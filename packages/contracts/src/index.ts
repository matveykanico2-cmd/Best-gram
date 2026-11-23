export type AuthUser = { id: string; email: string | null; username: string; displayName: string; avatarUrl: string | null };
export type ApiEnvelope<T> = { data: T; error?: never } | { data?: never; error: string };
export type Post = { id: string; body: string; audience: string; authorId: string; createdAt: string; displayName: string; username: string; mediaUrl?: string | null };
export type ChatMessage = { id: string; conversationId: string; senderId: string; body: string; sentAt: string; readAt: string | null };
