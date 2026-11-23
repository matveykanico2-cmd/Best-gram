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
import { Controller, Get, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { mkdirSync, createReadStream } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { AuthGuard } from './auth.guard.js';
import { DbService } from './db/db.service.js';
import { mediaFiles } from './db/schema.js';
const mediaDir = process.env.MEDIA_DIR || './data/media';
mkdirSync(mediaDir, { recursive: true });
let MediaController = class MediaController {
    db;
    constructor(db) {
        this.db = db;
    }
    async upload(req, file) { if (!file)
        return { error: 'unsupported_or_missing_file' }; const [media] = await this.db.db.insert(mediaFiles).values({ ownerId: req.user.id, objectKey: file.filename, mimeType: file.mimetype, size: file.size }).returning(); return { media: { ...media, url: `/api/media/${media.id}` } }; }
    async download(id, response) { const rows = await this.db.db.select().from(mediaFiles).where(eq(mediaFiles.id, id)).limit(1); const media = rows[0]; if (!media)
        return response.status(404).json({ error: 'not_found' }); response.type(media.mimeType); return createReadStream(join(mediaDir, media.objectKey)).pipe(response); }
};
__decorate([
    Post('upload'),
    UseInterceptors(FileInterceptor('file', { limits: { fileSize: 25 * 1024 * 1024 }, fileFilter: (_req, file, cb) => cb(null, /^(image|video|audio)\//.test(file.mimetype)), storage: diskStorage({ destination: mediaDir, filename: (_req, file, cb) => cb(null, `${randomUUID()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`) }) })),
    __param(0, Req()),
    __param(1, UploadedFile()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "upload", null);
__decorate([
    Get(':id'),
    __param(0, Param('id')),
    __param(1, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "download", null);
MediaController = __decorate([
    Controller('api/media'),
    UseGuards(AuthGuard),
    __metadata("design:paramtypes", [DbService])
], MediaController);
export { MediaController };
