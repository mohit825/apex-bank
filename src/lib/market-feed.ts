import "server-only";

import { setTimeout as delay } from "node:timers/promises";

type MarketFeedMode = "success" | "slow" | "error" | "timeout";

export const MARKET_FEED_TIMEOUT_MS = 2_500;

const RESPONSE_DELAY_MS: Record<MarketFeedMode, number> = {
  success: 120,
  slow: 1_600,
  error: 120,
  timeout: 5_000,
};

export class MarketFeedUnavailableError extends Error {}
export class MarketFeedTimeoutError extends Error {}

export function isExpectedMarketFeedError(error: unknown) {
  return (
    error instanceof MarketFeedUnavailableError ||
    error instanceof MarketFeedTimeoutError
  );
}

function getMode(): MarketFeedMode {
  const mode = process.env.MARKET_FEED_MODE;
  if (mode === "slow" || mode === "error" || mode === "timeout") return mode;
  return "success";
}

async function waitForSimulatedResponse(responseDelayMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MARKET_FEED_TIMEOUT_MS);

  try {
    await delay(responseDelayMs, undefined, { signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted) throw new MarketFeedTimeoutError();
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

/** Fictional sample values; this module performs no external network request. */
export async function getSimulatedMarketFeed() {
  const mode = getMode();
  await waitForSimulatedResponse(RESPONSE_DELAY_MS[mode]);

  if (mode === "error") throw new MarketFeedUnavailableError();

  return {
    updatedAt: new Date(),
    indices: [
      { name: "Sample Equity Index", value: "12,480.35", movement: "+0.42%" },
      { name: "Sample Bond Index", value: "1,006.20", movement: "−0.13%" },
    ],
  };
}
