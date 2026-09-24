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
  "404.html", "data/policy-facts-sd.json", "data/policy-facts-m.json", "data/policy-facts-kd.json", "data/policy-facts-l.json", "data/policy-facts-s.json", "data/policy-facts-c.json", "data/policy-facts-v.json"
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

  w.SITE_DATA?.appVersion === "0.47.0" ? pass("Version 0.47.0") : fail("Version mismatch");
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

html404.includes("style.css?v=0.47.0") ? pass("404 cache version") : fail("404 cache version mismatch");
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
  ["pump_prices_2022_2026","reduction_duty_2022","reduction_duty_2024","tax_2024_2025","temporary_tax_2026"].every(x => ids.has(x)) ? pass("SD sourced policy facts") : fail("SD policy facts incomplete");
  sdFacts.facts?.every(x => String(x.source ?? "").startsWith("https://")) ? pass("SD fact sources") : fail("SD fact source missing");
  script.includes('policyBackground') && script.includes('"sd":') && html.includes('id="policyFacts"') ? pass("SD contextual evidence UI") : fail("SD contextual evidence UI missing");
} catch (error) { fail("SD policy facts: " + error.message); }

try {
  const mFacts = JSON.parse(read("data/policy-facts-m.json"));
  const ids = new Set(mFacts.facts?.map(x => x.id));
  ["eu_min_tax_2026","additional_relief_2026","reduction_duty_current","tax_indexation_2026"].every(x => ids.has(x)) ? pass("M sourced policy facts") : fail("M policy facts incomplete");
  mFacts.facts?.every(x => String(x.source ?? "").startsWith("https://moderaterna.se/")) ? pass("M official fact sources") : fail("M fact source invalid");
  script.includes('policyBackground') && script.includes('"m":') ? pass("M contextual evidence UI") : fail("M contextual evidence UI missing");
  script.includes("model.validFrom") && script.includes("model.fuels") ? pass("Bounded political scenario guard") : fail("Bounded scenario guard missing");
} catch (error) { fail("M policy facts: " + error.message); }

try {
  const kdFacts = JSON.parse(read("data/policy-facts-kd.json"));
  const ids = new Set(kdFacts.facts?.map(x => x.id));
  ["tax_reduction_mix_2024","reduction_duty_2024","diesel_estimate_2024"].every(x => ids.has(x)) ? pass("KD sourced policy facts") : fail("KD policy facts incomplete");
  kdFacts.facts?.every(x => String(x.source ?? "").startsWith("https://kristdemokraterna.se/")) ? pass("KD official fact sources") : fail("KD fact source invalid");
  script.includes('policyBackground') && script.includes('"kd":') ? pass("KD contextual evidence UI") : fail("KD contextual evidence UI missing");
} catch (error) { fail("KD policy facts: " + error.message); }

try {
  const lFacts = JSON.parse(read("data/policy-facts-l.json"));
  const ids = new Set(lFacts.facts?.map(x => x.id));
  ["climate_report_2022","reduction_duty_2025"].every(x => ids.has(x)) ? pass("L sourced policy facts") : fail("L policy facts incomplete");
  lFacts.facts?.every(x => String(x.source ?? "").startsWith("https://www.liberalerna.se/")) ? pass("L official fact sources") : fail("L fact source invalid");
  script.includes('policyBackground') && script.includes('"l":') ? pass("L contextual evidence UI") : fail("L contextual evidence UI missing");
} catch (error) { fail("L policy facts: " + error.message); }

try {
  const sFacts = JSON.parse(read("data/policy-facts-s.json"));
  const ids = new Set(sFacts.facts?.map(x => x.id));
  ["temporary_fuel_tax_cut_2026","fuel_price_direction_2026"].every(x => ids.has(x)) ? pass("S sourced policy facts") : fail("S policy facts incomplete");
  sFacts.facts?.every(x => String(x.source ?? "").startsWith("https://www.socialdemokraterna.se/")) ? pass("S official fact sources") : fail("S fact source invalid");
  script.includes('policyBackground') && script.includes('"s":') ? pass("S contextual evidence UI") : fail("S contextual evidence UI missing");
} catch (error) { fail("S policy facts: " + error.message); }

try {
 const cFacts=JSON.parse(read("data/policy-facts-c.json")); const ids=new Set(cFacts.facts?.map(x=>x.id));
 ["climate_plan_transport_2026","biofuel_tax_exemption_2026","ev_sales_targets_2030"].every(x=>ids.has(x)) ? pass("C sourced policy facts") : fail("C policy facts incomplete");
 cFacts.facts?.every(x=>String(x.source??"").startsWith("https://www.centerpartiet.se/")) ? pass("C official fact sources") : fail("C fact source invalid");
 script.includes('policyBackground') && script.includes('"c":') ? pass("C contextual evidence UI") : fail("C contextual evidence UI missing");
} catch(error){ fail("C policy facts: "+error.message); }

try {
 const vFacts=JSON.parse(read("data/policy-facts-v.json")); const ids=new Set(vFacts.facts?.map(x=>x.id));
 ["fuel_tax_position_2026","geographic_road_tax","sustainable_travel_support"].every(x=>ids.has(x)) ? pass("V sourced policy facts") : fail("V policy facts incomplete");
 vFacts.facts?.every(x=>String(x.source??"").startsWith("https://www.vansterpartiet.se/")) ? pass("V official fact sources") : fail("V fact source invalid");
 script.includes('policyBackground') && script.includes('"v":') ? pass("V contextual evidence UI") : fail("V contextual evidence UI missing");
} catch(error){ fail("V policy facts: "+error.message); }

html.includes('data-tank-size="30"') && html.includes('data-tank-size="60"') && script.includes("tankSizeButtons") ? pass("Interactive tank-size selector") : fail("Tank-size selector missing");
html.includes('id="taxBarFill"') && script.includes("taxBarFill.style.width") ? pass("Visual tax-share bar") : fail("Tax-share visualization missing");
html.includes('id="policyDetails"') && html.includes("Visa underlag") ? pass("Progressive policy evidence disclosure") : fail("Policy evidence disclosure missing");
html.includes("Pris före skatt &amp; moms") ? pass("Plain-language residual label") : fail("Residual label not simplified");

html.includes('data-trend-days="365"') && script.includes("state.trendDays") && script.includes("trendLine.setAttribute") ? pass("Compact trend period controls") : fail("Trend controls missing");
html.includes('<details class="policy-details"') && html.indexOf('id="scenarioNote"') > html.indexOf('<details class="policy-details"') ? pass("Scenario methodology progressively disclosed") : fail("Scenario methodology disclosure regression");

html.includes('class="breakdown-details"') && html.includes("Visa kostnadsdelar") ? pass("Progressive cost breakdown") : fail("Cost breakdown disclosure missing");


script.includes("Sedan första mätningen") && script.includes("coverageDays") && script.includes("button.disabled") && html.includes('id="trendCoverage"') ? pass("Coverage-aware trend component") : fail("Trend readability regression");
script.includes("enoughForChart") && script.includes("distinctDates >= 3") ? pass("Trend chart minimum-data guard") : fail("Trend chart data guard missing");
script.includes("coverageDays >= period") && script.includes("minimumObservations") ? pass("Trend requires complete representative periods") : fail("Trend period completeness guard missing");
!script.includes("trendToleranceDays") ? pass("Trend uses exact dates") : fail("Trend still uses date tolerance");
(style.match(/\/\* Price trend \*\//g) ?? []).length === 1 && !style.includes("Price trend v2") ? pass("Trend CSS consolidated") : fail("Duplicate trend CSS remains");
html.includes('id="trendLastPoint"') && html.includes("trend-grid-line") ? pass("Trend chart visual guides") : fail("Trend chart guides missing");
html.includes('id="trendEmpty"') && html.includes('id="trendProgressFill"') && html.includes('role="progressbar"') ? pass("Trend empty-state progress") : fail("Trend empty state missing");
script.includes("observedDays") && script.includes("mätningar") ? pass("Trend distinguishes measurements from elapsed days") : fail("Trend measurement count missing");
html.includes('id="trendChartSummary"') && script.includes("chartSummary") ? pass("Accessible trend chart summary") : fail("Trend chart summary missing");
script.includes("formatTrendDate") && script.includes('Intl.DateTimeFormat("sv-SE"') ? pass("Swedish trend dates") : fail("Trend dates not localized");
script.includes("measurementsNeeded") && script.includes("collectedMeasurements") ? pass("Precise trend empty-state requirements") : fail("Trend empty-state requirements unclear");
script.includes("minIndex") && script.includes("maxIndex") ? pass("Trend summary includes extrema dates") : fail("Trend extrema context missing");
script.includes("pointSpanMs") && script.includes("p.ms-pointStartMs") ? pass("Trend uses proportional time axis") : fail("Trend x-axis is not time-proportional");
html.includes('id="trendMinStat"') && html.includes('id="trendMaxStat"') ? pass("Visible trend extrema summary") : fail("Trend extrema summary missing");
html.includes('aria-valuemax="3"') && script.includes("3 mätningar") ? pass("Trend progress matches graph readiness") : fail("Trend progress semantics mismatch");
script.includes("coveragePercent") && script.includes("datatäckning") ? pass("Trend reports data coverage accessibly") : fail("Trend data coverage context missing");
!JSON.parse(read("data/price-history.json")).trendToleranceDays ? pass("Obsolete trend tolerance metadata removed") : fail("Obsolete trend tolerance remains");
script.includes("trendPercent") && html.includes('id="trendPercent"') ? pass("Trend percentage context") : fail("Trend percentage missing");

style.includes("--radius-control") && style.includes("--control-active") ? pass("Unified control design tokens") : fail("Control design tokens missing");

!html.includes("fuel-id") && !style.includes(".fuel-id") && html.includes('id="fuelTypeLabel"') && style.includes(".control-label") ? pass("Unified fuel and tank headings without fuel symbols") : fail("Fuel/tank control heading mismatch");
html.includes("Tankstorlek <span class=\"control-label-unit\">(liter)</span>") && !html.includes(">30 L<") && !html.includes(">40 L<") ? pass("Tank unit appears only in heading") : fail("Tank unit presentation mismatch");
style.includes(".fuel-button,.tank-size-control button") && style.includes("font-weight:600") ? pass("Primary option typography unified") : fail("Primary option typography mismatch");

style.includes("font-variant-numeric:tabular-nums") ? pass("Stable numeric control typography") : fail("Numeric control typography missing");
style.includes(".trend-periods button") && style.includes("font-weight:600") ? pass("Trend selector typography aligned") : fail("Trend selector typography mismatch");
style.includes("--touch-min: 44px") && style.includes("min-height:var(--touch-min)") ? pass("Minimum touch target guard") : fail("Touch target guard missing");

style.includes("--space-section") && style.includes("--space-card") && style.includes("--touch-min") ? pass("Phase 4 spacing and touch tokens") : fail("Phase 4 layout tokens missing");
html.includes("result-card") && html.includes("scenario-card") ? pass("Semantic result card hooks") : fail("Result card hooks missing");
style.includes(".tax-summary { margin-top: 18px; padding-top: 15px; border-top: 1px solid var(--line); }") ? pass("Tax summary hierarchy") : fail("Tax summary hierarchy missing");

!style.includes("var(--muted,#") && !style.includes("var(--text,#") ? pass("CSS token fallbacks consolidated") : fail("Redundant CSS token fallbacks remain");
html.includes('data-tank-size="30" aria-pressed="false"') && html.includes('data-tank-size="60" aria-pressed="false"') ? pass("Complete tank selector accessibility state") : fail("Tank selector initial state incomplete");
script.includes('image.loading = "lazy"') ? pass("Party logos lazy loaded") : fail("Party logo loading strategy missing");
style.includes("@media (hover:hover)") ? pass("Touch-safe hover states") : fail("Hover capability guard missing");

!style.includes(".party-button:hover") && style.includes(".party-button:not([aria-pressed=\"true\"]):hover") ? pass("Party hover is touch-safe") : fail("Party hover regression");
!style.includes(".controls { grid-template-columns") ? pass("Dead controls grid rule removed") : fail("Dead controls grid rule remains");

const healthScript2 = read("scripts/data-health.mjs");
healthScript2.includes("const activeDuty=") ? pass("Reduction-duty health period resolved") : fail("Reduction-duty health period missing");
!style.includes("var(--line,#") ? pass("Line token fallbacks consolidated") : fail("Redundant line token fallback remains");
style.includes(".breakdown-details summary") && style.includes(".policy-details summary") ? pass("Details controls share touch target") : fail("Details touch target mismatch");
html.includes("Så räknar vi och våra källor") ? pass("Method disclosure label is explicit") : fail("Method disclosure label regression");

!style.includes(".tank-size-control button{min-height:58px") ? pass("Duplicate tank control CSS removed") : fail("Duplicate tank control CSS remains");
style.includes(".trend-periods button{min-height:var(--touch-min)") ? pass("Trend periods use shared touch token") : fail("Trend touch token regression");
!style.includes("background:#f3f3ef") && !style.includes("background:#deded8") ? pass("Trend neutrals use theme tokens") : fail("Hardcoded trend neutrals remain");

html.includes('id="taxSummaryLabel"') && script.includes('"Moms (känd del)"') && script.includes('"Varierar med bränslemixen"') ? pass("E85 tax semantics are explicit") : fail("E85 tax semantics regression");
script.includes('"Punktskatt varierar med bränslemixen"') ? pass("E85 tax share avoids false total") : fail("E85 tax share misleading");

html.includes("30–60 liters tankning") ? pass("Metadata matches selectable tank sizes") : fail("Metadata tank-size claim stale");
style.includes("prefers-reduced-motion") ? pass("Reduced motion preference supported") : fail("Reduced motion support missing");

html.includes('name="twitter:card"') && html.includes('property="og:title"') ? pass("Social metadata complete") : fail("Social metadata incomplete");
read("sitemap.xml").includes("<lastmod>2026-09-24</lastmod>") ? pass("Sitemap release date current") : fail("Sitemap release date stale");
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
productionAudit.status === "ok" ? pass("Production audit state healthy") : fail("Production audit state unhealthy");

if (warnings.length) console.warn("\n" + warnings.map(message => "! " + message).join("\n"));
if (failures.length) {
  console.error("\n" + failures.map(message => "✕ " + message).join("\n"));
  process.exit(1);
}
console.log("\nPASS");
