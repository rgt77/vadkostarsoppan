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
  "404.html", "data/phase3-status.json", "data/phase4-status.json", "lib/simulator.mjs", "tests/simulator.mjs", "data/policy-facts-sd.json", "data/policy-facts-m.json", "data/policy-facts-kd.json", "data/policy-facts-l.json", "data/policy-facts-s.json", "data/policy-facts-c.json", "data/policy-facts-v.json"
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
const html404 = read("404.html");
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

  w.SITE_DATA?.appVersion === "0.41.0" ? pass("Version 0.41.0") : fail("Version mismatch");
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
  ["petrol","petrol98","e85","diesel"].every(key => Number.isFinite(data.national?.[key]))
    ? pass("Four national fuel prices") : fail("National fuel price missing");
  Array.isArray(data.counties) ? fail("County data must not be stored") : pass("National-only price data");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.updatedAt ?? "")) fail("Price updatedAt invalid");
  else { const age=daysBetween(data.updatedAt); age<=3 ? pass("National price freshness: "+age+" day(s)") : fail("National prices are stale: "+age+" days"); }
} catch(error){ fail("National price data: "+error.message); }

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
  snapshots.every(item => !("counties" in item)) ? pass("National-only price history") : fail("County history remains");
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

html404.includes("style.css?v=0.41.0") ? pass("404 cache version") : fail("404 cache version mismatch");
script.includes("Partikällorna kontrollerades 2026-09-23") ? fail("Hardcoded policy review date") : pass("No hardcoded policy review date");
read("scripts/update-price-data.mjs").includes("Implausible") ? pass("Pump price plausibility guard") : fail("Pump price plausibility guard missing");
const marketUpdater = read("scripts/update-market-data.mjs");
marketUpdater.includes("Could not locate Riksbank observation") && marketUpdater.includes("replace(\",\", \".\")") ? pass("Robust Riksbank payload parser") : fail("Riksbank parser guard missing");

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

try {
  const phase = JSON.parse(read("data/phase3-status.json"));
  phase.status === "complete" && Object.values(phase.exitCriteria ?? {}).every(Boolean) ? pass("Phase 3 completion criteria") : fail("Phase 3 incomplete");
  phase.blockedInputs?.some(x => x.id === "refined_product_reference") ? pass("Blocked refined-product input documented") : fail("Blocked market input undocumented");
} catch (error) { fail("Phase 3 status: " + error.message); }

try {
  const healthScript = read("scripts/data-health.mjs");
  healthScript.includes('add("prices:plausibility","ok"') ? pass("Price outliers are informational anomalies") : fail("Price anomaly health regression");
  const monitor = read("scripts/check-policy-sources.mjs");
  monitor.includes('"unreachable"') && monitor.includes('"access_blocked"') ? pass("Policy monitor classifies source access failures") : fail("Policy monitor resilience missing");
} catch (error) { fail("Health architecture: " + error.message); }

try {
  const phase4 = JSON.parse(read("data/phase4-status.json"));
  phase4.status === "in_progress" && phase4.completedSteps?.length >= 10 ? pass("Phase 4 first ten steps recorded") : fail("Phase 4 progress invalid");
  html.includes('id="scenarioReferenceDate"') && html.includes('id="scenarioReset"') && html.includes('id="scenarioMeta"') ? pass("Scenario reference UI") : fail("Scenario reference UI missing");
  script.includes('state.party = ""') && script.includes("scenario.verifiedAt") ? pass("Scenario reset and evidence UI") : fail("Scenario interaction guard missing");
  const simulator = read("lib/simulator.mjs");
  simulator.includes('["party_delta","stated_target"]') ? pass("Simulator accepts only documented numeric models") : fail("Simulator model guard missing");
} catch (error) { fail("Phase 4 QA: " + error.message); }

try {
  const phase4b = JSON.parse(read("data/phase4-status.json"));
  phase4b.completedSteps?.length >= 20 ? pass("Phase 4 first twenty steps recorded") : fail("Phase 4 second block incomplete");
  html.includes('id="scenarioComparison"') && script.includes("evidenceLabels") ? pass("Neutral scenario comparison evidence UI") : fail("Scenario comparison evidence UI missing");
  script.includes('"ArrowLeft"') && script.includes('"popstate"') ? pass("Scenario keyboard and history navigation") : fail("Scenario navigation regression");
  script.includes('latestDate || ""') ? pass("Trend reference-date guard") : fail("Trend date guard missing");
} catch (error) { fail("Phase 4 block 2 QA: " + error.message); }

try {
  const sdFacts = JSON.parse(read("data/policy-facts-sd.json"));
  const ids = new Set(sdFacts.facts?.map(x => x.id));
  ["pump_prices_2022_2026","reduction_duty_2022","reduction_duty_2024","tax_2024_2025","temporary_tax_2026"].every(x => ids.has(x)) ? pass("SD sourced policy facts") : fail("SD policy facts incomplete");
  sdFacts.facts?.every(x => String(x.source ?? "").startsWith("https://")) ? pass("SD fact sources") : fail("SD fact source missing");
  script.includes('state.party === "sd"') && html.includes('id="policyFacts"') ? pass("SD contextual evidence UI") : fail("SD contextual evidence UI missing");
} catch (error) { fail("SD policy facts: " + error.message); }

try {
  const mFacts = JSON.parse(read("data/policy-facts-m.json"));
  const ids = new Set(mFacts.facts?.map(x => x.id));
  ["eu_min_tax_2026","additional_relief_2026","reduction_duty_current","tax_indexation_2026"].every(x => ids.has(x)) ? pass("M sourced policy facts") : fail("M policy facts incomplete");
  mFacts.facts?.every(x => String(x.source ?? "").startsWith("https://moderaterna.se/")) ? pass("M official fact sources") : fail("M fact source invalid");
  script.includes('state.party === "m"') ? pass("M contextual evidence UI") : fail("M contextual evidence UI missing");
  script.includes("model.validFrom") && script.includes("model.fuels") ? pass("Bounded political scenario guard") : fail("Bounded scenario guard missing");
} catch (error) { fail("M policy facts: " + error.message); }

try {
  const kdFacts = JSON.parse(read("data/policy-facts-kd.json"));
  const ids = new Set(kdFacts.facts?.map(x => x.id));
  ["tax_reduction_mix_2024","reduction_duty_2024","diesel_estimate_2024"].every(x => ids.has(x)) ? pass("KD sourced policy facts") : fail("KD policy facts incomplete");
  kdFacts.facts?.every(x => String(x.source ?? "").startsWith("https://kristdemokraterna.se/")) ? pass("KD official fact sources") : fail("KD fact source invalid");
  script.includes('state.party === "kd"') ? pass("KD contextual evidence UI") : fail("KD contextual evidence UI missing");
} catch (error) { fail("KD policy facts: " + error.message); }

try {
  const lFacts = JSON.parse(read("data/policy-facts-l.json"));
  const ids = new Set(lFacts.facts?.map(x => x.id));
  ["climate_report_2022","reduction_duty_2025"].every(x => ids.has(x)) ? pass("L sourced policy facts") : fail("L policy facts incomplete");
  lFacts.facts?.every(x => String(x.source ?? "").startsWith("https://www.liberalerna.se/")) ? pass("L official fact sources") : fail("L fact source invalid");
  script.includes('state.party === "l"') ? pass("L contextual evidence UI") : fail("L contextual evidence UI missing");
} catch (error) { fail("L policy facts: " + error.message); }

try {
  const sFacts = JSON.parse(read("data/policy-facts-s.json"));
  const ids = new Set(sFacts.facts?.map(x => x.id));
  ["temporary_fuel_tax_cut_2026","fuel_price_direction_2026"].every(x => ids.has(x)) ? pass("S sourced policy facts") : fail("S policy facts incomplete");
  sFacts.facts?.every(x => String(x.source ?? "").startsWith("https://www.socialdemokraterna.se/")) ? pass("S official fact sources") : fail("S fact source invalid");
  script.includes('state.party === "s"') ? pass("S contextual evidence UI") : fail("S contextual evidence UI missing");
} catch (error) { fail("S policy facts: " + error.message); }

try {
 const cFacts=JSON.parse(read("data/policy-facts-c.json")); const ids=new Set(cFacts.facts?.map(x=>x.id));
 ["climate_plan_transport_2026","biofuel_tax_exemption_2026","ev_sales_targets_2030"].every(x=>ids.has(x)) ? pass("C sourced policy facts") : fail("C policy facts incomplete");
 cFacts.facts?.every(x=>String(x.source??"").startsWith("https://www.centerpartiet.se/")) ? pass("C official fact sources") : fail("C fact source invalid");
 script.includes('state.party === "c"') ? pass("C contextual evidence UI") : fail("C contextual evidence UI missing");
} catch(error){ fail("C policy facts: "+error.message); }

try {
 const vFacts=JSON.parse(read("data/policy-facts-v.json")); const ids=new Set(vFacts.facts?.map(x=>x.id));
 ["fuel_tax_position_2026","geographic_road_tax","sustainable_travel_support"].every(x=>ids.has(x)) ? pass("V sourced policy facts") : fail("V policy facts incomplete");
 vFacts.facts?.every(x=>String(x.source??"").startsWith("https://www.vansterpartiet.se/")) ? pass("V official fact sources") : fail("V fact source invalid");
 script.includes('state.party === "v"') ? pass("V contextual evidence UI") : fail("V contextual evidence UI missing");
} catch(error){ fail("V policy facts: "+error.message); }

html.includes('data-tank-size="30"') && html.includes('data-tank-size="60"') && script.includes("tankSizeButtons") ? pass("Interactive tank-size selector") : fail("Tank-size selector missing");
html.includes('id="taxBarFill"') && script.includes("taxBarFill.style.width") ? pass("Visual tax-share bar") : fail("Tax-share visualization missing");
html.includes('id="policyDetails"') && html.includes("Visa underlag") ? pass("Progressive policy evidence disclosure") : fail("Policy evidence disclosure missing");
html.includes("Pris före skatt &amp; moms") ? pass("Plain-language residual label") : fail("Residual label not simplified");

html.includes('data-trend-days="365"') && script.includes("state.trendDays") && script.includes("trendLine.setAttribute") ? pass("Compact trend period controls") : fail("Trend controls missing");
html.includes('<details class="policy-details"') && html.indexOf('id="scenarioNote"') > html.indexOf('<details class="policy-details"') ? pass("Scenario methodology progressively disclosed") : fail("Scenario methodology disclosure regression");

html.includes('class="breakdown-details"') && html.includes("Visa kostnadsdelar") ? pass("Progressive cost breakdown") : fail("Cost breakdown disclosure missing");

!html.includes("countySelect") && !script.includes("state.county") && !script.includes("counties?.find") ? pass("County UI fully removed") : fail("County logic remains in frontend");

script.includes("Sedan första mätningen") && script.includes("coverageDays") && script.includes("button.disabled") && html.includes('id="trendCoverage"') ? pass("Coverage-aware trend component") : fail("Trend readability regression");
script.includes("enoughForChart") && script.includes("points.length >= 3") ? pass("Trend chart minimum-data guard") : fail("Trend chart data guard missing");
html.includes('id="trendEmpty"') && html.includes('id="trendProgressFill"') ? pass("Trend empty-state progress") : fail("Trend empty state missing");
script.includes("trendPercent") && html.includes('id="trendPercent"') ? pass("Trend percentage context") : fail("Trend percentage missing");

if (warnings.length) console.warn("\n" + warnings.map(message => "! " + message).join("\n"));
if (failures.length) {
  console.error("\n" + failures.map(message => "✕ " + message).join("\n"));
  process.exit(1);
}
console.log("\nPASS");
