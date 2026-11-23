import type { AuthUser } from '@nexora/contracts';

declare global {
  namespace Express {
    interface Request { user: AuthUser; }
  }
}

export {};
