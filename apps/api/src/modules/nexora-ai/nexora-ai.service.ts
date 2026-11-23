import { Injectable } from "@nestjs/common";
import { ApiError } from "../../common/errors/api-error.js";
import { findOrCreateDm, NEXORA_AI_ID, sendMessageAndBroadcast, nexoraAi } from "../../legacy/legacy.js";
import { MessagesRepository } from "../messages/messages.repository.js";
import { UserSettingsService } from "../users/user-settings.service.js";
import type { AiSettingsDto } from "./model/schemas/nexora-ai.schema.js";

// Nexora AI (/api/ai) — как server/routes/nexoraAi.js: чат, настройки ответов с тарифом и
// лимитами, остановка ответа. Сам ассистент, тарифы и лимиты — в server/lib (nexoraAi.js, aiPlans.js).
@Injectable()
export class NexoraAiService {
  public constructor(
    private readonly messages: MessagesRepository,
    private readonly settings: UserSettingsService
  ) {}

  /** Чат с Nexora AI: создаётся при первом открытии, в пустой — приветствие. */
  public async chat(uid: string) {
    const ai = nexoraAi();
    ai.ensureNexoraAiAccount();
    const chat = await findOrCreateDm(uid, NEXORA_AI_ID);
    if (this.messages.listFeed(chat.id, uid).length === 0) await sendMessageAndBroadcast(chat, NEXORA_AI_ID, ai.WELCOME);
    return { chatId: chat.id };
  }

  /** Крутилки и тариф: настройки ответов, лимиты и сколько потрачено сегодня. */
  public async state(uid: string) {
    const ai = nexoraAi();
    const { plan, settings, usage } = await ai.quotaFor(uid);
    return { settings, plan, plans: Object.values(ai.PLANS), usage, choices: ai.CHOICES };
  }

  public async updateSettings(uid: string, patch: AiSettingsDto) {
    const ai = nexoraAi();
    const { plan } = await ai.quotaFor(uid);
    const current = (this.settings.get(uid).ai as object | undefined) ?? {};
    if (patch.mode === "smart" && !plan.modes.includes("smart")) throw new ApiError(403, "Умный режим доступен в Premium");
    this.settings.update(uid, { ai: ai.normalizeAiSettings({ ...current, ...patch }, plan) });
    return this.state(uid);
  }

  public stop(uid: string, chatId: string) {
    return { stopped: nexoraAi().stopNexoraAi(chatId, uid) };
  }
}
