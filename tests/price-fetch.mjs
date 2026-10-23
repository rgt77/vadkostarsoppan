import assert from "node:assert/strict";
import { fetchPriceSnapshot } from "../scripts/price-fetch.mjs";

const valid = [
  "Prisdata uppdaterad 2026-10-23",
  "Bensin 95 17,06 kr/l",
  "Bensin 98 18,62 kr/l",
  "Diesel 22,47 kr/l",
  "Etanol E85 14,51 kr/l"
].join(" ");
const html = source => new Response(source, { headers: { "content-type": "text/html; charset=utf-8" } });
const url = "https://example.org/prices";
const noWait = async () => {};

let attempts = 0;
const recovered = await fetchPriceSnapshot(url, {
  fetchImpl: async () => {
    attempts++;
    return html(attempts === 1 ? "temporary empty price page" : valid);
  },
  sleep: noWait
});
assert.equal(attempts, 2, "Malformed HTML should be retried");
assert.deepEqual(recovered, {
  updatedAt: "2026-10-23",
  national: { petrol: 17.06, petrol98: 18.62, e85: 14.51, diesel: 22.47 }
});

attempts = 0;
await assert.rejects(fetchPriceSnapshot(url, {
  fetchImpl: async () => {
    attempts++;
    return html("No valid date or national prices");
  },
  sleep: noWait
}), /Missing or invalid price source date/);
assert.equal(attempts, 3, "Persistent incomplete responses should not publish stale values");

attempts = 0;
const afterHttpError = await fetchPriceSnapshot(url, {
  fetchImpl: async () => {
    attempts++;
    return attempts === 1
      ? new Response("busy", { status: 503, headers: { "content-type": "text/html" } })
      : html(valid);
  },
  sleep: noWait
});
assert.equal(attempts, 2);
assert.equal(afterHttpError.national.diesel, 22.47);

attempts = 0;
await assert.rejects(fetchPriceSnapshot(url, {
  fetchImpl: async () => {
    attempts++;
    return new Response("{}", { headers: { "content-type": "application/json" } });
  },
  sleep: noWait
}), /non-HTML content/);
assert.equal(attempts, 3);

console.log("Price ingestion retries PASS: malformed HTML, HTTP errors, non-HTML and complete recovery");
