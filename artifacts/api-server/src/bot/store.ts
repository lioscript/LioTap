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

const users = new Map<number, UserState>();
const pendingPayments = new Map<string, { userId: number; purchase: Purchase }>();
const referrals = new Map<string, ReferralLink>();
let totalEarned = 0;

export function getUser(userId: number): UserState | undefined {
  return users.get(userId);
}

export function setUser(userId: number, state: UserState): void {
  users.set(userId, state);
}

export function createUser(userId: number, username: string, referredBy?: string): UserState {
  const state: UserState = {
    userId,
    username: username || `user${userId}`,
    lang: "ru",
    step: "lang_select",
    purchases: [],
    referredBy,
    joinedAt: new Date(),
  };
  users.set(userId, state);
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
  const ref: ReferralLink = {
    code,
    creatorId,
    creatorUsername,
    clicks: 0,
    conversions: 0,
  };
  referrals.set(code, ref);
  return ref;
}

export function getReferral(code: string): ReferralLink | undefined {
  return referrals.get(code);
}

export function incrementReferralClick(code: string): void {
  const ref = referrals.get(code);
  if (ref) ref.clicks++;
}

export function incrementReferralConversion(code: string): void {
  const ref = referrals.get(code);
  if (ref) ref.conversions++;
}

export function getReferralsByCreator(creatorId: number): ReferralLink[] {
  return Array.from(referrals.values()).filter((r) => r.creatorId === creatorId);
}

export function getAllUsers(): UserState[] {
  return Array.from(users.values());
}
