import { Controller, Get, Req, UseGuards, Query, Post, Delete, Param, ForbiddenException } from '@nestjs/common';
import { and, desc, eq, ilike, ne } from 'drizzle-orm';
import type { Request } from 'express';
import { DbService } from './db/db.service.js';
import { follows, notifications, posts, users } from './db/schema.js';
import { AuthGuard } from './auth.guard.js';

@Controller('api/users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly db: DbService) {}
  @Get('search') async search(@Req() request: Request, @Query('q') q = '') {
    const value = `%${q.trim()}%`;
    const result = await this.db.db.select({ _id: users.id, id: users.id, username: users.username, fullName: users.displayName, displayName: users.displayName, profileImage: users.avatarUrl }).from(users).where(and(ne(users.id, request.user.id), ilike(users.username, value))).limit(20);
    return { users: result };
  }
  @Get('profile') async profile(@Req() request: Request) { const [profile] = await this.db.db.select().from(users).where(eq(users.id, request.user.id)).limit(1); const userPosts = await this.db.db.select({ _id: posts.id, body: posts.body, content: posts.body, createdAt: posts.createdAt }).from(posts).where(eq(posts.authorId, request.user.id)).orderBy(desc(posts.createdAt)); return { profile: { ...request.user, fullName: profile?.displayName, profileImage: profile?.avatarUrl }, posts: userPosts }; }
  @Post('follow/:id') async follow(@Req() request: Request, @Param('id') id: string) { if (id === request.user.id) throw new ForbiddenException('cannot_follow_self'); await this.db.db.insert(follows).values({ followerId: request.user.id, followingId: id }).onConflictDoNothing(); await this.db.db.insert(notifications).values({ userId: id, actorId: request.user.id, kind: 'follow', payload: {} }); return { success: true, following: true }; }
  @Delete('follow/:id') async unfollow(@Req() request: Request, @Param('id') id: string) { await this.db.db.delete(follows).where(and(eq(follows.followerId, request.user.id), eq(follows.followingId, id))); return { success: true, following: false }; }
  @Get('follow-requests') followRequests() { return { success: true, requests: [] }; }
}
