import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import type { Request } from 'express';
import { AuthGuard } from './auth.guard.js';
import { DbService } from './db/db.service.js';
import { callParticipants, calls } from './db/schema.js';

@Controller('api/calls')
@UseGuards(AuthGuard)
export class CallsController {
  constructor(private readonly db: DbService) {}
  @Post() async create(@Req() req: Request, @Body() body: { participantId: string; kind?: 'audio' | 'video' }) {
    const [call] = await this.db.db.insert(calls).values({ initiatorId: req.user.id, kind: body.kind || 'video' }).returning();
    await this.db.db.insert(callParticipants).values([{ callId: call.id, userId: req.user.id, joinedAt: new Date() }, { callId: call.id, userId: body.participantId }]);
    return { call };
  }
  @Patch(':id/end') async end(@Req() req: Request, @Param('id') id: string) { const [call] = await this.db.db.update(calls).set({ status: 'ended', endedAt: new Date() }).where(and(eq(calls.id, id), eq(calls.initiatorId, req.user.id))).returning(); return { call }; }
  @Get() async history(@Req() req: Request) { const rows = await this.db.db.select().from(calls).where(eq(calls.initiatorId, req.user.id)).orderBy(desc(calls.startedAt)).limit(50); return { calls: rows }; }
}
