import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import type { Request } from 'express';
import { DbService } from './db/db.service.js';
import { posts, users } from './db/schema.js';
import { AuthGuard } from './auth.guard.js';

@Controller('api/posts')
@UseGuards(AuthGuard)
export class PostsController { constructor(private readonly db: DbService) {} @Get() async list() { const result = await this.db.db.select({ _id: posts.id, id: posts.id, content: posts.body, body: posts.body, audience: posts.audience, authorId: posts.authorId, createdAt: posts.createdAt, displayName: users.displayName, username: users.username }).from(posts).innerJoin(users, eq(posts.authorId, users.id)).orderBy(desc(posts.createdAt)).limit(50); return { posts: result }; } @Post() async create(@Req() request: Request, @Body() body: { body?: string; content?: string; audience?: string }) { const [post] = await this.db.db.insert(posts).values({ authorId: request.user.id, body: body.body || body.content || '', audience: body.audience || 'friends' }).returning(); return { post }; } }
