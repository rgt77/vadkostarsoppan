import fs from "node:fs";

const SOURCE = "https://www.carculated.se/bensinpriser";
const FILE = "county-data.js";

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
    diesel: number(match[2])
  };
});

if (counties.length !== 21) throw new Error("Expected 21 counties");

const stockholmDate = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Stockholm",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
}).format(new Date());

const next = {
  updatedAt: updatedMatch[1],
  retrievedAt: stockholmDate,
  source: SOURCE,
  national: {
    id: "riket",
    name: "Hela Sverige",
    petrol: number(nationalMatch[1]),
    diesel: number(nationalMatch[2])
  },
  counties
};

const row = county =>
  '    { id: "' + county.id + '", name: "' + county.name + '", petrol: ' +
  county.petrol.toFixed(2) + ', diesel: ' + county.diesel.toFixed(2) + ' }';

const output =
  'window.COUNTY_PRICES = {\n' +
  '  updatedAt: "' + next.updatedAt + '",\n' +
  '  retrievedAt: "' + next.retrievedAt + '",\n' +
  '  source: "' + next.source + '",\n' +
  '  national: {\n' +
  '    id: "riket",\n' +
  '    name: "Hela Sverige",\n' +
  '    petrol: ' + next.national.petrol.toFixed(2) + ',\n' +
  '    diesel: ' + next.national.diesel.toFixed(2) + '\n' +
  '  },\n' +
  '  counties: [\n' +
  next.counties.map(row).join(',\n') + '\n' +
  '  ]\n' +
  '};\n';

fs.writeFileSync(FILE, output);
console.log(
  "Updated county-data.js:",
  next.updatedAt,
  next.national.petrol.toFixed(2),
  next.national.diesel.toFixed(2),
  "21 counties"
);
