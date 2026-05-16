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
const ADMIN_GROUP_ID_RAW = process.env["ADMIN_GROUP_ID"];

if (!BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN is required");
if (!ADMIN_GROUP_ID_RAW) throw new Error("ADMIN_GROUP_ID is required");

const ADMIN_GROUP = Number(ADMIN_GROUP_ID_RAW);

export function startBot(): void {
  const bot = new TelegramBot(BOT_TOKEN!, { polling: true });

  logger.info({ adminGroup: ADMIN_GROUP }, "Telegram bot started");

  function generateOrderId(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  function generateRefCode(): string {
    return Math.random().toString(36).substring(2, 9).toUpperCase();
  }

  function getLang(userId: number): Lang {
    return getUser(userId)?.lang ?? "ru";
  }

  async function sendMainMenu(chatId: number, lang: Lang): Promise<void> {
    await bot.sendMessage(chatId, t(lang, "main_menu"), {
      parse_mode: "HTML",
      reply_markup: mainMenuKeyboard(lang),
    });
  }

  async function notifyAdmin(msg: string, markup?: TelegramBot.InlineKeyboardMarkup): Promise<void> {
    try {
      await bot.sendMessage(ADMIN_GROUP, msg, {
        parse_mode: "HTML",
        ...(markup ? { reply_markup: markup } : {}),
      });
      logger.info({ adminGroup: ADMIN_GROUP }, "Admin notified");
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      logger.error(
        { err, adminGroup: ADMIN_GROUP, code: error?.code, reason: error?.message },
        "FAILED to send admin notification — check ADMIN_GROUP_ID and that bot is added to group as admin"
      );
    }
  }

  // ─── /start ──────────────────────────────────────────────────────────────────
  bot.onText(/\/start(.*)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from!.id;
    const username = msg.from!.username ?? `user${userId}`;
    const param = (match?.[1] ?? "").trim();

    const existing = getUser(userId);

    if (!existing) {
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
      logger.info({ userId, username, referredBy }, "New user registered");

      const notifText = referredBy
        ? `👤 <b>Новий користувач бота!</b>\n\n🧑 Юз: @${username}\n🔗 Прийшов від трафікера: @${referredBy}`
        : `👤 <b>Новий користувач бота!</b>\n\n🧑 Юз: @${username}`;

      await notifyAdmin(notifText);
    }

    const user = getUser(userId)!;

    // If user never selected lang — show language picker
    if (!user.langSelected) {
      await bot.sendMessage(
        chatId,
        "👋 Вітаю / Hello / Привет!\n\nЯ <b>LioTap</b> — ваш помічник з придбання читів для мобільних ігор.\n\n🌐 Оберіть мову / Choose language / Выберите язык:",
        { parse_mode: "HTML", reply_markup: langKeyboard() }
      );
    } else {
      // Already has lang — go to main menu
      user.step = "main_menu";
      setUser(userId, user);
      await sendMainMenu(chatId, user.lang);
    }
  });

  // ─── /menu (user shortcut) ────────────────────────────────────────────────────
  bot.onText(/\/menu/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from!.id;
    if (msg.chat.id === ADMIN_GROUP) return; // handled separately

    const user = getUser(userId);
    if (!user || !user.langSelected) return;

    user.step = "main_menu";
    setUser(userId, user);
    await sendMainMenu(chatId, user.lang);
  });

  // ─── Admin group commands ────────────────────────────────────────────────────
  bot.on("message", async (msg) => {
    if (msg.chat.id !== ADMIN_GROUP) return;
    if (!msg.text || !msg.from) return;

    const text = msg.text.trim();
    const userId = msg.from.id;
    const username = msg.from.username ?? `user${userId}`;

    if (text === "/menu" || text === "/menu@" + (bot as unknown as { options?: { username?: string } }).options?.username) {
      const userCount = getUserCount();
      const earned = getTotalEarned();
      await bot.sendMessage(
        ADMIN_GROUP,
        `📊 <b>Адмін панель LioTap</b>\n\n` +
          `👥 Користувачів: <b>${userCount}</b>\n` +
          `💰 Всього зароблено: <b>${earned} UAH</b>\n\n` +
          `📌 <b>Команди:</b>\n` +
          `/menu — ця панель\n` +
          `/ref — нове реферальне посилання\n` +
          `/users — список останніх юзерів`,
        { parse_mode: "HTML" }
      );
    } else if (text === "/ref") {
      const existingRefs = getReferralsByCreator(userId);
      let refMsg = `🔗 <b>Ваші посилання:</b>\n\n`;

      if (existingRefs.length > 0) {
        for (const ref of existingRefs) {
          refMsg += `• Код: <code>ref_${ref.code}</code>\n  👁 Кліки: ${ref.clicks} | ✅ Конверсії: ${ref.conversions}\n\n`;
        }
      }

      const code = generateRefCode();
      createReferral(code, userId, username);
      const botInfo = await bot.getMe();
      const link = `https://t.me/${botInfo.username}?start=ref_${code}`;

      refMsg +=
        `✅ <b>Нове посилання створено!</b>\n` +
        `<a href="${link}">${link}</a>\n\n` +
        `<i>Посилання виглядає як звичайне запрошення в бот.</i>`;

      await bot.sendMessage(ADMIN_GROUP, refMsg, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });
    } else if (text === "/users") {
      const allUsers = getAllUsers();
      if (allUsers.length === 0) {
        await bot.sendMessage(ADMIN_GROUP, "👥 Ще немає користувачів.");
        return;
      }
      const lines = allUsers
        .slice(-20)
        .reverse()
        .map(
          (u, i) =>
            `${i + 1}. @${u.username} (${u.lang.toUpperCase()}) — покупок: ${u.purchases.filter((p) => p.status === "approved").length}`
        );
      await bot.sendMessage(
        ADMIN_GROUP,
        `👥 <b>Останні ${lines.length} користувачів:</b>\n\n${lines.join("\n")}`,
        { parse_mode: "HTML" }
      );
    }
  });

  // ─── User messages (reply keyboard buttons) ──────────────────────────────────
  bot.on("message", async (msg) => {
    if (!msg.text || msg.text.startsWith("/")) return;
    if (msg.chat.id === ADMIN_GROUP) return;

    const chatId = msg.chat.id;
    const userId = msg.from!.id;
    const user = getUser(userId);

    if (!user || !user.langSelected) return;

    const lang = user.lang;
    const text = msg.text;

    if (text === t(lang, "buy_key")) {
      user.step = "choose_game";
      setUser(userId, user);
      await bot.sendMessage(chatId, t(lang, "choose_game"), {
        parse_mode: "HTML",
        reply_markup: gamesKeyboard(lang),
      });
    } else if (text === t(lang, "reviews")) {
      await bot.sendMessage(chatId, t(lang, "reviews_soon"), {
        parse_mode: "HTML",
        reply_markup: mainMenuKeyboard(lang),
      });
    } else if (text === t(lang, "help")) {
      await bot.sendMessage(chatId, t(lang, "help_text"), {
        parse_mode: "HTML",
        reply_markup: mainMenuKeyboard(lang),
      });
    } else if (text === t(lang, "my_account")) {
      const approved = user.purchases.filter((p) => p.status === "approved").length;
      await bot.sendMessage(
        chatId,
        t(lang, "account_info", {
          username: user.username,
          purchases: String(approved),
        }),
        {
          parse_mode: "HTML",
          reply_markup: accountKeyboard(lang),
        }
      );
    } else if (text === t(lang, "main_menu_btn")) {
      user.step = "main_menu";
      setUser(userId, user);
      await sendMainMenu(chatId, lang);
    }
  });

  // ─── Callback queries ────────────────────────────────────────────────────────
  bot.on("callback_query", async (query) => {
    const chatId = query.message!.chat.id;
    const msgId = query.message!.message_id;
    const userId = query.from.id;
    const data = query.data ?? "";

    // ── Admin group callbacks ────────────────────────────────────────────────
    if (chatId === ADMIN_GROUP) {
      if (data.startsWith("approve_")) {
        const orderId = data.slice(8);
        const pending = getPendingPayment(orderId);
        if (!pending) {
          await bot.answerCallbackQuery(query.id, { text: "⚠️ Замовлення не знайдено" });
          return;
        }
        const { userId: buyerId, purchase } = pending;
        purchase.status = "approved";
        removePendingPayment(orderId);

        const buyer = getUser(buyerId);
        if (buyer) {
          buyer.purchases.push(purchase);
          setUser(buyerId, buyer);
        }

        const amountNum = parseFloat(purchase.amount) || 0;
        addEarned(amountNum);

        try {
          await bot.sendMessage(buyerId, t(buyer?.lang ?? "ru", "payment_approved"), {
            parse_mode: "HTML",
          });
        } catch (e) {
          logger.error({ err: e }, "Failed to notify buyer of approval");
        }

        if (buyer?.referredBy) {
          const commission = (amountNum * 0.5).toFixed(2);
          await notifyAdmin(
            `💸 <b>Нова успішна оплата!</b>\n\n` +
              `👤 Покупець: @${buyer.username}\n` +
              `🔗 Трафікер: @${buyer.referredBy}\n` +
              `💰 Сума: <b>${purchase.amount} ${purchase.currency}</b>\n` +
              `💸 Доля трафікера (50%): <b>${commission} ${purchase.currency}</b>`
          );
          // increment conversion on referral
          const refs = getReferralsByCreator(0); // we search by creatorUsername instead
          for (const [, ref] of Object.entries({})) {
            void ref;
          }
          // find by username
          const allUsersArr = getAllUsers();
          const trafficerUser = allUsersArr.find((u) => u.username === buyer.referredBy);
          if (trafficerUser) {
            const trafficerRefs = getReferralsByCreator(trafficerUser.userId);
            if (trafficerRefs.length > 0) {
              incrementReferralConversion(trafficerRefs[0].code);
            }
          }
        }

        await bot.editMessageReplyMarkup(
          { inline_keyboard: [[{ text: "✅ Підтверджено", callback_data: "noop" }]] },
          { chat_id: chatId, message_id: msgId }
        );
        await bot.answerCallbackQuery(query.id, { text: "✅ Оплату підтверджено!" });
      } else if (data.startsWith("reject_")) {
        const orderId = data.slice(7);
        const pending = getPendingPayment(orderId);
        if (!pending) {
          await bot.answerCallbackQuery(query.id, { text: "⚠️ Замовлення не знайдено" });
          return;
        }
        const { userId: buyerId } = pending;
        removePendingPayment(orderId);

        const buyer = getUser(buyerId);
        try {
          await bot.sendMessage(buyerId, t(buyer?.lang ?? "ru", "payment_rejected"), {
            parse_mode: "HTML",
          });
        } catch (e) {
          logger.error({ err: e }, "Failed to notify buyer of rejection");
        }

        await bot.editMessageReplyMarkup(
          { inline_keyboard: [[{ text: "❌ Відхилено", callback_data: "noop" }]] },
          { chat_id: chatId, message_id: msgId }
        );
        await bot.answerCallbackQuery(query.id, { text: "❌ Оплату відхилено" });
      } else if (data === "noop") {
        await bot.answerCallbackQuery(query.id);
      }
      return;
    }

    // ── User callbacks ───────────────────────────────────────────────────────
    let user = getUser(userId);
    if (!user) {
      await bot.answerCallbackQuery(query.id, { text: "Натисніть /start" });
      return;
    }

    const lang = user.lang;

    async function editText(text: string, markup: TelegramBot.InlineKeyboardMarkup): Promise<void> {
      try {
        await bot.editMessageText(text, {
          chat_id: chatId,
          message_id: msgId,
          parse_mode: "HTML",
          reply_markup: markup,
        });
      } catch {
        await bot.sendMessage(chatId, text, {
          parse_mode: "HTML",
          reply_markup: markup,
        });
      }
    }

    // Language selection
    if (data.startsWith("lang_")) {
      const newLang = data.slice(5) as Lang;
      user.lang = newLang;
      user.langSelected = true;
      user.step = "main_menu";
      setUser(userId, user);

      await bot.answerCallbackQuery(query.id, { text: t(newLang, "lang_set") });
      try {
        await bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: chatId, message_id: msgId });
      } catch { /* ignore */ }
      await sendMainMenu(chatId, newLang);
      return;
    }

    if (data === "noop") {
      await bot.answerCallbackQuery(query.id);
      return;
    }

    // Change language
    if (data === "change_lang") {
      await bot.answerCallbackQuery(query.id);
      await bot.sendMessage(
        chatId,
        "🌐 <b>Зміна мови / Change language / Смена языка:</b>",
        { parse_mode: "HTML", reply_markup: langKeyboard() }
      );
      return;
    }

    // My purchases
    if (data === "my_purchases") {
      await bot.answerCallbackQuery(query.id);
      const approved = user.purchases.filter((p) => p.status === "approved");
      if (approved.length === 0) {
        await bot.sendMessage(chatId, t(lang, "no_purchases"), { parse_mode: "HTML" });
        return;
      }
      const lines = approved.map(
        (p, i) =>
          `${i + 1}. <b>${GAME_LABELS[p.game] ?? p.game}</b>\n` +
          `   📱 ${DEVICE_LABELS["ru"]?.[p.device] ?? p.device}\n` +
          `   ⏳ ${PERIOD_LABELS[lang]?.[p.period] ?? p.period}\n` +
          `   💳 ${getPaymentMethodLabel(p.paymentMethod)}`
      );
      await bot.sendMessage(
        chatId,
        `📦 <b>Ваші покупки:</b>\n\n${lines.join("\n\n")}`,
        { parse_mode: "HTML" }
      );
      return;
    }

    // ── Navigation backs ────────────────────────────────────────────────────
    if (data === "back_main") {
      user.step = "main_menu";
      setUser(userId, user);
      await bot.answerCallbackQuery(query.id);
      try {
        await bot.deleteMessage(chatId, msgId);
      } catch { /* ignore */ }
      await sendMainMenu(chatId, lang);
      return;
    }

    if (data === "back_games") {
      user.step = "choose_game";
      setUser(userId, user);
      await bot.answerCallbackQuery(query.id);
      await editText(t(lang, "choose_game"), gamesKeyboard(lang));
      return;
    }

    if (data === "back_device") {
      user.step = "choose_device";
      setUser(userId, user);
      await bot.answerCallbackQuery(query.id);
      await editText(t(lang, "choose_device"), deviceKeyboard(lang));
      return;
    }

    if (data === "back_period") {
      user.step = "choose_period";
      setUser(userId, user);
      await bot.answerCallbackQuery(query.id);
      const device = user.device ?? "apk";
      await editText(t(lang, `desc_${device}`), periodKeyboard(lang));
      return;
    }

    // ── Game selection ──────────────────────────────────────────────────────
    if (data.startsWith("game_")) {
      user.game = data.slice(5);
      user.step = "choose_device";
      setUser(userId, user);
      await bot.answerCallbackQuery(query.id);
      await editText(t(lang, "choose_device"), deviceKeyboard(lang));
      return;
    }

    // ── Device selection ────────────────────────────────────────────────────
    if (data.startsWith("device_")) {
      user.device = data.slice(7);
      user.step = "choose_period";
      setUser(userId, user);
      await bot.answerCallbackQuery(query.id);
      await editText(t(lang, `desc_${user.device}`), periodKeyboard(lang));
      return;
    }

    // ── Period selection ────────────────────────────────────────────────────
    if (data.startsWith("period_")) {
      user.period = data.slice(7);
      user.step = "choose_payment";
      setUser(userId, user);
      await bot.answerCallbackQuery(query.id);
      await editText(t(lang, "choose_payment"), paymentKeyboard(lang));
      return;
    }

    // ── Copy helpers ────────────────────────────────────────────────────────
    if (data.startsWith("copy_card_")) {
      const card = data.slice(10);
      await bot.answerCallbackQuery(query.id, { text: `Номер карти: ${card}`, show_alert: true });
      return;
    }
    if (data.startsWith("copy_amount_")) {
      const amount = data.slice(12);
      await bot.answerCallbackQuery(query.id, { text: `Сума: ${amount}`, show_alert: true });
      return;
    }

    // ── Payment method ──────────────────────────────────────────────────────
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
      const deviceName = DEVICE_LABELS["ru"]?.[device] ?? device;
      const periodName = PERIOD_LABELS[lang]?.[period] ?? period;
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
          `🛒 Product: <b>${gameName} ${deviceName}</b>\n` +
          `⏳ Duration: <b>${periodName}</b>\n` +
          `💵 Payment method: 🇺🇦 Ukrainian card\n` +
          `🆔 Order ID: <code>${orderId}</code>\n\n` +
          `📌 <b>Payment information:</b>\n` +
          `💳 Card number: <code>${CARD_NUMBER}</code>\n` +
          `💰 Amount to pay: <b>${amount} UAH</b>\n\n` +
          `📝 <b>Instructions:</b>\n` +
          `🔻 Transfer the specified amount to the card\n` +
          `🔻 Then click <b>"Check payment"</b>\n` +
          `🔻 You have <b>15 minutes</b> to pay\n` +
          `🔻 Do <b>NOT</b> write comments on the payment`;

        await editText(invoiceText, cardInvoiceKeyboard(lang, orderId, CARD_NUMBER, `${amount} UAH`));

        await notifyAdmin(
          `💳 <b>Новий запит на оплату!</b>\n\n` +
            `👤 Покупець: @${user.username}\n` +
            `🎮 Продукт: ${gameName} ${deviceName}\n` +
            `⏳ Термін: ${periodName}\n` +
            `💵 Метод: 🇺🇦 Ukrainian card\n` +
            `💰 Сума: <b>${amount} UAH</b>\n` +
            `🆔 Order ID: <code>${orderId}</code>`,
          adminPaymentKeyboard(orderId)
        );
      } else if (method === "crypto") {
        const invoiceText =
          `🤖 <b>Order information:</b>\n\n` +
          `🛒 Product: <b>${gameName} ${deviceName}</b>\n` +
          `⏳ Duration: <b>${periodName}</b>\n` +
          `💵 Payment method: 🤖 Crypto bot (USDT)\n` +
          `🆔 Order ID: <code>${orderId}</code>\n\n` +
          `💰 Amount to pay: <b>${amount} USDT</b>\n\n` +
          `📝 Після оплати натисніть <b>"Check payment"</b>`;

        await editText(invoiceText, cryptoInvoiceKeyboard(lang, orderId));

        await notifyAdmin(
          `🤖 <b>Новий запит на оплату (Crypto)!</b>\n\n` +
            `👤 Покупець: @${user.username}\n` +
            `🎮 Продукт: ${gameName} ${deviceName}\n` +
            `⏳ Термін: ${periodName}\n` +
            `💵 Метод: 🤖 Crypto bot\n` +
            `💰 Сума: <b>${amount} USDT</b>\n` +
            `🆔 Order ID: <code>${orderId}</code>`,
          adminPaymentKeyboard(orderId)
        );
      } else if (method === "gold") {
        const invoiceText =
          `🥇 <b>Order information:</b>\n\n` +
          `🛒 Product: <b>${gameName} ${deviceName}</b>\n` +
          `⏳ Duration: <b>${periodName}</b>\n` +
          `💵 Payment method: 🥇 Gold\n` +
          `🆔 Order ID: <code>${orderId}</code>\n\n` +
          `💰 Amount to pay: <b>${amount} Gold</b>\n\n` +
          `📝 Після оплати натисніть <b>"Check payment"</b>`;

        await editText(invoiceText, goldInvoiceKeyboard(lang, orderId));

        await notifyAdmin(
          `🥇 <b>Новий запит на оплату (Gold)!</b>\n\n` +
            `👤 Покупець: @${user.username}\n` +
            `🎮 Продукт: ${gameName} ${deviceName}\n` +
            `⏳ Термін: ${periodName}\n` +
            `💵 Метод: 🥇 Gold\n` +
            `💰 Сума: <b>${amount} Gold</b>\n` +
            `🆔 Order ID: <code>${orderId}</code>`,
          adminPaymentKeyboard(orderId)
        );
      }
      return;
    }

    // ── Check payment ───────────────────────────────────────────────────────
    if (data.startsWith("check_")) {
      const orderId = data.slice(6);
      const pending = getPendingPayment(orderId);
      if (!pending) {
        await bot.answerCallbackQuery(query.id, {
          text: "ℹ️ Оплата вже оброблена адміністратором.",
          show_alert: true,
        });
        return;
      }
      await bot.answerCallbackQuery(query.id, {
        text: "⏳ Ваш чек перевіряється адміністратором. Зачекайте будь ласка...",
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
