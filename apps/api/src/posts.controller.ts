import { Body, Controller, Get, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { desc, eq } from 'drizzle-orm';
import type { Request } from 'express';
import { DbService } from './db/db.service.js';
import { mediaFiles, postMedia, posts, users } from './db/schema.js';
import { AuthGuard } from './auth.guard.js';

@Controller('api/posts')
@UseGuards(AuthGuard)
export class PostsController { constructor(private readonly db: DbService) {} @Get() async list() { const result = await this.db.db.select({ _id: posts.id, id: posts.id, content: posts.body, body: posts.body, audience: posts.audience, authorId: posts.authorId, createdAt: posts.createdAt, displayName: users.displayName, username: users.username }).from(posts).innerJoin(users, eq(posts.authorId, users.id)).orderBy(desc(posts.createdAt)).limit(50); return { posts: result }; } @Post() @UseInterceptors(FilesInterceptor('media', 7, { limits: { fileSize: 25 * 1024 * 1024 }, storage: diskStorage({ destination: (_req, _file, cb) => { const directory = process.env.MEDIA_DIR || './data/media'; mkdirSync(directory, { recursive: true }); cb(null, directory); }, filename: (_req, file, cb) => cb(null, `${randomUUID()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`) }) })) async create(@Req() request: Request, @Body() body: { body?: string; content?: string; caption?: string; audience?: string }, @UploadedFiles() files: Array<{ filename: string; mimetype: string; size: number }> = []) { const [post] = await this.db.db.insert(posts).values({ authorId: request.user.id, body: body.body || body.content || body.caption || '', audience: body.audience || 'friends' }).returning(); for (const [index, file] of files.entries()) { const [media] = await this.db.db.insert(mediaFiles).values({ ownerId: request.user.id, objectKey: file.filename, mimeType: file.mimetype, size: file.size }).returning(); await this.db.db.insert(postMedia).values({ postId: post.id, mediaId: media.id, sortOrder: index }); } return { post }; } }
