# LioTap Cheat Bot

Telegram бот для продажу читів до мобільних ігор. Підтримує 3 мови, кілька способів оплати та систему реферальних посилань.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — запустити сервер + бот (port 5000)
- `pnpm run typecheck` — перевірка типів
- `pnpm run build` — збірка всіх пакетів

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- Telegram: node-telegram-bot-api (polling)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/api-server/src/bot/bot.ts` — головний файл бота, обробка всіх команд і колбеків
- `artifacts/api-server/src/bot/i18n.ts` — переклади (ru/en/ua)
- `artifacts/api-server/src/bot/keyboards.ts` — клавіатури InlineKeyboard та ReplyKeyboard
- `artifacts/api-server/src/bot/store.ts` — in-memory сховище користувачів, покупок, рефералів
- `artifacts/api-server/src/bot/prices.ts` — ціни, карта, назви продуктів

## Architecture decisions

- In-memory store (Map) — дані зберігаються під час роботи процесу; перезапуск скидає стан. Для продакшну варто підключити PostgreSQL.
- Polling mode — бот використовує polling, не webhook. Простіше для dev-середовища.
- Реферальні посилання виглядають як звичайні `/start ref_XXXXXX` — не розкривають, що це реферал.
- 50% комісія трафікеру рахується автоматично після підтвердження оплати адміном.

## Product

- Вибір мови при старті (RU/EN/UA)
- Купівля ключів: 4 гри × 3 девайси × 3 терміни × 3 способи оплати
- Картка Ukraine: рахунок з номером карти 5168752027679524
- Crypto bot: оплата в USDT
- Голда: внутрішня валюта гри
- Адмін група: підтвердження/відхилення платежів, /menu, /ref, /users
- Реферальна система з відстеженням кліків та конверсій

## Secrets required

- `TELEGRAM_BOT_TOKEN` — токен бота від @BotFather
- `ADMIN_GROUP_ID` — Chat ID адмін групи (від'ємне число)

## Adm group commands

- `/menu` — статистика (кількість юзерів, зароблено)
- `/ref` — створити реферальне посилання
- `/users` — список останніх 20 користувачів

## Gotchas

- Bot токен та ADMIN_GROUP_ID зберігаються в Replit Secrets
- ADMIN_GROUP_ID має бути від'ємним числом (групи мають від'ємні ID)
- Після перезапуску сервера всі pending payments скидаються — юзери мають починати замовлення знову
