import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, ForbiddenException, NotFoundException } from '@nestjs/common';
import { and, desc, eq, sql } from 'drizzle-orm';
import type { Request } from 'express';
import { AuthGuard } from './auth.guard.js';
import { DbService } from './db/db.service.js';
import { comments, follows, notifications, postShares, posts, reactions, savedPosts, users } from './db/schema.js';

@Controller('api/social')
@UseGuards(AuthGuard)
export class SocialController {
  constructor(private readonly db: DbService) {}
  @Patch('posts/:id') async updatePost(@Req() req: Request, @Param('id') id: string, @Body() body: { body?: string; audience?: string }) {
    const [post] = await this.db.db.update(posts).set({ body: body.body?.trim(), audience: body.audience }).where(and(eq(posts.id, id), eq(posts.authorId, req.user.id))).returning();
    if (!post) throw new NotFoundException('post_not_found'); return { post };
  }
  @Delete('posts/:id') async deletePost(@Req() req: Request, @Param('id') id: string) {
    const [post] = await this.db.db.delete(posts).where(and(eq(posts.id, id), eq(posts.authorId, req.user.id))).returning({ id: posts.id });
    if (!post) throw new NotFoundException('post_not_found'); return { ok: true };
  }
  @Post('posts/:id/react') async react(@Req() req: Request, @Param('id') postId: string, @Body() body: { kind?: string }) { const [reaction] = await this.db.db.insert(reactions).values({ postId, userId: req.user.id, kind: body.kind || 'like' }).onConflictDoNothing().returning(); return { reaction: reaction || null, ok: true }; }
  @Delete('posts/:id/react') async unreact(@Req() req: Request, @Param('id') postId: string, @Body() body: { kind?: string }) { await this.db.db.delete(reactions).where(and(eq(reactions.postId, postId), eq(reactions.userId, req.user.id), eq(reactions.kind, body.kind || 'like'))); return { ok: true }; }
  @Get('posts/:id/comments') async listComments(@Param('id') postId: string) { return { comments: await this.db.db.select({ id: comments.id, body: comments.body, parentId: comments.parentId, createdAt: comments.createdAt, authorId: comments.authorId, username: users.username, displayName: users.displayName }).from(comments).innerJoin(users, eq(comments.authorId, users.id)).where(eq(comments.postId, postId)).orderBy(desc(comments.createdAt)) }; }
  @Post('posts/:id/comments') async comment(@Req() req: Request, @Param('id') postId: string, @Body() body: { body: string; parentId?: string }) { const text = body.body?.trim(); if (!text || text.length > 4000) throw new ForbiddenException('invalid_comment'); const [comment] = await this.db.db.insert(comments).values({ postId, authorId: req.user.id, body: text, parentId: body.parentId }).returning(); return { comment }; }
  @Post('posts/:id/share') async share(@Req() req: Request, @Param('id') postId: string) { const [share] = await this.db.db.insert(postShares).values({ postId, userId: req.user.id }).returning(); return { share }; }
  @Post('posts/:id/save') async save(@Req() req: Request, @Param('id') postId: string) { await this.db.db.insert(savedPosts).values({ postId, userId: req.user.id }).onConflictDoNothing(); return { ok: true }; }
  @Delete('posts/:id/save') async unsave(@Req() req: Request, @Param('id') postId: string) { await this.db.db.delete(savedPosts).where(and(eq(savedPosts.postId, postId), eq(savedPosts.userId, req.user.id))); return { ok: true }; }
  @Post('users/:id/follow') async follow(@Req() req: Request, @Param('id') followingId: string) { if (followingId === req.user.id) throw new ForbiddenException('cannot_follow_self'); await this.db.db.insert(follows).values({ followerId: req.user.id, followingId }).onConflictDoNothing(); await this.db.db.insert(notifications).values({ userId: followingId, actorId: req.user.id, kind: 'follow', payload: {} }); return { following: true }; }
  @Delete('users/:id/follow') async unfollow(@Req() req: Request, @Param('id') followingId: string) { await this.db.db.delete(follows).where(and(eq(follows.followerId, req.user.id), eq(follows.followingId, followingId))); return { following: false }; }
  @Get('notifications') async notifications(@Req() req: Request) { return { notifications: await this.db.db.select().from(notifications).where(eq(notifications.userId, req.user.id)).orderBy(desc(notifications.createdAt)).limit(50) }; }
  @Post('users/:id/block') async block(@Req() req: Request, @Param('id') id: string) { await this.db.db.execute(sql`INSERT INTO user_blocks (blocker_id, blocked_id) VALUES (${req.user.id}, ${id}) ON CONFLICT DO NOTHING`); return { blocked: true }; }
}
