import fs from "node:fs";

const URL = "https://api.riksbank.se/swea/v1/Observations/Latest/sekusdpmi";
const OUT = "data/market-data.json";
const HISTORY = "data/market-history.json";

const response = await fetch(URL, { headers: { "user-agent": "vadkostarsoppan-market-updater/1.0" } });
if (!response.ok) throw new Error("Riksbank API returned HTTP " + response.status);
const payload = await response.json();
const objects = [];
const visit = value => {
  if (Array.isArray(value)) return value.forEach(visit);
  if (value && typeof value === "object") {
    objects.push(value);
    Object.values(value).forEach(visit);
  }
};
visit(payload);
const parseNumber = raw => Number(String(raw ?? "").replace(",", "."));
const row = objects.find(x => {
  const raw = x.value ?? x.Value ?? x.valueNumeric ?? x.ValueNumeric;
  const date = x.date ?? x.Date ?? x.observationDate ?? x.ObservationDate ?? x.dateString;
  return Number.isFinite(parseNumber(raw)) && /^\\d{4}-\\d{2}-\\d{2}/.test(String(date ?? ""));
});
if (!row) throw new Error("Could not locate Riksbank observation in API response");
const value = parseNumber(row.value ?? row.Value ?? row.valueNumeric ?? row.ValueNumeric);
const date = row.date ?? row.Date ?? row.observationDate ?? row.ObservationDate ?? row.dateString;
if (!Number.isFinite(value) || value < 5 || value > 20) throw new Error("Implausible USD/SEK value");
if (!/^\d{4}-\d{2}-\d{2}/.test(String(date ?? ""))) throw new Error("Invalid USD/SEK observation date");

const data = {
  version: 1,
  updatedAt: String(date).slice(0, 10),
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
const history = fs.existsSync(HISTORY) ? JSON.parse(fs.readFileSync(HISTORY, "utf8")) : { version: 1, retentionDays: 730, snapshots: [] };
const snapshot = { date: data.fx.observationDate, usdSek: data.fx.usdSek };
const index = history.snapshots.findIndex(x => x.date === snapshot.date);
if (index >= 0) history.snapshots[index] = snapshot; else history.snapshots.push(snapshot);
history.snapshots.sort((a,b) => a.date.localeCompare(b.date));
const cutoff = Date.parse(data.fx.observationDate + "T12:00:00Z") - 730 * 86400000;
history.snapshots = history.snapshots.filter(x => Date.parse(x.date + "T12:00:00Z") >= cutoff);
fs.writeFileSync(HISTORY, JSON.stringify(history, null, 2) + "\n");
console.log("USD/SEK", value, data.fx.observationDate);
