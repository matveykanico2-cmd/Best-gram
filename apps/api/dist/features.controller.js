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
import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { AuthGuard } from './auth.guard.js';
import { DbService } from './db/db.service.js';
let FeaturesController = class FeaturesController {
    db;
    constructor(db) {
        this.db = db;
    }
    async communities() { const result = await this.db.db.execute(sql `SELECT id, name, description, created_at AS "createdAt" FROM communities ORDER BY created_at DESC LIMIT 100`); return { communities: result.rows }; }
    async createCommunity(req, body) { const result = await this.db.db.execute(sql `INSERT INTO communities (owner_id, name, description) VALUES (${req.user.id}, ${body.name.trim()}, ${body.description || ''}) RETURNING id, name, description`); const community = result.rows[0]; await this.db.db.execute(sql `INSERT INTO community_members (community_id, user_id, role) VALUES (${community.id}, ${req.user.id}, 'owner')`); return { community }; }
    async joinCommunity(req, id) { await this.db.db.execute(sql `INSERT INTO community_members (community_id, user_id) VALUES (${id}, ${req.user.id}) ON CONFLICT DO NOTHING`); return { joined: true }; }
    async listings() { const result = await this.db.db.execute(sql `SELECT id, seller_id AS "sellerId", title, description, price_cents AS "priceCents", status, created_at AS "createdAt" FROM marketplace_listings WHERE status = 'active' ORDER BY created_at DESC LIMIT 100`); return { listings: result.rows }; }
    async createListing(req, body) { const result = await this.db.db.execute(sql `INSERT INTO marketplace_listings (seller_id, title, description, price_cents) VALUES (${req.user.id}, ${body.title.trim()}, ${body.description || ''}, ${Math.max(0, Math.round(body.priceCents))}) RETURNING *`); return { listing: result.rows[0] }; }
    async videos() { const result = await this.db.db.execute(sql `SELECT * FROM videos ORDER BY created_at DESC LIMIT 100`); return { videos: result.rows }; }
    async createVideo(req, body) { const result = await this.db.db.execute(sql `INSERT INTO videos (owner_id, title, description, media_id) VALUES (${req.user.id}, ${body.title.trim()}, ${body.description || ''}, ${body.mediaId || null}) RETURNING *`); return { video: result.rows[0] }; }
    async playlists(req) { const result = await this.db.db.execute(sql `SELECT * FROM playlists WHERE owner_id = ${req.user.id} ORDER BY created_at DESC`); return { playlists: result.rows }; }
    async report(req, body) { const result = await this.db.db.execute(sql `INSERT INTO reports (reporter_id, target_type, target_id, reason, details) VALUES (${req.user.id}, ${body.targetType}, ${body.targetId}, ${body.reason}, ${body.details || ''}) RETURNING id, status`); return { report: result.rows[0] }; }
};
__decorate([
    Get('communities'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FeaturesController.prototype, "communities", null);
__decorate([
    Post('communities'),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FeaturesController.prototype, "createCommunity", null);
__decorate([
    Post('communities/:id/join'),
    __param(0, Req()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FeaturesController.prototype, "joinCommunity", null);
__decorate([
    Get('marketplace'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FeaturesController.prototype, "listings", null);
__decorate([
    Post('marketplace'),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FeaturesController.prototype, "createListing", null);
__decorate([
    Get('videos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FeaturesController.prototype, "videos", null);
__decorate([
    Post('videos'),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FeaturesController.prototype, "createVideo", null);
__decorate([
    Get('music/playlists'),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FeaturesController.prototype, "playlists", null);
__decorate([
    Post('reports'),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FeaturesController.prototype, "report", null);
FeaturesController = __decorate([
    Controller('api'),
    UseGuards(AuthGuard),
    __metadata("design:paramtypes", [DbService])
], FeaturesController);
export { FeaturesController };
