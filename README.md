# RetryNet

RetryNet запускается как полноценный Node.js-сервер с SQLite и WebSocket.

## Локальный запуск

```bash
npm install
npm start
```

Открыть: `http://127.0.0.1:4173`

Проверки проекта:

```bash
npm run lint
npm run typecheck
npm run db:migrate
```

`docker compose up -d` поднимает PostgreSQL, Redis и MinIO для следующего этапа миграции из `link.md`; текущий проверенный runtime использует локальную SQLite, чтобы запуск оставался лёгким и воспроизводимым.

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
