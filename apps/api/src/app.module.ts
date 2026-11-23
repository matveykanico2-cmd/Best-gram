import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { DbService } from './db/db.service.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthGuard } from './auth.guard.js';
import { PostsController } from './posts.controller.js';
import { MessagesGateway } from './messages.gateway.js';
import { UsersController } from './users.controller.js';
import { ChatsController } from './chats.controller.js';
import { SocialController } from './social.controller.js';
import { CallsController } from './calls.controller.js';
import { FeaturesController } from './features.controller.js';
import { MediaController } from './media.controller.js';
import { AdminController } from './admin.controller.js';

@Module({ imports: [ConfigModule.forRoot({ isGlobal: true }), ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }])], controllers: [AuthController, PostsController, UsersController, ChatsController, SocialController, CallsController, FeaturesController, MediaController, AdminController], providers: [DbService, AuthService, AuthGuard, MessagesGateway, { provide: APP_GUARD, useClass: ThrottlerGuard }] })
export class AppModule {}
