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
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { asc, inArray, ne } from 'drizzle-orm';
import { DbService } from './db/db.service.js';
import { conversationMembers, messages, users } from './db/schema.js';
import { AuthGuard } from './auth.guard.js';
let ChatsController = class ChatsController {
    db;
    constructor(db) {
        this.db = db;
    }
    async users(request) {
        const result = await this.db.db.select({ _id: users.id, id: users.id, username: users.username, fullName: users.displayName, profilePicture: users.avatarUrl }).from(users).where(ne(users.id, request.user.id)).limit(100);
        return { success: true, users: result };
    }
    async messages(request, userId) {
        const memberships = await this.db.db.select({ conversationId: conversationMembers.conversationId }).from(conversationMembers).where(inArray(conversationMembers.userId, [request.user.id, userId]));
        const ids = memberships.map(item => item.conversationId);
        if (!ids.length)
            return { success: true, messages: [] };
        const rows = await this.db.db.select({ _id: messages.id, content: messages.body, body: messages.body, sender: messages.senderId, createdAt: messages.sentAt }).from(messages).where(inArray(messages.conversationId, ids)).orderBy(asc(messages.sentAt));
        return { success: true, messages: rows.map(message => ({ ...message, receiver: message.sender === request.user.id ? userId : request.user.id })) };
    }
};
__decorate([
    Get('users'),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatsController.prototype, "users", null);
__decorate([
    Get('messages/:userId'),
    __param(0, Req()),
    __param(1, Param('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatsController.prototype, "messages", null);
ChatsController = __decorate([
    Controller('api/chats'),
    UseGuards(AuthGuard),
    __metadata("design:paramtypes", [DbService])
], ChatsController);
export { ChatsController };
