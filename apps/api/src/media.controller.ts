import { Controller, Get, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { mkdirSync, createReadStream } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { AuthGuard } from './auth.guard.js';
import { DbService } from './db/db.service.js';
import { mediaFiles } from './db/schema.js';

const mediaDir = process.env.MEDIA_DIR || './data/media';
mkdirSync(mediaDir, { recursive: true });

@Controller('api/media')
@UseGuards(AuthGuard)
export class MediaController {
  constructor(private readonly db: DbService) {}
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 25 * 1024 * 1024 }, fileFilter: (_req, file, cb) => cb(null, /^(image|video|audio)\//.test(file.mimetype)), storage: diskStorage({ destination: mediaDir, filename: (_req, file, cb) => cb(null, `${randomUUID()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`) }) }))
  async upload(@Req() req: Request, @UploadedFile() file: { filename: string; mimetype: string; size: number }) { if (!file) return { error: 'unsupported_or_missing_file' }; const [media] = await this.db.db.insert(mediaFiles).values({ ownerId: req.user.id, objectKey: file.filename, mimeType: file.mimetype, size: file.size }).returning(); return { media: { ...media, url: `/api/media/${media.id}` } }; }
  @Get(':id') async download(@Param('id') id: string, @Res() response: Response) { const rows = await this.db.db.select().from(mediaFiles).where(eq(mediaFiles.id, id)).limit(1); const media = rows[0]; if (!media) return response.status(404).json({ error: 'not_found' }); response.type(media.mimeType); return createReadStream(join(mediaDir, media.objectKey)).pipe(response); }
}
