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
import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto, RegisterDto } from './auth.dto.js';
let AuthController = class AuthController {
    auth;
    constructor(auth) {
        this.auth = auth;
    }
    register(body) { return this.auth.register({ email: body.email, username: body.username, displayName: body.displayName || body.fullName || body.username, password: body.password }); }
    async login(body, response) { const result = await this.auth.login(body.email || body.username || '', body.password); response.cookie('nexora_token', result.token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 30 * 86400000 }); return result.user; }
    async me(request) { return this.auth.fromToken(request.cookies?.nexora_token || request.headers.authorization?.replace('Bearer ', '')); }
    logout(response) { response.clearCookie('nexora_token'); return { ok: true }; }
    verifyEmail(body) { return this.auth.verifyEmail(body.token); }
    forgotPassword(body) { return this.auth.requestPasswordReset(body.identity); }
    resetPassword(body) { return this.auth.resetPassword(body.token, body.password); }
};
__decorate([
    Post('register'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
__decorate([
    Post('login'),
    __param(0, Body()),
    __param(1, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    Get('me'),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
__decorate([
    Post('logout'),
    __param(0, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
__decorate([
    Post('verify-email'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    Post('forgot-password'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    Post('reset-password'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "resetPassword", null);
AuthController = __decorate([
    Controller('api/auth'),
    __metadata("design:paramtypes", [AuthService])
], AuthController);
export { AuthController };
