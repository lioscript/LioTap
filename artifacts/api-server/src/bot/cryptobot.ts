const CRYPTO_BOT_API = "https://pay.crypt.bot/api";
const TOKEN = process.env["CRYPTO_BOT_TOKEN"] ?? "";

interface CryptoBotInvoice {
  invoice_id: number;
  status: "active" | "paid" | "expired";
  hash: string;
  asset: string;
  amount: string;
  pay_url: string;
  description?: string;
  payload?: string;
  created_at: string;
  paid_at?: string;
}

interface CryptoBotResponse<T> {
  ok: boolean;
  result: T;
}

async function apiRequest<T>(method: string, params?: Record<string, unknown>): Promise<T> {
  const url = `${CRYPTO_BOT_API}/${method}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Crypto-Pay-API-Token": TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params ?? {}),
  });
  const data = (await res.json()) as CryptoBotResponse<T>;
  if (!data.ok) throw new Error(`CryptoBot API error: ${JSON.stringify(data)}`);
  return data.result;
}

export interface CreatedInvoice {
  invoiceId: number;
  payUrl: string;
  hash: string;
}

export async function createInvoice(
  amount: string,
  description: string,
  payload: string
): Promise<CreatedInvoice> {
  const result = await apiRequest<CryptoBotInvoice>("createInvoice", {
    asset: "USDT",
    amount,
    description,
    payload,
    expires_in: 900,
  });
  return {
    invoiceId: result.invoice_id,
    payUrl: result.pay_url,
    hash: result.hash,
  };
}

export async function checkInvoice(invoiceId: number): Promise<"active" | "paid" | "expired"> {
  const result = await apiRequest<{ items: CryptoBotInvoice[] }>("getInvoices", {
    invoice_ids: [invoiceId],
  });
  return result.items[0]?.status ?? "expired";
}
