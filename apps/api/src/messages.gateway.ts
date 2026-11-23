import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/** Compatibility gateway for the existing web client and the documented realtime API. */
@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class MessagesGateway {
  @WebSocketServer() server!: Server;
  @SubscribeMessage('conversation:join') join(@ConnectedSocket() socket: Socket, @MessageBody() body: { conversationId?: string; userId?: string }) { const room = body.conversationId || body.userId; if (room) socket.join(`conversation:${room}`); return { ok: true }; }
  @SubscribeMessage('chat:message') modernMessage(@ConnectedSocket() socket: Socket, @MessageBody() message: { conversationId: string; body: string }) { const event = { ...message, senderSocket: socket.id, sentAt: new Date().toISOString() }; this.server.to(`conversation:${message.conversationId}`).emit('chat:message', event); return event; }
  @SubscribeMessage('send_message') legacyMessage(@ConnectedSocket() socket: Socket, @MessageBody() message: Record<string, unknown>) { const event = { ...message, _id: message._id || crypto.randomUUID(), createdAt: message.createdAt || new Date().toISOString() }; this.server.emit('message_sent', event); this.server.emit('receive_message', event); return event; }
}
