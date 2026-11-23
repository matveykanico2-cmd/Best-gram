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
import { Server, Socket } from 'socket.io';
/** Compatibility gateway for the existing web client and the documented realtime API. */
let MessagesGateway = class MessagesGateway {
    server;
    join(socket, body) { const room = body.conversationId || body.userId; if (room)
        socket.join(`conversation:${room}`); return { ok: true }; }
    modernMessage(socket, message) { const event = { ...message, senderSocket: socket.id, sentAt: new Date().toISOString() }; this.server.to(`conversation:${message.conversationId}`).emit('chat:message', event); return event; }
    legacyMessage(socket, message) { const event = { ...message, _id: message._id || crypto.randomUUID(), createdAt: message.createdAt || new Date().toISOString() }; this.server.emit('message_sent', event); this.server.emit('receive_message', event); return event; }
    callJoin(socket, body) { socket.join(`call:${body.callId}`); return { ok: true }; }
    callSignal(socket, body) { socket.to(`call:${body.callId}`).emit('call:signal', { ...body, from: socket.id }); return { ok: true }; }
    callEnd(socket, body) { socket.to(`call:${body.callId}`).emit('call:end', body); return { ok: true }; }
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
    __metadata("design:paramtypes", [Socket, Object]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "join", null);
__decorate([
    SubscribeMessage('chat:message'),
    __param(0, ConnectedSocket()),
    __param(1, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Socket, Object]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "modernMessage", null);
__decorate([
    SubscribeMessage('send_message'),
    __param(0, ConnectedSocket()),
    __param(1, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Socket, Object]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "legacyMessage", null);
__decorate([
    SubscribeMessage('call:join'),
    __param(0, ConnectedSocket()),
    __param(1, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Socket, Object]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "callJoin", null);
__decorate([
    SubscribeMessage('call:signal'),
    __param(0, ConnectedSocket()),
    __param(1, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Socket, Object]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "callSignal", null);
__decorate([
    SubscribeMessage('call:end'),
    __param(0, ConnectedSocket()),
    __param(1, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Socket, Object]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "callEnd", null);
MessagesGateway = __decorate([
    WebSocketGateway({ cors: { origin: true, credentials: true } })
], MessagesGateway);
export { MessagesGateway };
