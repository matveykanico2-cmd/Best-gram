const db = require("../db");
const { applyBotMascot } = require("../lib/botMascot");

const NEXORA_AI_ID = "bot_nexora_ai";

const PROFILE = {
  name: "Nexora AI",
  username: "nexora_ai",
  avatarColor: "#7b5cff",
  bio: "ИИ-ассистент Nexora: отвечает на вопросы, разбирает фото и документы, пишет тексты и рисует картинки. /image — нарисовать, /new — начать заново.",
};

const COMMANDS = [
  { command: "new", description: "Начать разговор заново" },
  { command: "image", description: "Нарисовать картинку по описанию" },
  { command: "settings", description: "Режим, длина ответов, тон и тариф" },
];

function ensureNexoraAiAccount() {
  const existing = db.prepare("SELECT id, name FROM users WHERE id = ?").get(NEXORA_AI_ID);
  if (!existing) {
    // Ник мог занять живой человек — тогда бот живёт без ника, его находят через меню.
    const taken = db.prepare("SELECT 1 FROM users WHERE lower(username) = lower(?)").get(PROFILE.username);
    db.prepare(
      `INSERT INTO users (id, name, username, phone, email, avatarColor, bio, online, isBot, blockedUserIds, isPremium)
       VALUES (@id, @name, @username, '', NULL, @avatarColor, @bio, 1, 1, '[]', 0)`
    ).run({ id: NEXORA_AI_ID, ...PROFILE, username: taken ? "" : PROFILE.username });
  } else if (existing.name !== PROFILE.name) {
    db.prepare("UPDATE users SET name = @name, bio = @bio WHERE id = @id").run({ id: NEXORA_AI_ID, ...PROFILE });
  }
  db.prepare(
    `INSERT INTO bots (id, userId, description, commands) VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET description = excluded.description, commands = excluded.commands`
  ).run(NEXORA_AI_ID, NEXORA_AI_ID, "ИИ-ассистент: вопросы, фото, документы, картинки", JSON.stringify(COMMANDS));
  applyBotMascot(NEXORA_AI_ID);
}

module.exports = { NEXORA_AI_ID, ensureNexoraAiAccount };
