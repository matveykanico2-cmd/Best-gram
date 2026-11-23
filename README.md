# RetryNet

RetryNet — монорепозиторий с TypeScript frontend на React/Vite и реальным NestJS API на PostgreSQL/Drizzle. Legacy SQLite/Worker runtime сохранён для лёгкого локального режима и обратной совместимости.

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
docker compose up -d --build
npm run db:migrate:pg
npm run dev
```

Compose поднимает Nest API, React frontend, PostgreSQL, Redis и MinIO.

Frontend полностью переведён на `.ts/.tsx` и содержит отдельные страницы ленты, профиля, сообщений, сообществ, звонков, видео, marketplace, настроек и админки.

При первом запуске создаются:

- `data/retrynet.sqlite` — постоянная база данных;
- `data/media/` — локальное файловое хранилище загрузок;
- WebSocket `ws(s)://host/api/realtime` — обмен сообщениями в реальном времени.

Для VPS:

```bash
RETRYNET_HOST=0.0.0.0 RETRYNET_PORT=4173 npm start
```

Данные не являются demo-данными: пользователь создаёт аккаунт через экран регистрации, после чего может входить, публиковать записи, загружать медиа, общаться и видеть данные после перезапуска.

Проверка:

```bash
npm test
```
