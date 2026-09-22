import fs from "node:fs";

const required = [
  "index.html","style.css","script.js","fuel-data.js","county-data.js",
  "policy-data.js","manifest.webmanifest","sw.js","offline.html","404.html","version.json"
];

const fail = [];
const ok = [];
const read = file => fs.readFileSync(file,"utf8");

for (const file of required) {
  if (!fs.existsSync(file)) fail.push("Missing file: " + file);
  else ok.push("File exists: " + file);
}

for (const file of ["script.js","fuel-data.js","county-data.js","policy-data.js","sw.js"]) {
  try {
    new Function(read(file));
    ok.push("Syntax: " + file);
  } catch (error) {
    fail.push("Syntax " + file + ": " + error.message);
  }
}

for (const file of ["manifest.webmanifest","version.json"]) {
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

const order = ["/fuel-data.js","/county-data.js","/policy-data.js","/script.js"].map(src => html.indexOf(src));
if (!order.every((value,index) => value >= 0 && (index === 0 || value > order[index-1]))) {
  fail.push("Script load order is invalid");
} else ok.push("Minimal script load order");

const requiredMarkers = [
  "countySelect","currentPrice","marketValue","energyValue","carbonValue","vatValue",
  "taxTotal","partySelect","partyResult","scenarioPrice","scenarioNote","partySource"
];
for (const id of requiredMarkers) {
  if (!html.includes(`id="${id}"`)) fail.push("Missing minimal feature marker: " + id);
}
if (!fail.some(x => x.startsWith("Missing minimal feature"))) ok.push("Minimal feature markers");

const removedMarkers = [
  "commandDialog","settingsDialog","glossaryGrid","favoriteCompareGrid","marketShockSlider",
  "targetPriceInput","taxShareCurve","reportCard","dataScore","keyboardDialog","runDiagnostics"
];
const stillPresent = removedMarkers.filter(id => html.includes(`id="${id}"`));
if (stillPresent.length) fail.push("Legacy UI still present: " + stillPresent.join(", "));
else ok.push("Legacy UI removed from page");

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
  if (w.SITE_DATA?.appVersion !== "0.8.0" || version.appVersion !== "0.8.0") fail.push("App version mismatch");
  else ok.push("App version 0.8.0");

  const fuels = [w.FUEL_DATA.petrol,w.FUEL_DATA.diesel];
  if (!fuels.every(f => Number.isFinite(f.energyTax) && Number.isFinite(f.carbonTax) && Number.isFinite(f.vatRate))) {
    fail.push("Invalid tax fields");
  } else ok.push("Tax fields numeric");

  if (!fuels.every(f => f.validFrom && f.validTo && String(f.taxSource).startsWith("https://"))) {
    fail.push("Missing tax validity/source metadata");
  } else ok.push("Tax validity/source metadata");

  const c = {};
  new Function("window",read("county-data.js"))(c);
  const allPrices = [c.COUNTY_PRICES.national,...c.COUNTY_PRICES.counties];
  for (const fuelKey of ["petrol","diesel"]) {
    const fuel = w.FUEL_DATA[fuelKey];
    for (const area of allPrices) {
      const price = area[fuelKey];
      const beforeVat = price / (1 + fuel.vatRate/100);
      const market = beforeVat - fuel.energyTax - fuel.carbonTax;
      if (!(market >= 0)) fail.push("Negative market residual: " + fuelKey + " / " + area.id);
    }
  }
  if (!fail.some(x => x.startsWith("Negative market residual"))) ok.push("Non-negative market residuals");
} catch (error) {
  fail.push("Fuel/model evaluation: " + error.message);
}

try {
  const w = {};
  new Function("window",read("policy-data.js"))(w);
  const scenarios = w.POLICY_SCENARIOS || {};
  const partyKeys = ["c","kd","l","mp","m","s","sd","v"];
  if (!partyKeys.every(key => scenarios[key])) fail.push("One or more parliamentary party scenarios missing");
  else ok.push("Eight party scenarios present");

  if (!partyKeys.every(key => String(scenarios[key].source || "").startsWith("https://"))) {
    fail.push("One or more party scenarios lack HTTPS source");
  } else ok.push("Party scenario sources present");

  const allowed = new Set(["not_quantified","party_delta","stated_target","baseline"]);
  if (!partyKeys.every(key => allowed.has(scenarios[key]?.priceModel?.type))) {
    fail.push("Unexpected party price-model type");
  } else ok.push("Party scenario model types valid");
} catch (error) {
  fail.push("Policy evaluation: " + error.message);
}

console.log(ok.map(line => "✓ " + line).join("\n"));
if (fail.length) {
  console.error("\n" + fail.map(line => "✕ " + line).join("\n"));
  process.exit(1);
}
console.log("\nPASS — " + ok.length + " checks");
