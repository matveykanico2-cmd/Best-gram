<<<<<<< HEAD
# Best-gram
=======
# best-gram — социальная сеть

Полноценная русскоязычная социальная сеть best-gram на React, Tailwind CSS, Zustand и Node.js API с SQLite/WebSocket.

![Bestgram Preview](https://images.unsplash.com/photo-1611605698335-8b1c4627d26a?w=1200&auto=format&fit=crop&q=80)

## 🚀 Возможности Bestgram

### 1. **Rich Post Composition**
- **Media Support:** Upload and preview photos directly in your posts.
- **Emoji Integration:** Native emoji picker for expressive content.
- **Dynamic Feed:** Real-time tweet posting with optimized rendering.

### 2. **Interactive Messaging & AI**
- **Direct Messages:** Full-featured messaging system with stack-based navigation.
- **X-Bot AI:** An integrated AI assistant that responds to your messages in real-time.
- **Smart Scrolling:** Intelligent auto-scroll logic that respects user intent.

### 3. **Discovery & Exploration**
- **Global Search:** Dedicated search results page with tabs for Top, People, and Media.
- **Communities:** Discover and join interest-based groups with beautiful visual cards.
- **Lists:** Create and manage custom feeds based on selected members.

### 4. **User Profiles & Verification**
- **Multi-Tier Verification:** Blue, Gold, and Silver badges integrated into the UI.
- **Profile Customization:** Edit bio, location, and website with instant updates.
- **Follow System:** Robust follow/unfollow logic with real-time stats tracking.

### 5. **Premium Mobile Experience**
- **Responsive Navigation:** Bottom navigation bar and FAB (Floating Action Button) for mobile.
- **Adaptive Layout:** Dynamic Viewport Height (100dvh) support for stable mobile browsing.

## 🛠️ Tech Stack

- **Frontend:** React 18
- **Styling:** Tailwind CSS (Modern aesthetics & Dark Mode)
- **State Management:** Zustand (with Persistence/LocalStorage)
- **Routing:** React Router 6
- **Icons:** Lucide React
- **Animations:** Framer Motion

## 📦 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mazkev/twitter-clonex.git
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🧪 Credentials for Testing

To explore the platform without registering, you can use:
- **Handle:** `@dev_guy`
- **Password:** `password123`

---

Built with ❤️ by Antigravity
# Bestgram

Русскоязычная социальная сеть на React + Vite + Zustand.

## Запуск

```bash
npm install
npm run dev:full
```

Фронтенд запускается на `http://localhost:5173`, API — на `http://localhost:4000`. Для отдельного запуска используйте `npm run dev` и `npm run api`.

## Администратор

Перед деплоем скопируйте `.env.example` в `.env` и обязательно замените `ADMIN_PASSWORD` и `VITE_ADMIN_PASSWORD`. Телефон администратора задаётся через `ADMIN_PHONE`. Администратор входит через обычную форму по телефону и паролю, после чего получает доступ к `/admin`.

## DonatePay

Задайте `VITE_DONATEPAY_URL` своей публичной ссылкой на страницу оплаты DonatePay. Клиент открывает эту ссылку в новой вкладке. Для подтверждения Premium после оплаты нужен серверный webhook/endpoint и backend-аутентификация — не добавляйте секретные ключи в `VITE_*` переменные.

## Деплой

Проект готов для Vercel и Netlify. Команда сборки: `npm run build`, папка публикации: `dist`. Файлы `vercel.json` и `public/_redirects` уже добавлены для работы React Router при прямом открытии страниц.

Для online-режима API запускается отдельным процессом командой `npm run api`. На хостинге укажите `VITE_API_URL` на публичный URL API и сохраните каталог `server/data` на постоянном диске. SMS-подтверждения нет: номер телефона используется как идентификатор аккаунта. В продакшене обязательно используйте HTTPS и задайте собственный `ADMIN_PASSWORD`.

## Установка как приложение

Frontend содержит `manifest.webmanifest` и service worker: после публикации сайт можно установить на Android, iOS и компьютере через меню браузера «Добавить на главный экран». API намеренно не кэшируется, поэтому публикации, чаты и авторизация остаются онлайн-данными backend.

Ключ авторизации сохраняется в localStorage и резервно в cookie, а сервер продлевает активную сессию при каждом запросе. По умолчанию сессия живёт 180 дней; срок можно изменить через `SESSION_DAYS`. Нажатие «Выйти» удаляет ключ и серверную сессию.

## Публикации и модерация

Пользователь может редактировать и удалять свои публикации, администратор — любые публикации. Панель администратора позволяет назначать синюю, золотую или серую галочку и снимать её. Все проверки прав выполняются на сервере, а не только в интерфейсе.
>>>>>>> a7f91ef (prepare best-gram for production)
