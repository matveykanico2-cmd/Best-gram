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
import { Controller, Delete, Get, Param, Post, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { AuthGuard } from './auth.guard.js';
import { DbService } from './db/db.service.js';
let AdminController = class AdminController {
    db;
    constructor(db) {
        this.db = db;
    }
    ensure(req) { if (req.user.role !== 'admin')
        throw new ForbiddenException('admin_only'); }
    async stats(req) { this.ensure(req); const result = await this.db.db.execute(sql `SELECT (SELECT count(*) FROM users)::int AS users, (SELECT count(*) FROM posts)::int AS posts, (SELECT count(*) FROM users WHERE role = 'admin')::int AS admins, 0::int AS verified`); return result.rows[0]; }
    async users(req) { this.ensure(req); const result = await this.db.db.execute(sql `SELECT id AS "_id", username, display_name AS "fullName", avatar_url AS "profileImage", role, (email_verified_at IS NOT NULL) AS verified FROM users ORDER BY created_at DESC LIMIT 200`); return { users: result.rows }; }
    async verify(req, id) { this.ensure(req); await this.db.db.execute(sql `UPDATE users SET email_verified_at = now() WHERE id = ${id}`); return { ok: true }; }
    async revoke(req, id) { this.ensure(req); await this.db.db.execute(sql `UPDATE users SET email_verified_at = NULL WHERE id = ${id}`); return { ok: true }; }
};
__decorate([
    Get('stats'),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "stats", null);
__decorate([
    Get('users'),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "users", null);
__decorate([
    Post('users/:id/verify'),
    __param(0, Req()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "verify", null);
__decorate([
    Delete('users/:id/verify'),
    __param(0, Req()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "revoke", null);
AdminController = __decorate([
    Controller('api/admin'),
    UseGuards(AuthGuard),
    __metadata("design:paramtypes", [DbService])
], AdminController);
export { AdminController };
