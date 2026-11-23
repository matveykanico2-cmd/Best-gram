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
import { Controller, Get, Req, UseGuards, Query, Post, Delete, Param, ForbiddenException } from '@nestjs/common';
import { and, desc, eq, ilike, ne } from 'drizzle-orm';
import { DbService } from './db/db.service.js';
import { follows, notifications, posts, users } from './db/schema.js';
import { AuthGuard } from './auth.guard.js';
let UsersController = class UsersController {
    db;
    constructor(db) {
        this.db = db;
    }
    async search(request, q = '') {
        const value = `%${q.trim()}%`;
        const result = await this.db.db.select({ _id: users.id, id: users.id, username: users.username, fullName: users.displayName, displayName: users.displayName, profileImage: users.avatarUrl }).from(users).where(and(ne(users.id, request.user.id), ilike(users.username, value))).limit(20);
        return { users: result };
    }
    async profile(request) { const [profile] = await this.db.db.select().from(users).where(eq(users.id, request.user.id)).limit(1); const userPosts = await this.db.db.select({ _id: posts.id, body: posts.body, content: posts.body, createdAt: posts.createdAt }).from(posts).where(eq(posts.authorId, request.user.id)).orderBy(desc(posts.createdAt)); return { profile: { ...request.user, fullName: profile?.displayName, profileImage: profile?.avatarUrl }, posts: userPosts }; }
    async follow(request, id) { if (id === request.user.id)
        throw new ForbiddenException('cannot_follow_self'); await this.db.db.insert(follows).values({ followerId: request.user.id, followingId: id }).onConflictDoNothing(); await this.db.db.insert(notifications).values({ userId: id, actorId: request.user.id, kind: 'follow', payload: {} }); return { success: true, following: true }; }
    async unfollow(request, id) { await this.db.db.delete(follows).where(and(eq(follows.followerId, request.user.id), eq(follows.followingId, id))); return { success: true, following: false }; }
    followRequests() { return { success: true, requests: [] }; }
};
__decorate([
    Get('search'),
    __param(0, Req()),
    __param(1, Query('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "search", null);
__decorate([
    Get('profile'),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "profile", null);
__decorate([
    Post('follow/:id'),
    __param(0, Req()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "follow", null);
__decorate([
    Delete('follow/:id'),
    __param(0, Req()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "unfollow", null);
__decorate([
    Get('follow-requests'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "followRequests", null);
UsersController = __decorate([
    Controller('api/users'),
    UseGuards(AuthGuard),
    __metadata("design:paramtypes", [DbService])
], UsersController);
export { UsersController };
