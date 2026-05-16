import TelegramBot from "node-telegram-bot-api";
import type { Lang } from "./i18n";
import { t } from "./i18n";

export function langKeyboard(): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: "🇷🇺 Русский", callback_data: "lang_ru" },
        { text: "🇬🇧 English", callback_data: "lang_en" },
        { text: "🇺🇦 Українська", callback_data: "lang_ua" },
      ],
    ],
  };
}

export function mainMenuKeyboard(lang: Lang): TelegramBot.ReplyKeyboardMarkup {
  return {
    keyboard: [
      [{ text: t(lang, "buy_key") }, { text: t(lang, "reviews") }],
      [{ text: t(lang, "help") }, { text: t(lang, "my_account") }],
    ],
    resize_keyboard: true,
  };
}

export function gamesKeyboard(lang: Lang): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: "🎯 Standoff 2", callback_data: "game_standoff2" },
        { text: "🔫 PUBG Mobile", callback_data: "game_pubgmobile" },
      ],
      [
        { text: "⭐ Brawlstars", callback_data: "game_brawlstars" },
        { text: "⚽ FC MOBILE", callback_data: "game_fcmobile" },
      ],
      [{ text: t(lang, "back"), callback_data: "back_main" }],
    ],
  };
}

export function deviceKeyboard(lang: Lang): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: t(lang, "device_apk"), callback_data: "device_apk" }],
      [{ text: t(lang, "device_ipa"), callback_data: "device_ipa" }],
      [{ text: t(lang, "device_pc"), callback_data: "device_pc" }],
      [{ text: t(lang, "back"), callback_data: "back_games" }],
    ],
  };
}

export function periodKeyboard(lang: Lang): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: t(lang, "period_7"), callback_data: "period_7" }],
      [{ text: t(lang, "period_30"), callback_data: "period_30" }],
      [{ text: t(lang, "period_forever"), callback_data: "period_forever" }],
      [{ text: t(lang, "back"), callback_data: "back_device" }],
    ],
  };
}

export function paymentKeyboard(lang: Lang): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: t(lang, "pay_card"), callback_data: "pay_card" }],
      [{ text: t(lang, "pay_crypto"), callback_data: "pay_crypto" }],
      [{ text: t(lang, "pay_gold"), callback_data: "pay_gold" }],
      [{ text: t(lang, "back"), callback_data: "back_period" }],
    ],
  };
}

export function cardInvoiceKeyboard(
  lang: Lang,
  orderId: string,
  cardNumber: string,
  amount: string
): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: t(lang, "copy_card"), callback_data: `copy_card_${cardNumber}` }],
      [{ text: t(lang, "copy_amount"), callback_data: `copy_amount_${amount}` }],
      [{ text: t(lang, "check_payment"), callback_data: `check_${orderId}` }],
    ],
  };
}

export function cryptoInvoiceKeyboard(
  lang: Lang,
  orderId: string
): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: t(lang, "check_payment"), callback_data: `check_${orderId}` }],
    ],
  };
}

export function goldInvoiceKeyboard(
  lang: Lang,
  orderId: string
): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: t(lang, "check_payment"), callback_data: `check_${orderId}` }],
    ],
  };
}

export function adminPaymentKeyboard(
  orderId: string
): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: "✅ Підтвердити", callback_data: `approve_${orderId}` },
        { text: "❌ Відхилити", callback_data: `reject_${orderId}` },
      ],
    ],
  };
}

export function accountKeyboard(lang: Lang): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: t(lang, "my_purchases"), callback_data: "my_purchases" }],
      [{ text: t(lang, "change_lang"), callback_data: "change_lang" }],
    ],
  };
}
