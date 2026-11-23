# Nexora

Nexora — монорепозиторий с TypeScript frontend на React/Vite и реальным NestJS API на PostgreSQL/Drizzle. Legacy SQLite/Worker runtime сохранён для лёгкого локального режима и обратной совместимости.

## Локальный запуск

```bash
npm install
npm run dev
```

Frontend: `http://127.0.0.1:5173`
API: `http://127.0.0.1:3000`
Swagger: `http://127.0.0.1:3000/api/docs`

Для лёгкого legacy-режима без PostgreSQL:

```bash
npm start
```

Открыть: `http://127.0.0.1:4173`

Проверки проекта:

```bash
npm run lint
npm run typecheck
npm run db:migrate
```

Для online-режима:

```bash
NEXORA_DOMAIN=example.com docker compose --profile online up -d --build
npm run db:migrate:pg
npm run dev
```

Compose поднимает Nest API, React frontend, PostgreSQL, Redis и MinIO. Профиль `online` добавляет Caddy с автоматическим HTTPS через `NEXORA_DOMAIN`.

Frontend полностью переведён на `.ts/.tsx` и содержит отдельные страницы ленты, профиля, сообщений, сообществ, звонков, видео, marketplace, настроек и админки.

При первом запуске создаются:

- `data/nexora.sqlite` — постоянная база данных;
- `data/media/` — локальное файловое хранилище загрузок;
- WebSocket `ws(s)://host/api/realtime` — обмен сообщениями в реальном времени.

Для VPS:

```bash
NEXORA_HOST=0.0.0.0 NEXORA_PORT=4173 npm start
```

Данные не являются demo-данными: пользователь создаёт аккаунт через экран регистрации, после чего может входить, публиковать записи, загружать медиа, общаться и видеть данные после перезапуска.

Проверка:

```bash
npm test
```

## Домен и постоянные volumes

Для реального домена укажи в `.env`:

```bash
NEXORA_DOMAIN=example.com
NEXORA_ORIGIN=https://example.com
JWT_SECRET=длинный-случайный-секрет
```

После этого запусти online-профиль:

```bash
docker compose --profile online up -d --build
```

Caddy автоматически запросит HTTPS-сертификат для `NEXORA_DOMAIN` и будет
проксировать приложение через `80/443`. Volume `nexora-postgres` хранит аккаунты,
посты и сообщения, `nexora-minio` — фотографии и видео, `nexora-redis` —
временные realtime-данные, а `nexora-caddy` — сертификаты HTTPS. Эти volume нельзя
удалять при обновлении контейнеров: они и есть постоянное хранилище приложения.
