import fs from "node:fs";
import assert from "node:assert/strict";

const read = path => fs.readFileSync(path, "utf8");
const page = read("index.html");
const privacy = read("integritet.html");
const app = read("script.js");
const headers = read("_headers");
const window = {};
new Function("window", read("fuel-data.js"))(window);

const config = window.AD_CONFIG ?? {};
const slots = [...page.matchAll(/data-ad-slot="([^"]+)"/g)].map(match => match[1]);
assert.deepEqual(slots, ["primary", "secondary"], "Two labelled ad placements are required");
assert.equal((page.match(/<span class="ad-label">ANNONS<\/span>/g) || []).length, 2);
assert.ok(page.includes('href="/integritet.html"'), "The privacy page must be linked in the footer");
assert.ok(privacy.includes("Integritet och annonser") && privacy.includes("Cookies och tekniska uppgifter"));
assert.ok(privacy.includes("Ansvar och kontakt"), "Publisher identity and contact requirements must be documented");
assert.ok(app.includes('typeof window.__tcfapi !== "function"'), "Ad requests must be blocked when no CMP is present");
assert.ok(app.includes('!containers.length || !adConfig.enabled'), "Ad requests must be disabled by default");
assert.ok(!page.includes("pagead2.googlesyndication.com"), "AdSense must not load directly from the HTML");

if (!config.enabled) {
  // Publisher details may be prepared while remaining safely disabled.
  console.log("Ad readiness PREPARATION PASSED. Advertisements are OFF; no AdSense requests are made by the site code.");
  console.log("PENDING: approved publisher account, real pub/slot IDs, ads.txt, Google-certified CMP, CSP integration, legal owner/contact review.");
} else {
  assert.equal(config.provider, "adsense");
  assert.match(config.client || "", /^ca-pub-\d+$/, "Publisher ID is missing");
  for (const key of slots) assert.match(config.slots?.[key] || "", /^\d+$/, "Missing ad slot: " + key);
  assert.ok(fs.existsSync("ads.txt"), "Root ads.txt must be published when advertising is enabled");
  const expected = "google.com, " + config.client.replace(/^ca-/, "") + ", DIRECT, f08c47fec0942fa0";
  assert.ok(read("ads.txt").split(/\r?\n/).map(x => x.trim()).includes(expected), "ads.txt lacks the verified publisher line");
  assert.ok(headers.includes("https://pagead2.googlesyndication.com"), "AdSense script is blocked by the current CSP");
  throw new Error("Manual Google CMP setup, provider-specific CSP, publisher disclosure and account approval must be verified before enabling ads.");
}
