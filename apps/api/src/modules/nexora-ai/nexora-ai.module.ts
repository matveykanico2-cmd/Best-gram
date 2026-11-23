import { Module } from "@nestjs/common";
import { MessagesModule } from "../messages/messages.module.js";
import { UsersModule } from "../users/users.module.js";
import { NexoraAiController } from "./nexora-ai.controller.js";
import { NexoraAiService } from "./nexora-ai.service.js";

// Nexora AI: чат, настройки ответов и остановка (/api/ai).
@Module({
  imports: [UsersModule, MessagesModule],
  controllers: [NexoraAiController],
  providers: [NexoraAiService],
})
export class NexoraAiModule {}
