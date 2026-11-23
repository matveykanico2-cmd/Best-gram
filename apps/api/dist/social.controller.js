var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, ForbiddenException, NotFoundException } from '@nestjs/common';
import { and, desc, eq, sql } from 'drizzle-orm';
import { AuthGuard } from './auth.guard.js';
import { DbService } from './db/db.service.js';
import { comments, follows, notifications, postShares, posts, reactions, savedPosts, users } from './db/schema.js';
let SocialController = class SocialController {
    db;
    constructor(db) {
        this.db = db;
    }
    async updatePost(req, id, body) {
        const [post] = await this.db.db.update(posts).set({ body: body.body?.trim(), audience: body.audience }).where(and(eq(posts.id, id), eq(posts.authorId, req.user.id))).returning();
        if (!post)
            throw new NotFoundException('post_not_found');
        return { post };
    }
    async deletePost(req, id) {
        const [post] = await this.db.db.delete(posts).where(and(eq(posts.id, id), eq(posts.authorId, req.user.id))).returning({ id: posts.id });
        if (!post)
            throw new NotFoundException('post_not_found');
        return { ok: true };
    }
    async react(req, postId, body) { const [reaction] = await this.db.db.insert(reactions).values({ postId, userId: req.user.id, kind: body.kind || 'like' }).onConflictDoNothing().returning(); return { reaction: reaction || null, ok: true }; }
    async unreact(req, postId, body) { await this.db.db.delete(reactions).where(and(eq(reactions.postId, postId), eq(reactions.userId, req.user.id), eq(reactions.kind, body.kind || 'like'))); return { ok: true }; }
    async listComments(postId) { return { comments: await this.db.db.select({ id: comments.id, body: comments.body, parentId: comments.parentId, createdAt: comments.createdAt, authorId: comments.authorId, username: users.username, displayName: users.displayName }).from(comments).innerJoin(users, eq(comments.authorId, users.id)).where(eq(comments.postId, postId)).orderBy(desc(comments.createdAt)) }; }
    async comment(req, postId, body) { const text = body.body?.trim(); if (!text || text.length > 4000)
        throw new ForbiddenException('invalid_comment'); const [comment] = await this.db.db.insert(comments).values({ postId, authorId: req.user.id, body: text, parentId: body.parentId }).returning(); return { comment }; }
    async share(req, postId) { const [share] = await this.db.db.insert(postShares).values({ postId, userId: req.user.id }).returning(); return { share }; }
    async save(req, postId) { await this.db.db.insert(savedPosts).values({ postId, userId: req.user.id }).onConflictDoNothing(); return { ok: true }; }
    async unsave(req, postId) { await this.db.db.delete(savedPosts).where(and(eq(savedPosts.postId, postId), eq(savedPosts.userId, req.user.id))); return { ok: true }; }
    async follow(req, followingId) { if (followingId === req.user.id)
        throw new ForbiddenException('cannot_follow_self'); await this.db.db.insert(follows).values({ followerId: req.user.id, followingId }).onConflictDoNothing(); await this.db.db.insert(notifications).values({ userId: followingId, actorId: req.user.id, kind: 'follow', payload: {} }); return { following: true }; }
    async unfollow(req, followingId) { await this.db.db.delete(follows).where(and(eq(follows.followerId, req.user.id), eq(follows.followingId, followingId))); return { following: false }; }
    async notifications(req) { return { notifications: await this.db.db.select().from(notifications).where(eq(notifications.userId, req.user.id)).orderBy(desc(notifications.createdAt)).limit(50) }; }
    async block(req, id) { await this.db.db.execute(sql `INSERT INTO user_blocks (blocker_id, blocked_id) VALUES (${req.user.id}, ${id}) ON CONFLICT DO NOTHING`); return { blocked: true }; }
};
__decorate([
    Patch('posts/:id'),
    __param(0, Req()),
    __param(1, Param('id')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "updatePost", null);
__decorate([
    Delete('posts/:id'),
    __param(0, Req()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "deletePost", null);
__decorate([
    Post('posts/:id/react'),
    __param(0, Req()),
    __param(1, Param('id')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "react", null);
__decorate([
    Delete('posts/:id/react'),
    __param(0, Req()),
    __param(1, Param('id')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "unreact", null);
__decorate([
    Get('posts/:id/comments'),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "listComments", null);
__decorate([
    Post('posts/:id/comments'),
    __param(0, Req()),
    __param(1, Param('id')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "comment", null);
__decorate([
    Post('posts/:id/share'),
    __param(0, Req()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "share", null);
__decorate([
    Post('posts/:id/save'),
    __param(0, Req()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "save", null);
__decorate([
    Delete('posts/:id/save'),
    __param(0, Req()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "unsave", null);
__decorate([
    Post('users/:id/follow'),
    __param(0, Req()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "follow", null);
__decorate([
    Delete('users/:id/follow'),
    __param(0, Req()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "unfollow", null);
__decorate([
    Get('notifications'),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "notifications", null);
__decorate([
    Post('users/:id/block'),
    __param(0, Req()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "block", null);
SocialController = __decorate([
    Controller('api/social'),
    UseGuards(AuthGuard),
    __metadata("design:paramtypes", [DbService])
], SocialController);
export { SocialController };
