import fs from "node:fs";

const required = [
  "index.html",
  "style.css",
  "script.js",
  "fuel-data.js",
  "county-data.js",
  "policy-data.js",
  "404.html"
];

const failures = [];
const passes = [];
const read = file => fs.readFileSync(file, "utf8");

for (const file of required) {
  (fs.existsSync(file) ? passes : failures).push(
    (fs.existsSync(file) ? "Exists: " : "Missing: ") + file
  );
}

for (const file of ["script.js","fuel-data.js","county-data.js","policy-data.js"]) {
  try {
    new Function(read(file));
    passes.push("Syntax: " + file);
  } catch (error) {
    failures.push("Syntax " + file + ": " + error.message);
  }
}

const html = read("index.html");
const script = read("script.js");

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
const duplicateIds = [...new Set(ids.filter((id,index) => ids.indexOf(id) !== index))];
duplicateIds.length
  ? failures.push("Duplicate HTML IDs: " + duplicateIds.join(", "))
  : passes.push("Unique HTML IDs");

const directIds = [...script.matchAll(/\$\("([^"]+)"\)/g)].map(match => match[1]);
const missingIds = [...new Set(directIds.filter(id => !html.includes(`id="${id}"`)))];
missingIds.length
  ? failures.push("Missing HTML IDs: " + missingIds.join(", "))
  : passes.push("All JS ID references resolve");

const scriptOrder = ["/fuel-data.js","/county-data.js","/policy-data.js","/script.js"]
  .map(src => html.indexOf(src));
scriptOrder.every((value,index) => value >= 0 && (index === 0 || value > scriptOrder[index - 1]))
  ? passes.push("Script load order")
  : failures.push("Script load order invalid");

try {
  const w = {};
  new Function("window", read("fuel-data.js"))(w);
  const fuels = [w.FUEL_DATA?.petrol,w.FUEL_DATA?.diesel].filter(Boolean);

  w.SITE_DATA?.appVersion === "0.10.0"
    ? passes.push("App version 0.10.0")
    : failures.push("App version mismatch");

  Number(w.SITE_DATA?.typicalTankLiters) === 40
    ? passes.push("Typical tank size: 40 L")
    : failures.push("Typical tank size missing/invalid");

  fuels.length === 2 &&
  fuels.every(fuel =>
    Number.isFinite(fuel.energyTax) &&
    Number.isFinite(fuel.carbonTax) &&
    Number.isFinite(fuel.vatRate) &&
    String(fuel.taxSource || "").startsWith("https://")
  )
    ? passes.push("Fuel tax data")
    : failures.push("Fuel tax data invalid");
} catch (error) {
  failures.push("Fuel data evaluation: " + error.message);
}

try {
  const w = {};
  new Function("window", read("county-data.js"))(w);
  const data = w.COUNTY_PRICES;
  const counties = data?.counties ?? [];

  counties.length === 21
    ? passes.push("21 counties")
    : failures.push("Expected 21 counties, got " + counties.length);

  new Set(counties.map(item => item.id)).size === counties.length
    ? passes.push("Unique county IDs")
    : failures.push("Duplicate county IDs");

  counties.every(item => Number.isFinite(item.petrol) && Number.isFinite(item.diesel))
    ? passes.push("Numeric county prices")
    : failures.push("Invalid county prices");

  Number.isFinite(data?.national?.petrol) && Number.isFinite(data?.national?.diesel)
    ? passes.push("National prices")
    : failures.push("National prices invalid");
} catch (error) {
  failures.push("County data evaluation: " + error.message);
}

try {
  const w = {};
  new Function("window", read("policy-data.js"))(w);
  const scenarios = w.POLICY_SCENARIOS ?? {};
  const keys = ["c","kd","l","mp","m","s","sd","v"];
  const allowed = new Set(["not_quantified","party_delta","stated_target","baseline"]);

  keys.every(key => scenarios[key])
    ? passes.push("Eight party scenarios")
    : failures.push("Party scenario missing");

  keys.every(key => String(scenarios[key]?.source || "").startsWith("https://"))
    ? passes.push("Party sources")
    : failures.push("Party source missing");

  keys.every(key => allowed.has(scenarios[key]?.priceModel?.type))
    ? passes.push("Party model types")
    : failures.push("Unexpected party model type");
} catch (error) {
  failures.push("Policy data evaluation: " + error.message);
}

const forbiddenRuntimeFiles = [
  "/manifest.webmanifest",
  "/market-data.js",
  "/glossary-data.js",
  "/data-sources.json",
  "/sw.js"
];

for (const file of forbiddenRuntimeFiles) {
  html.includes(file)
    ? failures.push("Legacy runtime reference remains: " + file)
    : passes.push("No runtime reference: " + file);
}

console.log(passes.map(item => "✓ " + item).join("\n"));

if (failures.length) {
  console.error("\n" + failures.map(item => "✕ " + item).join("\n"));
  process.exit(1);
}

console.log("\nPASS — " + passes.length + " checks");
