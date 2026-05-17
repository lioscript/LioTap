import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
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

interface PersistedData {
  users: Array<[number, UserState]>;
  referrals: Array<[string, ReferralLink]>;
  totalEarned: number;
}

// ── Paths ──────────────────────────────────────────────────────────────────────
const DATA_DIR  = process.env["DATA_DIR"] ?? join(process.cwd(), "data");
const DATA_FILE = join(DATA_DIR, "store.json");

// ── In-memory maps ─────────────────────────────────────────────────────────────
const users           = new Map<number, UserState>();
const pendingPayments = new Map<string, { userId: number; purchase: Purchase }>();
const referrals       = new Map<string, ReferralLink>();
let totalEarned       = 0;

// ── Persistence ────────────────────────────────────────────────────────────────
function loadData(): void {
  try {
    if (!existsSync(DATA_FILE)) return;
    const raw  = readFileSync(DATA_FILE, "utf-8");
    const data = JSON.parse(raw) as PersistedData;

    for (const [id, u] of data.users ?? []) {
      u.joinedAt = new Date(u.joinedAt);
      u.purchases = (u.purchases ?? []).map((p) => ({
        ...p,
        createdAt: new Date(p.createdAt),
      }));
      users.set(Number(id), u);
    }
    for (const [code, r] of data.referrals ?? []) {
      referrals.set(code, r);
    }
    totalEarned = data.totalEarned ?? 0;
  } catch {
    // Corrupt file — start fresh
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleWrite(): void {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
      const data: PersistedData = {
        users:      Array.from(users.entries()),
        referrals:  Array.from(referrals.entries()),
        totalEarned,
      };
      writeFileSync(DATA_FILE, JSON.stringify(data), "utf-8");
    } catch { /* disk full or permission error — ignore */ }
  }, 500);
}

// Load on module import
loadData();

// ── Public API ─────────────────────────────────────────────────────────────────
export function getUser(userId: number): UserState | undefined {
  return users.get(userId);
}

export function setUser(userId: number, state: UserState): void {
  users.set(userId, state);
  scheduleWrite();
}

export function createUser(userId: number, username: string, referredBy?: string): UserState {
  const state: UserState = {
    userId,
    username: username || `user${userId}`,
    lang: "ru",
    langSelected: false,
    step: "main_menu",
    purchases: [],
    referredBy,
    joinedAt: new Date(),
  };
  users.set(userId, state);
  scheduleWrite();
  return state;
}

export function getUserCount(): number {
  return users.size;
}

export function getTotalEarned(): number {
  return totalEarned;
}

export function addEarned(amount: number): void {
  totalEarned += amount;
  scheduleWrite();
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
  scheduleWrite();
  return ref;
}

export function getReferral(code: string): ReferralLink | undefined {
  return referrals.get(code);
}

export function incrementReferralClick(code: string): void {
  const ref = referrals.get(code);
  if (ref) { ref.clicks++; scheduleWrite(); }
}

export function incrementReferralConversion(code: string): void {
  const ref = referrals.get(code);
  if (ref) { ref.conversions++; scheduleWrite(); }
}

export function getReferralsByCreator(creatorId: number): ReferralLink[] {
  return Array.from(referrals.values()).filter((r) => r.creatorId === creatorId);
}

export function getAllUsers(): UserState[] {
  return Array.from(users.values());
}
