import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import type { Request } from 'express';
import { AuthGuard } from './auth.guard.js';
import { DbService } from './db/db.service.js';

@Controller('api')
@UseGuards(AuthGuard)
export class FeaturesController {
  constructor(private readonly db: DbService) {}
  @Get('communities') async communities() { const result = await this.db.db.execute(sql`SELECT id, name, description, created_at AS "createdAt" FROM communities ORDER BY created_at DESC LIMIT 100`); return { communities: result.rows }; }
  @Post('communities') async createCommunity(@Req() req: Request, @Body() body: { name: string; description?: string }) { const result = await this.db.db.execute(sql`INSERT INTO communities (owner_id, name, description) VALUES (${req.user.id}, ${body.name.trim()}, ${body.description || ''}) RETURNING id, name, description`); const community = result.rows[0]; await this.db.db.execute(sql`INSERT INTO community_members (community_id, user_id, role) VALUES (${community.id}, ${req.user.id}, 'owner')`); return { community }; }
  @Post('communities/:id/join') async joinCommunity(@Req() req: Request, @Param('id') id: string) { await this.db.db.execute(sql`INSERT INTO community_members (community_id, user_id) VALUES (${id}, ${req.user.id}) ON CONFLICT DO NOTHING`); return { joined: true }; }
  @Get('marketplace') async listings() { const result = await this.db.db.execute(sql`SELECT id, seller_id AS "sellerId", title, description, price_cents AS "priceCents", status, created_at AS "createdAt" FROM marketplace_listings WHERE status = 'active' ORDER BY created_at DESC LIMIT 100`); return { listings: result.rows }; }
  @Post('marketplace') async createListing(@Req() req: Request, @Body() body: { title: string; description?: string; priceCents: number }) { const result = await this.db.db.execute(sql`INSERT INTO marketplace_listings (seller_id, title, description, price_cents) VALUES (${req.user.id}, ${body.title.trim()}, ${body.description || ''}, ${Math.max(0, Math.round(body.priceCents))}) RETURNING *`); return { listing: result.rows[0] }; }
  @Get('videos') async videos() { const result = await this.db.db.execute(sql`SELECT * FROM videos ORDER BY created_at DESC LIMIT 100`); return { videos: result.rows }; }
  @Post('videos') async createVideo(@Req() req: Request, @Body() body: { title: string; description?: string; mediaId?: string }) { const result = await this.db.db.execute(sql`INSERT INTO videos (owner_id, title, description, media_id) VALUES (${req.user.id}, ${body.title.trim()}, ${body.description || ''}, ${body.mediaId || null}) RETURNING *`); return { video: result.rows[0] }; }
  @Get('music/playlists') async playlists(@Req() req: Request) { const result = await this.db.db.execute(sql`SELECT * FROM playlists WHERE owner_id = ${req.user.id} ORDER BY created_at DESC`); return { playlists: result.rows }; }
  @Post('reports') async report(@Req() req: Request, @Body() body: { targetType: string; targetId: string; reason: string; details?: string }) { const result = await this.db.db.execute(sql`INSERT INTO reports (reporter_id, target_type, target_id, reason, details) VALUES (${req.user.id}, ${body.targetType}, ${body.targetId}, ${body.reason}, ${body.details || ''}) RETURNING id, status`); return { report: result.rows[0] }; }
}
