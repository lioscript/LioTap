export const PRICES_USDT: Record<string, number> = {
  "7": 7,
  "30": 16,
  "forever": 30,
};

export const PRICES_UAH: Record<string, number> = {
  "7": 335,
  "30": 750,
  "forever": 1400,
};

export const PRICES_GOLD: Record<string, number> = {
  "7": 800,
  "30": 2000,
  "forever": 3800,
};

export const CARD_NUMBER = "5168752027679524";

export const PERIOD_LABELS: Record<string, Record<string, string>> = {
  ru: { "7": "7 дней", "30": "30 дней", "forever": "Навсегда" },
  en: { "7": "7 days", "30": "30 days", "forever": "Forever" },
  ua: { "7": "7 днів", "30": "30 днів", "forever": "Назавжди" },
};

export const GAME_LABELS: Record<string, string> = {
  standoff2: "Standoff 2",
  pubgmobile: "PUBG Mobile",
  brawlstars: "Brawlstars",
  fcmobile: "FC MOBILE",
};

export const DEVICE_LABELS: Record<string, Record<string, string>> = {
  ru: {
    apk: "📱 APK Android - Non root",
    ipa: "🍎 IPA iOS",
    pc: "💻 PC Emulator",
  },
  en: {
    apk: "📱 APK Android - Non root",
    ipa: "🍎 IPA iOS",
    pc: "💻 PC Emulator",
  },
  ua: {
    apk: "📱 APK Android - Non root",
    ipa: "🍎 IPA iOS",
    pc: "💻 PC Emulator",
  },
};

export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    card: "🇺🇦 Ukrainian card",
    crypto: "🤖 Crypto bot",
    gold: "🥇 Gold",
  };
  return labels[method] ?? method;
}

export function getAmountForMethod(
  method: string,
  period: string
): { amount: string; currency: string } {
  if (method === "card") {
    return { amount: String(PRICES_UAH[period] ?? 0), currency: "UAH" };
  } else if (method === "gold") {
    return { amount: String(PRICES_GOLD[period] ?? 0), currency: "Gold" };
  } else {
    return { amount: String(PRICES_USDT[period] ?? 0), currency: "USDT" };
  }
}
