import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('register') register(@Body() body: { email?: string; username: string; displayName?: string; fullName?: string; password: string }) { return this.auth.register({ email: body.email, username: body.username, displayName: body.displayName || body.fullName || body.username, password: body.password }); }
  @Post('login') async login(@Body() body: { email?: string; username?: string; identity?: string; password: string }, @Res({ passthrough: true }) response: Response) { const result = await this.auth.login(body.identity || body.email || body.username || '', body.password); response.cookie('retrynet_token', result.token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 30 * 86400000 }); return result.user; }
  @Get('me') async me(@Req() request: Request) { return this.auth.fromToken(request.cookies?.retrynet_token || request.headers.authorization?.replace('Bearer ', '')); }
  @Post('logout') logout(@Res({ passthrough: true }) response: Response) { response.clearCookie('retrynet_token'); return { ok: true }; }
}
