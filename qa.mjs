import fs from "node:fs";

const read = file => fs.readFileSync(file, "utf8");
const required = [
  "index.html", "style.css", "script.js",
  "fuel-data.js", "county-data.js", "policy-data.js",
  "party-logos/mp.png", "party-logos/s.png",
  "scripts/update-price-data.mjs",
  ".github/workflows/update-prices.yml",
  ".github/workflows/data-health.yml",
  "scripts/data-health.mjs",
  "scripts/check-official-sources.mjs",
  "data/source-registry.json",
  "data/data-health.json",
  "404.html"
];
const failures = [];
const warnings = [];
const pass = message => console.log("✓ " + message);
const fail = message => failures.push(message);
const warn = message => warnings.push(message);

for (const file of required) {
  fs.existsSync(file) ? pass(file) : fail("Missing: " + file);
}

for (const file of ["script.js", "fuel-data.js", "county-data.js", "policy-data.js"]) {
  try {
    new Function(read(file));
    pass("Syntax: " + file);
  } catch (error) {
    fail("Syntax " + file + ": " + error.message);
  }
}

const html = read("index.html");
const script = read("script.js");
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
duplicates.length ? fail("Duplicate IDs: " + duplicates.join(", ")) : pass("Unique HTML IDs");

const jsIds = [...script.matchAll(/\$\("([^"]+)"\)/g)].map(match => match[1]);
const missingIds = [...new Set(jsIds.filter(id => !html.includes(`id="${id}"`)))];
missingIds.length ? fail("Missing JS targets: " + missingIds.join(", ")) : pass("JS targets exist");

const isoToday = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Stockholm",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
}).format(new Date());

const daysBetween = (older, newer = isoToday) =>
  Math.floor((Date.parse(newer + "T12:00:00Z") - Date.parse(older + "T12:00:00Z")) / 86400000);

try {
  const w = {};
  new Function("window", read("fuel-data.js"))(w);
  const fuels = Object.values(w.FUEL_DATA ?? {});

  w.SITE_DATA?.appVersion === "0.17.0" ? pass("Version 0.17.0") : fail("Version mismatch");
  w.SITE_DATA?.typicalTankLiters === 40 ? pass("Tank size 40 L") : fail("Tank size invalid");

  for (const fuel of fuels) {
    if (!Number.isFinite(fuel.vatRate) || !String(fuel.taxSource ?? "").startsWith("https://")) {
      fail("Fuel metadata invalid: " + fuel.label);
      continue;
    }

    const periods = fuel.taxPeriods ?? [];
    periods.length ? pass("Tax periods: " + fuel.label) : fail("Tax periods missing: " + fuel.label);

    for (const period of periods) {
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(period.validFrom) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(period.validTo) ||
        !Number.isFinite(period.energyTax) ||
        !Number.isFinite(period.carbonTax) ||
        period.validFrom > period.validTo
      ) {
        fail("Invalid tax period: " + fuel.label);
      }
    }

    const current = periods.find(period => period.validFrom <= isoToday && isoToday <= period.validTo);
    current ? pass("Current tax period: " + fuel.label) : fail("No tax period covers " + isoToday + ": " + fuel.label);
  }
} catch (error) {
  fail("Fuel data: " + error.message);
}

try {
  const w = {};
  new Function("window", read("county-data.js"))(w);
  const data = w.COUNTY_PRICES ?? {};
  const counties = data.counties ?? [];

  counties.length === 21 ? pass("21 counties") : fail("County count: " + counties.length);
  new Set(counties.map(item => item.id)).size === counties.length
    ? pass("Unique county IDs")
    : fail("Duplicate county IDs");
  counties.every(item => Number.isFinite(item.petrol) && Number.isFinite(item.diesel))
    ? pass("County prices")
    : fail("Invalid county prices");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.updatedAt ?? "")) {
    fail("County updatedAt invalid");
  } else {
    const age = daysBetween(data.updatedAt);
    age <= 3 ? pass("County data freshness: " + age + " day(s)") : fail("County prices are stale: " + age + " days");
  }
} catch (error) {
  fail("County data: " + error.message);
}

try {
  const w = {};
  new Function("window", read("policy-data.js"))(w);
  const scenarios = w.POLICY_SCENARIOS ?? {};
  const keys = ["c", "kd", "l", "mp", "m", "s", "sd", "v"];
  const allowed = new Set(["not_quantified", "party_delta", "stated_target"]);
  const evidence = new Set(["not_quantified", "party_estimate", "party_stated_target"]);

  keys.every(key => scenarios[key]) ? pass("Eight parties") : fail("Party missing");
  keys.every(key => String(scenarios[key]?.source ?? "").startsWith("https://"))
    ? pass("Party sources")
    : fail("Party source missing");
  keys.every(key => allowed.has(scenarios[key]?.priceModel?.type))
    ? pass("Party models")
    : fail("Invalid party model");
  keys.every(key => evidence.has(scenarios[key]?.evidence))
    ? pass("Party evidence labels")
    : fail("Invalid party evidence label");

  for (const key of keys) {
    const verifiedAt = scenarios[key]?.verifiedAt;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(verifiedAt ?? "")) {
      fail("Party verification date missing: " + key);
      continue;
    }
    const age = daysBetween(verifiedAt);
    if (age > 30) warn("Party source review is " + age + " days old: " + key.toUpperCase());
  }
} catch (error) {
  fail("Policy data: " + error.message);
}

if (html.includes('id="partySelect"') || !html.includes('id="partyGrid"')) {
  fail("Party selector regression");
} else {
  pass("Clickable party logos");
}

if (warnings.length) {
  console.warn("\n" + warnings.map(message => "! " + message).join("\n"));
}

if (failures.length) {
  console.error("\n" + failures.map(message => "✕ " + message).join("\n"));
  process.exit(1);
}

console.log("\nPASS");
