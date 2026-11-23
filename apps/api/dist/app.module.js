var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({ imports: [ConfigModule.forRoot({ isGlobal: true }), ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }])], controllers: [AuthController, PostsController, UsersController, ChatsController, SocialController, CallsController, FeaturesController, MediaController, AdminController], providers: [DbService, AuthService, AuthGuard, MessagesGateway, { provide: APP_GUARD, useClass: ThrottlerGuard }] })
], AppModule);
export { AppModule };
