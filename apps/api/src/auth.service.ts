import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { eq, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID, createHash } from 'node:crypto';
import { DbService } from './db/db.service.js';
import { users, sessions } from './db/schema.js';

@Injectable()
export class AuthService {
  constructor(private readonly db: DbService) {}
  private safe(user: typeof users.$inferSelect) { return { id: user.id, email: user.email, username: user.username, displayName: user.displayName, avatarUrl: user.avatarUrl }; }
  async register(input: { email?: string; username: string; displayName: string; password: string }) { const email = input.email?.trim().toLowerCase() || null; const where = email ? or(eq(users.username, input.username.toLowerCase()), eq(users.email, email)) : eq(users.username, input.username.toLowerCase()); const existing = await this.db.db.select().from(users).where(where).limit(1); if (existing.length) throw new ConflictException('account_already_exists'); const [user] = await this.db.db.insert(users).values({ email, username: input.username.trim().toLowerCase(), displayName: input.displayName.trim(), passwordHash: await bcrypt.hash(input.password, 12) }).returning(); return this.safe(user); }
  async login(identity: string, password: string) { const normalized = identity.trim().toLowerCase(); const rows = await this.db.db.select().from(users).where(or(eq(users.email, normalized), eq(users.username, normalized))).limit(1); const user = rows[0]; if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new UnauthorizedException('invalid_credentials'); const raw = randomUUID(); await this.db.db.insert(sessions).values({ userId: user.id, tokenHash: createHash('sha256').update(raw).digest('hex'), expiresAt: new Date(Date.now() + 30 * 86400000) }); return { user: this.safe(user), token: jwt.sign({ sub: user.id, session: raw }, process.env.JWT_SECRET || 'change-me', { expiresIn: '30d' }) }; }
  async fromToken(token?: string) { if (!token) throw new UnauthorizedException(); try { const payload = jwt.verify(token, process.env.JWT_SECRET || 'change-me') as { sub: string; session: string }; const hash = createHash('sha256').update(payload.session).digest('hex'); const rows = await this.db.db.select({ user: users }).from(sessions).innerJoin(users, eq(sessions.userId, users.id)).where(eq(sessions.tokenHash, hash)).limit(1); if (!rows[0]) throw new UnauthorizedException(); return this.safe(rows[0].user); } catch { throw new UnauthorizedException(); } }
}
