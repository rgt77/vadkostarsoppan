const fuelData = window.FUEL_DATA || {};
const siteData = window.SITE_DATA || {};
const marketData = window.MARKET_DATA || {};
const politicalScenarios = window.POLICY_SCENARIOS || {};

let selectedFuel = siteData.defaultFuel || "petrol";

const els = {
  pumpPrice: document.querySelector("#pumpPrice"),
  priceError: document.querySelector("#priceError"),
  totalPrice: document.querySelector("#totalPrice"),
  energyTax: document.querySelector("#energyTax"),
  carbonTax: document.querySelector("#carbonTax"),
  vat: document.querySelector("#vat"),
  vatLabel: document.querySelector("#vatLabel"),
  other: document.querySelector("#other"),
  energyPct: document.querySelector("#energyPct"),
  carbonPct: document.querySelector("#carbonPct"),
  vatPct: document.querySelector("#vatPct"),
  otherPct: document.querySelector("#otherPct"),
  taxShare: document.querySelector("#taxShare"),
  taxPerLiter: document.querySelector("#taxPerLiter"),
  donut: document.querySelector("#donut"),
  priceBar: document.querySelector("#priceBar"),
  barTotal: document.querySelector("#barTotal"),
  periodText: document.querySelector("#periodText"),
  dataPeriod: document.querySelector("#dataPeriod"),
  dataVersion: document.querySelector("#dataVersion"),
  factCheckDate: document.querySelector("#factCheckDate"),
  chainTotal: document.querySelector("#chainTotal"),
  useWeeklyReference: document.querySelector("#useWeeklyReference"),
  weeklyReferenceLabel: document.querySelector("#weeklyReferenceLabel"),
  weeklyPumpReference: document.querySelector("#weeklyPumpReference"),
  weeklyPumpDate: document.querySelector("#weeklyPumpDate"),
  weeklyPumpSource: document.querySelector("#weeklyPumpSource"),
  brentPrice: document.querySelector("#brentPrice"),
  brentDate: document.querySelector("#brentDate"),
  brentSource: document.querySelector("#brentSource"),
  usdSek: document.querySelector("#usdSek"),
  fxDate: document.querySelector("#fxDate"),
  fxSource: document.querySelector("#fxSource"),
  crudeSekPerLiter: document.querySelector("#crudeSekPerLiter"),
  bridgePump: document.querySelector("#bridgePump"),
  bridgeMarket: document.querySelector("#bridgeMarket"),
  bridgeCrude: document.querySelector("#bridgeCrude"),
  tabs: [...document.querySelectorAll(".fuel-tab")],

  partyScenario: document.querySelector("#partyScenario"),
  scenarioPrice: document.querySelector("#scenarioPrice"),
  scenarioDelta: document.querySelector("#scenarioDelta"),
  scenarioBadge: document.querySelector("#scenarioBadge"),
  scenarioAsOf: document.querySelector("#scenarioAsOf"),
  scenarioTitle: document.querySelector("#scenarioTitle"),
  scenarioSummary: document.querySelector("#scenarioSummary"),
  scenarioMethod: document.querySelector("#scenarioMethod"),
  scenarioSource: document.querySelector("#scenarioSource"),
  policyTax: document.querySelector("#policyTax"),
  policyReduction: document.querySelector("#policyReduction"),
  policyBio: document.querySelector("#policyBio"),
  policyVat: document.querySelector("#policyVat"),
  policySupport: document.querySelector("#policySupport"),
  politicalShareKr: document.querySelector("#politicalShareKr"),
  politicalSharePct: document.querySelector("#politicalSharePct"),
  marketBaseKr: document.querySelector("#marketBaseKr"),
  compareReference: document.querySelector("#compareReference"),
  compareScenario: document.querySelector("#compareScenario"),

  energySlider: document.querySelector("#energySlider"),
  energyNumber: document.querySelector("#energyNumber"),
  carbonSlider: document.querySelector("#carbonSlider"),
  carbonNumber: document.querySelector("#carbonNumber"),
  vatSlider: document.querySelector("#vatSlider"),
  vatNumber: document.querySelector("#vatNumber"),
  regulatorySlider: document.querySelector("#regulatorySlider"),
  regulatoryNumber: document.querySelector("#regulatoryNumber"),
  energySliderValue: document.querySelector("#energySliderValue"),
  carbonSliderValue: document.querySelector("#carbonSliderValue"),
  vatSliderValue: document.querySelector("#vatSliderValue"),
  regulatorySliderValue: document.querySelector("#regulatorySliderValue"),
  customScenarioPrice: document.querySelector("#customScenarioPrice"),
  customScenarioDelta: document.querySelector("#customScenarioDelta"),
  resetPolicy: document.querySelector("#resetPolicy"),
  liveRegion: document.querySelector("#liveRegion"),
  copyScenarioLink: document.querySelector("#copyScenarioLink"),
  copyStatus: document.querySelector("#copyStatus"),
  resetAll: document.querySelector("#resetAll"),
  navLinks: [...document.querySelectorAll(".nav a")]
};

const fmt = (value, digits = 2) =>
  new Intl.NumberFormat("sv-SE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function parseNumber(value) {
  return Number(String(value ?? "").trim().replace(/\s/g, "").replace(",", "."));
}

function pct(part, total) {
  return total > 0 ? part / total * 100 : 0;
}

function signed(value, suffix = " kr/l") {
  if (Math.abs(value) < 0.005) return "0,00" + suffix;
  return (value > 0 ? "+" : "−") + fmt(Math.abs(value)) + suffix;
}

function validPrice(value) {
  return Number.isFinite(value) && value >= 1 && value <= 100;
}

function announce(message) {
  if (!els.liveRegion) return;
  els.liveRegion.textContent = "";
  requestAnimationFrame(() => {
    els.liveRegion.textContent = message;
  });
}

function getPrice() {
  const price = parseNumber(els.pumpPrice.value);
  const ok = validPrice(price);
  els.priceError.hidden = ok;
  els.pumpPrice.setAttribute("aria-invalid", String(!ok));
  return ok ? price : null;
}

function getReference(price) {
  const fuel = fuelData[selectedFuel];
  const vatRate = fuel.vatRate / 100;
  const priceBeforeVat = price / (1 + vatRate);
  const vat = price - priceBeforeVat;
  const excise = fuel.energyTax + fuel.carbonTax;
  const marketBase = Math.max(0, priceBeforeVat - excise);

  return {
    fuel,
    vatRate,
    vat,
    excise,
    marketBase,
    politicalDirect: vat + excise
  };
}

function weeklyReferenceForFuel() {
  const weekly = marketData.weeklyReference || {};
  return selectedFuel === "diesel" ? weekly.diesel : weekly.petrol;
}

function crudeEquivalentSekPerLiter() {
  const brent = marketData.brent?.usdPerBarrel;
  const usdSek = marketData.fx?.usdSek;
  const liters = marketData.constants?.litersPerBarrel;
  if (![brent, usdSek, liters].every(Number.isFinite) || liters <= 0) return null;
  return brent * usdSek / liters;
}

function updateMarketReferences() {
  const weeklyPrice = weeklyReferenceForFuel();
  const weekly = marketData.weeklyReference || {};
  const brent = marketData.brent || {};
  const fx = marketData.fx || {};
  const crudeSek = crudeEquivalentSekPerLiter();

  if (els.weeklyReferenceLabel) {
    els.weeklyReferenceLabel.textContent = Number.isFinite(weeklyPrice)
      ? fmt(weeklyPrice) + " kr/l · " + (weekly.asOf || "")
      : "Referens saknas";
  }
  if (els.weeklyPumpReference) els.weeklyPumpReference.textContent = Number.isFinite(weeklyPrice) ? fmt(weeklyPrice) + " kr/l" : "—";
  if (els.weeklyPumpDate) els.weeklyPumpDate.textContent = weekly.asOf || "—";
  if (els.weeklyPumpSource && weekly.source) els.weeklyPumpSource.href = weekly.source;

  if (els.brentPrice) els.brentPrice.textContent = Number.isFinite(brent.usdPerBarrel) ? fmt(brent.usdPerBarrel) + " USD/fat" : "—";
  if (els.brentDate) els.brentDate.textContent = brent.asOf || "—";
  if (els.brentSource && brent.source) els.brentSource.href = brent.source;

  if (els.usdSek) els.usdSek.textContent = Number.isFinite(fx.usdSek) ? fmt(fx.usdSek, 4) + " SEK/USD" : "—";
  if (els.fxDate) els.fxDate.textContent = fx.asOf || "—";
  if (els.fxSource && fx.source) els.fxSource.href = fx.source;

  if (els.crudeSekPerLiter) els.crudeSekPerLiter.textContent = crudeSek === null ? "—" : fmt(crudeSek) + " kr/l";
  if (els.bridgePump) els.bridgePump.textContent = Number.isFinite(weeklyPrice) ? fmt(weeklyPrice) + " kr/l" : "—";
  if (els.bridgeCrude) els.bridgeCrude.textContent = crudeSek === null ? "—" : fmt(crudeSek) + " kr/l";

  return { weeklyPrice, crudeSek };
}

function setBar(parts, total) {
  if (!els.priceBar) return;
  const spans = [...els.priceBar.children];
  parts.forEach((part, index) => {
    if (spans[index]) spans[index].style.width = Math.max(0, pct(part, total)) + "%";
  });
}

function setFuelTabs() {
  els.tabs.forEach(tab => {
    const active = tab.dataset.fuel === selectedFuel;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
}

function syncPair(range, number) {
  if (!range || !number) return;
  number.value = range.value;
}

function syncCustomControlsFromFuel() {
  const fuel = fuelData[selectedFuel];
  if (!fuel) return;

  els.energySlider.value = fuel.energyTax;
  els.carbonSlider.value = fuel.carbonTax;
  els.vatSlider.value = fuel.vatRate;
  els.regulatorySlider.value = 0;

  syncPair(els.energySlider, els.energyNumber);
  syncPair(els.carbonSlider, els.carbonNumber);
  syncPair(els.vatSlider, els.vatNumber);
  syncPair(els.regulatorySlider, els.regulatoryNumber);
}

function customControlValue(input, fallback, min, max) {
  const n = Number(input?.value);
  return Number.isFinite(n) ? clamp(n, min, max) : fallback;
}

function updateCustomSimulator(price, reference) {
  const energy = customControlValue(els.energySlider, reference.fuel.energyTax, 0, 6);
  const carbon = customControlValue(els.carbonSlider, reference.fuel.carbonTax, 0, 6);
  const vatPercent = customControlValue(els.vatSlider, reference.fuel.vatRate, 0, 30);
  const regulatory = customControlValue(els.regulatorySlider, 0, -3, 8);
  const vatRate = vatPercent / 100;

  const pretax = Math.max(0, reference.marketBase + regulatory + energy + carbon);
  const scenarioPrice = pretax * (1 + vatRate);
  const delta = scenarioPrice - price;

  els.energySliderValue.textContent = fmt(energy) + " kr/l";
  els.carbonSliderValue.textContent = fmt(carbon) + " kr/l";
  els.vatSliderValue.textContent = fmt(vatPercent, 0) + " %";
  els.regulatorySliderValue.textContent = signed(regulatory);
  els.customScenarioPrice.textContent = fmt(scenarioPrice) + " kr/l";
  els.customScenarioDelta.textContent = signed(delta);

  syncPair(els.energySlider, els.energyNumber);
  syncPair(els.carbonSlider, els.carbonNumber);
  syncPair(els.vatSlider, els.vatNumber);
  syncPair(els.regulatorySlider, els.regulatoryNumber);

  return { scenarioPrice, delta, energy, carbon, vatPercent, regulatory };
}

function updatePoliticalScenario(price) {
  const key = els.partyScenario?.value || "current";
  const scenario = politicalScenarios[key] || politicalScenarios.current;
  if (!scenario) return null;

  els.scenarioBadge.textContent = scenario.statusLabel;
  els.scenarioBadge.dataset.status = scenario.status || "partial";
  els.scenarioAsOf.textContent = scenario.asOf || "";
  els.scenarioTitle.textContent = scenario.name || "Scenario";
  els.scenarioSummary.textContent = scenario.summary || "";
  els.scenarioMethod.textContent = scenario.method || "";

  els.policyTax.textContent = scenario.policies?.tax || "Ej angivet";
  els.policyReduction.textContent = scenario.policies?.reduction || "Ej angivet";
  els.policyBio.textContent = scenario.policies?.bio || "Ej angivet";
  els.policyVat.textContent = scenario.policies?.vat || "Ej angivet";
  els.policySupport.textContent = scenario.policies?.support || "Ej angivet";

  if (scenario.source) {
    els.scenarioSource.hidden = false;
    els.scenarioSource.href = scenario.source;
  } else {
    els.scenarioSource.hidden = true;
  }

  const model = scenario.priceModel || { type: "not_quantified" };
  let result = null;
  let delta = null;

  if (model.type === "baseline") {
    result = price;
    delta = 0;
    els.scenarioDelta.textContent = "Referenspris – ingen scenarioförändring.";
  } else if (model.type === "party_delta" && Number.isFinite(model.delta)) {
    delta = model.delta;
    result = Math.max(0, price + delta);
    els.scenarioDelta.textContent = signed(delta) + " enligt partiets egen publicerade beräkning.";
  } else if (model.type === "stated_target" && Number.isFinite(model.delta)) {
    delta = model.delta;
    result = Math.max(0, price + delta);
    els.scenarioDelta.textContent = "Partiets uttalade mål: " + signed(delta) + ". Inte oberoende verifierat.";
  } else {
    els.scenarioDelta.textContent = "Minst en nödvändig parameter saknar en publicerad exakt nivå.";
  }

  els.scenarioPrice.textContent = result === null ? "Ej exakt beräkningsbart" : fmt(result) + " kr/l";
  els.compareReference.textContent = fmt(price) + " kr/l";
  els.compareScenario.textContent = result === null ? "Ej beräkningsbart" : fmt(result) + " kr/l";

  return { scenario, result, delta };
}

function updateUrl(price) {
  const url = new URL(window.location.href);
  url.searchParams.set("fuel", selectedFuel);
  url.searchParams.set("price", price.toFixed(2));
  if (els.partyScenario?.value && els.partyScenario.value !== "current") {
    url.searchParams.set("party", els.partyScenario.value);
  } else {
    url.searchParams.delete("party");
  }

  url.searchParams.set("energy", Number(els.energySlider.value).toFixed(2));
  url.searchParams.set("carbon", Number(els.carbonSlider.value).toFixed(2));
  url.searchParams.set("vat", Number(els.vatSlider.value).toFixed(0));
  url.searchParams.set("rule", Number(els.regulatorySlider.value).toFixed(2));

  history.replaceState(null, "", url);
}

function update() {
  const price = getPrice();
  if (price === null) return;

  const reference = getReference(price);
  const { fuel, vat, excise, marketBase, politicalDirect } = reference;
  const energy = fuel.energyTax;
  const carbon = fuel.carbonTax;
  const taxPct = pct(politicalDirect, price);

  els.totalPrice.textContent = fmt(price);
  els.energyTax.textContent = fmt(energy) + " kr";
  els.carbonTax.textContent = fmt(carbon) + " kr";
  els.vat.textContent = fmt(vat) + " kr";
  els.other.textContent = fmt(marketBase) + " kr";

  els.energyPct.textContent = fmt(pct(energy, price), 1) + " %";
  els.carbonPct.textContent = fmt(pct(carbon, price), 1) + " %";
  els.vatPct.textContent = fmt(pct(vat, price), 1) + " %";
  els.otherPct.textContent = fmt(pct(marketBase, price), 1) + " %";

  els.taxShare.textContent = fmt(taxPct, 1) + " % av pumppriset";
  els.taxPerLiter.textContent = fmt(politicalDirect) + " kr/l";
  els.vatLabel.textContent = fmt(fuel.vatRate, 0) + " % på priset före moms";
  els.periodText.textContent = "Skattesatserna på sidan gäller " + fuel.period + ".";
  els.dataPeriod.textContent = "Skattesatser: " + fuel.period;
  els.barTotal.textContent = fmt(price) + " kr/l";
  els.chainTotal.textContent = fmt(marketBase) + " kr/l";

  els.politicalShareKr.textContent = fmt(politicalDirect) + " kr/l";
  els.politicalSharePct.textContent = fmt(taxPct, 1) + " % av pumppriset";
  els.marketBaseKr.textContent = fmt(marketBase) + " kr/l";

  const marketRefs = updateMarketReferences();
  if (els.bridgeMarket) {
    if (Number.isFinite(marketRefs.weeklyPrice)) {
      const weeklyReference = getReference(marketRefs.weeklyPrice);
      els.bridgeMarket.textContent = fmt(weeklyReference.marketBase) + " kr/l";
    } else {
      els.bridgeMarket.textContent = "—";
    }
  }

  const parts = [marketBase, energy, carbon, vat];
  const colors = ["var(--other)", "var(--energy)", "var(--carbon)", "var(--vat)"];
  let cursor = 0;
  const gradient = parts.map((part, index) => {
    const start = cursor;
    cursor += pct(part, price) * 3.6;
    return `${colors[index]} ${start.toFixed(2)}deg ${cursor.toFixed(2)}deg`;
  }).join(", ");

  els.donut.style.background = `conic-gradient(${gradient})`;
  els.donut.setAttribute(
    "aria-label",
    `${fuel.label}: marknad och kedja ${fmt(marketBase)} kronor, energiskatt ${fmt(energy)}, koldioxidskatt ${fmt(carbon)} och moms ${fmt(vat)} per liter.`
  );

  setBar(parts, price);
  updatePoliticalScenario(price);
  updateCustomSimulator(price, reference);
  updateUrl(price);
}

function normalizePumpPrice() {
  const price = getPrice();
  if (price !== null) {
    els.pumpPrice.value = fmt(price);
    announce("Literpriset är uppdaterat till " + fmt(price) + " kronor.");
  }
  update();
}

function bindPair(range, number) {
  if (!range || !number) return;

  range.addEventListener("input", () => {
    number.value = range.value;
    update();
  });

  number.addEventListener("input", () => {
    const min = Number(range.min);
    const max = Number(range.max);
    const n = parseNumber(number.value);
    if (!Number.isFinite(n)) return;
    range.value = String(clamp(n, min, max));
    update();
  });

  number.addEventListener("blur", () => {
    number.value = range.value;
  });
}

function loadStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const fuel = params.get("fuel");
  const price = parseNumber(params.get("price"));
  const party = params.get("party");
  const energy = parseNumber(params.get("energy"));
  const carbon = parseNumber(params.get("carbon"));
  const vat = parseNumber(params.get("vat"));
  const rule = parseNumber(params.get("rule"));

  if (fuel && fuelData[fuel]) selectedFuel = fuel;
  if (validPrice(price)) els.pumpPrice.value = fmt(price);
  if (party && politicalScenarios[party] && els.partyScenario) els.partyScenario.value = party;

  setFuelTabs();
  syncCustomControlsFromFuel();

  if (Number.isFinite(energy)) els.energySlider.value = clamp(energy, 0, 6);
  if (Number.isFinite(carbon)) els.carbonSlider.value = clamp(carbon, 0, 6);
  if (Number.isFinite(vat)) els.vatSlider.value = clamp(vat, 0, 30);
  if (Number.isFinite(rule)) els.regulatorySlider.value = clamp(rule, -3, 8);

  syncPair(els.energySlider, els.energyNumber);
  syncPair(els.carbonSlider, els.carbonNumber);
  syncPair(els.vatSlider, els.vatNumber);
  syncPair(els.regulatorySlider, els.regulatoryNumber);
}

function setupNavObserver() {
  if (!("IntersectionObserver" in window)) return;
  const sections = els.navLinks
    .map(link => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;
    els.navLinks.forEach(link => {
      link.classList.toggle("active", link.getAttribute("href") === "#" + visible.target.id);
    });
  }, { rootMargin: "-20% 0px -68% 0px", threshold: [0, .2, .5] });

  sections.forEach(section => observer.observe(section));
}

els.tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    selectedFuel = tab.dataset.fuel;
    setFuelTabs();
    syncCustomControlsFromFuel();
    updateMarketReferences();
    update();
    announce("Bränsle ändrat till " + fuelData[selectedFuel].label + ".");
  });

  tab.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const index = els.tabs.indexOf(tab);
    const next = event.key === "ArrowRight"
      ? (index + 1) % els.tabs.length
      : (index - 1 + els.tabs.length) % els.tabs.length;
    els.tabs[next].focus();
    els.tabs[next].click();
  });
});

els.pumpPrice.addEventListener("input", update);
els.pumpPrice.addEventListener("blur", normalizePumpPrice);

els.useWeeklyReference?.addEventListener("click", () => {
  const reference = weeklyReferenceForFuel();
  if (!Number.isFinite(reference)) return;
  els.pumpPrice.value = fmt(reference);
  update();
  announce("Veckoreferensen " + fmt(reference) + " kronor per liter används för " + fuelData[selectedFuel].label + ".");
});

if (els.partyScenario) {
  els.partyScenario.addEventListener("change", () => {
    update();
    const scenario = politicalScenarios[els.partyScenario.value];
    announce("Politiskt scenario ändrat till " + (scenario?.name || "valt scenario") + ".");
  });
}

bindPair(els.energySlider, els.energyNumber);
bindPair(els.carbonSlider, els.carbonNumber);
bindPair(els.vatSlider, els.vatNumber);
bindPair(els.regulatorySlider, els.regulatoryNumber);

els.resetPolicy?.addEventListener("click", () => {
  syncCustomControlsFromFuel();
  update();
  announce("Det egna politiska scenariot är återställt till dagens nivå.");
});

async function copyCurrentScenarioLink() {
  const url = window.location.href;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    els.copyStatus.textContent = "Länken är kopierad.";
    announce("Länken till scenariot är kopierad.");
  } catch {
    els.copyStatus.textContent = "Kunde inte kopiera länken.";
  }
}

els.copyScenarioLink?.addEventListener("click", copyCurrentScenarioLink);

els.resetAll?.addEventListener("click", () => {
  selectedFuel = siteData.defaultFuel || "petrol";
  els.pumpPrice.value = fmt(siteData.defaultPumpPrice || 16.49);
  if (els.partyScenario) els.partyScenario.value = "current";
  setFuelTabs();
  syncCustomControlsFromFuel();
  update();
  announce("Sidan är återställd till standardvärden.");
});

loadStateFromUrl();

if (els.dataVersion) els.dataVersion.textContent = siteData.dataVersion || "—";
if (els.factCheckDate) els.factCheckDate.textContent = siteData.lastFactCheck || "—";

setupNavObserver();
updateMarketReferences();
update();
