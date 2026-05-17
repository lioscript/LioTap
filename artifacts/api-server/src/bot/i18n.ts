export type Lang = "ru" | "en" | "ua";

export const texts: Record<Lang, Record<string, string>> = {
  ru: {
    welcome_lang:
      "🎮 Добро пожаловать в <b>LioTap Shop</b>!\n\n" +
      "Я ваш помощник по приобретению читов для мобильных игр.\n\n" +
      "🌐 Выберите язык:",
    lang_set: "✅ Язык: <b>Русский</b>",

    main_menu_text:
      "🏆 <b>LioTap Shop</b>\n\n" +
      "👋 Привет, <b>{name}</b>!\n\n" +
      "⚡ Премиум читы для топовых мобильных игр.\n" +
      "💎 Мгновенная выдача после оплаты.\n" +
      "🛡 100% безопасно • необнаруживаемо • ежедневные обновления.\n" +
      "🔥 Standoff 2 • PUBG Mobile • Brawlstars • FC Mobile\n\n" +
      "👇 Выберите действие:",

    btn_buy: "🎮 Купить ключ",
    btn_reviews: "⭐ Отзывы",
    btn_help: "🆘 Помощь",
    btn_account: "👤 Мой аккаунт",
    btn_back_main: "🏠 Главное меню",

    buy_key: "🎮 Купить ключ",
    reviews: "⭐ Отзывы",
    help: "🆘 Помощь",
    my_account: "👤 Мой аккаунт",

    choose_game:
      "🎮 <b>Выбор игры</b>\n\n" +
      "Выберите игру, для которой хотите приобрести чит:",

    choose_device:
      "📱 <b>Выбор устройства</b>\n\n" +
      "Выберите тип вашего устройства:",

    desc_apk:
      "📱 <b>APK Android — без root</b>\n\n" +
      "🔥 Поддержка последней версии игры\n" +
      "📲 Android <b>8–16</b>\n" +
      "🗽 <b>Root не нужен!</b>\n" +
      "🔑 Вход через: <b>Vk, Facebook</b>\n\n" +
      "⬇️ Выберите период:",

    desc_ipa:
      "🍎 <b>IPA iOS — все версии</b>\n\n" +
      "🔥 Поддержка последней версии игры\n" +
      "📲 Все версии iOS, <b>включая iOS 26!</b>\n" +
      "🗽 <b>Jailbreak не нужен!</b>\n" +
      "🔑 Вход через: <b>Vk, Facebook, Google</b>\n\n" +
      "⬇️ Выберите период:",

    desc_pc:
      "💻 <b>PC Emulator — без root</b>\n\n" +
      "🔥 Поддержка последней версии игры\n" +
      "📲 Поддерживаемые эмуляторы:\n" +
      "  🟢 <b>Bluestacks 5</b> — без root\n" +
      "  🟡 <b>MSI, LD Player, Nox</b> (root)\n" +
      "🔑 Вход через: <b>Vk, Facebook, Google</b>\n\n" +
      "⬇️ Выберите период:",

    choose_period:
      "⏳ <b>Период подписки</b>\n\nВыберите срок:",

    period_7: "📅 7 дней — 7 USDT",
    period_30: "📆 30 дней — 16 USDT",
    period_forever: "♾️ Навсегда — 30 USDT",

    choose_payment:
      "💳 <b>Способ оплаты</b>\n\nВыберите удобный способ:",

    pay_card: "🇺🇦 Карта Украины (UAH)",
    pay_crypto: "🤖 Crypto Bot (USDT)",
    pay_gold: "🥇 Голдой",

    back: "◀️ Назад",

    account_text:
      "👤 <b>Мой аккаунт</b>\n\n" +
      "🧑 Юзернейм: @{username}\n" +
      "🛒 Покупок: <b>{purchases}</b>",

    change_lang: "🌐 Сменить язык",
    my_purchases: "📦 Мои покупки",
    no_purchases:
      "📭 <b>Покупок пока нет</b>\n\nНажмите «Купить ключ» чтобы приобрести первый продукт!",

    card_invoice:
      "💳 <b>Счёт на оплату</b>\n\n" +
      "🛒 Продукт: <b>{product}</b>\n" +
      "⏳ Срок: <b>{period}</b>\n" +
      "💵 Метод: 🇺🇦 Карта Украины\n" +
      "🆔 Заказ: <code>{orderId}</code>\n\n" +
      "━━━━━━━━━━━━━━━━━━━━\n" +
      "💳 Номер карты:\n<code>{card}</code>\n" +
      "💰 Сумма: <b>{amount} UAH</b>\n" +
      "━━━━━━━━━━━━━━━━━━━━\n\n" +
      "📝 <b>Инструкция:</b>\n" +
      "🔺 Переведите точную сумму на карту\n" +
      "🔺 Нажмите <b>«Проверить оплату»</b>\n" +
      "🔺 Без комментариев к переводу!\n" +
      "⏱ У вас <b>15 минут</b> на оплату",

    crypto_invoice:
      "🤖 <b>Оплата через Crypto Bot</b>\n\n" +
      "🛒 Продукт: <b>{product}</b>\n" +
      "⏳ Срок: <b>{period}</b>\n" +
      "💵 Валюта: USDT\n" +
      "🆔 Заказ: <code>{orderId}</code>\n\n" +
      "━━━━━━━━━━━━━━━━━━━━\n" +
      "💰 Сумма: <b>{amount} USDT</b>\n" +
      "━━━━━━━━━━━━━━━━━━━━\n\n" +
      "👇 Нажмите кнопку ниже для оплаты.\n" +
      "✅ После оплаты ключ выдаётся <b>автоматически!</b>",

    gold_invoice:
      "🥇 <b>Оплата голдой</b>\n\n" +
      "🛒 Продукт: <b>{product}</b>\n" +
      "⏳ Срок: <b>{period}</b>\n" +
      "🆔 Заказ: <code>{orderId}</code>\n\n" +
      "━━━━━━━━━━━━━━━━━━━━\n" +
      "💰 Сумма: <b>{amount} Gold</b>\n" +
      "━━━━━━━━━━━━━━━━━━━━\n\n" +
      "📝 <b>Инструкция:</b>\n" +
      "🔺 Напишите <b>@li0nchik</b> чтобы провести оплату голдой\n" +
      "🔺 Укажите Order ID: <code>{orderId}</code>\n" +
      "🔺 После подтверждения нажмите «Проверить»",

    btn_pay_crypto: "💸 Оплатить через Crypto Bot",
    btn_check: "🔄 Проверить оплату",
    btn_copy_card: "📋 Скопировать номер карты",
    btn_copy_amount: "💰 Скопировать сумму",

    payment_sent:
      "⏳ <b>Заявка отправлена!</b>\n\nОжидайте подтверждения от администратора.",
    payment_checking:
      "⏳ Ваш чек проверяется администратором. Подождите...",
    payment_approved:
      "✅ <b>Оплата подтверждена!</b>\n\n🎉 Ключ будет выдан в ближайшее время.\n💬 По вопросам: @li0nchik",
    payment_rejected:
      "❌ <b>Оплата отклонена</b>\n\nОбратитесь в поддержку: @li0nchik",
    crypto_paid:
      "✅ <b>Оплата получена!</b>\n\n🎉 Ваш заказ подтверждён автоматически!\n💬 Ключ будет выдан в ближайшее время.\nПо вопросам: @li0nchik",
    crypto_expired:
      "⌛ <b>Время оплаты истекло</b>\n\nСчёт недействителен. Создайте новый заказ.",

    reviews_soon:
      "⭐ <b>Отзывы</b>\n\nКанал с отзывами будет добавлен скоро. Следите за обновлениями!",
    help_text:
      "🆘 <b>Помощь</b>\n\nПо всем вопросам обращайтесь:\n👤 @li0nchik\n\n⏱ Время ответа: до 1 часа",
    purchases_header: "📦 <b>Ваши покупки:</b>\n\n",
  },

  en: {
    welcome_lang:
      "🎮 Welcome to <b>LioTap Shop</b>!\n\n" +
      "I'm your assistant for purchasing mobile game cheats.\n\n" +
      "🌐 Choose language:",
    lang_set: "✅ Language: <b>English</b>",

    main_menu_text:
      "🏆 <b>LioTap Shop</b>\n\n" +
      "👋 Hey, <b>{name}</b>! Welcome to the official store.\n\n" +
      "⚡ Premium cheats for the games you play.\n" +
      "💎 Instant key delivery — no waiting.\n" +
      "🛡 100% safe • undetected • daily updates.\n" +
      "🔥 Standoff 2 • PUBG Mobile • Brawlstars • FC Mobile\n\n" +
      "👇 Pick an option to get started:",

    btn_buy: "🎮 Buy Keys",
    btn_reviews: "⭐ Reviews",
    btn_help: "🆘 Help",
    btn_account: "👤 My Account",
    btn_back_main: "🏠 Main Menu",

    buy_key: "🎮 Buy Keys",
    reviews: "⭐ Reviews",
    help: "🆘 Help",
    my_account: "👤 My Account",

    choose_game:
      "🎮 <b>Choose Game</b>\n\nSelect the game you want a cheat for:",

    choose_device:
      "📱 <b>Choose Device</b>\n\nSelect your device type:",

    desc_apk:
      "📱 <b>APK Android — No root</b>\n\n" +
      "🔥 Latest game version supported\n" +
      "📲 Android <b>8–16</b>\n" +
      "🗽 <b>No root required!</b>\n" +
      "🔑 Login: <b>Vk, Facebook</b>\n\n" +
      "⬇️ Choose period:",

    desc_ipa:
      "🍎 <b>IPA iOS — All versions</b>\n\n" +
      "🔥 Latest game version supported\n" +
      "📲 All iOS versions, <b>including iOS 26!</b>\n" +
      "🗽 <b>No Jailbreak required!</b>\n" +
      "🔑 Login: <b>Vk, Facebook, Google</b>\n\n" +
      "⬇️ Choose period:",

    desc_pc:
      "💻 <b>PC Emulator — No root</b>\n\n" +
      "🔥 Latest game version supported\n" +
      "📲 Supported emulators:\n" +
      "  🟢 <b>Bluestacks 5</b> — no root\n" +
      "  🟡 <b>MSI, LD Player, Nox</b> (root)\n" +
      "🔑 Login: <b>Vk, Facebook, Google</b>\n\n" +
      "⬇️ Choose period:",

    choose_period:
      "⏳ <b>Subscription Period</b>\n\nChoose duration:",

    period_7: "📅 7 days — 7 USDT",
    period_30: "📆 30 days — 16 USDT",
    period_forever: "♾️ Forever — 30 USDT",

    choose_payment:
      "💳 <b>Payment Method</b>\n\nChoose how to pay:",

    pay_card: "🇺🇦 Ukraine Card (UAH)",
    pay_crypto: "🤖 Crypto Bot (USDT)",
    pay_gold: "🥇 Gold",

    back: "◀️ Back",

    account_text:
      "👤 <b>My Account</b>\n\n" +
      "🧑 Username: @{username}\n" +
      "🛒 Purchases: <b>{purchases}</b>",

    change_lang: "🌐 Change Language",
    my_purchases: "📦 My Purchases",
    no_purchases:
      "📭 <b>No purchases yet</b>\n\nPress «Buy Keys» to get your first product!",

    card_invoice:
      "💳 <b>Payment Invoice</b>\n\n" +
      "🛒 Product: <b>{product}</b>\n" +
      "⏳ Duration: <b>{period}</b>\n" +
      "💵 Method: 🇺🇦 Ukraine Card\n" +
      "🆔 Order: <code>{orderId}</code>\n\n" +
      "━━━━━━━━━━━━━━━━━━━━\n" +
      "💳 Card number:\n<code>{card}</code>\n" +
      "💰 Amount: <b>{amount} UAH</b>\n" +
      "━━━━━━━━━━━━━━━━━━━━\n\n" +
      "📝 <b>Instructions:</b>\n" +
      "🔺 Transfer exact amount to the card\n" +
      "🔺 Press <b>«Check Payment»</b>\n" +
      "🔺 No comments on the transfer!\n" +
      "⏱ You have <b>15 minutes</b> to pay",

    crypto_invoice:
      "🤖 <b>Crypto Bot Payment</b>\n\n" +
      "🛒 Product: <b>{product}</b>\n" +
      "⏳ Duration: <b>{period}</b>\n" +
      "💵 Currency: USDT\n" +
      "🆔 Order: <code>{orderId}</code>\n\n" +
      "━━━━━━━━━━━━━━━━━━━━\n" +
      "💰 Amount: <b>{amount} USDT</b>\n" +
      "━━━━━━━━━━━━━━━━━━━━\n\n" +
      "👇 Press the button below to pay.\n" +
      "✅ Key is issued <b>automatically</b> after payment!",

    gold_invoice:
      "🥇 <b>Gold Payment</b>\n\n" +
      "🛒 Product: <b>{product}</b>\n" +
      "⏳ Duration: <b>{period}</b>\n" +
      "🆔 Order: <code>{orderId}</code>\n\n" +
      "━━━━━━━━━━━━━━━━━━━━\n" +
      "💰 Amount: <b>{amount} Gold</b>\n" +
      "━━━━━━━━━━━━━━━━━━━━\n\n" +
      "📝 <b>Instructions:</b>\n" +
      "🔺 Write to <b>@li0nchik</b> to process your gold payment\n" +
      "🔺 Provide Order ID: <code>{orderId}</code>\n" +
      "🔺 Press «Check» after confirmation",

    btn_pay_crypto: "💸 Pay via Crypto Bot",
    btn_check: "🔄 Check Payment",
    btn_copy_card: "📋 Copy Card Number",
    btn_copy_amount: "💰 Copy Amount",

    payment_sent:
      "⏳ <b>Request sent!</b>\n\nWaiting for admin confirmation.",
    payment_checking:
      "⏳ Your payment is being checked. Please wait...",
    payment_approved:
      "✅ <b>Payment confirmed!</b>\n\n🎉 Your key will be issued shortly.\n💬 Questions: @li0nchik",
    payment_rejected:
      "❌ <b>Payment rejected</b>\n\nContact support: @li0nchik",
    crypto_paid:
      "✅ <b>Payment received!</b>\n\n🎉 Your order is confirmed automatically!\n💬 Key will be issued soon.\nQuestions: @li0nchik",
    crypto_expired:
      "⌛ <b>Payment time expired</b>\n\nInvoice invalid. Please create a new order.",

    reviews_soon:
      "⭐ <b>Reviews</b>\n\nReviews channel coming soon. Stay tuned!",
    help_text:
      "🆘 <b>Help & Support</b>\n\nContact admin:\n👤 @li0nchik\n\n⏱ Response time: up to 1 hour",
    purchases_header: "📦 <b>Your purchases:</b>\n\n",
  },

  ua: {
    welcome_lang:
      "🎮 Ласкаво просимо до <b>LioTap Shop</b>!\n\n" +
      "Я ваш помічник з придбання читів для мобільних ігор.\n\n" +
      "🌐 Оберіть мову:",
    lang_set: "✅ Мова: <b>Українська</b>",

    main_menu_text:
      "🏆 <b>LioTap Shop</b>\n\n" +
      "👋 Привіт, <b>{name}</b>!\n\n" +
      "⚡ Преміум чити для топових мобільних ігор.\n" +
      "💎 Миттєва видача після оплати.\n" +
      "🛡 100% безпечно • не визначається • щоденні оновлення.\n" +
      "🔥 Standoff 2 • PUBG Mobile • Brawlstars • FC Mobile\n\n" +
      "👇 Оберіть дію:",

    btn_buy: "🎮 Купити ключ",
    btn_reviews: "⭐ Відгуки",
    btn_help: "🆘 Допомога",
    btn_account: "👤 Мій акаунт",
    btn_back_main: "🏠 Головне меню",

    buy_key: "🎮 Купити ключ",
    reviews: "⭐ Відгуки",
    help: "🆘 Допомога",
    my_account: "👤 Мій акаунт",

    choose_game:
      "🎮 <b>Вибір гри</b>\n\nОберіть гру, для якої хочете придбати чит:",

    choose_device:
      "📱 <b>Вибір пристрою</b>\n\nОберіть тип вашого пристрою:",

    desc_apk:
      "📱 <b>APK Android — без root</b>\n\n" +
      "🔥 Підтримка останньої версії гри\n" +
      "📲 Android <b>8–16</b>\n" +
      "🗽 <b>Root не потрібен!</b>\n" +
      "🔑 Вхід через: <b>Vk, Facebook</b>\n\n" +
      "⬇️ Оберіть термін:",

    desc_ipa:
      "🍎 <b>IPA iOS — всі версії</b>\n\n" +
      "🔥 Підтримка останньої версії гри\n" +
      "📲 Всі версії iOS, <b>включно з iOS 26!</b>\n" +
      "🗽 <b>Jailbreak не потрібен!</b>\n" +
      "🔑 Вхід через: <b>Vk, Facebook, Google</b>\n\n" +
      "⬇️ Оберіть термін:",

    desc_pc:
      "💻 <b>PC Emulator — без root</b>\n\n" +
      "🔥 Підтримка останньої версії гри\n" +
      "📲 Підтримувані емулятори:\n" +
      "  🟢 <b>Bluestacks 5</b> — без root\n" +
      "  🟡 <b>MSI, LD Player, Nox</b> (root)\n" +
      "🔑 Вхід через: <b>Vk, Facebook, Google</b>\n\n" +
      "⬇️ Оберіть термін:",

    choose_period:
      "⏳ <b>Термін підписки</b>\n\nОберіть тривалість:",

    period_7: "📅 7 днів — 7 USDT",
    period_30: "📆 30 днів — 16 USDT",
    period_forever: "♾️ Назавжди — 30 USDT",

    choose_payment:
      "💳 <b>Спосіб оплати</b>\n\nОберіть зручний спосіб:",

    pay_card: "🇺🇦 Картка України (UAH)",
    pay_crypto: "🤖 Crypto Bot (USDT)",
    pay_gold: "🥇 Голдою",

    back: "◀️ Назад",

    account_text:
      "👤 <b>Мій акаунт</b>\n\n" +
      "🧑 Юзернейм: @{username}\n" +
      "🛒 Покупок: <b>{purchases}</b>",

    change_lang: "🌐 Змінити мову",
    my_purchases: "📦 Мої покупки",
    no_purchases:
      "📭 <b>Покупок поки немає</b>\n\nНатисніть «Купити ключ» щоб придбати перший продукт!",

    card_invoice:
      "💳 <b>Рахунок на оплату</b>\n\n" +
      "🛒 Продукт: <b>{product}</b>\n" +
      "⏳ Термін: <b>{period}</b>\n" +
      "💵 Метод: 🇺🇦 Картка України\n" +
      "🆔 Замовлення: <code>{orderId}</code>\n\n" +
      "━━━━━━━━━━━━━━━━━━━━\n" +
      "💳 Номер картки:\n<code>{card}</code>\n" +
      "💰 Сума: <b>{amount} UAH</b>\n" +
      "━━━━━━━━━━━━━━━━━━━━\n\n" +
      "📝 <b>Інструкція:</b>\n" +
      "🔺 Переведіть точну суму на картку\n" +
      "🔺 Натисніть <b>«Перевірити оплату»</b>\n" +
      "🔺 Без коментарів до переказу!\n" +
      "⏱ У вас <b>15 хвилин</b> на оплату",

    crypto_invoice:
      "🤖 <b>Оплата через Crypto Bot</b>\n\n" +
      "🛒 Продукт: <b>{product}</b>\n" +
      "⏳ Термін: <b>{period}</b>\n" +
      "💵 Валюта: USDT\n" +
      "🆔 Замовлення: <code>{orderId}</code>\n\n" +
      "━━━━━━━━━━━━━━━━━━━━\n" +
      "💰 Сума: <b>{amount} USDT</b>\n" +
      "━━━━━━━━━━━━━━━━━━━━\n\n" +
      "👇 Натисніть кнопку нижче для оплати.\n" +
      "✅ Ключ видається <b>автоматично</b> після оплати!",

    gold_invoice:
      "🥇 <b>Оплата голдою</b>\n\n" +
      "🛒 Продукт: <b>{product}</b>\n" +
      "⏳ Термін: <b>{period}</b>\n" +
      "🆔 Замовлення: <code>{orderId}</code>\n\n" +
      "━━━━━━━━━━━━━━━━━━━━\n" +
      "💰 Сума: <b>{amount} Gold</b>\n" +
      "━━━━━━━━━━━━━━━━━━━━\n\n" +
      "📝 <b>Інструкція:</b>\n" +
      "🔺 Напишіть <b>@li0nchik</b> щоб провести оплату голдою\n" +
      "🔺 Вкажіть Order ID: <code>{orderId}</code>\n" +
      "🔺 Після підтвердження натисніть «Перевірити»",

    btn_pay_crypto: "💸 Оплатити через Crypto Bot",
    btn_check: "🔄 Перевірити оплату",
    btn_copy_card: "📋 Скопіювати номер картки",
    btn_copy_amount: "💰 Скопіювати суму",

    payment_sent:
      "⏳ <b>Заявку надіслано!</b>\n\nОчікуйте підтвердження від адміністратора.",
    payment_checking:
      "⏳ Ваш чек перевіряється. Зачекайте...",
    payment_approved:
      "✅ <b>Оплату підтверджено!</b>\n\n🎉 Ключ буде виданий найближчим часом.\n💬 Питання: @li0nchik",
    payment_rejected:
      "❌ <b>Оплату відхилено</b>\n\nЗверніться до підтримки: @li0nchik",
    crypto_paid:
      "✅ <b>Оплату отримано!</b>\n\n🎉 Ваше замовлення підтверджено автоматично!\n💬 Ключ буде виданий незабаром.\nПитання: @li0nchik",
    crypto_expired:
      "⌛ <b>Час оплати сплив</b>\n\nРахунок недійсний. Створіть нове замовлення.",

    reviews_soon:
      "⭐ <b>Відгуки</b>\n\nКанал з відгуками незабаром буде додано!",
    help_text:
      "🆘 <b>Допомога</b>\n\nЗ усіх питань:\n👤 @li0nchik\n\n⏱ Час відповіді: до 1 години",
    purchases_header: "📦 <b>Ваші покупки:</b>\n\n",
  },
};

export function t(lang: Lang, key: string, vars?: Record<string, string>): string {
  let text = texts[lang]?.[key] ?? texts["ru"][key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replaceAll(`{${k}}`, v);
    }
  }
  return text;
}
