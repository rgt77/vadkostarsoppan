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
  "data/price-history.json",
  "data/calculation-model.json", "data/reduction-duty.json", "data/market-data.json", "data/market-history.json", "lib/calculation.mjs",
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

  w.SITE_DATA?.appVersion === "0.25.0" ? pass("Version 0.25.0") : fail("Version mismatch");
  w.SITE_DATA?.typicalTankLiters === 40 ? pass("Tank size 40 L") : fail("Tank size invalid");

  for (const fuel of fuels) {
    if (!Number.isFinite(fuel.vatRate) || !String(fuel.taxSource ?? "").startsWith("https://")) {
      fail("Fuel metadata invalid: " + fuel.label);
      continue;
    }

    const periods = fuel.taxPeriods ?? [];
    if (fuel.taxModel === "blend_dependent") {
      periods.length === 0 ? pass("Blend-dependent tax model: " + fuel.label) : warn("Blend-dependent fuel has fixed periods: " + fuel.label);
      continue;
    }
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
  ["petrol", "petrol98", "e85", "diesel"].every(key => Number.isFinite(data.national?.[key]))
    ? pass("Four national fuel prices")
    : fail("National fuel price missing");

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
  const model = JSON.parse(read("data/calculation-model.json"));
  model.methodology === "observed-plus-simulation" ? pass("Two-layer calculation model") : fail("Calculation model invalid");
  model.simulation?.referencePolicy?.allowUndocumentedPoliticalInputs === false ? pass("No undocumented political inputs") : fail("Political input safeguard missing");
  model.variables?.refined_product_reference?.publicProxyAllowed === false ? pass("No crude proxy substitution") : fail("Market proxy safeguard missing");
  model.variables?.market_chain_residual?.kind === "derived_residual" ? pass("Market residual explicitly classified") : fail("Market residual classification missing");
  Array.isArray(model.safeguards) && model.safeguards.length >= 4 ? pass("Simulation safeguards") : fail("Simulation safeguards missing");
} catch (error) { fail("Calculation model: " + error.message); }

try {
  const history = JSON.parse(read("data/price-history.json"));
  const snapshots = history.snapshots ?? [];
  snapshots.length ? pass("Price history seeded") : fail("Price history empty");
  snapshots.length <= 730 ? pass("Price history bounded") : fail("Price history exceeds 730 snapshots");
  const dates = snapshots.map(item => item.date);
  new Set(dates).size === dates.length ? pass("Unique history dates") : fail("Duplicate history dates");
  dates.every((date, i) => i === 0 || dates[i - 1] <= date) ? pass("Chronological history") : fail("History order invalid");
  const latest = snapshots.at(-1);
  ["petrol", "petrol98", "e85", "diesel"].every(key => Number.isFinite(latest?.national?.[key]))
    ? pass("Latest history has four fuels") : fail("History fuel data missing");
} catch (error) {
  fail("Price history: " + error.message);
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

const fuelButtons = [...html.matchAll(/data-fuel="([^"]+)"/g)].map(x => x[1]);
new Set(fuelButtons).size === 4 && ["petrol","petrol98","diesel","e85"].every(x => fuelButtons.includes(x)) && script.includes('button.addEventListener("click"') ? pass("Clickable four-fuel selector") : fail("Fuel selector regression");

if (html.includes('id="partySelect"') || !html.includes('id="partyGrid"')) {
  fail("Party selector regression");
} else {
  pass("Clickable party logos");
}

try {
  const duty = JSON.parse(read("data/reduction-duty.json"));
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm" }).format(new Date());
  const active = duty.periods?.find(p => p.validFrom <= today && today <= p.validTo);
  duty.model === "ghg_reduction_obligation" ? pass("Reduction duty model") : fail("Reduction duty model invalid");
  active?.petrolPct === 10 && active?.dieselPct === 10 ? pass("Active reduction duty") : fail("Active reduction duty missing");
  duty.notes?.some(x => x.includes("not direct biofuel volume shares")) ? pass("Reduction duty safeguard") : fail("Reduction duty safeguard missing");
} catch (error) {
  fail("Reduction duty: " + error.message);
}

try {
  const market = JSON.parse(read("data/market-data.json"));
  market.fx?.seriesId === "SEKUSDPMI" ? pass("Riksbank FX series") : fail("Riksbank FX series invalid");
  String(market.fx?.source ?? "").startsWith("https://api.riksbank.se/") ? pass("Official FX source") : fail("FX source invalid");
  market.updatedAt === null || /^\d{4}-\d{2}-\d{2}$/.test(market.updatedAt) ? pass("Market snapshot date") : fail("Market updatedAt invalid");
  if (market.fx?.usdSek !== null) {
    Number.isFinite(market.fx.usdSek) && market.fx.usdSek > 0 ? pass("USD/SEK value") : fail("USD/SEK value invalid");
    /^\d{4}-\d{2}-\d{2}$/.test(market.fx.observationDate ?? "") ? pass("USD/SEK date") : fail("USD/SEK date invalid");
  } else warn("Market data awaits first Riksbank ingestion");
} catch (error) { fail("Market data: " + error.message); }

try {
  const registry = JSON.parse(read("data/source-registry.json"));
  const ids = registry.sources?.map(x => x.id) ?? [];
  new Set(ids).size === ids.length ? pass("Unique source IDs") : fail("Duplicate source IDs");
  registry.sources?.every(x => /^https:\/\//.test(x.url) && Array.isArray(x.requiredFor)) ? pass("Source registry schema") : fail("Source registry invalid");
} catch (error) { fail("Source registry: " + error.message); }

try {
  const history = JSON.parse(read("data/market-history.json"));
  const rows = history.snapshots ?? [];
  rows.length <= 730 ? pass("Market history bounded") : fail("Market history too large");
  rows.every((x,i) => /^\d{4}-\d{2}-\d{2}$/.test(x.date) && Number.isFinite(x.usdSek) && (i===0 || rows[i-1].date < x.date)) ? pass("Market history schema") : rows.length === 0 ? warn("Market history awaits first ingestion") : fail("Market history invalid");
} catch (error) { fail("Market history: " + error.message); }

if (warnings.length) console.warn("\n" + warnings.map(message => "! " + message).join("\n"));
if (failures.length) {
  console.error("\n" + failures.map(message => "✕ " + message).join("\n"));
  process.exit(1);
}
console.log("\nPASS");
