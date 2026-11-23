import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';
import { DbService } from './db/db.service.js';

const app = await NestFactory.create(AppModule);
app.enableShutdownHooks();
app.use(cookieParser());
app.enableCors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true });
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
const document = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('Nexora API').setVersion('1.0').addCookieAuth('nexora_token').build());
SwaggerModule.setup('api/docs', app, document);
app.getHttpAdapter().get('/api/health', (_req: unknown, response: { json: (value: unknown) => void }) => response.json({ ok: true, service: 'nexora-nest-api' }));
app.getHttpAdapter().get('/api/health/ready', async (_req: unknown, response: { status: (code: number) => { json: (value: unknown) => void }; json: (value: unknown) => void }) => { try { await app.get(DbService).ready(); response.json({ ok: true, database: 'ready' }); } catch { response.status(503).json({ ok: false, database: 'unavailable' }); } });
await app.listen(Number(process.env.PORT || 3000), process.env.HOST || '0.0.0.0');
