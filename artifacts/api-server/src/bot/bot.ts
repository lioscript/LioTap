import TelegramBot from "node-telegram-bot-api";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { logger } from "../lib/logger";
import type { Lang } from "./i18n";
import { t } from "./i18n";
import {
  getUser, setUser, createUser, getUserCount, getTotalEarned,
  addEarned, addPendingPayment, getPendingPayment, removePendingPayment,
  createReferral, getReferral, getReferralsByCreator, incrementReferralClick,
  incrementReferralConversion, getAllUsers, type Purchase,
} from "./store";
import {
  langKeyboard, mainMenuKeyboard, gamesKeyboard, deviceKeyboard,
  periodKeyboard, paymentKeyboard, cardInvoiceKeyboard,
  cryptoInvoiceKeyboard, goldInvoiceKeyboard, adminPaymentKeyboard,
  accountKeyboard,
} from "./keyboards";
import {
  CARD_NUMBER, PRICES_UAH, PRICES_USDT, PRICES_GOLD,
  PERIOD_LABELS, GAME_LABELS, DEVICE_LABELS, getPaymentMethodLabel,
} from "./prices";
import { createInvoice, checkInvoice } from "./cryptobot";

const BOT_TOKEN        = process.env["TELEGRAM_BOT_TOKEN"] ?? "";
const ADMIN_GROUP      = Number(process.env["ADMIN_GROUP_ID"] ?? "0");
const OWNER_ID         = Number(process.env["OWNER_ID"] ?? "0");
const CHANNEL_USERNAME = "@liotap";

if (!BOT_TOKEN)   throw new Error("TELEGRAM_BOT_TOKEN is required");
if (!ADMIN_GROUP) throw new Error("ADMIN_GROUP_ID is required");

// Global crash guards
process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled promise rejection");
});
process.on("uncaughtException", (err) => {
  logger.error({ err }, "Uncaught exception");
});

const DATA_DIR        = process.env["DATA_DIR"] ?? join(process.cwd(), "data");
const LOGO_PATH       = join(process.cwd(), "logo.png");
const LOGO_ID_CACHE   = join(DATA_DIR, "logo_file_id.txt");

const GAME_IMAGES: Record<string, string> = {
  standoff2:  join(process.cwd(), "games", "standoff.jpeg"),
  brawlstars: join(process.cwd(), "games", "brawl.jpeg"),
  pubgmobile: join(process.cwd(), "games", "pubg.jpeg"),
  fcmobile:   join(process.cwd(), "games", "fifa.jpeg"),
};
const GAME_IDS_CACHE = join(DATA_DIR, "game_file_ids.json");
const gameFileIds: Record<string, string> = {};

function loadCachedGameFileIds(): void {
  try {
    if (existsSync(GAME_IDS_CACHE)) {
      const parsed = JSON.parse(readFileSync(GAME_IDS_CACHE, "utf-8")) as Record<string, string>;
      Object.assign(gameFileIds, parsed);
      logger.info({ gameFileIds }, "Game file_ids loaded from cache");
    }
  } catch { /* ignore */ }
}

async function uploadGamePhotosIfNeeded(bot: TelegramBot, adminGroup: number): Promise<void> {
  let changed = false;
  for (const [game, imgPath] of Object.entries(GAME_IMAGES)) {
    if (gameFileIds[game]) continue;
    if (!existsSync(imgPath)) { logger.warn({ game }, "Game image not found"); continue; }
    try {
      const result = await bot.sendPhoto(adminGroup, imgPath, { caption: `📸 ${game}` });
      const best = result.photo?.[result.photo.length - 1];
      if (best?.file_id) {
        gameFileIds[game] = best.file_id;
        changed = true;
        logger.info({ game, fileId: best.file_id }, "Game photo cached");
      }
      try { await bot.deleteMessage(adminGroup, result.message_id); } catch { /* ignore */ }
    } catch (err) {
      logger.error({ err, game }, "Game photo upload failed");
    }
  }
  if (changed) {
    mkdirSync(join(process.cwd(), "data"), { recursive: true });
    writeFileSync(GAME_IDS_CACHE, JSON.stringify(gameFileIds), "utf-8");
  }
}

loadCachedGameFileIds();

// crypto invoices being polled
const cryptoPolling = new Map<number, {
  userId: number; purchase: Purchase; chatId: number; msgId: number;
}>();

// orders for which admin was already notified (prevents duplicate notifications)
const notifiedOrders = new Set<string>();

// Telegram file_id for the logo — loaded from disk or uploaded on first run
let logoFileId: string | undefined;

function loadCachedLogoFileId(): void {
  try {
    if (existsSync(LOGO_ID_CACHE)) {
      const id = readFileSync(LOGO_ID_CACHE, "utf-8").trim();
      if (id) { logoFileId = id; logger.info({ logoFileId }, "Logo file_id loaded from cache"); }
    }
  } catch { /* ignore */ }
}

async function uploadLogoIfNeeded(bot: TelegramBot, adminGroup: number): Promise<void> {
  if (logoFileId) return;
  if (!existsSync(LOGO_PATH)) { logger.warn("logo.png not found"); return; }
  try {
    const result = await bot.sendPhoto(adminGroup, LOGO_PATH, { caption: "🖼 Logo cached" });
    const best = result.photo?.[result.photo.length - 1];
    if (best?.file_id) {
      logoFileId = best.file_id;
      mkdirSync(join(process.cwd(), "data"), { recursive: true });
      writeFileSync(LOGO_ID_CACHE, logoFileId, "utf-8");
      logger.info({ logoFileId }, "Logo uploaded and file_id cached");
    }
    try { await bot.deleteMessage(adminGroup, result.message_id); } catch { /* ignore */ }
  } catch (err) {
    logger.error({ err }, "Logo upload failed — menu will be text-only");
  }
}

loadCachedLogoFileId();

export function startBot(): void {
  const bot = new TelegramBot(BOT_TOKEN, { polling: true });
  logger.info({ adminGroup: ADMIN_GROUP }, "Telegram bot started");

  // Upload logo and game photos on startup (only if not cached yet)
  void uploadLogoIfNeeded(bot, ADMIN_GROUP);
  void uploadGamePhotosIfNeeded(bot, ADMIN_GROUP);

  // ── helpers ──────────────────────────────────────────────────────────────────

  function genOrderId(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  function genRefCode(): string {
    return Math.random().toString(36).substring(2, 9).toUpperCase();
  }

  async function isSubscribed(userId: number): Promise<boolean> {
    try {
      const member = await bot.getChatMember(CHANNEL_USERNAME, userId);
      return ["member", "administrator", "creator"].includes(member.status);
    } catch {
      return false;
    }
  }

  function subscribeKeyboard(lang: string): TelegramBot.InlineKeyboardMarkup {
    return {
      inline_keyboard: [
        [{ text: t(lang as Lang, "btn_subscribe"), url: "https://t.me/liotap" }],
        [{ text: t(lang as Lang, "btn_check_sub"), callback_data: "check_sub" }],
      ],
    };
  }

  async function requireSubscription(chatId: number, userId: number, lang: string): Promise<boolean> {
    const subscribed = await isSubscribed(userId);
    if (!subscribed) {
      await bot.sendMessage(chatId, t(lang as Lang, "subscribe_required"), {
        parse_mode: "HTML",
        reply_markup: subscribeKeyboard(lang),
      });
      return false;
    }
    return true;
  }

  async function notifyAdmin(
    text: string,
    markup?: TelegramBot.InlineKeyboardMarkup,
  ): Promise<void> {
    try {
      await bot.sendMessage(ADMIN_GROUP, text, {
        parse_mode: "HTML",
        ...(markup ? { reply_markup: markup } : {}),
      });
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      logger.error({ err, code: e?.code, reason: e?.message }, "Admin notify FAILED");
    }
  }

  async function sendMainMenu(chatId: number, userId: number): Promise<void> {
    const user   = getUser(userId);
    const lang   = user?.lang ?? "ru";
    const name   = user?.username ?? "друг";
    const text   = t(lang, "main_menu_text", { name });
    const markup = mainMenuKeyboard(lang);

    if (logoFileId) {
      try {
        await bot.sendPhoto(chatId, logoFileId, {
          caption: text, parse_mode: "HTML", reply_markup: markup,
        });
        return;
      } catch {
        logoFileId = undefined; // file_id expired — fall back to text
      }
    }
    await bot.sendMessage(chatId, text, { parse_mode: "HTML", reply_markup: markup });
  }

  async function editToMainMenu(chatId: number, msgId: number, userId: number): Promise<void> {
    // Delete old message and send fresh (photo can't be edited to/from text)
    try { await bot.deleteMessage(chatId, msgId); } catch { /* ignore */ }
    await sendMainMenu(chatId, userId);
  }

  async function editMsg(
    chatId: number, msgId: number,
    text: string, markup: TelegramBot.InlineKeyboardMarkup,
  ): Promise<void> {
    try {
      await bot.editMessageText(text, {
        chat_id: chatId, message_id: msgId,
        parse_mode: "HTML", reply_markup: markup,
      });
    } catch {
      await bot.sendMessage(chatId, text, { parse_mode: "HTML", reply_markup: markup });
    }
  }

  // ── Crypto Bot auto-polling ──────────────────────────────────────────────────
  setInterval(async () => {
    for (const [invoiceId, info] of cryptoPolling.entries()) {
      try {
        const status = await checkInvoice(invoiceId);
        if (status === "paid") {
          cryptoPolling.delete(invoiceId);
          const { userId, purchase, chatId, msgId } = info;

          purchase.status = "approved";
          removePendingPayment(purchase.id);

          const buyer = getUser(userId);
          if (buyer) {
            buyer.purchases.push(purchase);
            setUser(userId, buyer);
          }

          const amountNum = parseFloat(purchase.amount) || 0;
          addEarned(amountNum);

          const lang = buyer?.lang ?? "ru";
          try {
            await bot.editMessageReplyMarkup(
              { inline_keyboard: [] },
              { chat_id: chatId, message_id: msgId },
            );
          } catch { /* ignore */ }

          await bot.sendMessage(chatId, t(lang, "crypto_paid"), { parse_mode: "HTML" });

          const gameName   = GAME_LABELS[purchase.game]    ?? purchase.game;
          const deviceName = DEVICE_LABELS["ru"]?.[purchase.device] ?? purchase.device;
          const periodName = PERIOD_LABELS["ru"]?.[purchase.period] ?? purchase.period;

          await notifyAdmin(
            `✅ <b>Авто-оплата Crypto Bot!</b>\n\n` +
            `👤 Покупець: @${buyer?.username ?? userId}\n` +
            `🎮 Продукт: ${gameName} ${deviceName}\n` +
            `⏳ Термін: ${periodName}\n` +
            `💰 Сума: <b>${purchase.amount} USDT</b>` +
            (buyer?.referredBy
              ? `\n🔗 Трафікер: @${buyer.referredBy}\n💸 Доля (50%): <b>${(amountNum * 0.5).toFixed(2)} USDT</b>`
              : ""),
          );

          if (buyer?.referredBy) {
            const trafficer = getAllUsers().find(u => u.username === buyer.referredBy);
            if (trafficer) {
              const refs = getReferralsByCreator(trafficer.userId);
              if (refs.length > 0) incrementReferralConversion(refs[0].code);
            }
          }
        } else if (status === "expired") {
          cryptoPolling.delete(invoiceId);
          const { userId, purchase } = info;
          removePendingPayment(purchase.id);
          const buyer = getUser(userId);
          try {
            await bot.sendMessage(userId, t(buyer?.lang ?? "ru", "crypto_expired"), {
              parse_mode: "HTML",
            });
          } catch { /* ignore */ }
        }
      } catch (err) {
        logger.error({ err, invoiceId }, "Crypto polling error");
      }
    }
  }, 10_000);

  // ── /start ────────────────────────────────────────────────────────────────────
  bot.onText(/\/start(.*)/, async (msg, match) => {
    const chatId   = msg.chat.id;
    const userId   = msg.from!.id;
    const username = msg.from!.username ?? `user${userId}`;
    const param    = (match?.[1] ?? "").trim();

    // Always remove old reply keyboard first
    try {
      const rm = await bot.sendMessage(chatId, "...", {
        reply_markup: { remove_keyboard: true },
      });
      await bot.deleteMessage(chatId, rm.message_id);
    } catch { /* ignore */ }

    let existing = getUser(userId);

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
      existing = createUser(userId, username, referredBy);
      logger.info({ userId, username, referredBy }, "New user");

      const notifText = referredBy
        ? `👤 <b>Новий користувач!</b>\n🧑 @${username}\n🔗 Трафікер: @${referredBy}`
        : `👤 <b>Новий користувач!</b>\n🧑 @${username}`;
      await notifyAdmin(notifText);
    }

    const lang = existing.lang ?? "ru";

    if (!await requireSubscription(chatId, userId, lang)) return;

    if (!existing.langSelected) {
      await bot.sendMessage(chatId, t("ru", "welcome_lang"), {
        parse_mode: "HTML",
        reply_markup: langKeyboard(),
      });
    } else {
      existing.step = "main_menu";
      setUser(userId, existing);
      await sendMainMenu(chatId, userId);
    }
  });

  // ── Admin group text commands ──────────────────────────────────────────────────
  bot.on("message", async (msg) => {
    if (msg.chat.id !== ADMIN_GROUP) return;
    if (!msg.text || !msg.from) return;
    const text   = msg.text.trim();
    const userId = msg.from.id;
    const uname  = msg.from.username ?? `user${userId}`;

    if (text === "/menu") {
      await bot.sendMessage(ADMIN_GROUP,
        `📊 <b>Адмін панель LioTap</b>\n\n` +
        `👥 Користувачів: <b>${getUserCount()}</b>\n` +
        `💰 Зароблено: <b>${getTotalEarned()} UAH</b>\n\n` +
        `/menu — панель\n/ref — реф. посилання\n/mystats — моя статистика\n/users — список юзерів`,
        { parse_mode: "HTML" },
      );
    } else if (text === "/ref") {
      const botInfo = await bot.getMe();
      const existingRefs = getReferralsByCreator(userId);
      let ref: ReturnType<typeof createReferral>;
      let isNew = false;
      if (existingRefs.length > 0) {
        ref = existingRefs[0];
      } else {
        const code = genRefCode();
        ref = createReferral(code, userId, uname);
        isNew = true;
      }
      const link = `https://t.me/${botInfo.username}?start=ref_${ref.code}`;
      const statsLine = `кліки: ${ref.clicks} / конверсії: ${ref.conversions}`;
      const header = isNew ? "🔗 <b>Ваше реф. посилання створено:</b>" : "🔗 <b>Ваше реф. посилання:</b>";
      await bot.sendMessage(ADMIN_GROUP,
        `${header}\n<a href="${link}">${link}</a>\n\n📊 Статистика: ${statsLine}`,
        { parse_mode: "HTML", disable_web_page_preview: true },
      );
    } else if (text === "/mystats") {
      const myRefs = getReferralsByCreator(userId);
      if (!myRefs.length) {
        await bot.sendMessage(ADMIN_GROUP,
          `📊 <b>Ваша статистика</b>\n\nУ вас ще немає реф. посилання.\nСтворіть його командою /ref`,
          { parse_mode: "HTML" },
        );
        return;
      }
      const ref = myRefs[0];
      const botInfo = await bot.getMe();
      const link = `https://t.me/${botInfo.username}?start=ref_${ref.code}`;

      // Count users referred by this trafficker and their approved purchases
      const allUsers = getAllUsers();
      const referredUsers = allUsers.filter(u => u.username === uname
        ? false
        : u.referredBy === uname);
      const totalApproved = referredUsers.reduce(
        (sum, u) => sum + u.purchases.filter(p => p.status === "approved").length, 0,
      );

      // Estimate earned commission (50% of USDT purchases)
      let earnedUSDT = 0;
      for (const u of referredUsers) {
        for (const p of u.purchases.filter(pp => pp.status === "approved")) {
          if (p.currency === "USDT") {
            earnedUSDT += parseFloat(p.amount) * 0.5;
          }
        }
      }

      await bot.sendMessage(ADMIN_GROUP,
        `📊 <b>Ваша статистика, @${uname}</b>\n\n` +
        `🔗 Посилання:\n<a href="${link}">${link}</a>\n\n` +
        `👆 Кліки: <b>${ref.clicks}</b>\n` +
        `✅ Конверсії: <b>${ref.conversions}</b>\n` +
        `👥 Залучено юзерів: <b>${referredUsers.length}</b>\n` +
        `🛒 Підтверджених покупок: <b>${totalApproved}</b>\n` +
        `💸 Ваша комісія (50%): <b>${earnedUSDT.toFixed(2)} USDT</b>`,
        { parse_mode: "HTML", disable_web_page_preview: true },
      );
    } else if (text === "/users") {
      const all = getAllUsers().slice(-20).reverse();
      if (!all.length) { await bot.sendMessage(ADMIN_GROUP, "Немає юзерів."); return; }
      const lines = all.map((u, i) =>
        `${i + 1}. @${u.username} [${u.lang.toUpperCase()}] — покупок: ${u.purchases.filter(p => p.status === "approved").length}`,
      );
      await bot.sendMessage(ADMIN_GROUP,
        `👥 <b>Останні ${lines.length} юзерів:</b>\n\n${lines.join("\n")}`,
        { parse_mode: "HTML" },
      );
    }
  });

  // ── Callback queries ──────────────────────────────────────────────────────────
  bot.on("callback_query", async (query) => {
    const chatId = query.message!.chat.id;
    const msgId  = query.message!.message_id;
    const userId = query.from.id;
    const data   = query.data ?? "";

    // ── Admin group ────────────────────────────────────────────────────────────
    if (chatId === ADMIN_GROUP) {
      if (data.startsWith("approve_") || data.startsWith("reject_")) {
        if (userId !== OWNER_ID) {
          await bot.answerCallbackQuery(query.id, {
            text: "⛔ Тільки власник може підтверджувати оплати.",
            show_alert: true,
          });
          return;
        }
      }
      if (data.startsWith("approve_")) {
        const orderId = data.slice(8);
        const pending = getPendingPayment(orderId);
        if (!pending) { await bot.answerCallbackQuery(query.id, { text: "⚠️ Не знайдено" }); return; }

        const { userId: buyerId, purchase } = pending;
        purchase.status = "approved";
        removePendingPayment(orderId);

        const buyer = getUser(buyerId);
        if (buyer) { buyer.purchases.push(purchase); setUser(buyerId, buyer); }

        const amountNum = parseFloat(purchase.amount) || 0;
        addEarned(amountNum);

        try {
          await bot.sendMessage(buyerId, t(buyer?.lang ?? "ru", "payment_approved"), { parse_mode: "HTML" });
        } catch { /* user blocked bot */ }

        if (buyer?.referredBy) {
          const commission = (amountNum * 0.5).toFixed(2);
          await notifyAdmin(
            `💸 <b>Успішна оплата!</b>\n👤 @${buyer.username}\n🔗 @${buyer.referredBy}\n` +
            `💰 ${purchase.amount} ${purchase.currency}\n💸 Частка 50%: <b>${commission} ${purchase.currency}</b>`,
          );
          const trafficer = getAllUsers().find(u => u.username === buyer.referredBy);
          if (trafficer) {
            const refs = getReferralsByCreator(trafficer.userId);
            if (refs[0]) incrementReferralConversion(refs[0].code);
          }
        }

        await bot.editMessageReplyMarkup(
          { inline_keyboard: [[{ text: "✅ Підтверджено", callback_data: "noop" }]] },
          { chat_id: chatId, message_id: msgId },
        );
        await bot.answerCallbackQuery(query.id, { text: "✅ Підтверджено!" });

      } else if (data.startsWith("reject_")) {
        const orderId = data.slice(7);
        const pending = getPendingPayment(orderId);
        if (!pending) { await bot.answerCallbackQuery(query.id, { text: "⚠️ Не знайдено" }); return; }

        const { userId: buyerId } = pending;
        removePendingPayment(orderId);
        const buyer = getUser(buyerId);
        try {
          await bot.sendMessage(buyerId, t(buyer?.lang ?? "ru", "payment_rejected"), { parse_mode: "HTML" });
        } catch { /* ignore */ }

        await bot.editMessageReplyMarkup(
          { inline_keyboard: [[{ text: "❌ Відхилено", callback_data: "noop" }]] },
          { chat_id: chatId, message_id: msgId },
        );
        await bot.answerCallbackQuery(query.id, { text: "❌ Відхилено" });
      } else {
        await bot.answerCallbackQuery(query.id);
      }
      return;
    }

    // ── User callbacks ──────────────────────────────────────────────────────────
    const user = getUser(userId);
    if (!user) { await bot.answerCallbackQuery(query.id, { text: "Натисніть /start" }); return; }
    const lang = user.lang;

    // ── Check subscription callback ─────────────────────────────────────────────
    if (data === "check_sub") {
      const subscribed = await isSubscribed(userId);
      if (!subscribed) {
        await bot.answerCallbackQuery(query.id, {
          text: t(lang, "not_subscribed_yet"), show_alert: true,
        });
        return;
      }
      await bot.answerCallbackQuery(query.id);
      try { await bot.deleteMessage(chatId, msgId); } catch { /* ignore */ }
      if (!user.langSelected) {
        await bot.sendMessage(chatId, t("ru", "welcome_lang"), {
          parse_mode: "HTML",
          reply_markup: langKeyboard(),
        });
      } else {
        user.step = "main_menu";
        setUser(userId, user);
        await sendMainMenu(chatId, userId);
      }
      return;
    }

    await bot.answerCallbackQuery(query.id);

    // Language selection
    if (data.startsWith("lang_")) {
      const newLang = data.slice(5) as Lang;
      user.lang         = newLang;
      user.langSelected = true;
      user.step         = "main_menu";
      setUser(userId, user);
      try { await bot.deleteMessage(chatId, msgId); } catch { /* ignore */ }
      await sendMainMenu(chatId, userId);
      return;
    }

    if (data === "noop") return;

    // ── Main menu actions ───────────────────────────────────────────────────────
    if (data === "menu_buy") {
      user.step = "choose_game";
      setUser(userId, user);
      await editMsg(chatId, msgId, t(lang, "choose_game"), gamesKeyboard(lang));
      return;
    }

    if (data === "menu_reviews") {
      await editMsg(chatId, msgId, t(lang, "reviews_soon"), mainMenuKeyboard(lang));
      return;
    }

    if (data === "menu_help") {
      await editMsg(chatId, msgId, t(lang, "help_text"), mainMenuKeyboard(lang));
      return;
    }

    if (data === "menu_account") {
      const approved = user.purchases.filter(p => p.status === "approved").length;
      await editMsg(
        chatId, msgId,
        t(lang, "account_text", { username: user.username, purchases: String(approved) }),
        accountKeyboard(lang),
      );
      return;
    }

    if (data === "change_lang") {
      await editMsg(chatId, msgId, t("ru", "welcome_lang"), langKeyboard());
      return;
    }

    if (data === "my_purchases") {
      const approved = user.purchases.filter(p => p.status === "approved");
      if (!approved.length) {
        await editMsg(chatId, msgId, t(lang, "no_purchases"), accountKeyboard(lang));
        return;
      }
      const lines = approved.map((p, i) => {
        const gname = GAME_LABELS[p.game]    ?? p.game;
        const dname = DEVICE_LABELS["ru"]?.[p.device] ?? p.device;
        const pname = PERIOD_LABELS[lang]?.[p.period]  ?? p.period;
        return `${i + 1}. <b>${gname}</b> — ${dname}\n   ⏳ ${pname} | 💳 ${getPaymentMethodLabel(p.paymentMethod)}`;
      });
      await bot.sendMessage(chatId, t(lang, "purchases_header") + lines.join("\n\n"), {
        parse_mode: "HTML",
      });
      return;
    }

    // ── Back navigation ─────────────────────────────────────────────────────────
    if (data === "back_main") {
      user.step = "main_menu";
      setUser(userId, user);
      await editToMainMenu(chatId, msgId, userId);
      return;
    }
    if (data === "back_games") {
      user.step = "choose_game";
      setUser(userId, user);
      await editMsg(chatId, msgId, t(lang, "choose_game"), gamesKeyboard(lang));
      return;
    }
    if (data === "back_device") {
      user.step = "choose_device";
      setUser(userId, user);
      await editMsg(chatId, msgId, t(lang, "choose_device"), deviceKeyboard(lang));
      return;
    }
    if (data === "back_period") {
      user.step = "choose_period";
      setUser(userId, user);
      await editMsg(chatId, msgId, t(lang, `desc_${user.device ?? "apk"}`), periodKeyboard(lang));
      return;
    }
    if (data === "back_payment") {
      user.step = "choose_payment";
      setUser(userId, user);
      await editMsg(chatId, msgId, t(lang, "choose_payment"), paymentKeyboard(lang));
      return;
    }

    // ── Cancel crypto (back from crypto invoice) ─────────────────────────────
    if (data.startsWith("cancel_crypto_")) {
      const orderId = data.slice("cancel_crypto_".length);
      // Stop polling for this invoice
      for (const [invoiceId, info] of cryptoPolling.entries()) {
        if (info.purchase.id === orderId) {
          cryptoPolling.delete(invoiceId);
          break;
        }
      }
      removePendingPayment(orderId);
      user.step = "choose_payment";
      setUser(userId, user);
      // Delete the crypto invoice message and send fresh payment selection
      try { await bot.deleteMessage(chatId, msgId); } catch { /* ignore */ }
      await bot.sendMessage(chatId, t(lang, "choose_payment"), {
        parse_mode: "HTML",
        reply_markup: paymentKeyboard(lang),
      });
      return;
    }

    // ── Game selection ──────────────────────────────────────────────────────────
    if (data.startsWith("game_")) {
      user.game = data.slice(5);
      user.step = "choose_device";
      setUser(userId, user);
      const game    = user.game;
      const desc    = t(lang, `game_desc_${game}`);
      const kbd     = deviceKeyboard(lang);
      const fileId  = gameFileIds[game];
      if (fileId) {
        try {
          try { await bot.deleteMessage(chatId, msgId); } catch { /* ignore */ }
          await bot.sendPhoto(chatId, fileId, {
            caption: desc, parse_mode: "HTML", reply_markup: kbd,
          });
          return;
        } catch {
          delete gameFileIds[game]; // file_id expired — fall back
        }
      }
      await editMsg(chatId, msgId, desc, kbd);
      return;
    }

    // ── Device selection ────────────────────────────────────────────────────────
    if (data.startsWith("device_")) {
      user.device = data.slice(7);
      user.step   = "choose_period";
      setUser(userId, user);
      await editMsg(chatId, msgId, t(lang, `desc_${user.device}`), periodKeyboard(lang));
      return;
    }

    // ── Period selection ────────────────────────────────────────────────────────
    if (data.startsWith("period_")) {
      user.period = data.slice(7);
      user.step   = "choose_payment";
      setUser(userId, user);
      await editMsg(chatId, msgId, t(lang, "choose_payment"), paymentKeyboard(lang));
      return;
    }

    // ── Payment method selection ────────────────────────────────────────────────
    if (data.startsWith("pay_")) {
      const method  = data.slice(4);
      const game    = user.game    ?? "standoff2";
      const device  = user.device  ?? "apk";
      const period  = user.period  ?? "7";
      const orderId = genOrderId();

      const gameName   = GAME_LABELS[game]          ?? game;
      const deviceName = DEVICE_LABELS["ru"]?.[device] ?? device;
      const periodName = PERIOD_LABELS[lang]?.[period]  ?? period;
      const productStr = `${gameName} ${deviceName}`;

      user.paymentMethod = method;
      user.step          = "awaiting_payment";
      setUser(userId, user);

      if (method === "card") {
        const amount   = String(PRICES_UAH[period] ?? 0);
        const purchase: Purchase = {
          id: orderId, game, device, period,
          paymentMethod: "card", amount, currency: "UAH",
          status: "pending", createdAt: new Date(),
        };
        addPendingPayment(orderId, userId, purchase);

        const invoiceText = t(lang, "card_invoice", {
          product: productStr, period: periodName,
          orderId, card: CARD_NUMBER, amount,
        });
        await editMsg(chatId, msgId, invoiceText,
          cardInvoiceKeyboard(lang, orderId, CARD_NUMBER, amount),
        );

      } else if (method === "crypto") {
        const amount   = String(PRICES_USDT[period] ?? 0);
        const purchase: Purchase = {
          id: orderId, game, device, period,
          paymentMethod: "crypto", amount, currency: "USDT",
          status: "pending", createdAt: new Date(),
        };

        const invoiceText = t(lang, "crypto_invoice", {
          product: productStr, period: periodName, orderId, amount,
        });

        // Create CryptoBot invoice
        try {
          logger.info({ orderId, amount }, "Creating CryptoBot invoice");
          const invoice = await createInvoice(
            amount,
            `LioTap: ${productStr} (${periodName})`,
            orderId,
          );
          logger.info({ invoiceId: invoice.invoiceId, payUrl: invoice.payUrl }, "CryptoBot invoice created");
          addPendingPayment(orderId, userId, purchase);

          // Delete the "choose payment" message and send fresh invoice
          try { await bot.deleteMessage(chatId, msgId); } catch { /* ignore */ }

          const sentMsg = await bot.sendMessage(chatId, invoiceText, {
            parse_mode: "HTML",
            reply_markup: cryptoInvoiceKeyboard(lang, invoice.payUrl, orderId),
          });

          // Start polling for this invoice
          cryptoPolling.set(invoice.invoiceId, {
            userId, purchase, chatId, msgId: sentMsg.message_id,
          });

          // Notify admin
          await notifyAdmin(
            `🤖 <b>Новий запит (Crypto Bot)</b>\n` +
            `👤 @${user.username}\n🎮 ${productStr}\n` +
            `⏳ ${periodName}\n💰 <b>${amount} USDT</b>\n` +
            `🆔 <code>${orderId}</code>\n` +
            `✅ Рахунок створено — оплата автоматична`,
          );

        } catch (err) {
          logger.error({ err }, "CryptoBot invoice creation FAILED");
          await bot.sendMessage(chatId,
            "⚠️ <b>Помилка створення рахунку.</b>\n\nСпробуйте ще раз або оберіть картку / голду.",
            { parse_mode: "HTML" },
          );
        }

      } else if (method === "gold") {
        const amount   = String(PRICES_GOLD[period] ?? 0);
        const purchase: Purchase = {
          id: orderId, game, device, period,
          paymentMethod: "gold", amount, currency: "Gold",
          status: "pending", createdAt: new Date(),
        };
        addPendingPayment(orderId, userId, purchase);

        const invoiceText = t(lang, "gold_invoice", {
          product: productStr, period: periodName, orderId, amount,
        });
        await editMsg(chatId, msgId, invoiceText, goldInvoiceKeyboard(lang, orderId));
      }
      return;
    }

    // ── Check payment (card / gold) ─────────────────────────────────────────────
    if (data.startsWith("check_")) {
      const orderId = data.slice(6);
      const pending = getPendingPayment(orderId);
      if (!pending) {
        await bot.answerCallbackQuery(query.id, {
          text: "ℹ️ Оплата вже оброблена.", show_alert: true,
        });
        return;
      }

      // Prevent duplicate admin notifications for same order
      if (!notifiedOrders.has(orderId)) {
        notifiedOrders.add(orderId);

        const { purchase } = pending;
        const gameName   = GAME_LABELS[purchase.game]            ?? purchase.game;
        const deviceName = DEVICE_LABELS["ru"]?.[purchase.device] ?? purchase.device;
        const periodName = PERIOD_LABELS["ru"]?.[purchase.period]  ?? purchase.period;
        const productStr = `${gameName} ${deviceName}`;

        const methodEmoji = purchase.paymentMethod === "card" ? "💳" : "🥇";
        const methodLabel = purchase.paymentMethod === "card" ? "Картка (UAH)" : "Gold";

        await notifyAdmin(
          `${methodEmoji} <b>Перевірка оплати</b>\n` +
          `👤 @${user.username}\n` +
          `🎮 ${productStr}\n` +
          `⏳ ${periodName}\n` +
          `💰 <b>${purchase.amount} ${purchase.currency}</b> — ${methodLabel}\n` +
          `🆔 <code>${orderId}</code>`,
          adminPaymentKeyboard(orderId),
        );
      }

      await bot.answerCallbackQuery(query.id, {
        text: t(lang, "payment_checking"), show_alert: true,
      });
      return;
    }
  });

  bot.on("polling_error", err => logger.error({ err }, "Polling error"));
  logger.info("Bot polling started");
}
