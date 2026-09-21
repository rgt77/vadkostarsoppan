import fs from "node:fs";

const required = [
  "index.html","style.css","script.js","fuel-data.js","market-data.js",
  "county-data.js","glossary-data.js","policy-data.js","data-sources.json",
  "manifest.webmanifest","sw.js","offline.html","404.html","version.json"
];

const fail = [];
const ok = [];

for (const file of required) {
  if (!fs.existsSync(file)) fail.push("Missing file: " + file);
  else ok.push("File exists: " + file);
}

const read = file => fs.readFileSync(file,"utf8");

for (const file of ["script.js","fuel-data.js","market-data.js","county-data.js","glossary-data.js","policy-data.js","sw.js"]) {
  try {
    new Function(read(file));
    ok.push("Syntax: " + file);
  } catch (error) {
    fail.push("Syntax " + file + ": " + error.message);
  }
}

for (const file of ["manifest.webmanifest","data-sources.json","version.json"]) {
  try {
    JSON.parse(read(file));
    ok.push("JSON: " + file);
  } catch (error) {
    fail.push("JSON " + file + ": " + error.message);
  }
}

const html = read("index.html");
const script = read("script.js");

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
const duplicateIds = [...new Set(ids.filter((id,index) => ids.indexOf(id) !== index))];
if (duplicateIds.length) fail.push("Duplicate HTML IDs: " + duplicateIds.join(", "));
else ok.push("Unique HTML IDs");

const selectorIds = [...script.matchAll(/querySelector\("#([^"]+)"\)/g)].map(m => m[1]);
const missingIds = [...new Set(selectorIds.filter(id => !html.includes(`id="${id}"`)))];
if (missingIds.length) fail.push("Missing HTML IDs for JS selectors: " + missingIds.join(", "));
else ok.push("All direct ID selectors resolve");

const order = ["/fuel-data.js","/market-data.js","/county-data.js","/glossary-data.js","/policy-data.js","/script.js"]
  .map(src => html.indexOf(src));
if (!order.every((value,index) => value >= 0 && (index === 0 || value > order[index-1]))) {
  fail.push("Script load order is invalid");
} else ok.push("Script load order");

try {
  const w = {};
  new Function("window",read("county-data.js"))(w);
  const data = w.COUNTY_PRICES;
  if (data.counties.length !== 21) fail.push("County count is " + data.counties.length + ", expected 21");
  else ok.push("21 counties");
  if (new Set(data.counties.map(item => item.id)).size !== data.counties.length) fail.push("Duplicate county IDs");
  else ok.push("Unique county IDs");
  if (!data.counties.every(item => Number.isFinite(item.petrol) && Number.isFinite(item.diesel))) fail.push("Non-numeric county price");
  else ok.push("Numeric county prices");
} catch (error) {
  fail.push("County evaluation: " + error.message);
}

try {
  const w = {};
  new Function("window",read("fuel-data.js"))(w);
  const version = JSON.parse(read("version.json"));
  if (w.SITE_DATA?.appVersion !== "0.7.0" || version.appVersion !== "0.7.0") fail.push("App version mismatch");
  else ok.push("App version 0.7.0");
  if (!w.FUEL_DATA?.petrol?.validFrom || !w.FUEL_DATA?.petrol?.validTo || !w.FUEL_DATA?.diesel?.validFrom || !w.FUEL_DATA?.diesel?.validTo) {
    fail.push("Missing machine-readable tax validity dates");
  } else ok.push("Tax validity dates");
} catch (error) {
  fail.push("Fuel data evaluation: " + error.message);
}

console.log(ok.map(line => "✓ " + line).join("\n"));
if (fail.length) {
  console.error("\n" + fail.map(line => "✕ " + line).join("\n"));
  process.exit(1);
}
const requiredMarkers = [
  "commandDialog","settingsDialog","glossaryGrid","countyFavorites","favoriteCompareGrid",
  "marketShockSlider","targetPriceInput","taxShareCurve","reportCard","dataScore",
  "explainDialog","pageProgressBar","keyboardDialog","runDiagnostics"
];
for (const id of requiredMarkers) {
  if (!html.includes(`id="${id}"`)) {
    console.error("✕ Missing feature marker: " + id);
    process.exit(1);
  }
}
console.log("\nPASS — " + ok.length + " checks + feature markers");
