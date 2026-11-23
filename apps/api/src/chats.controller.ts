import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { and, asc, eq, inArray, ne, or } from 'drizzle-orm';
import type { Request } from 'express';
import { DbService } from './db/db.service.js';
import { conversationMembers, conversations, messages, users } from './db/schema.js';
import { AuthGuard } from './auth.guard.js';

@Controller('api/chats')
@UseGuards(AuthGuard)
export class ChatsController {
  constructor(private readonly db: DbService) {}
  @Get('users') async users(@Req() request: Request) {
    const result = await this.db.db.select({ _id: users.id, id: users.id, username: users.username, fullName: users.displayName, profilePicture: users.avatarUrl }).from(users).where(ne(users.id, request.user.id)).limit(100);
    return { success: true, users: result };
  }
  @Get('messages/:userId') async messages(@Req() request: Request, @Param('userId') userId: string) {
    const memberships = await this.db.db.select({ conversationId: conversationMembers.conversationId }).from(conversationMembers).where(inArray(conversationMembers.userId, [request.user.id, userId]));
    const ids = memberships.map(item => item.conversationId);
    if (!ids.length) return { success: true, messages: [] };
    const rows = await this.db.db.select({ _id: messages.id, content: messages.body, body: messages.body, sender: messages.senderId, createdAt: messages.sentAt }).from(messages).where(inArray(messages.conversationId, ids)).orderBy(asc(messages.sentAt));
    return { success: true, messages: rows.map(message => ({ ...message, receiver: message.sender === request.user.id ? userId : request.user.id })) };
  }
}
