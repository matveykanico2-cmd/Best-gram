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
import { Body, Controller, Get, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { desc, eq } from 'drizzle-orm';
import { DbService } from './db/db.service.js';
import { mediaFiles, postMedia, posts, users } from './db/schema.js';
import { AuthGuard } from './auth.guard.js';
let PostsController = class PostsController {
    db;
    constructor(db) {
        this.db = db;
    }
    async list() { const result = await this.db.db.select({ _id: posts.id, id: posts.id, content: posts.body, body: posts.body, audience: posts.audience, authorId: posts.authorId, createdAt: posts.createdAt, displayName: users.displayName, username: users.username }).from(posts).innerJoin(users, eq(posts.authorId, users.id)).orderBy(desc(posts.createdAt)).limit(50); return { posts: result }; }
    async create(request, body, files = []) { const [post] = await this.db.db.insert(posts).values({ authorId: request.user.id, body: body.body || body.content || body.caption || '', audience: body.audience || 'friends' }).returning(); for (const [index, file] of files.entries()) {
        const [media] = await this.db.db.insert(mediaFiles).values({ ownerId: request.user.id, objectKey: file.filename, mimeType: file.mimetype, size: file.size }).returning();
        await this.db.db.insert(postMedia).values({ postId: post.id, mediaId: media.id, sortOrder: index });
    } return { post }; }
};
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "list", null);
__decorate([
    Post(),
    UseInterceptors(FilesInterceptor('media', 7, { limits: { fileSize: 25 * 1024 * 1024 }, storage: diskStorage({ destination: (_req, _file, cb) => { const directory = process.env.MEDIA_DIR || './data/media'; mkdirSync(directory, { recursive: true }); cb(null, directory); }, filename: (_req, file, cb) => cb(null, `${randomUUID()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`) }) })),
    __param(0, Req()),
    __param(1, Body()),
    __param(2, UploadedFiles()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Array]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "create", null);
PostsController = __decorate([
    Controller('api/posts'),
    UseGuards(AuthGuard),
    __metadata("design:paramtypes", [DbService])
], PostsController);
export { PostsController };
