import { Controller, Get, Req, UseGuards, Query } from '@nestjs/common';
import { and, ilike, ne } from 'drizzle-orm';
import type { Request } from 'express';
import { DbService } from './db/db.service.js';
import { users } from './db/schema.js';
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
  @Get('profile') profile(@Req() request: Request) { return { user: request.user }; }
}
