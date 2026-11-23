import { publicUrl } from "@/shared/lib/public-link";

/** Текст приглашения в Nexora — со ссылкой на вход. */
export const inviteText = () => `Привет! Пишу тебе из Nexora — попробуй, там удобно. ${publicUrl("/login")}`;
