import { env } from "../config/env";

interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  convertedAmount: number;
  rate: number;
}

// cache exchange rates for 1 hour
let rateCache: { base: string; rates: Record<string, number>; fetchedAt: number } | null = null;
const CACHE_TTL = 3600_000; // 1 hour

async function fetchRates(base = "USD"): Promise<Record<string, number>> {
  if (rateCache && rateCache.base === base && Date.now() - rateCache.fetchedAt < CACHE_TTL) {
    return rateCache.rates;
  }

  const res = await fetch(`${env.EXCHANGE_RATE_API_URL}/${base}`);
  if (!res.ok) throw new Error("Failed to fetch exchange rates");

  const data = (await res.json()) as { rates: Record<string, number> };
  rateCache = { base, rates: data.rates, fetchedAt: Date.now() };
  return data.rates;
}

export async function convertCurrency(
  from: string,
  to: string,
  amount: number,
): Promise<ConversionResult> {
  const rates = await fetchRates("USD");
  const fromRate = rates[from];
  const toRate = rates[to];

  if (!fromRate || !toRate) {
    throw new Error(`Unsupported currency: ${!fromRate ? from : to}`);
  }

  // convert via USD: amount / fromRate * toRate
  const rate = toRate / fromRate;
  const convertedAmount = Math.round(amount * rate * 100) / 100;

  return { from, to, amount, convertedAmount, rate };
}
