import { parseFuelPrices } from "./price-parser.mjs";

const defaultSleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch a complete, dated national fuel price snapshot.
 * Transient HTTP, network and markup failures are retried; incomplete data is never returned.
 */
export async function fetchPriceSnapshot(url, {
  fetchImpl = fetch,
  sleep = defaultSleep,
  attempts = 3,
  timeoutMs = 20000
} = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetchImpl(url, {
        headers: { "user-agent": "vadkostarsoppan-data-updater/1.0", accept: "text/html" },
        signal: AbortSignal.timeout(timeoutMs)
      });
      if (!response.ok) throw new Error("Price source returned HTTP " + response.status);
      if (!(response.headers.get("content-type") || "").toLowerCase().includes("text/html")) {
        throw new Error("Price source returned non-HTML content");
      }
      // Parsing here means truncated pages and temporary markup failures also get retried.
      return parseFuelPrices(await response.text());
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(attempt * 2000);
    }
  }
  throw new Error("Price source failed after " + attempts + " attempts: " + (lastError?.message || "unknown error"));
}
