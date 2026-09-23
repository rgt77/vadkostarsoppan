import fs from "node:fs";

const URL = "https://api.riksbank.se/swea/v1/Observations/Latest/sekusdpmi";
const OUT = "data/market-data.json";

const response = await fetch(URL, { headers: { "user-agent": "vadkostarsoppan-market-updater/1.0" } });
if (!response.ok) throw new Error("Riksbank API returned HTTP " + response.status);
const payload = await response.json();
const rows = Array.isArray(payload) ? payload : payload?.observations ?? payload?.value ?? [payload];
const row = rows.find(x => Number.isFinite(Number(x?.value ?? x?.Value))) ?? rows[0];
const value = Number(row?.value ?? row?.Value);
const date = row?.date ?? row?.Date ?? row?.observationDate ?? row?.ObservationDate;
if (!Number.isFinite(value) || value <= 0) throw new Error("Invalid USD/SEK value");
if (!/^\d{4}-\d{2}-\d{2}/.test(String(date ?? ""))) throw new Error("Invalid USD/SEK observation date");

const data = {
  version: 1,
  updatedAt: new Date().toISOString(),
  fx: {
    usdSek: value,
    observationDate: String(date).slice(0, 10),
    seriesId: "SEKUSDPMI",
    source: URL,
    indicative: true
  }
};
fs.mkdirSync("data", { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(data, null, 2) + "\n");
console.log("USD/SEK", value, data.fx.observationDate);
