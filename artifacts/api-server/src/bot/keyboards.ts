import TelegramBot from "node-telegram-bot-api";
import type { Lang } from "./i18n";
import { t } from "./i18n";

type InlineButton = TelegramBot.InlineKeyboardButton;

// Helper to make a copy_text button (Telegram Bot API 7.11+)
function copyBtn(label: string, textToCopy: string): InlineButton {
  return {
    text: label,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    copy_text: { text: textToCopy },
  } as InlineButton;
}

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

export function mainMenuKeyboard(lang: Lang): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: t(lang, "btn_buy"), callback_data: "menu_buy" }],
      [{ text: t(lang, "btn_reviews"), callback_data: "menu_reviews" }],
      [{ text: t(lang, "btn_help"), callback_data: "menu_help" }],
      [{ text: t(lang, "btn_account"), callback_data: "menu_account" }],
    ],
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
      [{ text: "📱 APK Android — Non root", callback_data: "device_apk" }],
      [{ text: "🍎 IPA iOS", callback_data: "device_ipa" }],
      [{ text: "💻 PC Emulator", callback_data: "device_pc" }],
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
  amountStr: string
): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [copyBtn(t(lang, "btn_copy_card"), cardNumber)],
      [copyBtn(t(lang, "btn_copy_amount"), amountStr)],
      [{ text: t(lang, "btn_check"), callback_data: `check_${orderId}` }],
      [{ text: t(lang, "back"), callback_data: "back_payment" }],
    ],
  };
}

export function cryptoInvoiceKeyboard(
  lang: Lang,
  payUrl: string,
  orderId: string,
): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: t(lang, "btn_pay_crypto"), url: payUrl }],
      [{ text: t(lang, "back"), callback_data: `cancel_crypto_${orderId}` }],
    ],
  };
}

export function goldInvoiceKeyboard(
  lang: Lang,
  orderId: string
): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: t(lang, "btn_check"), callback_data: `check_${orderId}` }],
      [{ text: t(lang, "back"), callback_data: "back_payment" }],
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
      [{ text: t(lang, "back"), callback_data: "back_main" }],
    ],
  };
}
