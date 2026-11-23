import type { AuthUser } from '@retrynet/contracts';

declare global {
  namespace Express {
    interface Request { user: AuthUser; }
  }
}

export {};
