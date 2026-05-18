import { pgTable, bigint, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("bot_users", {
  userId:        bigint("user_id", { mode: "number" }).primaryKey(),
  username:      text("username").notNull(),
  lang:          text("lang").notNull().default("ru"),
  langSelected:  boolean("lang_selected").notNull().default(false),
  step:          text("step").notNull().default("main_menu"),
  game:          text("game"),
  device:        text("device"),
  period:        text("period"),
  paymentMethod: text("payment_method"),
  referredBy:    text("referred_by"),
  joinedAt:      timestamp("joined_at").notNull().defaultNow(),
});

export const purchasesTable = pgTable("bot_purchases", {
  id:            text("id").primaryKey(),
  userId:        bigint("user_id", { mode: "number" }).notNull(),
  game:          text("game").notNull(),
  device:        text("device").notNull(),
  period:        text("period").notNull(),
  paymentMethod: text("payment_method").notNull(),
  amount:        text("amount").notNull(),
  currency:      text("currency").notNull(),
  status:        text("status").notNull().default("pending"),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
  messageId:     integer("message_id"),
});

export const referralsTable = pgTable("bot_referrals", {
  code:            text("code").primaryKey(),
  creatorId:       bigint("creator_id", { mode: "number" }).notNull(),
  creatorUsername: text("creator_username").notNull(),
  clicks:          integer("clicks").notNull().default(0),
  conversions:     integer("conversions").notNull().default(0),
});

export const settingsTable = pgTable("bot_settings", {
  key:   text("key").primaryKey(),
  value: text("value").notNull(),
});
