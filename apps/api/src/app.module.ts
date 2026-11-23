import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbService } from './db/db.service.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthGuard } from './auth.guard.js';
import { PostsController } from './posts.controller.js';
import { MessagesGateway } from './messages.gateway.js';
import { UsersController } from './users.controller.js';
import { ChatsController } from './chats.controller.js';

@Module({ imports: [ConfigModule.forRoot({ isGlobal: true })], controllers: [AuthController, PostsController, UsersController, ChatsController], providers: [DbService, AuthService, AuthGuard, MessagesGateway] })
export class AppModule {}
