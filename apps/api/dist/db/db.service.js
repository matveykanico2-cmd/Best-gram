var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';
let DbService = class DbService {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(this.pool, { schema });
    async ready() { await this.pool.query('SELECT 1'); return true; }
    async onModuleDestroy() { await this.pool.end(); }
};
DbService = __decorate([
    Injectable()
], DbService);
export { DbService };
