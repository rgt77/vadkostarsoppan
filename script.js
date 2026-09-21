const fuelData = window.FUEL_DATA || {};
const siteData = window.SITE_DATA || {};
const marketData = window.MARKET_DATA || {};
const countyData = window.COUNTY_PRICES || {};
const politicalScenarios = window.POLICY_SCENARIOS || {};

let selectedFuel = siteData.defaultFuel || "petrol";
let selectedCounty = "riket";
let priceMode = "county";
let recentCounties = [];
let partyFilter = "all";

const els = {
  pumpPrice: document.querySelector("#pumpPrice"),
  headerFuel: document.querySelector("#headerFuel"),
  headerPrice: document.querySelector("#headerPrice"),
  mobileFuel: document.querySelector("#mobileFuel"),
  mobilePrice: document.querySelector("#mobilePrice"),
  contrastToggle: document.querySelector("#contrastToggle"),
  mobileNavLinks: [...document.querySelectorAll(".mobile-bottom-nav a")],
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
  countySelect: document.querySelector("#countySelect"),
  countyPriceLabel: document.querySelector("#countyPriceLabel"),
  countyPrice: document.querySelector("#countyPrice"),
  countyDifference: document.querySelector("#countyDifference"),
  useCountyAverage: document.querySelector("#useCountyAverage"),
  countySource: document.querySelector("#countySource"),
  countySearch: document.querySelector("#countySearch"),
  countySort: document.querySelector("#countySort"),
  countyList: document.querySelector("#countyList"),
  countyCoverage: document.querySelector("#countyCoverage"),
  countyUpdated: document.querySelector("#countyUpdated"),
  countyLowest: document.querySelector("#countyLowest"),
  countyLowestName: document.querySelector("#countyLowestName"),
  countyHighest: document.querySelector("#countyHighest"),
  countyHighestName: document.querySelector("#countyHighestName"),
  countySpread: document.querySelector("#countySpread"),
  countyRank: document.querySelector("#countyRank"),
  countyRankDetail: document.querySelector("#countyRankDetail"),
  countyPositionName: document.querySelector("#countyPositionName"),
  countyPositionDot: document.querySelector("#countyPositionDot"),
  countyPositionLow: document.querySelector("#countyPositionLow"),
  countyPositionHigh: document.querySelector("#countyPositionHigh"),
  countyDataAlert: document.querySelector("#countyDataAlert"),
  countyDataAlertText: document.querySelector("#countyDataAlertText"),
  countyListCount: document.querySelector("#countyListCount"),
  countyFocusSelected: document.querySelector("#countyFocusSelected"),
  countyRecent: document.querySelector("#countyRecent"),
  priceModeBadge: document.querySelector("#priceModeBadge"),
  manualVsCounty: document.querySelector("#manualVsCounty"),
  manualVsNational: document.querySelector("#manualVsNational"),
  clearPreferences: document.querySelector("#clearPreferences"),
  dataFreshness: document.querySelector("#dataFreshness"),
  dataHealth: document.querySelector("#dataHealth"),
  dataHealthDetail: document.querySelector("#dataHealthDetail"),
  dataHealthDot: document.querySelector("#dataHealthDot"),
  appVersion: document.querySelector("#appVersion"),
  heroPetrolPrice: document.querySelector("#heroPetrolPrice"),
  heroDieselPrice: document.querySelector("#heroDieselPrice"),
  heroFuelChips: [...document.querySelectorAll("[data-hero-fuel]")],
  gaugeFuelLabel: document.querySelector("#gaugeFuelLabel"),
  gaugeTotal: document.querySelector("#gaugeTotal"),
  gaugeMarket: document.querySelector("#gaugeMarket"),
  gaugeEnergy: document.querySelector("#gaugeEnergy"),
  gaugeCarbon: document.querySelector("#gaugeCarbon"),
  gaugeVat: document.querySelector("#gaugeVat"),
  chipMarket: document.querySelector("#chipMarket"),
  chipEnergy: document.querySelector("#chipEnergy"),
  chipCarbon: document.querySelector("#chipCarbon"),
  chipVat: document.querySelector("#chipVat"),
  costChips: [...document.querySelectorAll(".cost-chip")],
  breakdownRows: [...document.querySelectorAll(".breakdown-row")],
  receiptFuel: document.querySelector("#receiptFuel"),
  receiptMarket: document.querySelector("#receiptMarket"),
  receiptEnergy: document.querySelector("#receiptEnergy"),
  receiptCarbon: document.querySelector("#receiptCarbon"),
  receiptVat: document.querySelector("#receiptVat"),
  receiptTotal: document.querySelector("#receiptTotal"),
  copyReceipt: document.querySelector("#copyReceipt"),
  shareReceipt: document.querySelector("#shareReceipt"),
  printReceipt: document.querySelector("#printReceipt"),
  toast: document.querySelector("#toast"),
  partyPills: document.querySelector("#partyPills"),
  partyFilterButtons: [...document.querySelectorAll("[data-party-filter]")],
  politicsReferenceLocation: document.querySelector("#politicsReferenceLocation"),
  politicsReferencePrice: document.querySelector("#politicsReferencePrice"),
  compareScenarioPct: document.querySelector("#compareScenarioPct"),
  scenarioMeterDot: document.querySelector("#scenarioMeterDot"),
  meterDeltaLabel: document.querySelector("#meterDeltaLabel"),
  presetButtons: [...document.querySelectorAll("[data-preset]")],
  useWeeklyReference: document.querySelector("#useWeeklyReference"),
  useNationalAverage: document.querySelector("#useNationalAverage"),
  priceNudges: [...document.querySelectorAll("[data-price-nudge]")],
  priceStory: document.querySelector("#priceStory"),
  duelWinner: document.querySelector("#duelWinner"),
  duelMarket: document.querySelector("#duelMarket"),
  duelTax: document.querySelector("#duelTax"),
  duelMarketLabel: document.querySelector("#duelMarketLabel"),
  duelTaxLabel: document.querySelector("#duelTaxLabel"),
  hundredKronaAnalogy: document.querySelector("#hundredKronaAnalogy"),
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
  bridgeGap: document.querySelector("#bridgeGap"),
  marketCountyPrice: document.querySelector("#marketCountyPrice"),
  marketCountyName: document.querySelector("#marketCountyName"),
  marketNationalPrice: document.querySelector("#marketNationalPrice"),
  marketCountyVsNational: document.querySelector("#marketCountyVsNational"),
  marketWeeklyCompare: document.querySelector("#marketWeeklyCompare"),
  marketCountyVsWeekly: document.querySelector("#marketCountyVsWeekly"),
  crudeShareOfPump: document.querySelector("#crudeShareOfPump"),
  marketDataAge: document.querySelector("#marketDataAge"),
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

const STORAGE_KEY = "vadkostarsoppan.preferences.v1";

function loadSavedPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (saved.fuel && fuelData[saved.fuel]) selectedFuel = saved.fuel;
    if (saved.county && allCountyEntries().some(item => item.id === saved.county)) selectedCounty = saved.county;
    if (["county","manual","weekly"].includes(saved.mode)) priceMode = saved.mode;
    if (Array.isArray(saved.recent)) {
      recentCounties = saved.recent.filter(id => allCountyEntries().some(item => item.id === id)).slice(0,4);
    }
    if (saved.manualPrice && validPrice(Number(saved.manualPrice)) && priceMode === "manual") {
      els.pumpPrice.value = fmt(Number(saved.manualPrice));
    }
    if (saved.highContrast) document.documentElement.classList.add("high-contrast");
  } catch {}
  if (els.contrastToggle) {
    const active = document.documentElement.classList.contains("high-contrast");
    els.contrastToggle.setAttribute("aria-pressed", String(active));
  }
}

function savePreferences() {
  try {
    const currentPrice = parseNumber(els.pumpPrice?.value);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      fuel: selectedFuel,
      county: selectedCounty,
      mode: priceMode,
      manualPrice: priceMode === "manual" && validPrice(currentPrice) ? currentPrice : null,
      recent: recentCounties,
      highContrast: document.documentElement.classList.contains("high-contrast")
    }));
  } catch {}
}

function rememberCounty(id) {
  if (!id || id === "riket") return;
  recentCounties = [id, ...recentCounties.filter(item => item !== id)].slice(0,4);
  savePreferences();
  renderRecentCounties();
}

function renderRecentCounties() {
  if (!els.countyRecent) return;
  els.countyRecent.innerHTML = "";
  if (!recentCounties.length) {
    const span = document.createElement("span");
    span.className = "recent-empty";
    span.textContent = "Inga ännu";
    els.countyRecent.appendChild(span);
    return;
  }
  recentCounties.forEach(id => {
    const item = countyEntry(id);
    if (!item) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "recent-county" + (id === selectedCounty ? " active" : "");
    button.textContent = item.name.replace(" län","");
    button.addEventListener("click", () => {
      selectedCounty = id;
      priceMode = "county";
      if (els.countySelect) els.countySelect.value = id;
      applyCountyPrice({ announceChange: true });
      rememberCounty(id);
    });
    els.countyRecent.appendChild(button);
  });
}

function formatDataFreshness(dateText) {
  if (!dateText) return "okänd färskhet";
  const date = new Date(dateText + "T00:00:00");
  if (Number.isNaN(date.getTime())) return "okänd färskhet";
  const now = new Date();
  const days = Math.round((Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()) - Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())) / 86400000);
  if (days <= 0) return "prisdata uppdaterad idag";
  if (days === 1) return "prisdata 1 dag gammal";
  return "prisdata " + days + " dagar gammal";
}

function validateDatasets() {
  const errors = [];

  const fuelKeys = ["petrol","diesel"];
  fuelKeys.forEach(key => {
    const fuel = fuelData[key];
    if (!fuel) errors.push("Saknar bränsledata: " + key);
    else if (![fuel.energyTax, fuel.carbonTax, fuel.vatRate].every(Number.isFinite)) {
      errors.push("Ogiltiga skattevärden: " + key);
    }
  });

  const counties = Array.isArray(countyData.counties) ? countyData.counties : [];
  if (counties.length !== 21) errors.push("Länsdata är inte 21 län.");
  const ids = counties.map(item => item.id);
  if (new Set(ids).size !== ids.length) errors.push("Dubbla läns-ID:n.");
  counties.forEach(item => {
    if (!Number.isFinite(item.petrol) || !Number.isFinite(item.diesel)) {
      errors.push("Ogiltigt länspris: " + (item.name || item.id));
    }
  });

  const weekly = marketData.weeklyReference || {};
  if (!Number.isFinite(weekly.petrol) || !Number.isFinite(weekly.diesel)) {
    errors.push("Veckoreferens saknas.");
  }
  if (!Number.isFinite(marketData.brent?.usdPerBarrel)) errors.push("Brentdata saknas.");
  if (!Number.isFinite(marketData.fx?.usdSek)) errors.push("Valutadata saknas.");
  if (!politicalScenarios.current) errors.push("Referensscenario för politik saknas.");

  if (els.dataHealth) {
    const ok = errors.length === 0;
    els.dataHealth.textContent = ok ? "Datakontroll: OK" : "Datakontroll: kontrollera";
    els.dataHealthDetail.textContent = ok
      ? "Bränsledata, 21 län, marknadsreferenser och referensscenario är laddade."
      : errors.join(" ");
    els.dataHealth.parentElement?.classList.toggle("error", !ok);
  }

  if (els.countyCoverage) els.countyCoverage.textContent = counties.length + " / 21 län";
  return errors;
}

function validPrice(value) {
  return Number.isFinite(value) && value >= 1 && value <= 100;
}

function popValue(node) {
  if (!node) return;
  node.classList.remove("value-pop");
  void node.offsetWidth;
  node.classList.add("value-pop");
}

let toastTimer = null;

function showToast(message) {
  if (!els.toast) return;
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2200);
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

function allCountyEntries() {
  const national = countyData.national ? [countyData.national] : [];
  const counties = Array.isArray(countyData.counties) ? countyData.counties : [];
  return [...national, ...counties];
}

function countyEntry(id = selectedCounty) {
  return allCountyEntries().find(item => item.id === id) || countyData.national || null;
}

function countyPriceForFuel(id = selectedCounty, fuel = selectedFuel) {
  const entry = countyEntry(id);
  if (!entry) return null;
  const value = fuel === "diesel" ? entry.diesel : entry.petrol;
  return Number.isFinite(value) ? value : null;
}

function populateCountySelect() {
  if (!els.countySelect) return;
  els.countySelect.innerHTML = "";
  allCountyEntries().forEach(entry => {
    const option = document.createElement("option");
    option.value = entry.id;
    option.textContent = entry.name;
    els.countySelect.appendChild(option);
  });
  els.countySelect.value = selectedCounty;
  if (els.countySource && countyData.source) els.countySource.href = countyData.source;
}

function countyRows() {
  return (Array.isArray(countyData.counties) ? countyData.counties : [])
    .map(item => ({ ...item, price: selectedFuel === "diesel" ? item.diesel : item.petrol }))
    .filter(item => Number.isFinite(item.price));
}

function countyStats() {
  const rows = countyRows().sort((a,b) => a.price - b.price || a.name.localeCompare(b.name, "sv"));
  if (!rows.length) return null;
  const selectedIndex = rows.findIndex(item => item.id === selectedCounty);
  return {
    rows,
    lowest: rows[0],
    highest: rows[rows.length - 1],
    spread: rows[rows.length - 1].price - rows[0].price,
    selectedRank: selectedIndex >= 0 ? selectedIndex + 1 : null
  };
}

function renderCountyExplorer() {
  if (!els.countyList) return;
  const stats = countyStats();
  if (!stats) {
    els.countyList.innerHTML = '<div class="county-row empty">Ingen länsdata tillgänglig.</div>';
    return;
  }

  const q = (els.countySearch?.value || "").trim().toLocaleLowerCase("sv");
  const sortMode = els.countySort?.value || "price-asc";
  const national = countyPriceForFuel("riket");

  let rows = [...stats.rows];
  if (sortMode === "price-desc") rows.sort((a,b) => b.price - a.price || a.name.localeCompare(b.name, "sv"));
  if (sortMode === "name") rows.sort((a,b) => a.name.localeCompare(b.name, "sv"));
  if (q) rows = rows.filter(item => item.name.toLocaleLowerCase("sv").includes(q));

  els.countyList.innerHTML = "";
  const range = Math.max(.01, stats.highest.price - stats.lowest.price);

  rows.forEach(item => {
    const delta = Number.isFinite(national) ? item.price - national : 0;
    const normalized = 12 + ((item.price - stats.lowest.price) / range) * 88;
    const actualRank = stats.rows.findIndex(row => row.id === item.id) + 1;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "county-row" + (item.id === selectedCounty ? " selected" : "");
    button.dataset.county = item.id;
    button.setAttribute("role","listitem");
    if (item.id === selectedCounty) button.setAttribute("aria-current","true");
    button.setAttribute("aria-label", item.name + ", " + fmt(item.price) + " kronor per liter, plats " + actualRank + " av " + stats.rows.length);
    button.innerHTML = `
      <span class="county-row-rank">#${actualRank}</span>
      <span class="county-row-name">${item.name}</span>
      <span class="county-row-bar" aria-hidden="true"><span style="width:${normalized.toFixed(1)}%"></span></span>
      <span class="county-row-price">${fmt(item.price)} kr/l</span>
      <span class="county-row-delta ${delta > .005 ? "positive" : delta < -.005 ? "negative" : ""}">${signed(delta)}</span>
    `;
    button.addEventListener("click", () => {
      selectedCounty = item.id;
      priceMode = "county";
      if (els.countySelect) els.countySelect.value = item.id;
      applyCountyPrice({ announceChange: true });
      renderCountyExplorer();
      document.querySelector("#literpris")?.scrollIntoView({behavior:"smooth",block:"start"});
    });
    els.countyList.appendChild(button);
  });

  if (!rows.length) {
    const empty = document.createElement("div");
    empty.className = "county-row empty";
    empty.textContent = "Inga län matchar sökningen.";
    els.countyList.appendChild(empty);
  }

  const selected = countyEntry();
  const selectedPrice = countyPriceForFuel();
  const low = stats.lowest.price;
  const high = stats.highest.price;
  const position = Number.isFinite(selectedPrice) && high > low
    ? clamp((selectedPrice - low) / (high - low) * 100, 0, 100)
    : 50;

  if (els.countyLowest) els.countyLowest.textContent = fmt(stats.lowest.price) + " kr/l";
  if (els.countyLowestName) els.countyLowestName.textContent = stats.lowest.name;
  if (els.countyHighest) els.countyHighest.textContent = fmt(stats.highest.price) + " kr/l";
  if (els.countyHighestName) els.countyHighestName.textContent = stats.highest.name;
  if (els.countySpread) els.countySpread.textContent = fmt(stats.spread) + " kr/l";
  if (els.countyRank) els.countyRank.textContent = stats.selectedRank ? "#" + stats.selectedRank : "Riket";
  if (els.countyRankDetail) els.countyRankDetail.textContent = stats.selectedRank ? "av " + stats.rows.length + " län, lägst till högst" : "rikssnittet rankas inte";
  if (els.countyPositionName) els.countyPositionName.textContent = selected?.name || "valt län";
  if (els.countyPositionDot) els.countyPositionDot.style.left = position + "%";
  if (els.countyPositionLow) els.countyPositionLow.textContent = fmt(low) + " kr/l";
  if (els.countyPositionHigh) els.countyPositionHigh.textContent = fmt(high) + " kr/l";
  if (els.countyListCount) els.countyListCount.textContent = rows.length + (rows.length === 1 ? " län" : " län");
  if (els.countyCoverage) els.countyCoverage.textContent = stats.rows.length + " / 21 län";
  if (els.countyUpdated) els.countyUpdated.textContent = "Uppdaterat " + (countyData.updatedAt || "—");

  const nationalPrice = countyPriceForFuel("riket");
  const largeDeviation = Number.isFinite(selectedPrice) && Number.isFinite(nationalPrice) &&
    selected?.id !== "riket" && Math.abs(selectedPrice - nationalPrice) / nationalPrice >= .15;

  if (els.countyDataAlert) els.countyDataAlert.hidden = !largeDeviation;
  if (largeDeviation && els.countyDataAlertText) {
    els.countyDataAlertText.textContent =
      (selected?.name || "Valt län") + " avviker mer än 15 % från rikssnittet. Se det som en signal att kontrollera källan och gärna jämföra med ett faktiskt stationspris.";
  }
}

function updateCountyUI() {
  const entry = countyEntry();
  const local = countyPriceForFuel();
  const national = countyPriceForFuel("riket");

  if (els.countySelect && els.countySelect.value !== selectedCounty) {
    els.countySelect.value = selectedCounty;
  }
  if (els.countyPriceLabel) {
    els.countyPriceLabel.textContent = entry?.id === "riket" ? "Rikssnitt" : entry?.name || "Valt län";
  }
  if (els.countyPrice) {
    els.countyPrice.textContent = Number.isFinite(local) ? fmt(local) + " kr/l" : "—";
  }
  if (els.countyDifference) {
    if (!Number.isFinite(local) || !Number.isFinite(national) || entry?.id === "riket") {
      els.countyDifference.textContent = "Prisdata " + (countyData.updatedAt || "");
    } else {
      const delta = local - national;
      const direction = Math.abs(delta) < .005 ? "samma som rikssnittet" : delta < 0 ? "under rikssnittet" : "över rikssnittet";
      els.countyDifference.textContent = signed(delta) + " " + direction;
    }
  }
  if (els.useCountyAverage) {
    els.useCountyAverage.textContent = entry?.id === "riket" ? "Använd rikssnittet" : "Använd länssnittet";
  }

  if (els.priceModeBadge) {
    const labels = { county: entry?.id === "riket" ? "RIKSSNITT" : "LÄNSSNITT", manual: "EGET PRIS", weekly: "VECKOREFERENS" };
    els.priceModeBadge.textContent = labels[priceMode] || "PRIS";
    els.priceModeBadge.classList.toggle("manual", priceMode === "manual");
    els.priceModeBadge.classList.toggle("weekly", priceMode === "weekly");
  }

  const current = parseNumber(els.pumpPrice?.value);
  const local = countyPriceForFuel();
  const national = countyPriceForFuel("riket");
  const setDelta = (node, base, label) => {
    if (!node) return;
    node.classList.remove("up","down");
    if (!validPrice(current) || !Number.isFinite(base)) {
      node.textContent = label + ": —";
      return;
    }
    const delta = current - base;
    node.textContent = label + ": " + signed(delta);
    if (delta > .005) node.classList.add("up");
    if (delta < -.005) node.classList.add("down");
  };
  setDelta(els.manualVsCounty, local, "Mot länssnitt");
  setDelta(els.manualVsNational, national, "Mot rikssnitt");

  renderRecentCounties();
  renderCountyExplorer();
}

function applyCountyPrice({ announceChange = false } = {}) {
  const price = countyPriceForFuel();
  if (!Number.isFinite(price)) return false;
  priceMode = "county";
  els.pumpPrice.value = fmt(price);
  rememberCounty(selectedCounty);
  updateCountyUI();
  update();
  if (announceChange) {
    const entry = countyEntry();
    announce((entry?.name || "Valt område") + ": " + fmt(price) + " kronor per liter för " + fuelData[selectedFuel].label + ".");
  }
  return true;
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

  const local = countyPriceForFuel();
  const national = countyPriceForFuel("riket");
  const entry = countyEntry();

  if (els.marketCountyPrice) els.marketCountyPrice.textContent = Number.isFinite(local) ? fmt(local) + " kr/l" : "—";
  if (els.marketCountyName) els.marketCountyName.textContent = entry?.name || "—";
  if (els.marketNationalPrice) els.marketNationalPrice.textContent = Number.isFinite(national) ? fmt(national) + " kr/l" : "—";
  if (els.marketCountyVsNational) {
    els.marketCountyVsNational.textContent = Number.isFinite(local) && Number.isFinite(national) ? signed(local - national) + " mot rikssnitt" : "—";
  }
  if (els.marketWeeklyCompare) els.marketWeeklyCompare.textContent = Number.isFinite(weeklyPrice) ? fmt(weeklyPrice) + " kr/l" : "—";
  if (els.marketCountyVsWeekly) {
    els.marketCountyVsWeekly.textContent = Number.isFinite(local) && Number.isFinite(weeklyPrice) ? signed(local - weeklyPrice) + " mot länssnitt" : "—";
  }
  if (els.marketDataAge) els.marketDataAge.textContent = formatDataFreshness(countyData.updatedAt);

  return { weeklyPrice, crudeSek };
}

function updateHeroReferenceChips() {
  const national = countyData.national || {};
  if (els.heroPetrolPrice) els.heroPetrolPrice.textContent = Number.isFinite(national.petrol) ? fmt(national.petrol) + " kr/l" : "—";
  if (els.heroDieselPrice) els.heroDieselPrice.textContent = Number.isFinite(national.diesel) ? fmt(national.diesel) + " kr/l" : "—";

  els.heroFuelChips.forEach(chip => {
    chip.classList.toggle("active", chip.dataset.heroFuel === selectedFuel);
  });
}

function updateGauge(price, parts) {
  const [marketBase, energy, carbon, vat] = parts;
  const total = Math.max(price, .01);
  const map = [
    [els.gaugeMarket, marketBase],
    [els.gaugeEnergy, energy],
    [els.gaugeCarbon, carbon],
    [els.gaugeVat, vat]
  ];
  map.forEach(([node, value]) => {
    if (node) node.style.height = Math.max(0, pct(value, total)) + "%";
  });
  if (els.gaugeFuelLabel) els.gaugeFuelLabel.textContent = (fuelData[selectedFuel]?.label || "").toUpperCase();
  if (els.gaugeTotal) els.gaugeTotal.textContent = fmt(price);
}

function updateQuickChips(parts) {
  const [marketBase, energy, carbon, vat] = parts;
  if (els.chipMarket) els.chipMarket.textContent = fmt(marketBase) + " kr/l";
  if (els.chipEnergy) els.chipEnergy.textContent = fmt(energy) + " kr/l";
  if (els.chipCarbon) els.chipCarbon.textContent = fmt(carbon) + " kr/l";
  if (els.chipVat) els.chipVat.textContent = fmt(vat) + " kr/l";
}

function updatePriceStory(price, marketBase, politicalDirect) {
  if (!els.priceStory) return;
  const county = countyEntry();
  const localLabel = county?.id === "riket" ? "rikssnittet" : (county?.name || "valt län");
  const taxPct = pct(politicalDirect, price);
  const marketPct = pct(marketBase, price);
  els.priceStory.textContent =
    "I " + localLabel + " blir " + fmt(price) + " kr/l ungefär " +
    fmt(marketBase) + " kr till marknad/kedja och " + fmt(politicalDirect) +
    " kr till skatt + moms. Det motsvarar " + fmt(marketPct,1) + " % respektive " + fmt(taxPct,1) + " %.";
}

function updateDuel(price, marketBase, politicalDirect) {
  const marketPct = pct(marketBase, price);
  const taxPct = pct(politicalDirect, price);
  if (els.duelMarket) els.duelMarket.style.width = marketPct + "%";
  if (els.duelTax) els.duelTax.style.width = taxPct + "%";
  if (els.duelMarketLabel) els.duelMarketLabel.textContent = fmt(marketPct,1) + " %";
  if (els.duelTaxLabel) els.duelTaxLabel.textContent = fmt(taxPct,1) + " %";
  if (els.duelWinner) {
    const gap = Math.abs(marketPct - taxPct);
    els.duelWinner.textContent = gap < .5
      ? "Nästan jämnt"
      : marketPct > taxPct ? "Marknad/kedja är större" : "Skatt + moms är större";
  }
  if (els.hundredKronaAnalogy) {
    els.hundredKronaAnalogy.textContent =
      "Av varje 100 kr vid pumpen motsvarar cirka " + fmt(taxPct,0) +
      " kr skatt + moms och " + fmt(marketPct,0) + " kr marknad/kedja.";
  }
}

function updateReceipt(price, parts) {
  const [marketBase, energy, carbon, vat] = parts;
  if (els.receiptFuel) els.receiptFuel.textContent = fuelData[selectedFuel]?.label || "Bränsle";
  if (els.receiptMarket) els.receiptMarket.textContent = fmt(marketBase) + " kr";
  if (els.receiptEnergy) els.receiptEnergy.textContent = fmt(energy) + " kr";
  if (els.receiptCarbon) els.receiptCarbon.textContent = fmt(carbon) + " kr";
  if (els.receiptVat) els.receiptVat.textContent = fmt(vat) + " kr";
  if (els.receiptTotal) els.receiptTotal.textContent = fmt(price) + " kr";
}

function receiptSummaryText() {
  const price = getPrice();
  if (price === null) return "";
  const ref = getReference(price);
  const county = countyEntry();
  return [
    "Vad kostar soppan? – 1 liter",
    (fuelData[selectedFuel]?.label || "Bränsle") + " · " + (county?.name || "Hela Sverige"),
    "Pumppris: " + fmt(price) + " kr/l",
    "Marknad/kedja: " + fmt(ref.marketBase) + " kr/l",
    "Energiskatt: " + fmt(ref.fuel.energyTax) + " kr/l",
    "Koldioxidskatt: " + fmt(ref.fuel.carbonTax) + " kr/l",
    "Moms: " + fmt(ref.vat) + " kr/l",
    "Skatt + moms: " + fmt(ref.politicalDirect) + " kr/l",
    window.location.href
  ].join("\n");
}

function updateScenarioMeter(delta) {
  if (!els.scenarioMeterDot || !els.meterDeltaLabel) return;
  if (!Number.isFinite(delta)) {
    els.scenarioMeterDot.style.left = "50%";
    els.scenarioMeterDot.style.background = "var(--muted)";
    els.meterDeltaLabel.textContent = "Ej kvantifierat";
    return;
  }
  const limited = clamp(delta, -5, 5);
  const left = 50 + limited / 5 * 45;
  els.scenarioMeterDot.style.left = left + "%";
  els.scenarioMeterDot.style.background = delta < -.005 ? "var(--good)" : delta > .005 ? "var(--carbon)" : "var(--text)";
  els.meterDeltaLabel.textContent = Math.abs(delta) < .005 ? "Referens" : signed(delta);
}

function buildPartyPills() {
  if (!els.partyPills) return;
  els.partyPills.innerHTML = "";
  const order = ["current","m","s","sd","c","v","kd","l","mp"];
  order.forEach(key => {
    const scenario = politicalScenarios[key];
    if (!scenario) return;
    const modelType = scenario.priceModel?.type || "not_quantified";
    const quantified = ["baseline","party_delta","stated_target"].includes(modelType);
    if (partyFilter === "quantified" && !quantified) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "party-pill";
    button.dataset.party = key;
    button.textContent = key === "current" ? "Nuvarande" : scenario.name;
    button.addEventListener("click", () => {
      if (els.partyScenario) els.partyScenario.value = key;
      syncPartyPills();
      update();
      announce("Politiskt scenario ändrat till " + scenario.name + ".");
    });
    els.partyPills.appendChild(button);
  });
  syncPartyPills();
}

function syncPartyPills() {
  const selected = els.partyScenario?.value || "current";
  els.partyPills?.querySelectorAll(".party-pill").forEach(button => {
    const active = button.dataset.party === selected;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function focusCostPart(part) {
  const indexMap = { market: 0, energy: 1, carbon: 2, vat: 3 };
  const target = indexMap[part];

  els.costChips.forEach(chip => chip.classList.toggle("active", chip.dataset.focusPart === part));
  els.breakdownRows.forEach((row, index) => row.classList.toggle("is-focused", index === target));

  [els.gaugeMarket, els.gaugeEnergy, els.gaugeCarbon, els.gaugeVat].forEach((slice, index) => {
    if (!slice) return;
    slice.classList.toggle("is-focused", index === target);
    slice.classList.toggle("is-dimmed", index !== target);
  });
}

function clearCostFocus() {
  els.costChips.forEach(chip => chip.classList.remove("active"));
  els.breakdownRows.forEach(row => row.classList.remove("is-focused"));
  [els.gaugeMarket, els.gaugeEnergy, els.gaugeCarbon, els.gaugeVat].forEach(slice => {
    slice?.classList.remove("is-focused","is-dimmed");
  });
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
  if (result !== null) popValue(els.scenarioPrice);
  els.compareReference.textContent = fmt(price) + " kr/l";
  els.compareScenario.textContent = result === null ? "Ej beräkningsbart" : fmt(result) + " kr/l";
  if (els.compareScenarioPct) {
    els.compareScenarioPct.textContent = result === null || !price
      ? "—"
      : signed((result - price) / price * 100, " %");
  }
  if (els.politicsReferenceLocation) els.politicsReferenceLocation.textContent = countyEntry()?.name || "Hela Sverige";
  if (els.politicsReferencePrice) els.politicsReferencePrice.textContent = fmt(price) + " kr/l";
  updateScenarioMeter(delta);
  syncPartyPills();

  return { scenario, result, delta };
}

function updateUrl(price) {
  const url = new URL(window.location.href);
  url.searchParams.set("fuel", selectedFuel);
  url.searchParams.set("price", price.toFixed(2));
  url.searchParams.set("county", selectedCounty);
  url.searchParams.set("mode", priceMode);
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
  savePreferences();
}

function update() {
  const price = getPrice();
  if (price === null) return;

  updateCountyUI();

  const reference = getReference(price);
  const { fuel, vat, excise, marketBase, politicalDirect } = reference;
  const energy = fuel.energyTax;
  const carbon = fuel.carbonTax;
  const taxPct = pct(politicalDirect, price);

  els.totalPrice.textContent = fmt(price);
  if (els.headerFuel) els.headerFuel.textContent = fuel.label;
  if (els.headerPrice) els.headerPrice.textContent = fmt(price) + " kr/l";
  if (els.mobileFuel) els.mobileFuel.textContent = fuel.shortLabel || fuel.label;
  if (els.mobilePrice) els.mobilePrice.textContent = fmt(price) + " kr";
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
  popValue(els.totalPrice);
  popValue(els.taxPerLiter);
  els.vatLabel.textContent = fmt(fuel.vatRate, 0) + " % på priset före moms";
  els.periodText.textContent = "Skattesatserna på sidan gäller " + fuel.period + ".";
  els.dataPeriod.textContent = "Skattesatser: " + fuel.period;
  els.barTotal.textContent = fmt(price) + " kr/l";
  els.chainTotal.textContent = fmt(marketBase) + " kr/l";

  els.politicalShareKr.textContent = fmt(politicalDirect) + " kr/l";
  els.politicalSharePct.textContent = fmt(taxPct, 1) + " % av pumppriset";
  els.marketBaseKr.textContent = fmt(marketBase) + " kr/l";

  const marketRefs = updateMarketReferences();
  if (els.crudeShareOfPump) {
    els.crudeShareOfPump.textContent = marketRefs.crudeSek === null ? "—" : fmt(pct(marketRefs.crudeSek, price),1) + " %";
  }
  if (els.bridgeMarket) {
    if (Number.isFinite(marketRefs.weeklyPrice)) {
      const weeklyReference = getReference(marketRefs.weeklyPrice);
      els.bridgeMarket.textContent = fmt(weeklyReference.marketBase) + " kr/l";
      if (els.bridgeGap) {
        els.bridgeGap.textContent = marketRefs.crudeSek === null
          ? "—"
          : fmt(Math.max(0, weeklyReference.marketBase - marketRefs.crudeSek)) + " kr/l";
      }
    } else {
      els.bridgeMarket.textContent = "—";
      if (els.bridgeGap) els.bridgeGap.textContent = "—";
    }
  }

  const parts = [marketBase, energy, carbon, vat];
  updateHeroReferenceChips();
  updateGauge(price, parts);
  updateQuickChips(parts);
  updateReceipt(price, parts);
  updatePriceStory(price, marketBase, politicalDirect);
  updateDuel(price, marketBase, politicalDirect);

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
  const county = params.get("county");
  const mode = params.get("mode");
  const energy = parseNumber(params.get("energy"));
  const carbon = parseNumber(params.get("carbon"));
  const vat = parseNumber(params.get("vat"));
  const rule = parseNumber(params.get("rule"));

  if (fuel && fuelData[fuel]) selectedFuel = fuel;
  if (county && allCountyEntries().some(item => item.id === county)) selectedCounty = county;
  if (["county","manual","weekly"].includes(mode)) priceMode = mode;
  if (party && politicalScenarios[party] && els.partyScenario) els.partyScenario.value = party;

  populateCountySelect();
  if (priceMode === "county") {
    const countyPrice = countyPriceForFuel();
    if (Number.isFinite(countyPrice)) els.pumpPrice.value = fmt(countyPrice);
  } else if (priceMode === "weekly") {
    const weekly = weeklyReferenceForFuel();
    els.pumpPrice.value = fmt(Number.isFinite(weekly) ? weekly : price);
  } else if (validPrice(price)) {
    els.pumpPrice.value = fmt(price);
  }

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
  const allNavLinks = [...els.navLinks, ...els.mobileNavLinks];
  const sections = allNavLinks
    .map(link => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;
    allNavLinks.forEach(link => {
      const active = link.getAttribute("href") === "#" + visible.target.id;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current","page");
      else link.removeAttribute("aria-current");
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
    if (priceMode === "county") {
      const local = countyPriceForFuel();
      if (Number.isFinite(local)) els.pumpPrice.value = fmt(local);
    }
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

els.heroFuelChips.forEach(chip => {
  chip.addEventListener("click", () => {
    const fuel = chip.dataset.heroFuel;
    if (!fuelData[fuel]) return;
    selectedFuel = fuel;
    setFuelTabs();
    syncCustomControlsFromFuel();
    priceMode = "county";
    const reference = countyPriceForFuel();
    if (Number.isFinite(reference)) els.pumpPrice.value = fmt(reference);
    update();
    document.querySelector("#literpris")?.scrollIntoView({ behavior: "smooth", block: "start" });
    announce("Visar " + fuelData[selectedFuel].label + " med " + (countyEntry()?.name || "valt område") + " som prisreferens.");
  });
});

els.costChips.forEach(chip => {
  chip.addEventListener("click", () => {
    const part = chip.dataset.focusPart;
    if (chip.classList.contains("active")) clearCostFocus();
    else focusCostPart(part);
  });
});

els.pumpPrice.addEventListener("input", () => {
  priceMode = "manual";
  update();
});
els.pumpPrice.addEventListener("blur", normalizePumpPrice);

els.useNationalAverage?.addEventListener("click", () => {
  selectedCounty = "riket";
  priceMode = "county";
  if (els.countySelect) els.countySelect.value = "riket";
  applyCountyPrice({ announceChange: true });
});

els.priceNudges.forEach(button => {
  button.addEventListener("click", () => {
    const current = getPrice();
    const delta = Number(button.dataset.priceNudge);
    if (current === null || !Number.isFinite(delta)) return;
    const next = clamp(current + delta, 1, 100);
    priceMode = "manual";
    els.pumpPrice.value = fmt(next);
    update();
    announce("Pumppriset justerades till " + fmt(next) + " kronor per liter.");
  });
});

els.useWeeklyReference?.addEventListener("click", () => {
  const reference = weeklyReferenceForFuel();
  if (!Number.isFinite(reference)) return;
  els.pumpPrice.value = fmt(reference);
  priceMode = "weekly";
  update();
  announce("Veckoreferensen " + fmt(reference) + " kronor per liter används för " + fuelData[selectedFuel].label + ".");
});

els.countySearch?.addEventListener("input", renderCountyExplorer);
els.countySort?.addEventListener("change", renderCountyExplorer);
els.countyFocusSelected?.addEventListener("click", () => {
  if (selectedCounty === "riket") {
    if (els.countySearch) els.countySearch.value = "";
    renderCountyExplorer();
    return;
  }
  const selected = countyEntry();
  if (els.countySearch && selected) els.countySearch.value = selected.name.replace(" län","");
  renderCountyExplorer();
});

els.countySelect?.addEventListener("change", () => {
  selectedCounty = els.countySelect.value;
  applyCountyPrice({ announceChange: true });
  rememberCounty(selectedCounty);
});

els.useCountyAverage?.addEventListener("click", () => {
  applyCountyPrice({ announceChange: true });
});

els.contrastToggle?.addEventListener("click", () => {
  const active = document.documentElement.classList.toggle("high-contrast");
  els.contrastToggle.setAttribute("aria-pressed", String(active));
  savePreferences();
  showToast(active ? "Hög kontrast är på." : "Hög kontrast är av.");
});

document.addEventListener("keydown", event => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  const tag = document.activeElement?.tagName;
  const typing = ["INPUT","TEXTAREA","SELECT"].includes(tag);
  if (event.key === "/" && !typing) {
    event.preventDefault();
    els.countySearch?.focus();
  }
  if (event.key.toLowerCase() === "p" && !typing) {
    event.preventDefault();
    els.pumpPrice?.focus();
    els.pumpPrice?.select();
  }
});

els.clearPreferences?.addEventListener("click", () => {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
  recentCounties = [];
  renderRecentCounties();
  announce("Sparade val har rensats.");
});

if (els.partyScenario) {
  els.partyScenario.addEventListener("change", () => {
    syncPartyPills();
    update();
    const scenario = politicalScenarios[els.partyScenario.value];
    announce("Politiskt scenario ändrat till " + (scenario?.name || "valt scenario") + ".");
  });
}

bindPair(els.energySlider, els.energyNumber);
bindPair(els.carbonSlider, els.carbonNumber);
bindPair(els.vatSlider, els.vatNumber);
bindPair(els.regulatorySlider, els.regulatoryNumber);

els.partyFilterButtons.forEach(button => {
  button.addEventListener("click", () => {
    partyFilter = button.dataset.partyFilter || "all";
    els.partyFilterButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    buildPartyPills();
  });
});

els.presetButtons.forEach(button => {
  button.addEventListener("click", () => {
    const fuel = fuelData[selectedFuel];
    if (!fuel) return;
    if (button.dataset.preset === "zero-excise") {
      els.energySlider.value = 0;
      els.carbonSlider.value = 0;
    } else if (button.dataset.preset === "half-excise") {
      els.energySlider.value = (fuel.energyTax / 2).toFixed(2);
      els.carbonSlider.value = (fuel.carbonTax / 2).toFixed(2);
    } else if (button.dataset.preset === "zero-vat") {
      els.vatSlider.value = 0;
    } else if (button.dataset.preset === "standard-vat") {
      els.vatSlider.value = 25;
    }
    syncPair(els.energySlider, els.energyNumber);
    syncPair(els.carbonSlider, els.carbonNumber);
    update();
    announce(button.textContent + " är aktiverat i det egna scenariot.");
  });
});

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
    showToast("Länken är kopierad.");
  } catch {
    els.copyStatus.textContent = "Kunde inte kopiera länken.";
  }
}

els.copyScenarioLink?.addEventListener("click", copyCurrentScenarioLink);

els.copyReceipt?.addEventListener("click", async () => {
  const textValue = receiptSummaryText();
  if (!textValue) return;
  try {
    await navigator.clipboard.writeText(textValue);
    showToast("Kvittot är kopierat.");
    announce("Kvittot är kopierat.");
  } catch {
    showToast("Kunde inte kopiera kvittot.");
  }
});

els.shareReceipt?.addEventListener("click", async () => {
  const textValue = receiptSummaryText();
  if (!textValue) return;
  if (navigator.share) {
    try {
      await navigator.share({
        title: "Vad kostar soppan?",
        text: textValue,
        url: window.location.href
      });
      showToast("Delningsrutan öppnades.");
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
  }
  try {
    await navigator.clipboard.writeText(window.location.href);
    showToast("Delning stöds inte här – länken kopierades.");
  } catch {
    showToast("Kunde inte dela.");
  }
});

els.printReceipt?.addEventListener("click", () => {
  window.print();
});

els.resetAll?.addEventListener("click", () => {
  selectedFuel = siteData.defaultFuel || "petrol";
  selectedCounty = "riket";
  priceMode = "county";
  const nationalPrice = countyPriceForFuel("riket", selectedFuel);
  els.pumpPrice.value = fmt(Number.isFinite(nationalPrice) ? nationalPrice : (siteData.defaultPumpPrice || 17.43));
  if (els.partyScenario) els.partyScenario.value = "current";
  if (els.countySelect) els.countySelect.value = selectedCounty;
  setFuelTabs();
  syncCustomControlsFromFuel();
  update();
  announce("Sidan är återställd till standardvärden.");
});

populateCountySelect();
loadSavedPreferences();
loadStateFromUrl();
updateCountyUI();
renderRecentCounties();
if (els.dataFreshness) els.dataFreshness.textContent = formatDataFreshness(countyData.updatedAt);

if (els.dataVersion) els.dataVersion.textContent = siteData.dataVersion || "—";
if (els.factCheckDate) els.factCheckDate.textContent = siteData.lastFactCheck || "—";
if (els.appVersion) els.appVersion.textContent = siteData.appVersion || "—";
validateDatasets();

buildPartyPills();
setupNavObserver();
updateMarketReferences();
updateHeroReferenceChips();
update();


if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
