import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import type { Request } from 'express';
import { AuthGuard } from './auth.guard.js';
import { DbService } from './db/db.service.js';

@Controller('api/admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private readonly db: DbService) {}
  private ensure(req: Request) { if (req.user.role !== 'admin') throw new ForbiddenException('admin_only'); }
  @Get('stats') async stats(@Req() req: Request) { this.ensure(req); const result = await this.db.db.execute(sql`SELECT (SELECT count(*) FROM users)::int AS users, (SELECT count(*) FROM posts)::int AS posts, (SELECT count(*) FROM users WHERE role = 'admin')::int AS admins, 0::int AS verified`); return result.rows[0]; }
  @Get('users') async users(@Req() req: Request) { this.ensure(req); const result = await this.db.db.execute(sql`SELECT id AS "_id", username, display_name AS "fullName", avatar_url AS "profileImage", role, (email_verified_at IS NOT NULL) AS verified FROM users ORDER BY created_at DESC LIMIT 200`); return { users: result.rows }; }
  @Post('users/:id/verify') async verify(@Req() req: Request, @Param('id') id: string) { this.ensure(req); await this.db.db.execute(sql`UPDATE users SET email_verified_at = now() WHERE id = ${id}`); return { ok: true }; }
  @Delete('users/:id/verify') async revoke(@Req() req: Request, @Param('id') id: string) { this.ensure(req); await this.db.db.execute(sql`UPDATE users SET email_verified_at = NULL WHERE id = ${id}`); return { ok: true }; }
}
