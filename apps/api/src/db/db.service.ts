import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';

@Injectable()
export class DbService implements OnModuleDestroy {
  readonly pool = new Pool({ connectionString: process.env.DATABASE_URL });
  readonly db = drizzle(this.pool, { schema });
  async ready() { await this.pool.query('SELECT 1'); return true; }
  async onModuleDestroy() { await this.pool.end(); }
}
