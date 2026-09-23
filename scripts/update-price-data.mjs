import fs from "node:fs";

const SOURCE = "https://www.carculated.se/bensinpriser";
const COUNTY_SLUGS = { blekinge:"blekinge", dalarna:"dalarna", gotland:"gotland", gavleborg:"gavleborg", halland:"halland", jamtland:"jamtland", jonkoping:"jonkoping", kalmar:"kalmar", kronoberg:"kronoberg", norrbotten:"norrbotten", skane:"skane", stockholm:"stockholm", sodermanland:"sodermanland", uppsala:"uppsala", varmland:"varmland", vasterbotten:"vasterbotten", vasternorrland:"vasternorrland", vastmanland:"vastmanland", "vastra-gotaland":"vastra-gotaland", orebro:"orebro", ostergotland:"ostergotland" };
const FILE = "county-data.js";
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
const current = scope.COUNTY_PRICES;

const response = await fetch(SOURCE, {
  headers: { "user-agent": "vadkostarsoppan-data-updater/1.0" }
});
if (!response.ok) throw new Error("Price source returned HTTP " + response.status);

const text = plainText(await response.text());
const petrol98Match = text.match(/Bensin 98\s+([\d,]+)\s+kr\/l/i);
const e85Match = text.match(/Etanol E85\s+([\d,]+)\s+kr\/l/i);

const updatedMatch = text.match(/Prisdata uppdaterad\s+(\d{4}-\d{2}-\d{2})/i);
const nationalMatch = text.match(
  /Snittpriset på 95-oktanig bensin är just nu\s+([\d,]+)\s+kr\/liter och diesel kostar\s+([\d,]+)\s+kr\/liter/i
);

if (!updatedMatch || !nationalMatch) {
  throw new Error("Could not parse national price metadata");
}

const counties = current.counties.map(county => {
  const pattern = new RegExp(
    escapeRegExp(county.name) +
    "(?:\\s+billigast)?\\s+([0-9]+,[0-9]{2})\\s+kr\\s+([0-9]+,[0-9]{2})\\s+kr",
    "i"
  );
  const match = text.match(pattern);
  if (!match) throw new Error("Could not parse " + county.name);

  return {
    id: county.id,
    name: county.name,
    petrol: number(match[1]),
    petrol98: Number.isFinite(county.petrol98) ? county.petrol98 : null,
    e85: Number.isFinite(county.e85) ? county.e85 : null,
    diesel: number(match[2])
  };
});

if (counties.length !== 21) throw new Error("Expected 21 counties");

for (const county of counties) {
  const slug = COUNTY_SLUGS[county.id];
  if (!slug) continue;
  try {
    const r = await fetch(`${SOURCE}/${slug}`, { headers: { "user-agent": "vadkostarsoppan-data-updater/1.0" } });
    if (!r.ok) continue;
    const countyText = plainText(await r.text());
    const p98 = countyText.match(/Bensin 98\s+([\d,]+)\s+kr\/l/i);
    const e85 = countyText.match(/Etanol E85\s+([\d,]+)\s+kr\/l/i);
    if (p98) county.petrol98 = number(p98[1]);
    if (e85) county.e85 = number(e85[1]);
  } catch (error) {
    console.warn(`Could not enrich ${county.name}: ${error.message}`);
  }
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
  counties
};

for (const key of ["petrol","petrol98","e85","diesel"]) validPrice(next.national[key], `national ${key}`);
for (const county of counties) for (const key of ["petrol","diesel"]) validPrice(county[key], `${county.id} ${key}`);

const row = county =>
  '    { id: "' + county.id + '", name: "' + county.name + '", petrol: ' +
  county.petrol.toFixed(2) + ', petrol98: ' + (Number.isFinite(county.petrol98) ? county.petrol98.toFixed(2) : 'null') + ', e85: ' + (Number.isFinite(county.e85) ? county.e85.toFixed(2) : 'null') + ', diesel: ' + county.diesel.toFixed(2) + ' }';

const output =
  'window.COUNTY_PRICES = {\n' +
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
  '  counties: [\n' +
  next.counties.map(row).join(',\n') + '\n' +
  '  ]\n' +
  '};\n';

fs.writeFileSync(FILE, output);

const history = fs.existsSync(HISTORY_FILE) ? JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8")) : { version: 1, snapshots: [] };
const snapshot = { date: next.updatedAt, national: next.national, counties: next.counties };
const existingIndex = history.snapshots.findIndex(item => item.date === snapshot.date);
if (existingIndex >= 0) history.snapshots[existingIndex] = snapshot;
else history.snapshots.push(snapshot);
history.snapshots.sort((a, b) => a.date.localeCompare(b.date));
history.snapshots = history.snapshots.slice(-730);
fs.mkdirSync("data", { recursive: true });
fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2) + "\n");
console.log(
  "Updated county-data.js:",
  next.updatedAt,
  next.national.petrol.toFixed(2),
  next.national.diesel.toFixed(2),
  "21 counties"
);
