export type Lang = "ru" | "en" | "ua";

export const texts: Record<Lang, Record<string, string>> = {
  ru: {
    welcome_lang:
      "👋 Приветствую! Я <b>LioTap</b> — ваш персональный помощник по приобретению читов для мобильных игр.\n\n🌐 Выберите удобный язык:",

    lang_set: "✅ Язык установлен: <b>Русский</b>",

    main_menu:
      "╔══════════════════╗\n" +
      "      🏆 <b>LioTap Shop</b> 🏆\n" +
      "╚══════════════════╝\n\n" +
      "👋 Добро пожаловать! Здесь вы можете приобрести <b>профессиональные читы</b> для топовых мобильных игр.\n\n" +
      "🔒 Все продукты <b>100% безопасны</b> и регулярно обновляются.\n" +
      "⚡ Активация происходит <b>мгновенно</b> после подтверждения оплаты.\n\n" +
      "📌 Выберите действие ниже 👇",

    buy_key: "🛒 Купить ключ",
    reviews: "⭐ Отзывы",
    help: "🆘 Помощь",
    my_account: "👤 Мой аккаунт",

    choose_game:
      "🎮 <b>Выбор игры</b>\n\n" +
      "Мы поддерживаем следующие игры. Выберите нужную 👇",

    choose_device:
      "📱 <b>Выбор устройства</b>\n\n" +
      "Выберите тип вашего устройства для получения совместимого продукта 👇",

    device_apk: "📱 APK Android — Non root",
    device_ipa: "🍎 IPA iOS",
    device_pc: "💻 PC Emulator",

    desc_apk:
      "╔══════════════════╗\n" +
      "   📱 <b>APK Android — Non Root</b>\n" +
      "╚══════════════════╝\n\n" +
      "🔥 <b>Поддержка последней версии игры</b>\n" +
      "📲 Поддерживает Android версий <b>8 — 16</b>\n" +
      "🗽 <b>Без прав root!</b> Ничего лишнего устанавливать не нужно\n" +
      "🔑 Методы входа: <b>Vk, Facebook</b> — выберите любой удобный!\n\n" +
      "⬇️ Выберите период подписки:",

    desc_ipa:
      "╔══════════════════╗\n" +
      "    🍎 <b>iPA iOS — все версии</b>\n" +
      "╚══════════════════╝\n\n" +
      "🔥 <b>Поддержка последней версии игры</b>\n" +
      "📲 Поддерживает <b>все версии iOS</b>, включая iOS 26!\n" +
      "🗽 <b>Jailbreak и TrollStore НЕ требуются!</b>\n" +
      "🔑 Методы входа: <b>Vk, Facebook, Google</b> — выберите любой удобный!\n\n" +
      "⬇️ Выберите период подписки:",

    desc_pc:
      "╔══════════════════╗\n" +
      "  💻 <b>PC Emulator — Non Root</b>\n" +
      "╚══════════════════╝\n\n" +
      "🔥 <b>Поддержка последней версии игры</b>\n" +
      "📲 Поддерживаемые эмуляторы:\n" +
      "  🟢 <b>Bluestacks 5</b> — без прав root\n" +
      "  🟡 <b>MSI, LD Player, Nox</b> и другие 64-бит (root)\n" +
      "🗽 <b>Без прав root!</b>\n" +
      "🔑 Методы входа: <b>Vk, Facebook, Google</b> — выберите любой удобный!\n\n" +
      "⬇️ Выберите период подписки:",

    choose_period: "⏳ <b>Период подписки</b>\n\nВыберите на сколько хотите приобрести ключ 👇",
    period_7: "📅 7 дней — 7 USDT",
    period_30: "📆 30 дней — 16 USDT",
    period_forever: "♾ Навсегда — 30 USDT",

    choose_payment:
      "💳 <b>Способ оплаты</b>\n\n" +
      "Выберите удобный способ оплаты 👇",

    pay_card: "🇺🇦 Ukraine card (UAH)",
    pay_crypto: "🤖 Crypto bot (USDT)",
    pay_gold: "🥇 Голдой",

    back: "◀️ Назад",
    main_menu_btn: "🏠 Главное меню",

    account_info:
      "╔══════════════════╗\n" +
      "      👤 <b>Мой аккаунт</b>\n" +
      "╚══════════════════╝\n\n" +
      "🧑 Юзернейм: <b>@{username}</b>\n" +
      "🛒 Покупок: <b>{purchases}</b>\n\n" +
      "Управление аккаунтом 👇",

    change_lang: "🌐 Сменить язык",
    my_purchases: "📦 Мои покупки",
    no_purchases: "📭 У вас пока нет покупок.\n\nНажмите <b>Купить ключ</b> чтобы приобрести первый продукт!",

    payment_sent:
      "⏳ <b>Заявка отправлена!</b>\n\n" +
      "Ваш запрос на оплату отправлен администратору.\n" +
      "Пожалуйста, ожидайте подтверждения.\n\n" +
      "⏱ Обычно проверка занимает до 15 минут.",

    payment_rejected:
      "❌ <b>Оплата отклонена</b>\n\n" +
      "К сожалению, ваша оплата была отклонена.\n" +
      "Обратитесь за помощью: @li0nchik",

    payment_approved:
      "✅ <b>Оплата подтверждена!</b>\n\n" +
      "🎉 Поздравляем с покупкой! Ваш ключ будет выдан в ближайшее время.\n\n" +
      "💬 По вопросам активации: @li0nchik",

    check_payment: "🔄 Проверить оплату",
    copy_card: "📋 Скопировать номер карты",
    copy_amount: "💰 Скопировать сумму",

    reviews_soon: "⭐ <b>Отзывы</b>\n\nКанал с отзывами скоро будет добавлен. Следите за обновлениями!",
    help_text:
      "🆘 <b>Помощь и поддержка</b>\n\n" +
      "По всем вопросам, проблемам с активацией или оплатой — обращайтесь к нашему администратору:\n\n" +
      "👤 @li0nchik\n\n" +
      "⏱ Время ответа: обычно до 1 часа",
  },

  en: {
    welcome_lang:
      "👋 Welcome! I'm <b>LioTap</b> — your personal assistant for purchasing mobile game cheats.\n\n🌐 Please select your language:",

    lang_set: "✅ Language set: <b>English</b>",

    main_menu:
      "╔══════════════════╗\n" +
      "      🏆 <b>LioTap Shop</b> 🏆\n" +
      "╚══════════════════╝\n\n" +
      "👋 Welcome! Here you can purchase <b>professional cheats</b> for top mobile games.\n\n" +
      "🔒 All products are <b>100% safe</b> and regularly updated.\n" +
      "⚡ Activation happens <b>instantly</b> after payment confirmation.\n\n" +
      "📌 Select an action below 👇",

    buy_key: "🛒 Buy Key",
    reviews: "⭐ Reviews",
    help: "🆘 Help",
    my_account: "👤 My Account",

    choose_game:
      "🎮 <b>Choose Game</b>\n\n" +
      "We support the following games. Select the one you need 👇",

    choose_device:
      "📱 <b>Choose Device</b>\n\n" +
      "Select your device type to get a compatible product 👇",

    device_apk: "📱 APK Android — Non root",
    device_ipa: "🍎 IPA iOS",
    device_pc: "💻 PC Emulator",

    desc_apk:
      "╔══════════════════╗\n" +
      "   📱 <b>APK Android — Non Root</b>\n" +
      "╚══════════════════╝\n\n" +
      "🔥 <b>Support for the latest game version</b>\n" +
      "📲 Supports Android versions <b>8 — 16</b>\n" +
      "🗽 <b>No root rights required!</b>\n" +
      "🔑 Login methods: <b>Vk, Facebook</b> — choose any!\n\n" +
      "⬇️ Select your subscription period:",

    desc_ipa:
      "╔══════════════════╗\n" +
      "    🍎 <b>iPA iOS — all versions</b>\n" +
      "╚══════════════════╝\n\n" +
      "🔥 <b>Support for the latest game version</b>\n" +
      "📲 Supports <b>all iOS versions</b>, even iOS 26!\n" +
      "🗽 <b>No Jailbreak or TrollStore required!</b>\n" +
      "🔑 Login methods: <b>Vk, Facebook, Google</b> — choose any!\n\n" +
      "⬇️ Select your subscription period:",

    desc_pc:
      "╔══════════════════╗\n" +
      "  💻 <b>PC Emulator — Non Root</b>\n" +
      "╚══════════════════╝\n\n" +
      "🔥 <b>Support for the latest game version</b>\n" +
      "📲 Supported emulators:\n" +
      "  🟢 <b>Bluestacks 5</b> — works without root\n" +
      "  🟡 <b>MSI, LD Player, Nox</b> and other 64-bit (root)\n" +
      "🗽 <b>No root rights required!</b>\n" +
      "🔑 Login methods: <b>Vk, Facebook, Google</b> — choose any!\n\n" +
      "⬇️ Select your subscription period:",

    choose_period: "⏳ <b>Subscription Period</b>\n\nChoose how long you want to purchase the key for 👇",
    period_7: "📅 7 days — 7 USDT",
    period_30: "📆 30 days — 16 USDT",
    period_forever: "♾ Forever — 30 USDT",

    choose_payment:
      "💳 <b>Payment Method</b>\n\n" +
      "Choose your preferred payment method 👇",

    pay_card: "🇺🇦 Ukraine card (UAH)",
    pay_crypto: "🤖 Crypto bot (USDT)",
    pay_gold: "🥇 Gold",

    back: "◀️ Back",
    main_menu_btn: "🏠 Main Menu",

    account_info:
      "╔══════════════════╗\n" +
      "      👤 <b>My Account</b>\n" +
      "╚══════════════════╝\n\n" +
      "🧑 Username: <b>@{username}</b>\n" +
      "🛒 Purchases: <b>{purchases}</b>\n\n" +
      "Account management 👇",

    change_lang: "🌐 Change Language",
    my_purchases: "📦 My Purchases",
    no_purchases: "📭 You have no purchases yet.\n\nPress <b>Buy Key</b> to get your first product!",

    payment_sent:
      "⏳ <b>Request sent!</b>\n\n" +
      "Your payment request has been sent to the administrator.\n" +
      "Please wait for confirmation.\n\n" +
      "⏱ Usually verified within 15 minutes.",

    payment_rejected:
      "❌ <b>Payment Rejected</b>\n\n" +
      "Unfortunately, your payment was rejected.\n" +
      "Contact support: @li0nchik",

    payment_approved:
      "✅ <b>Payment Confirmed!</b>\n\n" +
      "🎉 Congratulations on your purchase! Your key will be issued shortly.\n\n" +
      "💬 For activation questions: @li0nchik",

    check_payment: "🔄 Check Payment",
    copy_card: "📋 Copy Card Number",
    copy_amount: "💰 Copy Amount",

    reviews_soon: "⭐ <b>Reviews</b>\n\nThe reviews channel will be added soon. Stay tuned!",
    help_text:
      "🆘 <b>Help & Support</b>\n\n" +
      "For any questions, activation problems or payment issues — contact our admin:\n\n" +
      "👤 @li0nchik\n\n" +
      "⏱ Response time: usually within 1 hour",
  },

  ua: {
    welcome_lang:
      "👋 Вітаю! Я <b>LioTap</b> — ваш персональний помічник з придбання читів для мобільних ігор.\n\n🌐 Оберіть зручну мову:",

    lang_set: "✅ Мову встановлено: <b>Українська</b>",

    main_menu:
      "╔══════════════════╗\n" +
      "      🏆 <b>LioTap Shop</b> 🏆\n" +
      "╚══════════════════╝\n\n" +
      "👋 Ласкаво просимо! Тут ви можете придбати <b>професійні чити</b> для топових мобільних ігор.\n\n" +
      "🔒 Всі продукти <b>100% безпечні</b> та регулярно оновлюються.\n" +
      "⚡ Активація відбувається <b>миттєво</b> після підтвердження оплати.\n\n" +
      "📌 Оберіть дію нижче 👇",

    buy_key: "🛒 Купити ключ",
    reviews: "⭐ Відгуки",
    help: "🆘 Допомога",
    my_account: "👤 Мій акаунт",

    choose_game:
      "🎮 <b>Вибір гри</b>\n\n" +
      "Ми підтримуємо наступні ігри. Оберіть потрібну 👇",

    choose_device:
      "📱 <b>Вибір пристрою</b>\n\n" +
      "Оберіть тип вашого пристрою для отримання сумісного продукту 👇",

    device_apk: "📱 APK Android — Non root",
    device_ipa: "🍎 IPA iOS",
    device_pc: "💻 PC Emulator",

    desc_apk:
      "╔══════════════════╗\n" +
      "   📱 <b>APK Android — Non Root</b>\n" +
      "╚══════════════════╝\n\n" +
      "🔥 <b>Підтримка останньої версії гри</b>\n" +
      "📲 Підтримує Android версій <b>8 — 16</b>\n" +
      "🗽 <b>Без прав root!</b> Нічого зайвого встановлювати не потрібно\n" +
      "🔑 Методи входу: <b>Vk, Facebook</b> — обери будь-який!\n\n" +
      "⬇️ Оберіть період підписки:",

    desc_ipa:
      "╔══════════════════╗\n" +
      "    🍎 <b>iPA iOS — всі версії</b>\n" +
      "╚══════════════════╝\n\n" +
      "🔥 <b>Підтримка останньої версії гри</b>\n" +
      "📲 Підтримує <b>всі версії iOS</b>, включно з iOS 26!\n" +
      "🗽 <b>Jailbreak та TrollStore НЕ потрібні!</b>\n" +
      "🔑 Методи входу: <b>Vk, Facebook, Google</b> — обери будь-який!\n\n" +
      "⬇️ Оберіть період підписки:",

    desc_pc:
      "╔══════════════════╗\n" +
      "  💻 <b>PC Emulator — Non Root</b>\n" +
      "╚══════════════════╝\n\n" +
      "🔥 <b>Підтримка останньої версії гри</b>\n" +
      "📲 Підтримувані емулятори:\n" +
      "  🟢 <b>Bluestacks 5</b> — без прав root\n" +
      "  🟡 <b>MSI, LD Player, Nox</b> та інші 64-біт (root)\n" +
      "🗽 <b>Без прав root!</b>\n" +
      "🔑 Методи входу: <b>Vk, Facebook, Google</b> — обери будь-який!\n\n" +
      "⬇️ Оберіть період підписки:",

    choose_period: "⏳ <b>Термін підписки</b>\n\nОберіть на скільки хочете придбати ключ 👇",
    period_7: "📅 7 днів — 7 USDT",
    period_30: "📆 30 днів — 16 USDT",
    period_forever: "♾ Назавжди — 30 USDT",

    choose_payment:
      "💳 <b>Спосіб оплати</b>\n\n" +
      "Оберіть зручний спосіб оплати 👇",

    pay_card: "🇺🇦 Ukraine card (UAH)",
    pay_crypto: "🤖 Crypto bot (USDT)",
    pay_gold: "🥇 Голдою",

    back: "◀️ Назад",
    main_menu_btn: "🏠 Головне меню",

    account_info:
      "╔══════════════════╗\n" +
      "      👤 <b>Мій акаунт</b>\n" +
      "╚══════════════════╝\n\n" +
      "🧑 Юзернейм: <b>@{username}</b>\n" +
      "🛒 Покупок: <b>{purchases}</b>\n\n" +
      "Управління акаунтом 👇",

    change_lang: "🌐 Змінити мову",
    my_purchases: "📦 Мої покупки",
    no_purchases: "📭 У вас поки немає покупок.\n\nНатисніть <b>Купити ключ</b> щоб придбати перший продукт!",

    payment_sent:
      "⏳ <b>Заявку надіслано!</b>\n\n" +
      "Ваш запит на оплату надіслано адміністратору.\n" +
      "Будь ласка, очікуйте підтвердження.\n\n" +
      "⏱ Зазвичай перевірка займає до 15 хвилин.",

    payment_rejected:
      "❌ <b>Оплату відхилено</b>\n\n" +
      "На жаль, вашу оплату було відхилено.\n" +
      "Зверніться за допомогою: @li0nchik",

    payment_approved:
      "✅ <b>Оплату підтверджено!</b>\n\n" +
      "🎉 Вітаємо з покупкою! Ваш ключ буде виданий найближчим часом.\n\n" +
      "💬 З питань активації: @li0nchik",

    check_payment: "🔄 Перевірити оплату",
    copy_card: "📋 Скопіювати номер карти",
    copy_amount: "💰 Скопіювати суму",

    reviews_soon: "⭐ <b>Відгуки</b>\n\nКанал з відгуками незабаром буде додано. Слідкуйте за оновленнями!",
    help_text:
      "🆘 <b>Допомога та підтримка</b>\n\n" +
      "З усіх питань, проблем з активацією або оплатою — звертайтеся до нашого адміністратора:\n\n" +
      "👤 @li0nchik\n\n" +
      "⏱ Час відповіді: зазвичай до 1 години",
  },
};

export function t(lang: Lang, key: string, vars?: Record<string, string>): string {
  let text = texts[lang]?.[key] ?? texts["ru"][key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, v);
    }
  }
  return text;
}
