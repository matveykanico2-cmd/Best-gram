import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Injectable()
export class AuthGuard implements CanActivate { constructor(private readonly auth: AuthService) {} async canActivate(context: ExecutionContext) { const request = context.switchToHttp().getRequest(); request.user = await this.auth.fromToken(request.cookies?.retrynet_token || request.headers.authorization?.replace('Bearer ', '')); return true; } }
