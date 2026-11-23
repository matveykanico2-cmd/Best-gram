import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto, RegisterDto } from './auth.dto.js';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('register') register(@Body() body: RegisterDto) { return this.auth.register({ email: body.email, username: body.username, displayName: body.displayName || body.fullName || body.username, password: body.password }); }
  @Post('login') async login(@Body() body: LoginDto, @Res({ passthrough: true }) response: Response) { const result = await this.auth.login(body.email || body.username || '', body.password); response.cookie('nexora_token', result.token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 30 * 86400000 }); return result.user; }
  @Get('me') async me(@Req() request: Request) { return this.auth.fromToken(request.cookies?.nexora_token || request.headers.authorization?.replace('Bearer ', '')); }
  @Post('logout') logout(@Res({ passthrough: true }) response: Response) { response.clearCookie('nexora_token'); return { ok: true }; }
  @Post('verify-email') verifyEmail(@Body() body: { token: string }) { return this.auth.verifyEmail(body.token); }
  @Post('forgot-password') forgotPassword(@Body() body: { identity: string }) { return this.auth.requestPasswordReset(body.identity); }
  @Post('reset-password') resetPassword(@Body() body: { token: string; password: string }) { return this.auth.resetPassword(body.token, body.password); }
}
