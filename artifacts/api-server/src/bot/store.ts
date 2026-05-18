import { eq, sql } from "drizzle-orm";
import { db, usersTable, purchasesTable, referralsTable, settingsTable } from "@workspace/db";
import { logger } from "../lib/logger";
import type { Lang } from "./i18n";

export interface Purchase {
  id: string;
  game: string;
  device: string;
  period: string;
  paymentMethod: string;
  amount: string;
  currency: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  messageId?: number;
}

export interface UserState {
  userId: number;
  username: string;
  lang: Lang;
  langSelected: boolean;
  step: string;
  game?: string;
  device?: string;
  period?: string;
  paymentMethod?: string;
  purchases: Purchase[];
  referredBy?: string;
  joinedAt: Date;
}

export interface ReferralLink {
  code: string;
  creatorId: number;
  creatorUsername: string;
  clicks: number;
  conversions: number;
}

// ── In-memory maps (cache for fast sync reads) ─────────────────────────────────
const users           = new Map<number, UserState>();
const pendingPayments = new Map<string, { userId: number; purchase: Purchase }>();
const referrals       = new Map<string, ReferralLink>();
let   totalEarned     = 0;

// ── DB write helpers (fire-and-forget) ─────────────────────────────────────────
function dbSaveUser(userId: number, state: UserState): void {
  db.insert(usersTable).values({
    userId,
    username:      state.username,
    lang:          state.lang,
    langSelected:  state.langSelected,
    step:          state.step,
    game:          state.game          ?? null,
    device:        state.device        ?? null,
    period:        state.period        ?? null,
    paymentMethod: state.paymentMethod ?? null,
    referredBy:    state.referredBy    ?? null,
    joinedAt:      state.joinedAt,
  }).onConflictDoUpdate({
    target: usersTable.userId,
    set: {
      username:      state.username,
      lang:          state.lang,
      langSelected:  state.langSelected,
      step:          state.step,
      game:          state.game          ?? null,
      device:        state.device        ?? null,
      period:        state.period        ?? null,
      paymentMethod: state.paymentMethod ?? null,
      referredBy:    state.referredBy    ?? null,
    },
  }).catch(err => logger.error({ err }, "DB saveUser failed"));
}

function dbSavePurchase(purchase: Purchase, userId: number): void {
  db.insert(purchasesTable).values({
    id:            purchase.id,
    userId,
    game:          purchase.game,
    device:        purchase.device,
    period:        purchase.period,
    paymentMethod: purchase.paymentMethod,
    amount:        purchase.amount,
    currency:      purchase.currency,
    status:        purchase.status,
    createdAt:     purchase.createdAt,
    messageId:     purchase.messageId ?? null,
  }).onConflictDoUpdate({
    target: purchasesTable.id,
    set: { status: purchase.status, messageId: purchase.messageId ?? null },
  }).catch(err => logger.error({ err }, "DB savePurchase failed"));
}

function dbSaveReferral(ref: ReferralLink): void {
  db.insert(referralsTable).values({
    code:            ref.code,
    creatorId:       ref.creatorId,
    creatorUsername: ref.creatorUsername,
    clicks:          ref.clicks,
    conversions:     ref.conversions,
  }).onConflictDoUpdate({
    target: referralsTable.code,
    set: { clicks: ref.clicks, conversions: ref.conversions },
  }).catch(err => logger.error({ err }, "DB saveReferral failed"));
}

// ── Init: create tables if needed, then load into memory ──────────────────────
export async function initStore(): Promise<void> {
  // Auto-create tables on first deploy (idempotent)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS bot_users (
      user_id        BIGINT PRIMARY KEY,
      username       TEXT NOT NULL,
      lang           TEXT NOT NULL DEFAULT 'ru',
      lang_selected  BOOLEAN NOT NULL DEFAULT false,
      step           TEXT NOT NULL DEFAULT 'main_menu',
      game           TEXT,
      device         TEXT,
      period         TEXT,
      payment_method TEXT,
      referred_by    TEXT,
      joined_at      TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS bot_purchases (
      id             TEXT PRIMARY KEY,
      user_id        BIGINT NOT NULL,
      game           TEXT NOT NULL,
      device         TEXT NOT NULL,
      period         TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      amount         TEXT NOT NULL,
      currency       TEXT NOT NULL,
      status         TEXT NOT NULL DEFAULT 'pending',
      created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
      message_id     INTEGER
    );
    CREATE TABLE IF NOT EXISTS bot_referrals (
      code             TEXT PRIMARY KEY,
      creator_id       BIGINT NOT NULL,
      creator_username TEXT NOT NULL,
      clicks           INTEGER NOT NULL DEFAULT 0,
      conversions      INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS bot_settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  logger.info("DB tables ensured");

  try {
    const [dbUsers, dbPurchases, dbRefs, earnedRows] = await Promise.all([
      db.select().from(usersTable),
      db.select().from(purchasesTable),
      db.select().from(referralsTable),
      db.select().from(settingsTable).where(eq(settingsTable.key, "total_earned")),
    ]);

    for (const u of dbUsers) {
      users.set(u.userId, {
        userId:        u.userId,
        username:      u.username,
        lang:          u.lang as Lang,
        langSelected:  u.langSelected,
        step:          u.step,
        game:          u.game          ?? undefined,
        device:        u.device        ?? undefined,
        period:        u.period        ?? undefined,
        paymentMethod: u.paymentMethod ?? undefined,
        referredBy:    u.referredBy    ?? undefined,
        joinedAt:      u.joinedAt,
        purchases:     [],
      });
    }

    for (const p of dbPurchases) {
      const user = users.get(p.userId);
      if (user) {
        user.purchases.push({
          id:            p.id,
          game:          p.game,
          device:        p.device,
          period:        p.period,
          paymentMethod: p.paymentMethod,
          amount:        p.amount,
          currency:      p.currency,
          status:        p.status as "pending" | "approved" | "rejected",
          createdAt:     p.createdAt,
          messageId:     p.messageId ?? undefined,
        });
      }
    }

    for (const r of dbRefs) {
      referrals.set(r.code, {
        code:            r.code,
        creatorId:       r.creatorId,
        creatorUsername: r.creatorUsername,
        clicks:          r.clicks,
        conversions:     r.conversions,
      });
    }

    if (earnedRows.length > 0) {
      totalEarned = parseFloat(earnedRows[0].value) || 0;
    }

    logger.info(
      { users: users.size, referrals: referrals.size, totalEarned },
      "Store loaded from PostgreSQL",
    );
  } catch (err) {
    logger.error({ err }, "Failed to load store from DB — starting fresh");
  }
}

// ── Settings (logo / game file_ids) ───────────────────────────────────────────
export async function getSetting(key: string): Promise<string | undefined> {
  const rows = await db.select().from(settingsTable).where(eq(settingsTable.key, key));
  return rows[0]?.value;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.insert(settingsTable).values({ key, value })
    .onConflictDoUpdate({ target: settingsTable.key, set: { value } });
}

// ── Public API ─────────────────────────────────────────────────────────────────
export function getUser(userId: number): UserState | undefined {
  return users.get(userId);
}

export function setUser(userId: number, state: UserState): void {
  users.set(userId, state);
  dbSaveUser(userId, state);
  for (const p of state.purchases) {
    dbSavePurchase(p, userId);
  }
}

export function createUser(userId: number, username: string, referredBy?: string): UserState {
  const state: UserState = {
    userId,
    username:     username || `user${userId}`,
    lang:         "ru",
    langSelected: false,
    step:         "main_menu",
    purchases:    [],
    referredBy,
    joinedAt:     new Date(),
  };
  users.set(userId, state);
  dbSaveUser(userId, state);
  return state;
}

export function getUserCount(): number { return users.size; }

export function getTotalEarned(): number { return totalEarned; }

export function addEarned(amount: number): void {
  totalEarned += amount;
  const val = String(totalEarned);
  db.insert(settingsTable).values({ key: "total_earned", value: val })
    .onConflictDoUpdate({ target: settingsTable.key, set: { value: val } })
    .catch(err => logger.error({ err }, "DB addEarned failed"));
}

export function addPendingPayment(orderId: string, userId: number, purchase: Purchase): void {
  pendingPayments.set(orderId, { userId, purchase });
}

export function getPendingPayment(orderId: string): { userId: number; purchase: Purchase } | undefined {
  return pendingPayments.get(orderId);
}

export function removePendingPayment(orderId: string): void {
  pendingPayments.delete(orderId);
}

export function getAllPendingPayments(): Map<string, { userId: number; purchase: Purchase }> {
  return pendingPayments;
}

export function createReferral(code: string, creatorId: number, creatorUsername: string): ReferralLink {
  const ref: ReferralLink = { code, creatorId, creatorUsername, clicks: 0, conversions: 0 };
  referrals.set(code, ref);
  dbSaveReferral(ref);
  return ref;
}

export function getReferral(code: string): ReferralLink | undefined {
  return referrals.get(code);
}

export function incrementReferralClick(code: string): void {
  const ref = referrals.get(code);
  if (!ref) return;
  ref.clicks++;
  dbSaveReferral(ref);
}

export function incrementReferralConversion(code: string): void {
  const ref = referrals.get(code);
  if (!ref) return;
  ref.conversions++;
  dbSaveReferral(ref);
}

export function getReferralsByCreator(creatorId: number): ReferralLink[] {
  return Array.from(referrals.values()).filter(r => r.creatorId === creatorId);
}

export function getAllUsers(): UserState[] {
  return Array.from(users.values());
}
