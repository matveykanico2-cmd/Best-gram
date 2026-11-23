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
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { DbService } from './db/db.service.js';
import { posts, users } from './db/schema.js';
import { AuthGuard } from './auth.guard.js';
let PostsController = class PostsController {
    db;
    constructor(db) {
        this.db = db;
    }
    async list() { const result = await this.db.db.select({ _id: posts.id, id: posts.id, content: posts.body, body: posts.body, audience: posts.audience, authorId: posts.authorId, createdAt: posts.createdAt, displayName: users.displayName, username: users.username }).from(posts).innerJoin(users, eq(posts.authorId, users.id)).orderBy(desc(posts.createdAt)).limit(50); return { posts: result }; }
    async create(request, body) { const [post] = await this.db.db.insert(posts).values({ authorId: request.user.id, body: body.body || body.content || '', audience: body.audience || 'friends' }).returning(); return { post }; }
};
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "list", null);
__decorate([
    Post(),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "create", null);
PostsController = __decorate([
    Controller('api/posts'),
    UseGuards(AuthGuard),
    __metadata("design:paramtypes", [DbService])
], PostsController);
export { PostsController };
