import fs from "node:fs";

const read = file => fs.readFileSync(file, "utf8");
const required = [
  "index.html", "style.css", "script.js",
  "fuel-data.js", "county-data.js", "policy-data.js",
  "party-logos/mp.png", "party-logos/s.png", "404.html"
];
const failures = [];
const pass = message => console.log("✓ " + message);
const fail = message => failures.push(message);

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

try {
  const w = {};
  new Function("window", read("fuel-data.js"))(w);
  const fuels = Object.values(w.FUEL_DATA ?? {});

  w.SITE_DATA?.appVersion === "0.13.0" ? pass("Version 0.13.0") : fail("Version mismatch");
  w.SITE_DATA?.typicalTankLiters === 40 ? pass("Tank size 40 L") : fail("Tank size invalid");

  fuels.length === 2 &&
  fuels.every(fuel =>
    Number.isFinite(fuel.energyTax) &&
    Number.isFinite(fuel.carbonTax) &&
    Number.isFinite(fuel.vatRate) &&
    String(fuel.taxSource ?? "").startsWith("https://")
  ) ? pass("Fuel data") : fail("Fuel data invalid");
} catch (error) {
  fail("Fuel data: " + error.message);
}

try {
  const w = {};
  new Function("window", read("county-data.js"))(w);
  const counties = w.COUNTY_PRICES?.counties ?? [];

  counties.length === 21 ? pass("21 counties") : fail("County count: " + counties.length);
  new Set(counties.map(item => item.id)).size === counties.length
    ? pass("Unique county IDs")
    : fail("Duplicate county IDs");
  counties.every(item => Number.isFinite(item.petrol) && Number.isFinite(item.diesel))
    ? pass("County prices")
    : fail("Invalid county prices");
} catch (error) {
  fail("County data: " + error.message);
}

try {
  const w = {};
  new Function("window", read("policy-data.js"))(w);
  const scenarios = w.POLICY_SCENARIOS ?? {};
  const keys = ["c", "kd", "l", "mp", "m", "s", "sd", "v"];
  const allowed = new Set(["not_quantified", "party_delta", "stated_target"]);

  keys.every(key => scenarios[key]) ? pass("Eight parties") : fail("Party missing");
  keys.every(key => String(scenarios[key]?.source ?? "").startsWith("https://"))
    ? pass("Party sources")
    : fail("Party source missing");
  keys.every(key => allowed.has(scenarios[key]?.priceModel?.type))
    ? pass("Party models")
    : fail("Invalid party model");
} catch (error) {
  fail("Policy data: " + error.message);
}

if (html.includes('id="partySelect"') || !html.includes('id="partyGrid"')) {
  fail("Party selector regression");
} else {
  pass("Clickable party logos");
}

if (failures.length) {
  console.error("\n" + failures.map(message => "✕ " + message).join("\n"));
  process.exit(1);
}

console.log("\nPASS");
