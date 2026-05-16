import TelegramBot from "node-telegram-bot-api";
import { logger } from "../lib/logger";
import type { Lang } from "./i18n";
import { t } from "./i18n";
import {
  getUser,
  setUser,
  createUser,
  getUserCount,
  getTotalEarned,
  addEarned,
  addPendingPayment,
  getPendingPayment,
  removePendingPayment,
  createReferral,
  getReferral,
  getReferralsByCreator,
  incrementReferralClick,
  incrementReferralConversion,
  getAllUsers,
  type Purchase,
} from "./store";
import {
  langKeyboard,
  mainMenuKeyboard,
  gamesKeyboard,
  deviceKeyboard,
  periodKeyboard,
  paymentKeyboard,
  cardInvoiceKeyboard,
  cryptoInvoiceKeyboard,
  goldInvoiceKeyboard,
  adminPaymentKeyboard,
  accountKeyboard,
} from "./keyboards";
import {
  CARD_NUMBER,
  PRICES_UAH,
  PRICES_USDT,
  PRICES_GOLD,
  PERIOD_LABELS,
  GAME_LABELS,
  DEVICE_LABELS,
  getPaymentMethodLabel,
  getAmountForMethod,
} from "./prices";

const BOT_TOKEN = process.env["TELEGRAM_BOT_TOKEN"];
const ADMIN_GROUP_ID = process.env["ADMIN_GROUP_ID"];

if (!BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN is required");
if (!ADMIN_GROUP_ID) throw new Error("ADMIN_GROUP_ID is required");

const ADMIN_GROUP = Number(ADMIN_GROUP_ID);

export function startBot(): void {
  const bot = new TelegramBot(BOT_TOKEN!, { polling: true });

  logger.info("Telegram bot started");

  function generateOrderId(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  function generateRefCode(): string {
    return Math.random().toString(36).substring(2, 9).toUpperCase();
  }

  function getUserLang(userId: number): Lang {
    return getUser(userId)?.lang ?? "ru";
  }

  async function sendMainMenu(bot: TelegramBot, chatId: number, lang: Lang): Promise<void> {
    await bot.sendMessage(chatId, t(lang, "main_menu"), {
      reply_markup: mainMenuKeyboard(lang),
    });
  }

  async function notifyAdminNewUser(username: string, referrerUsername?: string): Promise<void> {
    const msg = referrerUsername
      ? `👤 Новий користувач бота!\n\n🧑 Юз: @${username}\n🔗 Трафікер: @${referrerUsername}`
      : `👤 Новий користувач бота!\n\n🧑 Юз: @${username}`;
    try {
      await bot.sendMessage(ADMIN_GROUP, msg);
    } catch (e) {
      logger.error({ err: e }, "Failed to notify admin of new user");
    }
  }

  // /start handler
  bot.onText(/\/start(.*)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from!.id;
    const username = msg.from!.username ?? `user${userId}`;
    const param = match?.[1]?.trim() ?? "";

    const existingUser = getUser(userId);

    if (!existingUser) {
      let referredBy: string | undefined;

      if (param.startsWith("ref_")) {
        const refCode = param.slice(4);
        const refLink = getReferral(refCode);
        if (refLink) {
          referredBy = refLink.creatorUsername;
          incrementReferralClick(refCode);
        }
      }

      createUser(userId, username, referredBy);
      await notifyAdminNewUser(username, referredBy);
    }

    const user = getUser(userId)!;

    if (user.step === "lang_select" || !user.step) {
      await bot.sendMessage(chatId, "👋 Привет! Я <b>LioTap</b> — ваш помощник по читам.\n\nВыберите язык / Choose language / Оберіть мову:", {
        parse_mode: "HTML",
        reply_markup: langKeyboard(),
      });
    } else {
      await sendMainMenu(bot, chatId, user.lang);
    }
  });

  // Text message handler (main menu buttons)
  bot.on("message", async (msg) => {
    if (!msg.text || msg.text.startsWith("/")) return;

    const chatId = msg.chat.id;
    const userId = msg.from!.id;
    const user = getUser(userId);

    if (!user || user.step === "lang_select") return;

    const lang = user.lang;
    const text = msg.text;

    if (text === t(lang, "buy_key")) {
      user.step = "choose_game";
      setUser(userId, user);
      await bot.sendMessage(chatId, t(lang, "choose_game"), {
        reply_markup: gamesKeyboard(lang),
      });
    } else if (text === t(lang, "reviews")) {
      await bot.sendMessage(chatId, t(lang, "reviews_link"), {
        reply_markup: mainMenuKeyboard(lang),
      });
    } else if (text === t(lang, "help")) {
      await bot.sendMessage(chatId, t(lang, "help_text"), {
        reply_markup: mainMenuKeyboard(lang),
      });
    } else if (text === t(lang, "my_account")) {
      const purchases = user.purchases.filter((p) => p.status === "approved");
      const purchaseCount = purchases.length;
      const info = t(lang, "account_info", {
        username: user.username,
        purchases: purchaseCount > 0 ? `${purchaseCount} шт.` : t(lang, "no_purchases"),
      });
      await bot.sendMessage(chatId, info, {
        reply_markup: accountKeyboard(lang),
      });
    }
  });

  // Admin group commands
  bot.on("message", async (msg) => {
    if (!msg.text || !msg.from) return;
    if (msg.chat.id !== ADMIN_GROUP) return;

    const text = msg.text;
    const userId = msg.from.id;
    const username = msg.from.username ?? `user${userId}`;

    if (text === "/menu") {
      const userCount = getUserCount();
      const earned = getTotalEarned();
      await bot.sendMessage(
        ADMIN_GROUP,
        `📊 <b>Адмін панель LioTap</b>\n\n👥 Користувачів у боті: <b>${userCount}</b>\n💰 Всього зароблено: <b>${earned} UAH</b>\n\n/menu — ця панель\n/ref — створити реферальне посилання`,
        { parse_mode: "HTML" }
      );
    } else if (text === "/ref") {
      const existingRefs = getReferralsByCreator(userId);
      let refMsg = `🔗 <b>Ваші посилання:</b>\n\n`;

      if (existingRefs.length > 0) {
        for (const ref of existingRefs) {
          refMsg += `• Код: <code>${ref.code}</code>\n  Кліки: ${ref.clicks} | Конверсії: ${ref.conversions}\n\n`;
        }
      }

      const code = generateRefCode();
      createReferral(code, userId, username);

      const botInfo = await bot.getMe();
      const link = `https://t.me/${botInfo.username}?start=ref_${code}`;

      refMsg += `✅ <b>Нове посилання створено:</b>\n<a href="${link}">${link}</a>\n\nКод: <code>ref_${code}</code>`;

      await bot.sendMessage(ADMIN_GROUP, refMsg, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });
    } else if (text === "/users") {
      const allUsers = getAllUsers();
      const lines = allUsers.slice(0, 20).map((u) => `• @${u.username} — мова: ${u.lang}`);
      await bot.sendMessage(
        ADMIN_GROUP,
        `👥 <b>Останні користувачі:</b>\n\n${lines.join("\n")}`,
        { parse_mode: "HTML" }
      );
    }
  });

  // Callback query handler
  bot.on("callback_query", async (query) => {
    const chatId = query.message!.chat.id;
    const userId = query.from.id;
    const data = query.data ?? "";

    let user = getUser(userId);

    // Handle admin group callbacks (approve/reject)
    if (chatId === ADMIN_GROUP) {
      if (data.startsWith("approve_")) {
        const orderId = data.slice(8);
        const pending = getPendingPayment(orderId);
        if (!pending) {
          await bot.answerCallbackQuery(query.id, { text: "Замовлення не знайдено" });
          return;
        }

        const { userId: buyerId, purchase } = pending;
        purchase.status = "approved";
        removePendingPayment(orderId);

        const buyerUser = getUser(buyerId);
        if (buyerUser) {
          buyerUser.purchases.push(purchase);
          setUser(buyerId, buyerUser);
        }

        const amountNum = parseFloat(purchase.amount) || 0;
        addEarned(amountNum);

        // Notify buyer
        try {
          const buyerLang = buyerUser?.lang ?? "ru";
          await bot.sendMessage(buyerId, t(buyerLang, "payment_approved"));
        } catch (e) {
          logger.error({ err: e }, "Failed to notify buyer of approval");
        }

        // Notify about referral commission
        if (buyerUser?.referredBy) {
          const commission = (amountNum * 0.5).toFixed(2);
          await bot.sendMessage(
            ADMIN_GROUP,
            `✅ <b>Нова успішна оплата!</b>\n\n👤 Покупець: @${buyerUser.username}\n🔗 Трафікер: @${buyerUser.referredBy}\n💰 Сума: ${purchase.amount} ${purchase.currency}\n💸 Доля трафікера (50%): ${commission} ${purchase.currency}`,
            { parse_mode: "HTML" }
          );

          // Update referral conversion
          const allRefs = getReferralsByCreator(userId);
          for (const ref of allRefs) {
            if (ref.creatorUsername === buyerUser.referredBy) {
              incrementReferralConversion(ref.code);
            }
          }
        }

        await bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
          chat_id: chatId,
          message_id: query.message!.message_id,
        });
        await bot.answerCallbackQuery(query.id, { text: "✅ Оплату підтверджено!" });

      } else if (data.startsWith("reject_")) {
        const orderId = data.slice(7);
        const pending = getPendingPayment(orderId);
        if (!pending) {
          await bot.answerCallbackQuery(query.id, { text: "Замовлення не знайдено" });
          return;
        }

        const { userId: buyerId } = pending;
        removePendingPayment(orderId);

        const buyerUser = getUser(buyerId);
        try {
          const buyerLang = buyerUser?.lang ?? "ru";
          await bot.sendMessage(buyerId, t(buyerLang, "payment_rejected"));
        } catch (e) {
          logger.error({ err: e }, "Failed to notify buyer of rejection");
        }

        await bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
          chat_id: chatId,
          message_id: query.message!.message_id,
        });
        await bot.answerCallbackQuery(query.id, { text: "❌ Оплату відхилено" });
      }
      return;
    }

    // User not found - ask to start
    if (!user) {
      await bot.answerCallbackQuery(query.id, { text: "Натисніть /start" });
      return;
    }

    const lang = user.lang;

    // Language selection
    if (data.startsWith("lang_")) {
      const newLang = data.slice(5) as Lang;
      user.lang = newLang;
      user.step = "main_menu";
      setUser(userId, user);
      await bot.answerCallbackQuery(query.id, { text: t(newLang, "lang_set") });
      await bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
        chat_id: chatId,
        message_id: query.message!.message_id,
      });
      await sendMainMenu(bot, chatId, newLang);
      return;
    }

    // Change language from account
    if (data === "change_lang") {
      await bot.answerCallbackQuery(query.id);
      await bot.sendMessage(chatId, "Виберіть мову / Choose language / Оберіть мову:", {
        reply_markup: langKeyboard(),
      });
      return;
    }

    // My purchases
    if (data === "my_purchases") {
      await bot.answerCallbackQuery(query.id);
      const approved = user.purchases.filter((p) => p.status === "approved");
      if (approved.length === 0) {
        await bot.sendMessage(chatId, t(lang, "no_purchases"));
        return;
      }
      const lines = approved.map(
        (p, i) =>
          `${i + 1}. ${GAME_LABELS[p.game] ?? p.game} — ${DEVICE_LABELS[lang]?.[p.device] ?? p.device} — ${PERIOD_LABELS[lang]?.[p.period] ?? p.period}`
      );
      await bot.sendMessage(chatId, `📦 <b>Ваші покупки:</b>\n\n${lines.join("\n")}`, {
        parse_mode: "HTML",
      });
      return;
    }

    // Navigation backs
    if (data === "back_main") {
      user.step = "main_menu";
      setUser(userId, user);
      await bot.answerCallbackQuery(query.id);
      await sendMainMenu(bot, chatId, lang);
      return;
    }

    if (data === "back_games") {
      user.step = "choose_game";
      setUser(userId, user);
      await bot.answerCallbackQuery(query.id);
      await bot.editMessageText(t(lang, "choose_game"), {
        chat_id: chatId,
        message_id: query.message!.message_id,
        reply_markup: gamesKeyboard(lang),
      });
      return;
    }

    if (data === "back_device") {
      user.step = "choose_device";
      setUser(userId, user);
      await bot.answerCallbackQuery(query.id);
      await bot.editMessageText(t(lang, "choose_device"), {
        chat_id: chatId,
        message_id: query.message!.message_id,
        reply_markup: deviceKeyboard(lang),
      });
      return;
    }

    if (data === "back_period") {
      user.step = "choose_period";
      setUser(userId, user);
      await bot.answerCallbackQuery(query.id);
      const deviceDesc = t(lang, `desc_${user.device ?? "apk"}`);
      await bot.editMessageText(deviceDesc, {
        chat_id: chatId,
        message_id: query.message!.message_id,
        reply_markup: periodKeyboard(lang),
      });
      return;
    }

    // Game selection
    if (data.startsWith("game_")) {
      const game = data.slice(5);
      user.game = game;
      user.step = "choose_device";
      setUser(userId, user);
      await bot.answerCallbackQuery(query.id);
      await bot.editMessageText(t(lang, "choose_device"), {
        chat_id: chatId,
        message_id: query.message!.message_id,
        reply_markup: deviceKeyboard(lang),
      });
      return;
    }

    // Device selection
    if (data.startsWith("device_")) {
      const device = data.slice(7);
      user.device = device;
      user.step = "choose_period";
      setUser(userId, user);
      await bot.answerCallbackQuery(query.id);
      const deviceDesc = t(lang, `desc_${device}`);
      await bot.editMessageText(deviceDesc, {
        chat_id: chatId,
        message_id: query.message!.message_id,
        reply_markup: periodKeyboard(lang),
      });
      return;
    }

    // Period selection
    if (data.startsWith("period_")) {
      const period = data.slice(7);
      user.period = period;
      user.step = "choose_payment";
      setUser(userId, user);
      await bot.answerCallbackQuery(query.id);
      await bot.editMessageText(t(lang, "choose_payment"), {
        chat_id: chatId,
        message_id: query.message!.message_id,
        reply_markup: paymentKeyboard(lang),
      });
      return;
    }

    // Copy helpers
    if (data.startsWith("copy_card_")) {
      const card = data.slice(10);
      await bot.answerCallbackQuery(query.id, {
        text: `📋 ${card}`,
        show_alert: true,
      });
      return;
    }

    if (data.startsWith("copy_amount_")) {
      const amount = data.slice(12);
      await bot.answerCallbackQuery(query.id, {
        text: `💰 ${amount}`,
        show_alert: true,
      });
      return;
    }

    // Payment method selection
    if (data.startsWith("pay_")) {
      const method = data.slice(4);
      user.paymentMethod = method;
      user.step = "awaiting_payment";
      setUser(userId, user);
      await bot.answerCallbackQuery(query.id);

      const game = user.game ?? "standoff2";
      const device = user.device ?? "apk";
      const period = user.period ?? "7";
      const orderId = generateOrderId();

      const gameName = GAME_LABELS[game] ?? game;
      const deviceName = DEVICE_LABELS[lang]?.[device] ?? device;
      const periodName = PERIOD_LABELS[lang]?.[period] ?? period;
      const payMethod = getPaymentMethodLabel(method);
      const { amount, currency } = getAmountForMethod(method, period);

      const purchase: Purchase = {
        id: orderId,
        game,
        device,
        period,
        paymentMethod: method,
        amount,
        currency,
        status: "pending",
        createdAt: new Date(),
      };

      addPendingPayment(orderId, userId, purchase);

      if (method === "card") {
        const invoiceText =
          `💳 <b>Order information:</b>\n\n` +
          `🛒 Product: ${gameName} ${deviceName}\n` +
          `⏳ Duration: ${periodName}\n` +
          `💵 Payment method: 🇺🇦 Ukrainian card\n` +
          `🆔 Order ID: ${orderId}\n\n` +
          `📌 <b>Payment information:</b>\n` +
          `💳 Card number: <code>${CARD_NUMBER}</code>\n` +
          `💰 Amount to pay: <b>${amount} UAH</b>\n\n` +
          `📝 <b>Instructions:</b>\n` +
          `🔻Transfer the specified amount to the details, then click "Check payment"\n` +
          `🔻You have 15 minutes to pay\n` +
          `🔻Do not write comments on the payment`;

        await bot.editMessageText(invoiceText, {
          chat_id: chatId,
          message_id: query.message!.message_id,
          parse_mode: "HTML",
          reply_markup: cardInvoiceKeyboard(lang, orderId, CARD_NUMBER, `${amount} UAH`),
        });

        // Notify admin group
        await bot.sendMessage(
          ADMIN_GROUP,
          `💳 <b>Новий запит на оплату!</b>\n\n👤 Покупець: @${user.username}\n🎮 Продукт: ${gameName} ${deviceName}\n⏳ Термін: ${periodName}\n💵 Метод: Ukrainian card\n💰 Сума: ${amount} UAH\n🆔 Order ID: ${orderId}`,
          {
            parse_mode: "HTML",
            reply_markup: adminPaymentKeyboard(orderId),
          }
        );

      } else if (method === "crypto") {
        const invoiceText =
          `🤖 <b>Order information:</b>\n\n` +
          `🛒 Product: ${gameName} ${deviceName}\n` +
          `⏳ Duration: ${periodName}\n` +
          `💵 Payment method: 🤖 Crypto bot\n` +
          `🆔 Order ID: ${orderId}\n\n` +
          `💰 Amount to pay: <b>${amount} USDT</b>\n\n` +
          `📝 Після оплати натисніть "Check payment"`;

        await bot.editMessageText(invoiceText, {
          chat_id: chatId,
          message_id: query.message!.message_id,
          parse_mode: "HTML",
          reply_markup: cryptoInvoiceKeyboard(lang, orderId),
        });

        await bot.sendMessage(
          ADMIN_GROUP,
          `🤖 <b>Новий запит на оплату (Crypto)!</b>\n\n👤 Покупець: @${user.username}\n🎮 Продукт: ${gameName} ${deviceName}\n⏳ Термін: ${periodName}\n💵 Метод: Crypto bot\n💰 Сума: ${amount} USDT\n🆔 Order ID: ${orderId}`,
          {
            parse_mode: "HTML",
            reply_markup: adminPaymentKeyboard(orderId),
          }
        );

      } else if (method === "gold") {
        const invoiceText =
          `🥇 <b>Order information:</b>\n\n` +
          `🛒 Product: ${gameName} ${deviceName}\n` +
          `⏳ Duration: ${periodName}\n` +
          `💵 Payment method: 🥇 Gold\n` +
          `🆔 Order ID: ${orderId}\n\n` +
          `💰 Amount to pay: <b>${amount} Gold</b>\n\n` +
          `📝 Після оплати натисніть "Check payment"`;

        await bot.editMessageText(invoiceText, {
          chat_id: chatId,
          message_id: query.message!.message_id,
          parse_mode: "HTML",
          reply_markup: goldInvoiceKeyboard(lang, orderId),
        });

        await bot.sendMessage(
          ADMIN_GROUP,
          `🥇 <b>Новий запит на оплату (Gold)!</b>\n\n👤 Покупець: @${user.username}\n🎮 Продукт: ${gameName} ${deviceName}\n⏳ Термін: ${periodName}\n💵 Метод: Gold\n💰 Сума: ${amount} Gold\n🆔 Order ID: ${orderId}`,
          {
            parse_mode: "HTML",
            reply_markup: adminPaymentKeyboard(orderId),
          }
        );
      }
      return;
    }

    // Check payment
    if (data.startsWith("check_")) {
      const orderId = data.slice(6);
      const pending = getPendingPayment(orderId);
      if (!pending) {
        await bot.answerCallbackQuery(query.id, {
          text: "⏳ Очікуємо підтвердження від адміна...",
          show_alert: true,
        });
        return;
      }
      await bot.answerCallbackQuery(query.id, {
        text: "⏳ Ваш чек перевіряється адміністратором. Зачекайте...",
        show_alert: true,
      });
      return;
    }
  });

  bot.on("polling_error", (err) => {
    logger.error({ err }, "Polling error");
  });

  logger.info("Bot polling started");
}
