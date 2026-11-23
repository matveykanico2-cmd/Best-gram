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
import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { AuthGuard } from './auth.guard.js';
import { DbService } from './db/db.service.js';
import { callParticipants, calls } from './db/schema.js';
let CallsController = class CallsController {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(req, body) {
        const [call] = await this.db.db.insert(calls).values({ initiatorId: req.user.id, kind: body.kind || 'video' }).returning();
        await this.db.db.insert(callParticipants).values([{ callId: call.id, userId: req.user.id, joinedAt: new Date() }, { callId: call.id, userId: body.participantId }]);
        return { call };
    }
    async end(req, id) { const [call] = await this.db.db.update(calls).set({ status: 'ended', endedAt: new Date() }).where(and(eq(calls.id, id), eq(calls.initiatorId, req.user.id))).returning(); return { call }; }
    async history(req) { const rows = await this.db.db.select().from(calls).where(eq(calls.initiatorId, req.user.id)).orderBy(desc(calls.startedAt)).limit(50); return { calls: rows }; }
};
__decorate([
    Post(),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CallsController.prototype, "create", null);
__decorate([
    Patch(':id/end'),
    __param(0, Req()),
    __param(1, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CallsController.prototype, "end", null);
__decorate([
    Get(),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CallsController.prototype, "history", null);
CallsController = __decorate([
    Controller('api/calls'),
    UseGuards(AuthGuard),
    __metadata("design:paramtypes", [DbService])
], CallsController);
export { CallsController };
