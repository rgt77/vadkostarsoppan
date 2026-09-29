import fs from "node:fs";

const read = file => fs.readFileSync(file, "utf8");
const required = [
  "index.html", "style.css", "script.js",
  "fuel-data.js", "price-data.js", "policy-data.js",
  "party-logos/mp.png", "party-logos/s.png",
  "scripts/update-price-data.mjs",
  ".github/workflows/update-prices.yml",
  ".github/workflows/data-health.yml",
  "scripts/data-health.mjs",
  "scripts/check-official-sources.mjs",
  "data/source-registry.json",
  "data/data-health.json",
  "data/price-history.json",
  "data/calculation-model.json", "data/reduction-duty.json", "data/market-data.json", "data/market-history.json", "data/production-audit.json",
  "scripts/production-audit.mjs", ".github/workflows/production-audit.yml",
  "scripts/release-audit.mjs", ".github/workflows/release-audit.yml", "data/release-audit.json",
  "scripts/live-smoke.mjs", ".github/workflows/live-smoke.yml",
  "404.html", "data/policy-facts-mp.json", "data/policy-facts-sd.json", "data/policy-facts-m.json", "data/policy-facts-kd.json", "data/policy-facts-l.json", "data/policy-facts-s.json", "data/policy-facts-c.json", "data/policy-facts-v.json"
];
const failures = [];
const warnings = [];
const pass = message => console.log("✓ " + message);
const fail = message => failures.push(message);
const warn = message => warnings.push(message);

for (const file of required) {
  fs.existsSync(file) ? pass(file) : fail("Missing: " + file);
}

for (const file of ["script.js", "fuel-data.js", "price-data.js", "policy-data.js"]) {
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
const style = read("style.css");
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

  w.SITE_DATA?.appVersion === "0.70.0" ? pass("Version 0.70.0") : fail("Version mismatch");
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
  new Function("window", read("price-data.js"))(w);
  const data = w.PRICE_DATA ?? {};
  ["petrol","petrol98","e85","diesel"].every(key => Number.isFinite(data.national?.[key]))
    ? pass("Four national fuel prices") : fail("National fuel price missing");
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
  const evidence = new Set(["not_quantified", "party_estimate", "party_stated_target", "quantified_inputs"]);

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

html404.includes("style.css?v=0.70.0") ? pass("404 cache version") : fail("404 cache version mismatch");
script.includes("Partikällorna kontrollerades 2026-09-23") ? fail("Hardcoded policy review date") : pass("No hardcoded policy review date");
read("scripts/update-price-data.mjs").includes("Implausible") ? pass("Pump price plausibility guard") : fail("Pump price plausibility guard missing");
const marketUpdater = read("scripts/update-market-data.mjs");
marketUpdater.includes("Could not locate Riksbank observation") && marketUpdater.includes("replace(\",\", \".\")") ? pass("Robust Riksbank payload parser") : fail("Riksbank parser guard missing");

const fuelButtons = [...html.matchAll(/data-fuel="([^"]+)"/g)].map(x => x[1]);
new Set(fuelButtons).size === 4 && ["petrol","petrol98","diesel","e85"].every(x => fuelButtons.includes(x)) && script.includes('button.addEventListener("click"') || script.includes('els.partyGrid?.addEventListener("click"') ? pass("Clickable four-fuel selector") : fail("Fuel selector regression");

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
  if (rows.length === 0) warn("Market history awaits first ingestion");
  else rows.every((x,i) => /^\d{4}-\d{2}-\d{2}$/.test(x.date) && Number.isFinite(x.usdSek) && (i===0 || rows[i-1].date < x.date)) ? pass("Market history schema") : fail("Market history invalid");
} catch (error) { fail("Market history: " + error.message); }

try {
  const healthScript = read("scripts/data-health.mjs");
  healthScript.includes("invalidPrices") && healthScript.includes('add("prices:plausibility"') ? pass("National price plausibility health check") : fail("Price plausibility health regression");
  const monitor = read("scripts/check-policy-sources.mjs");
  monitor.includes('"unreachable"') && monitor.includes('"access_blocked"') ? pass("Policy monitor classifies source access failures") : fail("Policy monitor resilience missing");
} catch (error) { fail("Health architecture: " + error.message); }

try {
  const sdFacts = JSON.parse(read("data/policy-facts-sd.json"));
  const ids = new Set(sdFacts.facts?.map(x => x.id));
  ["pump_prices_2022_2026","reduction_duty_2022","reduction_duty_2024","tax_2024_2025","temporary_tax_2026","eu_minimum_tax_2026","additional_tax_2026","current_reduction_duty_2026","forward_price_level_2026"].every(x => ids.has(x)) ? pass("SD sourced policy facts") : fail("SD policy facts incomplete");
  sdFacts.facts?.every(x => String(x.source ?? "").startsWith("https://")) ? pass("SD fact sources") : fail("SD fact source missing");
  sdFacts.safeguards?.some(x => x.includes("current national pump price")) ? pass("SD double-count safeguard") : fail("SD double-count safeguard missing");
} catch (error) { fail("SD policy facts: " + error.message); }

try {
  const mpFacts = JSON.parse(read("data/policy-facts-mp.json"));
  const ids = new Set(mpFacts.facts?.map(x => x.id));
  ["pump_price_effect_2026","reduction_duty_2026","carbon_tax_alignment_2026","green_dividend_2026","phase_revenue_2026","spring_transport_support_2026"].every(x => ids.has(x)) ? pass("MP sourced policy facts") : fail("MP policy facts incomplete");
  mpFacts.facts?.every(x => String(x.source ?? "").startsWith("https://www.mp.se/")) ? pass("MP official fact sources") : fail("MP fact source invalid");
  script.includes('model.fuels') ? pass("MP fuel scope guard") : fail("MP fuel scope guard missing");
} catch (error) { fail("MP policy facts: " + error.message); }

try {
  const mFacts = JSON.parse(read("data/policy-facts-m.json"));
  const ids = new Set(mFacts.facts?.map(x => x.id));
  ["eu_min_tax_2026","additional_relief_2026","reduction_duty_current","tax_indexation_2026","extension_position_2026","collective_transport_2026","opposition_price_claim_2026"].every(x => ids.has(x)) ? pass("M sourced policy facts") : fail("M policy facts incomplete");
  mFacts.facts?.every(x => String(x.source ?? "").startsWith("https://moderaterna.se/")) ? pass("M official fact sources") : fail("M fact source invalid");
  script.includes("model.validFrom") && script.includes("model.fuels") ? pass("Bounded political scenario guard") : fail("Bounded scenario guard missing");
} catch (error) { fail("M policy facts: " + error.message); }

try {
  const kdFacts = JSON.parse(read("data/policy-facts-kd.json"));
  const ids = new Set(kdFacts.facts?.map(x => x.id));
  ["current_fuel_policy_2026","eu_minimum_position_2026","tax_reduction_mix_2024","reduction_duty_2024","diesel_estimate_2024","historical_comparison_2025_2026","speech_counterfactual_2026"].every(x => ids.has(x)) ? pass("KD sourced policy facts") : fail("KD policy facts incomplete");
  kdFacts.facts?.every(x => String(x.source ?? "").startsWith("https://kristdemokraterna.se/")) ? pass("KD official fact sources") : fail("KD fact source invalid");
} catch (error) { fail("KD policy facts: " + error.message); }

try {
  const lFacts = JSON.parse(read("data/policy-facts-l.json"));
  const ids = new Set(lFacts.facts?.map(x => x.id));
  ["climate_report_2022","reduction_duty_2025","tax_compensation_2025","temporary_tax_cut_2026","public_transport_relief_2026","biofuel_priority_current"].every(x => ids.has(x)) ? pass("L sourced policy facts") : fail("L policy facts incomplete");
  lFacts.facts?.every(x => ["https://www.liberalerna.se/","https://taby.liberalerna.se/","https://www.riksdagen.se/"].some(prefix => String(x.source ?? "").startsWith(prefix))) ? pass("L official fact sources") : fail("L fact source invalid");
} catch (error) { fail("L policy facts: " + error.message); }

try {
  const sFacts = JSON.parse(read("data/policy-facts-s.json"));
  const ids = new Set(sFacts.facts?.map(x => x.id));
  ["temporary_fuel_tax_cut_2026","fuel_price_direction_2026","sverigebranslet_2026","diesel_standard_mk3","historical_sverigebranslet_price_2024","temporary_tax_cut_2026_riksdag"].every(x => ids.has(x)) ? pass("S sourced policy facts") : fail("S policy facts incomplete");
  sFacts.facts?.every(x => ["https://www.socialdemokraterna.se/","https://www.riksdagen.se/"].some(prefix => String(x.source ?? "").startsWith(prefix))) ? pass("S official fact sources") : fail("S fact source invalid");
} catch (error) { fail("S policy facts: " + error.message); }

try {
 const cFacts=JSON.parse(read("data/policy-facts-c.json")); const ids=new Set(cFacts.facts?.map(x=>x.id));
 ["biofuel_tax_exemption_2026","renewable_blend_2028","pump_price_intent_2026","strategic_biofuel_reserve_2026","biofuel_reserve_funding_2026","historical_tanka_svenskt_2023"].every(x=>ids.has(x)) ? pass("C sourced policy facts") : fail("C policy facts incomplete");
 cFacts.facts?.every(x=>String(x.source??"").startsWith("https://www.centerpartiet.se/")) ? pass("C official fact sources") : fail("C fact source invalid");
} catch(error){ fail("C policy facts: "+error.message); }

try {
 const vFacts=JSON.parse(read("data/policy-facts-v.json")); const ids=new Set(vFacts.facts?.map(x=>x.id));
 ["fuel_tax_position_2026","geographic_road_tax","sustainable_travel_support","reduction_duty_direction_2026","reject_temporary_fuel_tax_cut_2026","targeted_car_owner_compensation_2026","sweden_ticket_2027"].every(x=>ids.has(x)) ? pass("V sourced policy facts") : fail("V policy facts incomplete");
 vFacts.facts?.every(x=>["https://www.vansterpartiet.se/","https://www.riksdagen.se/"].some(prefix=>String(x.source??"").startsWith(prefix))) ? pass("V official fact sources") : fail("V fact source invalid");
} catch(error){ fail("V policy facts: "+error.message); }

html.includes('data-tank-size="30"') && html.includes('data-tank-size="60"') && script.includes("tankSizeButtons") ? pass("Interactive tank-size selector") : fail("Tank-size selector missing");
html.includes('id="taxBarFill"') && script.includes("els.taxBarFill.style.width") ? pass("Visual tax-share bar") : fail("Tax-share visualization missing");
html.includes('id="policyDetails"') && html.includes("Fördjupning och källa") ? pass("Progressive policy evidence disclosure") : fail("Policy evidence disclosure missing");
html.includes('id="policyComparison"') && html.includes('id="policyStatus"') && html.includes('id="policyStatusHelp"') && html.includes('id="policyInstrument"') && html.includes('id="policyCompensation"') && html.includes('id="policyReason"') ? pass("Normalized party comparison UI") : fail("Party comparison UI missing");
script.includes("POLICY_STATUS_META") && script.includes("statusMeta[comparison.calculability]") ? pass("UI consumes centralized calculation states") : fail("Calculation states duplicated or disconnected");
html.includes("Fördjupning och källa") ? pass("Party detail disclosure is secondary") : fail("Party detail disclosure label missing");
try { const w={}; new Function("window",read("policy-data.js"))(w); const cmp=w.POLICY_COMPARISON??{}; const meta=w.POLICY_STATUS_META??{}; ["direct","direct_temporary","partial","baseline"].every(k=>meta[k]?.label&&meta[k]?.detail) ? pass("Central party status semantics") : fail("Party status semantics incomplete"); ["c","kd","l","mp","m","s","sd","v"].every(k=>cmp[k]?.known&&cmp[k]?.pump&&cmp[k]?.instrument&&cmp[k]?.compensation&&cmp[k]?.reason&&cmp[k]?.calculability) ? pass("Eight-party comparison schema") : fail("Party comparison schema incomplete"); const validCalc=new Set(["direct","direct_temporary","partial","baseline"]); ["c","kd","l","mp","m","s","sd","v"].every(k=>validCalc.has(cmp[k]?.calculability)) ? pass("Neutral calculation status taxonomy") : fail("Invalid calculation status"); } catch(error){ fail("Party comparison schema: "+error.message); }
html.includes("Pris före skatt &amp; moms") ? pass("Plain-language residual label") : fail("Residual label not simplified");


html.includes('<details class="policy-details"') && html.indexOf('id="scenarioNote"') > html.indexOf('<details class="policy-details"') ? pass("Scenario methodology progressively disclosed") : fail("Scenario methodology disclosure regression");

html.includes('class="breakdown-details"') && html.includes("Visa prisets delar") ? pass("Progressive cost breakdown") : fail("Cost breakdown disclosure missing");
script.includes("scenarioEvaluation") && script.includes('"unsupported_fuel"') && script.includes('"outside_date"') && script.includes('"invalid_result"') ? pass("Scenario availability states explicit") : fail("Scenario availability states missing");
script.includes('health.status === "fresh" || health.status === "stale"') && script.includes("renderScenario(NaN)") ? pass("Invalid price data cannot feed scenario calculations") : fail("Scenario invalid-data boundary missing");
html.includes('role="status" aria-live="polite" aria-atomic="true"') ? pass("Scenario result announced accessibly") : fail("Scenario live result semantics missing");
style.includes("/* Consolidated refinements: phases 70–100 */") && style.includes(".scenario-comparison") ? pass("Scenario deep refinement styles present") : fail("Scenario deep refinement styles missing");



style.includes("--radius-control") && style.includes("--control-active") ? pass("Unified control design tokens") : fail("Control design tokens missing");

!html.includes("fuel-id") && !style.includes(".fuel-id") && html.includes('id="fuelTypeLabel"') && style.includes(".control-label") ? pass("Unified fuel and tank headings without fuel symbols") : fail("Fuel/tank control heading mismatch");
html.includes("Tankstorlek <span class=\"control-label-unit\">(liter)</span>") && !html.includes(">30 L<") && !html.includes(">40 L<") ? pass("Tank unit appears only in heading") : fail("Tank unit presentation mismatch");
/\.fuel-button\s*,\s*\.tank-size-control button/.test(style) && /font-weight:\s*600/.test(style) ? pass("Primary option typography unified") : fail("Primary option typography mismatch");

style.replace(/\s+/g,"").includes("font-variant-numeric:tabular-nums") ? pass("Stable numeric control typography") : fail("Numeric control typography missing");
style.replace(/\s+/g,"").includes("--touch-min:44px") && /min-height:\s*var\(--touch-min\)/.test(style) ? pass("Minimum touch target guard") : fail("Touch target guard missing");

style.includes("--space-section") && style.includes("--space-card") && style.includes("--touch-min") ? pass("Phase 4 spacing and touch tokens") : fail("Phase 4 layout tokens missing");
html.includes("result-card") && html.includes("scenario-card") ? pass("Semantic result card hooks") : fail("Result card hooks missing");
/\.tax-summary\s*\{[^}]*border:\s*1px solid var\(--line\);[^}]*background:\s*var\(--soft\);[^}]*\}/s.test(style) && /\.tax-summary\s*\{[^}]*margin-top:\s*(?:14|18)px/.test(style) ? pass("Tax summary hierarchy") : fail("Tax summary hierarchy missing");

!style.replace(/\s+/g,"").includes("var(--muted,#") && !style.replace(/\s+/g,"").includes("var(--text,#") ? pass("CSS token fallbacks consolidated") : fail("Redundant CSS token fallbacks remain");
html.includes('data-tank-size="30" aria-pressed="false"') && html.includes('data-tank-size="60" aria-pressed="false"') ? pass("Complete tank selector accessibility state") : fail("Tank selector initial state incomplete");
script.includes('image.loading = "lazy"') ? pass("Party logos lazy loaded") : fail("Party logo loading strategy missing");
style.replace(/\s+/g,"").includes("@media(hover:hover)") || style.replace(/\s+/g,"").includes("@media(hover:hover)and(pointer:fine)") ? pass("Touch-safe hover states") : fail("Hover capability guard missing");

!style.replace(/\s+/g,"").includes(".party-button:hover") && /\.party-button:not\(\[aria-pressed=[\"\']true[\"\']\]\):hover/.test(style) ? pass("Party hover is touch-safe") : fail("Party hover regression");
!style.replace(/\s+/g,"").includes(".controls{grid-template-columns") ? pass("Dead controls grid rule removed") : fail("Dead controls grid rule remains");
(style.match(/\/\* Phase /g) ?? []).length === 0 && (style.match(/@media\(max-width:480px\)/g) ?? []).length <= 5 ? pass("Accumulated phase CSS consolidated") : fail("Phase CSS accumulation remains");

const healthScript2 = read("scripts/data-health.mjs");
/const\s+activeDuty\s*=/.test(healthScript2) ? pass("Reduction-duty health period resolved") : fail("Reduction-duty health period missing");
healthScript2.includes("todayUtcDay") && healthScript2.includes("Prisdatum ligger i framtiden") ? pass("Calendar-safe freshness validation") : fail("Freshness date handling regression");
healthScript2.includes("latestHistoryComplete") && healthScript2.includes("validHistoryDates") ? pass("Price-history health validates completeness and date schema") : fail("Price-history health validation incomplete");
script.includes("function priceState()") && script.includes('"invalid_date"') && script.includes('"stale"') ? pass("Frontend distinguishes price-data health states") : fail("Frontend data-health states missing");
script.includes('window.addEventListener("error"') && script.includes('window.addEventListener("unhandledrejection"') && style.includes(".runtime-error .data-status") ? pass("Unexpected runtime failures become visible") : fail("Runtime failure visibility missing");
style.includes(".data-status--warning") && style.includes(".data-status--error") ? pass("Visible data-health severity states") : fail("Data-health severity styling missing");
const healthWorkflow2 = read(".github/workflows/data-health.yml");
healthWorkflow2.includes("Enforce monitoring result") && healthWorkflow2.includes("steps.health.outcome") && healthWorkflow2.includes("steps.qa.outcome") ? pass("Data-health workflow persists then enforces failures") : fail("Data-health workflow can mask failures");
!style.replace(/\s+/g,"").includes("var(--line,#") ? pass("Line token fallbacks consolidated") : fail("Redundant line token fallback remains");
/\.breakdown-details(?:>|\\s)summary/.test(style) && /\.policy-details(?:>|\\s)summary/.test(style) ? pass("Details controls share touch target") : fail("Details touch target mismatch");
html.includes("Så räknar vi") ? pass("Method disclosure label is explicit") : fail("Method disclosure label regression");

!style.replace(/\s+/g,"").includes(".tank-size-controlbutton{min-height:58px") ? pass("Duplicate tank control CSS removed") : fail("Duplicate tank control CSS remains");

html.includes('id="taxSummaryLabel"') && script.includes('"Moms (känd del)"') && script.includes('"Varierar med bränslemixen"') ? pass("E85 tax semantics are explicit") : fail("E85 tax semantics regression");
script.includes("const validMoney") && script.includes("const validVatRate") && script.includes("reconstructed") ? pass("Core calculation validates numeric invariants") : fail("Core calculation invariant guards missing");
script.includes("function calculationViewModel(") && script.includes("function renderCalculation(") && script.includes("function renderSelections(") ? pass("Calculation, presentation model and DOM rendering separated") : fail("Frontend rendering remains tightly coupled");
script.includes("function setFuel(") && script.includes("function setTankLiters(") && script.includes("function setParty(") ? pass("Validated UI state transitions centralized") : fail("UI state transitions remain duplicated");
script.includes("allowedTankLiters") && script.includes("fuel === state.fuel") && script.includes("liters === tankLiters") ? pass("Control transitions avoid invalid and redundant renders") : fail("Control transition guard regression");
script.includes("else if (party !== null) state.party =") && script.includes('params.has("tank")') ? pass("Invalid URL state is normalized") : fail("URL state normalization missing");
!script.includes('ref.blendDependent ? "Energiskatt" : "Energiskatt"') && !script.includes('ref.blendDependent ? "Koldioxidskatt" : "Koldioxidskatt"') ? pass("Redundant calculation presentation branches removed") : fail("Redundant presentation branches remain");
script.includes("exciseTax") && script.includes("total: price") ? pass("Core calculation exposes explicit totals") : fail("Core calculation total semantics missing");
script.includes('setAttribute("aria-valuenow"') && script.includes("boundedTaxPct") ? pass("Tax-share meter stays bounded and accessible") : fail("Tax-share meter bounds missing");
script.includes('"Punktskatt varierar med bränslemixen"') ? pass("E85 tax share avoids false total") : fail("E85 tax share misleading");

html.includes("30–60 liters tankning") ? pass("Metadata matches selectable tank sizes") : fail("Metadata tank-size claim stale");
style.includes("prefers-reduced-motion") ? pass("Reduced motion preference supported") : fail("Reduced motion support missing");
html.includes('class="skip-link" href="#mainContent"') && html.includes('id="mainContent"') ? pass("Keyboard skip navigation") : fail("Skip navigation missing");
html.includes('class="tax-bar" role="progressbar"') && html.includes('aria-valuemax="100"') ? pass("Tax share exposed as accessible meter") : fail("Tax share accessibility semantics missing");
style.includes(":where(button,a,summary):focus-visible") ? pass("Global visible keyboard focus") : fail("Global focus-visible treatment missing");

html.includes('name="twitter:card"') && html.includes('property="og:title"') ? pass("Social metadata complete") : fail("Social metadata incomplete");
/<lastmod>2026-09-(?:24|25)<\/lastmod>/.test(read("sitemap.xml")) ? pass("Sitemap release date current") : fail("Sitemap release date stale");
script.includes('params.get("tank")') && script.includes('url.searchParams.set("tank"') ? pass("Tank-size URL state") : fail("Tank-size URL state missing");
html.includes('rel="canonical" href="https://vadkostarsoppan.se/"') && read("robots.txt").includes("https://vadkostarsoppan.se/sitemap.xml") ? pass("Canonical and sitemap discovery") : fail("Search discovery metadata incomplete");
html404.includes('name="robots" content="noindex"') ? pass("404 excluded from indexing") : fail("404 indexing guard missing");

const officialMonitor = read("scripts/check-official-sources.mjs");
officialMonitor.includes('"access_blocked"') && officialMonitor.includes('"unreachable"') ? pass("Official monitor tolerates source access failures") : fail("Official monitor resilience missing");
const priceWorkflow = read(".github/workflows/update-prices.yml");
priceWorkflow.includes("if: failure()") && priceWorkflow.includes("Prisuppdatering misslyckades") ? pass("Price ingestion failure alert") : fail("Price failure alert missing");
const healthWorkflow = read(".github/workflows/data-health.yml");
healthWorkflow.includes("gh issue list") && healthWorkflow.includes("Officiell datakälla ändrad") ? pass("Official source alerts deduplicated") : fail("Official source alert deduplication missing");
const marketWorkflow = read(".github/workflows/update-market-data.yml");
marketWorkflow.includes("Marknadsdata behöver granskas") && marketWorkflow.includes("issues: write") ? pass("Market health alert") : fail("Market health alert missing");

const productionAuditScript = read("scripts/production-audit.mjs");
productionAuditScript.includes("prices:latest-history") && productionAuditScript.includes("history:market-order") ? pass("Production audit validates live data continuity") : fail("Production audit coverage missing");
const productionAuditWorkflow = read(".github/workflows/production-audit.yml");
productionAuditWorkflow.includes('cron: "12 6 * * *"') && productionAuditWorkflow.includes("Produktionskontroll misslyckades") ? pass("Daily production audit and alert") : fail("Production audit automation missing");
const productionAudit = JSON.parse(read("data/production-audit.json"));
productionAudit.status === "ok" ? pass("Production audit state healthy") : warn("Production audit state pending refresh");



const releaseAuditScript=read("scripts/release-audit.mjs");
releaseAuditScript.includes("prefers-reduced-motion") && releaseAuditScript.includes("focus-visible") && releaseAuditScript.includes("noopener") ? pass("Frontend release audit coverage") : fail("Frontend release audit incomplete");
const releaseAuditWorkflow=read(".github/workflows/release-audit.yml");
releaseAuditWorkflow.includes("npm run qa") && releaseAuditWorkflow.includes("node scripts/release-audit.mjs") ? pass("Release audit gate") : fail("Release audit workflow missing");
read("package.json").includes('"check:syntax"') && read(".github/workflows/qa.yml").includes("Syntax preflight") && releaseAuditWorkflow.includes("Syntax preflight") ? pass("Syntax integrity gated in QA and release") : fail("Syntax integrity gate missing");
JSON.parse(read("data/release-audit.json")).status==="ok" ? pass("Release audit state healthy") : warn("Release audit state pending refresh");

const liveSmoke=read("scripts/live-smoke.mjs");
liveSmoke.includes("home:version") && liveSmoke.includes("robots:sitemap") && liveSmoke.includes("404:http") ? pass("Live production smoke coverage") : fail("Live production smoke coverage missing");
const liveSmokeWorkflow=read(".github/workflows/live-smoke.yml");
liveSmokeWorkflow.includes('cron: "32 6 * * *"') && liveSmokeWorkflow.includes("Live-sidan behöver granskas") && liveSmokeWorkflow.includes("issues: write") ? pass("Live production monitoring") : fail("Live production monitoring missing");

!html.includes("regionSelect") && !script.includes("swedishCounties") && !script.includes("priceData.regions") && !script.includes("buildRegionOptions") && !read("scripts/update-price-data.mjs").includes("countyNames") && !/\bregions\s*:/.test(read("scripts/update-price-data.mjs")) ? pass("National-only price scope") : fail("Regional price code remains");


if (warnings.length) console.warn("\n" + warnings.map(message => "! " + message).join("\n"));
if (failures.length) {
  console.error("\n" + failures.map(message => "✕ " + message).join("\n"));
  process.exit(1);
}
console.log("\nPASS");


script.includes('if (model.validFrom && referenceDate < model.validFrom)') && script.includes('if (model.validTo && referenceDate > model.validTo)') ? pass("Political scenario validity window enforced") : fail("Scenario validity window missing");

script.includes("setText(els.policyStatusHelp, status.detail)") ? pass("Calculation status explanation rendered") : fail("Calculation status explanation missing");
style.includes(".policy-status-row small") ? pass("Calculation status help responsive style") : fail("Calculation status help style missing");

const perfScript=read("scripts/performance-budget.mjs"); perfScript.includes("partyUiBytes") && perfScript.includes("45_000") ? pass("Party UI payload budget") : fail("Party UI payload guard missing");

html.includes("Samma metod används för alla partier") && html.includes("inget exakt pumppris när underlaget kräver egna antaganden") ? pass("Equal party methodology disclosed") : fail("Equal party methodology disclosure missing");


const policyText=read("policy-data.js"); !/m:\s*\{[\s\S]*?priceModel:\s*\{\s*type:\s*"party_delta"/.test(policyText) ? pass("M enacted tax cut not double-counted") : fail("M enacted tax cut still applied as delta");
policyText.includes('baselineTreatment: "already_reflected"') && policyText.includes('statedApproxPumpRelief: 3') ? pass("M enacted relief retained as baseline evidence") : fail("M baseline evidence missing");


html.includes("Vad innebär partiernas drivmedelspolitik?") ? pass("Party section promise matches evidence") : fail("Party section overpromises price calculation");
html.includes('id="partyAnswer"') && script.includes("comparison.known") && script.includes('evaluation.status === "unsupported_fuel"') ? pass("Party primary answer covers documented and unsupported-fuel states") : fail("Party primary answer behavior incomplete");
script.includes('Dokumenterad prisuppgift: ') && script.includes('state.liters + " liter = "') ? pass("Calculable party answer is self-contained") : fail("Calculable party answer lacks direct result");
script.includes('Ingen exakt prisuppgift') && !script.includes('Ej möjligt att räkna exakt') ? pass("Non-calculable party state uses neutral copy") : fail("Non-calculable party state copy unclear");

!html.includes('id="policyKnown"') && !html.includes('id="policyPump"') && !script.includes("els.policyKnown") && !script.includes("els.policyPump") ? pass("Party primary answer not duplicated in secondary panel") : fail("Duplicate party answer remains");

script.includes("function setFuel(fuel)") && script.includes("state.fuel = fuel; render();") && script.includes("function setTankLiters(liters)") && script.includes("tankLiters = liters; render();") && script.includes("renderScenario(price)") ? pass("Selected party stays synchronized with fuel and tank") : fail("Party answer can become stale after input change");

script.includes('button.classList.toggle("selected", selected)') && script.includes('button.tabIndex = selected || !state.party ? 0 : -1') ? pass("Party visual, ARIA and focus state synchronized") : fail("Party selection state can diverge");
script.includes('if (!buttons.length) return;') && script.includes('["ArrowLeft","ArrowRight","Home","End"]') ? pass("Party keyboard navigation defensive") : fail("Party keyboard navigation not defensive");

script.includes('Prisdata ') && script.includes('Politik verifierad ') && script.includes("evidenceLabels[scenario.evidence]") ? pass("Party evidence provenance visible") : fail("Party provenance metadata unclear");
!script.includes('referenspris " +') && !script.includes('källan verifierad " +') ? pass("Technical party metadata copy removed") : fail("Technical metadata copy remains");

html.includes("Separat stöd / kompensation") && html.includes("Räknas inte in i pumppriset.") ? pass("Household support separated from pump price") : fail("Support can be confused with pump price");
!script.includes("policyCompensation") || script.includes("setText(els.policyCompensation, comparison.compensation)") ? pass("Compensation remains display-only") : fail("Compensation rendering unclear");

html.includes('id="policyFuels"') && script.includes("applicableFuels") && script.includes('join(" · ")') ? pass("Party fuel applicability visible") : fail("Party fuel scope hidden");
script.includes('fuelData[fuel]?.label || fuel') && script.includes('"Övergripande policy"') ? pass("Fuel scope uses user labels and safe fallback") : fail("Fuel scope rendering incomplete");

script.includes('evaluation.status === "unsupported_fuel"') && script.includes('"Ingen dokumenterad prisberäkning för "') && script.includes('"Gäller inte valt bränsle"') ? pass("Unsupported party fuel gets direct answer") : fail("Unsupported fuel remains generic");
script.includes('scenarioUnavailableText(evaluation, scenario)') && script.includes('"Det dokumenterade scenariot gäller inte "') ? pass("Unsupported fuel keeps explanatory detail") : fail("Unsupported fuel detail missing");

!html.includes('id="priceTrend"') && !html.includes("Prisutveckling") && !script.includes("renderTrend") && !script.includes("priceHistory") && !script.includes('fetch("/data/price-history.json"') ? pass("Public price-trend feature removed") : fail("Price-trend UI or runtime remains");

!script.includes("const policyBackground =") && script.includes("const background = scenario.method") && html.includes('id="policyFacts"') && ['c','kd','l','mp','m','s','sd','v'].every(key => policyText.includes(key + ': {') || policyText.includes(key + ': {')) && ['Centerpartiet','Kristdemokraterna','Liberalerna','Miljöpartiet','Moderaterna','Socialdemokraterna','Sverigedemokraterna','Vänsterpartiet'].every(name => policyText.includes('name: "' + name + '"')) ? pass("Political background has one frontend source of truth") : fail("Political background source incomplete or duplicated");
