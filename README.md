# Zuko Messenger

Мини-соцсеть и мессенджер в реальном времени (Telegram-like). Монорепозиторий в prod-стиле:
аккаунты, лента постов, лайки/комментарии/репосты, шаринг-ссылки на посты, личная переписка
в реальном времени, typing-индикаторы, presence, read-receipts и push-уведомления через WebSocket.

## Стек

| Слой | Технологии |
|------|-----------|
| **Фронт** | Next.js 15 (App Router, React 19), TypeScript strict, TanStack Query, Redux Toolkit, react-hook-form + zod, Tailwind v4 |
| **UI-kit** | `@zuko/ui` — 42 компонента (CVA + clsx + tailwind-merge), перекрашены под тему **Trigger.dev** (dark canvas, Signal Lime accent, Satoshi/Geist) |
| **Бэк** | Fastify 5 + Socket.io 4, JWT-auth (access+refresh, httpOnly cookies, ротация) |
| **БД** | PostgreSQL + Prisma |
| **Тесты** | Vitest (бизнес-логика: slices, cache-updaters, сериализаторы, zod-схемы, api-client) |

## Структура монорепы (npm workspaces)

```
apps/
  web/     Next.js фронт (архитектура Feature-Sliced Design)
  api/     Fastify + Socket.io бэкенд
packages/
  ui/         @zuko/ui  — UI-kit + Trigger.dev токены
  db/         @zuko/db  — Prisma schema, client, seed
  contracts/  @zuko/contracts — zod-схемы и типы, общие для web и api
  config/     @zuko/config — базовые tsconfig / eslint / prettier
```

### Фронт: Feature-Sliced Design

```
apps/web/src/
  app/        Next-роутинг + app-слой FSD (providers, store, layout, error/not-found)
  views/      страницы-композиции (pages-слой FSD)
  widgets/    app-shell, feed, chat, post-card, post-detail, conversation-list, …
  features/   auth, post-create/like/repost/delete/share, comment-create,
              send-message, start-conversation, mark-notifications-read, update-profile
  entities/   session, user, post, comment, message, conversation, notification
  shared/     api-client, config, socket, lib (format, redux-hooks), ui (skeletons, error-boundary)
```

Импорты строго вниз по слоям (`app → views → widgets → features → entities → shared`),
у каждого слайса — публичный API через `index.ts`. Разделение состояния:
**TanStack Query** — серверные данные (кэш, инвалидация, оптимистичные мутации),
**Redux Toolkit** — клиентское realtime-состояние (сессия, presence, typing, unread-счётчики).

## Требования

- **Node.js ≥ 20**
- **PostgreSQL** — проще всего через Docker (`docker-compose.yml` в комплекте). Нет Docker —
  подойдёт любой локальный/облачный Postgres: пропишите строку подключения в `.env`.

## Быстрый старт

```bash
# 1. Зависимости
npm install

# 2. Поднять Postgres (если есть Docker)
docker compose up -d

# 3. Переменные окружения — скопировать примеры и при необходимости поправить
cp .env.example apps/api/.env          # секреты API + DATABASE_URL
cp .env.example packages/db/.env       # DATABASE_URL для Prisma CLI
cp .env.example apps/web/.env.local    # NEXT_PUBLIC_API_URL / SOCKET_URL

# 4. Схема БД + демо-данные
npm run db:generate
npm run db:push        # синхронизировать схему (или db:migrate для истории миграций)
npm run db:seed        # демо-юзеры + посты + диалог

# 5. Запуск (api :4000 + web :3000 параллельно)
npm run dev
```

Откройте http://localhost:3000. Демо-логины из сида: **alice** / **bob**, пароль `password123`.

## Скрипты

| Команда | Действие |
|---------|----------|
| `npm run dev` | api + web параллельно |
| `npm run build` | сборка всех пакетов и приложений |
| `npm run typecheck` | tsc по всем workspaces |
| `npm run test` | Vitest по всем workspaces |
| `npm run db:push` / `db:migrate` / `db:seed` / `db:studio` | Prisma |
| `npm run ui:sync` | пересинхронизировать компоненты `@zuko/ui` из апстрим-репозитория |

## Как это работает

- **Auth.** `POST /auth/register|login` выдают access (15м) и refresh (7д) в httpOnly-cookie;
  refresh ротируется на `/auth/refresh`. Один и тот же access-токен валидируется и в REST
  (`preHandler`), и в Socket.io handshake.
- **Realtime.** Socket.io на том же http-сервере, что и Fastify. Комнаты: `conversation:<id>`
  (сообщения/typing/read) и `user:<id>` (доставка уведомлений вне открытого диалога). Клиент
  подключается после появления сессии; входящие события маршрутизируются в TanStack Query
  (данные) и RTK (UI-состояние) из `SocketProvider`.
- **Уведомления.** Лайк/коммент/репост/сообщение создают запись `Notification` и пушатся
  получателю событием `notification:new` → toast + бейдж непрочитанных.
- **Дизайн.** Тема dark-only Trigger.dev: семантические токены переопределены в
  `packages/ui/src/styles/tokens.css`, акцент Signal Lime `#a8ff53` — единственная filled-поверхность.

## Тесты

```bash
npm run test
```

Покрыта бизнес-логика: reducers `chat`/`session`, чистый cache-updater `updatePostInPages`,
`timeAgo`/`initials`, `api-client` (401 → refresh → retry на моках fetch), тексты уведомлений,
zod-схемы contracts, сериализаторы API.

## Заметки

- `apps/api` запускается через `tsx` (dev и prod) — без стадии компиляции TS.
- UI-kit помечен `'use client'` там, где используются хуки, — для совместимости с RSC Next.js.
```
