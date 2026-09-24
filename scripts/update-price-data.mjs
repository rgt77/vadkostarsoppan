import fs from "node:fs";

const SOURCE = "https://www.carculated.se/bensinpriser";
const FILE = "price-data.js";
const HISTORY_FILE = "data/price-history.json";

const decode = text => text
  .replace(/&nbsp;|&#160;/gi, " ")
  .replace(/&aring;/gi, "å")
  .replace(/&auml;/gi, "ä")
  .replace(/&ouml;/gi, "ö")
  .replace(/&Aring;/g, "Å")
  .replace(/&Auml;/g, "Ä")
  .replace(/&Ouml;/g, "Ö")
  .replace(/&amp;/gi, "&")
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&quot;/gi, '"');

const plainText = html => decode(
  html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
).replace(/\s+/g, " ").trim();

const number = value => Number(value.replace(",", "."));
const escapeRegExp = value => value.replace(/[.*+?^$(){}|[\]\\]/g, "\\$&");

const scope = {};
new Function("window", fs.readFileSync(FILE, "utf8"))(scope);
const current = scope.PRICE_DATA;

const response = await fetch(SOURCE, {
  headers: { "user-agent": "vadkostarsoppan-data-updater/1.0" }
});
if (!response.ok) throw new Error("Price source returned HTTP " + response.status);

const text = plainText(await response.text());
const petrol98Match = text.match(/Bensin 98\s+([\d,]+)\s+kr\/l/i);
const countyNames = {
  blekinge:"Blekinge län", dalarna:"Dalarnas län", gotland:"Gotlands län", gavleborg:"Gävleborgs län", halland:"Hallands län",
  jamtland:"Jämtlands län", jonkoping:"Jönköpings län", kalmar:"Kalmar län", kronoberg:"Kronobergs län", norrbotten:"Norrbottens län",
  skane:"Skåne län", stockholm:"Stockholms län", sodermanland:"Södermanlands län", uppsala:"Uppsala län", varmland:"Värmlands län",
  vasterbotten:"Västerbottens län", vasternorrland:"Västernorrlands län", vastmanland:"Västmanlands län",
  "vastra-gotaland":"Västra Götalands län", orebro:"Örebro län", ostergotland:"Östergötlands län"
};
const regional = {};
for (const [id,name] of Object.entries(countyNames)) {
  const escaped = escapeRegExp(name);
  const row = text.match(new RegExp(escaped + String.raw`(?:\\s+billigast)?\\s+([0-9]{1,2},[0-9]{2})\\s+kr\\s+([0-9]{1,2},[0-9]{2})\\s+kr`, "i"));
  if (!row) continue;
  const petrol = number(row[1]), diesel = number(row[2]);
  if (petrol >= 5 && petrol <= 50 && diesel >= 5 && diesel <= 50) regional[id] = { id, name, petrol, diesel };
}
const regionalCount = Object.keys(regional).length;
if (regionalCount !== 21) throw new Error(`Expected 21 verified county rows, parsed ${regionalCount}`);

const e85Match = text.match(/Etanol E85\s+([\d,]+)\s+kr\/l/i);

const updatedMatch = text.match(/Prisdata uppdaterad\s+(\d{4}-\d{2}-\d{2})/i);
const nationalMatch = text.match(
  /Snittpriset på 95-oktanig bensin är just nu\s+([\d,]+)\s+kr\/liter och diesel kostar\s+([\d,]+)\s+kr\/liter/i
);

if (!updatedMatch || !nationalMatch) {
  throw new Error("Could not parse national price metadata");
}



const stockholmDate = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Stockholm",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
}).format(new Date());

const validPrice = (value, label) => {
  if (!Number.isFinite(value) || value < 5 || value > 50) throw new Error(`Implausible ${label}: ${value}`);
  return value;
};
const sourceAgeDays = Math.floor((Date.parse(stockholmDate + "T12:00:00Z") - Date.parse(updatedMatch[1] + "T12:00:00Z")) / 86400000);
if (!Number.isFinite(sourceAgeDays) || sourceAgeDays < 0 || sourceAgeDays > 3) {
  throw new Error(`Price source date is not current enough: ${updatedMatch[1]} (${sourceAgeDays} days)`);
}

const next = {
  updatedAt: updatedMatch[1],
  retrievedAt: stockholmDate,
  source: SOURCE,
  national: {
    id: "riket",
    name: "Hela Sverige",
    petrol: number(nationalMatch[1]),
    petrol98: petrol98Match ? number(petrol98Match[1]) : current.national.petrol98,
    e85: e85Match ? number(e85Match[1]) : current.national.e85,
    diesel: number(nationalMatch[2])
  },
  regions: regional
};

for (const key of ["petrol","petrol98","e85","diesel"]) validPrice(next.national[key], `national ${key}`);
const previousDate = current.updatedAt;
if (previousDate && next.updatedAt < previousDate) throw new Error(`Price source moved backwards: ${previousDate} -> ${next.updatedAt}`);
for (const key of ["petrol","petrol98","e85","diesel"]) {
  const previous = Number(current.national?.[key]);
  const latest = next.national[key];
  if (Number.isFinite(previous) && Math.abs(latest - previous) > 8) {
    throw new Error(`Suspicious one-update jump for ${key}: ${previous} -> ${latest}`);
  }
}

const output =
  'window.PRICE_DATA = {\n' +
  '  updatedAt: "' + next.updatedAt + '",\n' +
  '  retrievedAt: "' + next.retrievedAt + '",\n' +
  '  source: "' + next.source + '",\n' +
  '  national: {\n' +
  '    id: "riket",\n' +
  '    name: "Hela Sverige",\n' +
  '    petrol: ' + next.national.petrol.toFixed(2) + ',\n' +
  '    petrol98: ' + next.national.petrol98.toFixed(2) + ',\n' +
  '    e85: ' + next.national.e85.toFixed(2) + ',\n' +
  '    diesel: ' + next.national.diesel.toFixed(2) + '\n' +
  '  },\n' +
  '  regions: ' + JSON.stringify(next.regions, null, 2).replace(/\n/g, "\\n  ") + '\n' +
  '};\n';

fs.writeFileSync(FILE, output);

const history = fs.existsSync(HISTORY_FILE) ? JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8")) : { version: 1, snapshots: [] };
const snapshot = { date: next.updatedAt, national: next.national };
const existingIndex = history.snapshots.findIndex(item => item.date === snapshot.date);
if (existingIndex >= 0) history.snapshots[existingIndex] = snapshot;
else history.snapshots.push(snapshot);
history.snapshots.sort((a, b) => a.date.localeCompare(b.date));
const cutoff = Date.parse(next.updatedAt + "T12:00:00Z") - 730 * 86400000;
history.snapshots = history.snapshots.filter(item => Date.parse(item.date + "T12:00:00Z") >= cutoff);
fs.mkdirSync("data", { recursive: true });
fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2) + "\n");
console.log(
  "Updated fuel price data:",
  next.updatedAt,
  next.national.petrol.toFixed(2),
  next.national.diesel.toFixed(2)
);
