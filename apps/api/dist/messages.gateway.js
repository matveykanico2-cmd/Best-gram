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
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { UnauthorizedException } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import { Server } from 'socket.io';
import { AuthService } from './auth.service.js';
import { DbService } from './db/db.service.js';
import { conversationMembers, conversations, messages, users } from './db/schema.js';
let MessagesGateway = class MessagesGateway {
    auth;
    db;
    server;
    online = new Map();
    constructor(auth, db) {
        this.auth = auth;
        this.db = db;
    }
    cookie(socket, name) { return socket.handshake.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1); }
    socketsOf(userId) { return [...(this.online.get(userId) || [])].map((id) => this.server.sockets.sockets.get(id)).filter(Boolean); }
    broadcastPresence(userId, online) { this.server.emit('presence:update', { userId, online, at: new Date().toISOString() }); }
    async handleConnection(socket) { try {
        const user = await this.auth.fromToken(this.cookie(socket, 'retrynet_token') || socket.handshake.auth?.token);
        socket.data.user = { id: user.id, username: user.username };
        const peers = this.online.get(user.id) || new Set();
        const wasOffline = peers.size === 0;
        peers.add(socket.id);
        this.online.set(user.id, peers);
        if (wasOffline)
            this.broadcastPresence(user.id, true);
        socket.emit('presence:snapshot', { users: [...this.online.keys()] });
    }
    catch {
        socket.disconnect(true);
    } }
    handleDisconnect(socket) { const userId = socket.data.user?.id; if (!userId)
        return; const peers = this.online.get(userId); peers?.delete(socket.id); if (peers?.size === 0) {
        this.online.delete(userId);
        this.broadcastPresence(userId, false);
    } }
    async conversationFor(firstUser, secondUser) { const result = await this.db.db.execute(sql `SELECT c.id FROM conversations c JOIN conversation_members a ON a.conversation_id = c.id AND a.user_id = ${firstUser} JOIN conversation_members b ON b.conversation_id = c.id AND b.user_id = ${secondUser} LIMIT 1`); if (result.rows[0]?.id)
        return String(result.rows[0].id); const [conversation] = await this.db.db.insert(conversations).values({ createdBy: firstUser }).returning(); await this.db.db.insert(conversationMembers).values([{ conversationId: conversation.id, userId: firstUser }, { conversationId: conversation.id, userId: secondUser }]); return conversation.id; }
    async join(socket, body) { if (!socket.data.user)
        throw new UnauthorizedException(); const room = body.conversationId || body.userId; if (room)
        socket.join(`conversation:${room}`); return { ok: true }; }
    async legacyMessage(socket, message) { const sender = socket.data.user; if (!sender)
        throw new UnauthorizedException(); const body = String(message.message || message.content || '').trim(); if (!body && !message.media?.length && !message.poll)
        return { ok: false, error: 'empty_message' }; const recipient = await this.db.db.select({ id: users.id, username: users.username }).from(users).where(eq(users.id, message.receiver)).limit(1); if (!recipient[0])
        return { ok: false, error: 'recipient_not_found' }; const conversationId = await this.conversationFor(sender.id, message.receiver); const [saved] = await this.db.db.insert(messages).values({ conversationId, senderId: sender.id, body }).returning(); const event = { _id: saved.id, id: saved.id, content: saved.body, sender: sender.id, receiver: message.receiver, conversationId, createdAt: saved.sentAt, media: message.media || [], poll: message.poll || null }; socket.emit('message_sent', event); for (const peer of this.socketsOf(message.receiver))
        peer.emit('receive_message', event); return event; }
    async modernMessage(socket, message) { const sender = socket.data.user; if (!sender)
        throw new UnauthorizedException(); const member = await this.db.db.select().from(conversationMembers).where(and(eq(conversationMembers.conversationId, message.conversationId), eq(conversationMembers.userId, sender.id))).limit(1); if (!member[0])
        throw new UnauthorizedException(); const [saved] = await this.db.db.insert(messages).values({ conversationId: message.conversationId, senderId: sender.id, body: message.body.trim() }).returning(); const event = { ...message, id: saved.id, senderId: sender.id, sentAt: saved.sentAt }; this.server.to(`conversation:${message.conversationId}`).emit('chat:message', event); return event; }
    typing(socket, body) { const sender = socket.data.user; if (!sender)
        throw new UnauthorizedException(); for (const peer of this.socketsOf(body.userId))
        peer.emit('typing:update', { ...body, userId: sender.id }); return { ok: true }; }
    callJoin(socket, body) { if (!socket.data.user)
        throw new UnauthorizedException(); socket.join(`call:${body.callId}`); return { ok: true }; }
    callSignal(socket, body) { if (!socket.data.user)
        throw new UnauthorizedException(); socket.to(`call:${body.callId}`).emit('call:signal', { ...body, from: socket.data.user.id }); return { ok: true }; }
    callEnd(socket, body) { if (!socket.data.user)
        throw new UnauthorizedException(); socket.to(`call:${body.callId}`).emit('call:end', body); return { ok: true }; }
};
__decorate([
    WebSocketServer(),
    __metadata("design:type", Server)
], MessagesGateway.prototype, "server", void 0);
__decorate([
    SubscribeMessage('conversation:join'),
    __param(0, ConnectedSocket()),
    __param(1, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "join", null);
__decorate([
    SubscribeMessage('send_message'),
    __param(0, ConnectedSocket()),
    __param(1, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "legacyMessage", null);
__decorate([
    SubscribeMessage('chat:message'),
    __param(0, ConnectedSocket()),
    __param(1, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "modernMessage", null);
__decorate([
    SubscribeMessage('typing:update'),
    __param(0, ConnectedSocket()),
    __param(1, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "typing", null);
__decorate([
    SubscribeMessage('call:join'),
    __param(0, ConnectedSocket()),
    __param(1, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "callJoin", null);
__decorate([
    SubscribeMessage('call:signal'),
    __param(0, ConnectedSocket()),
    __param(1, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "callSignal", null);
__decorate([
    SubscribeMessage('call:end'),
    __param(0, ConnectedSocket()),
    __param(1, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "callEnd", null);
MessagesGateway = __decorate([
    WebSocketGateway({ cors: { origin: true, credentials: true }, transports: ['websocket', 'polling'] }),
    __metadata("design:paramtypes", [AuthService, DbService])
], MessagesGateway);
export { MessagesGateway };
