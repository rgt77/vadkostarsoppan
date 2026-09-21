const fuelData = window.FUEL_DATA || {};
const siteData = window.SITE_DATA || {};
const marketData = window.MARKET_DATA || {};
const countyData = window.COUNTY_PRICES || {};
const glossaryData = window.GLOSSARY_DATA || [];
const politicalScenarios = window.POLICY_SCENARIOS || {};

let selectedFuel = siteData.defaultFuel || "petrol";
let selectedCounty = "riket";
let priceMode = "county";
let recentCounties = [];
let favoriteCounties = [];
let favoritesOnly = false;
let partyFilter = "all";
let compareA = "stockholm";
let compareB = "ostergotland";
let sourceRegistry = null;
let sourceFilter = "all";
let glossaryFilter = "all";
let deferredInstallPrompt = null;
let serviceWorkerRegistration = null;
let viewMode = "simple";
let lightTheme = false;
let reducedMotion = false;
let lowDataMode = false;
let displayPrecision = 2;
let commandActiveIndex = 0;
let commandItems = [];
let stateHistory = [];
let redoHistory = [];
let historyTimer = null;
let isApplyingHistory = false;

const els = {
  pumpPrice: document.querySelector("#pumpPrice"),
  headerFuel: document.querySelector("#headerFuel"),
  headerPrice: document.querySelector("#headerPrice"),
  mobileFuel: document.querySelector("#mobileFuel"),
  mobilePrice: document.querySelector("#mobilePrice"),
  contrastToggle: document.querySelector("#contrastToggle"),
  themeToggle: document.querySelector("#themeToggle"),
  simpleMode: document.querySelector("#simpleMode"),
  expertMode: document.querySelector("#expertMode"),
  simpleExplainerText: document.querySelector("#simpleExplainerText"),
  marketShockSlider: document.querySelector("#marketShockSlider"),
  marketShockLabel: document.querySelector("#marketShockLabel"),
  marketShockPresets: [...document.querySelectorAll("[data-market-shock]")],
  shockBasePrice: document.querySelector("#shockBasePrice"),
  shockBaseMarket: document.querySelector("#shockBaseMarket"),
  shockScenarioPrice: document.querySelector("#shockScenarioPrice"),
  shockScenarioMarket: document.querySelector("#shockScenarioMarket"),
  shockDelta: document.querySelector("#shockDelta"),
  shockPassThrough: document.querySelector("#shockPassThrough"),
  shockMarketBar: document.querySelector("#shockMarketBar"),
  shockTaxBar: document.querySelector("#shockTaxBar"),
  shockVatBar: document.querySelector("#shockVatBar"),
  targetPriceInput: document.querySelector("#targetPriceInput"),
  targetPriceSlider: document.querySelector("#targetPriceSlider"),
  targetCurrentMarket: document.querySelector("#targetCurrentMarket"),
  targetRequiredMarket: document.querySelector("#targetRequiredMarket"),
  targetMarketDelta: document.querySelector("#targetMarketDelta"),
  targetMarketDeltaPct: document.querySelector("#targetMarketDeltaPct"),
  targetMechanicalFloor: document.querySelector("#targetMechanicalFloor"),
  targetMessage: document.querySelector("#targetMessage"),
  targetPresets: [...document.querySelectorAll("[data-target-delta]")],
  curveCurrentPrice: document.querySelector("#curveCurrentPrice"),
  curveCurrentTax: document.querySelector("#curveCurrentTax"),
  curveCurrentShare: document.querySelector("#curveCurrentShare"),
  curveExcise: document.querySelector("#curveExcise"),
  taxSharePolyline: document.querySelector("#taxSharePolyline"),
  taxShareDot: document.querySelector("#taxShareDot"),
  curveDotLabel: document.querySelector("#curveDotLabel"),
  reportHeading: document.querySelector("#reportHeading"),
  reportVersion: document.querySelector("#reportVersion"),
  reportPrice: document.querySelector("#reportPrice"),
  reportTax: document.querySelector("#reportTax"),
  reportMarket: document.querySelector("#reportMarket"),
  reportEnergy: document.querySelector("#reportEnergy"),
  reportCarbon: document.querySelector("#reportCarbon"),
  reportVat: document.querySelector("#reportVat"),
  reportMode: document.querySelector("#reportMode"),
  reportPolicy: document.querySelector("#reportPolicy"),
  reportDate: document.querySelector("#reportDate"),
  reportSummary: document.querySelector("#reportSummary"),
  copyReportText: document.querySelector("#copyReportText"),
  copyReportMarkdown: document.querySelector("#copyReportMarkdown"),
  printReport: document.querySelector("#printReport"),
  settingsOpen: document.querySelector("#settingsOpen"),
  commandOpen: document.querySelector("#commandOpen"),
  commandDialog: document.querySelector("#commandDialog"),
  commandSearch: document.querySelector("#commandSearch"),
  commandList: document.querySelector("#commandList"),
  settingsDialog: document.querySelector("#settingsDialog"),
  reducedMotionToggle: document.querySelector("#reducedMotionToggle"),
  lowDataToggle: document.querySelector("#lowDataToggle"),
  expertModeToggle: document.querySelector("#expertModeToggle"),
  lightThemeToggle: document.querySelector("#lightThemeToggle"),
  highContrastToggle: document.querySelector("#highContrastToggle"),
  precisionSelect: document.querySelector("#precisionSelect"),
  resetSettings: document.querySelector("#resetSettings"),
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
  compareCountyA: document.querySelector("#compareCountyA"),
  compareCountyB: document.querySelector("#compareCountyB"),
  swapCounties: document.querySelector("#swapCounties"),
  compareNameA: document.querySelector("#compareNameA"),
  compareNameB: document.querySelector("#compareNameB"),
  comparePriceA: document.querySelector("#comparePriceA"),
  comparePriceB: document.querySelector("#comparePriceB"),
  compareBreakdownA: document.querySelector("#compareBreakdownA"),
  compareBreakdownB: document.querySelector("#compareBreakdownB"),
  compareCountyDelta: document.querySelector("#compareCountyDelta"),
  compareCountyDeltaPct: document.querySelector("#compareCountyDeltaPct"),
  compareBarNameA: document.querySelector("#compareBarNameA"),
  compareBarNameB: document.querySelector("#compareBarNameB"),
  compareBarA: document.querySelector("#compareBarA"),
  compareBarB: document.querySelector("#compareBarB"),
  useCompareA: document.querySelector("#useCompareA"),
  useCompareB: document.querySelector("#useCompareB"),
  copyCountyCompare: document.querySelector("#copyCountyCompare"),
  downloadCountyCsv: document.querySelector("#downloadCountyCsv"),
  copyCountyTable: document.querySelector("#copyCountyTable"),
  downloadScenarioJson: document.querySelector("#downloadScenarioJson"),
  undoState: document.querySelector("#undoState"),
  redoState: document.querySelector("#redoState"),
  historyStatus: document.querySelector("#historyStatus"),
  countyMedian: document.querySelector("#countyMedian"),
  countyQ1: document.querySelector("#countyQ1"),
  countyQ3: document.querySelector("#countyQ3"),
  countyPercentile: document.querySelector("#countyPercentile"),
  countyPercentileDetail: document.querySelector("#countyPercentileDetail"),
  countyHistogram: document.querySelector("#countyHistogram"),
  distributionNote: document.querySelector("#distributionNote"),
  countyRecent: document.querySelector("#countyRecent"),
  countyFavorites: document.querySelector("#countyFavorites"),
  countyFavoritesOnly: document.querySelector("#countyFavoritesOnly"),
  toggleCountyFavorite: document.querySelector("#toggleCountyFavorite"),
  favoriteCompareGrid: document.querySelector("#favoriteCompareGrid"),
  favoriteCompareSummary: document.querySelector("#favoriteCompareSummary"),
  priceModeBadge: document.querySelector("#priceModeBadge"),
  manualVsCounty: document.querySelector("#manualVsCounty"),
  manualVsNational: document.querySelector("#manualVsNational"),
  clearPreferences: document.querySelector("#clearPreferences"),
  dataFreshness: document.querySelector("#dataFreshness"),
  dataHealth: document.querySelector("#dataHealth"),
  dataHealthDetail: document.querySelector("#dataHealthDetail"),
  dataHealthDot: document.querySelector("#dataHealthDot"),
  appVersion: document.querySelector("#appVersion"),
  networkPill: document.querySelector("#networkPill"),
  networkStatus: document.querySelector("#networkStatus"),
  installApp: document.querySelector("#installApp"),
  updateApp: document.querySelector("#updateApp"),
  refreshData: document.querySelector("#refreshData"),
  runDiagnostics: document.querySelector("#runDiagnostics"),
  diagnostics: document.querySelector("#diagnostics"),
  diagnosticsTitle: document.querySelector("#diagnosticsTitle"),
  diagnosticsOutput: document.querySelector("#diagnosticsOutput"),
  registryList: document.querySelector("#registryList"),
  registryPlanned: document.querySelector("#registryPlanned"),
  registryCount: document.querySelector("#registryCount"),
  registryStatus: document.querySelector("#registryStatus"),
  registryFilters: [...document.querySelectorAll("[data-source-filter]")],
  glossarySearch: document.querySelector("#glossarySearch"),
  glossaryFilters: document.querySelector("#glossaryFilters"),
  glossaryGrid: document.querySelector("#glossaryGrid"),
  glossarySpotlight: document.querySelector("#glossarySpotlight"),
  glossarySpotlightTerm: document.querySelector("#glossarySpotlightTerm"),
  glossarySpotlightText: document.querySelector("#glossarySpotlightText"),
  welcomeDialog: document.querySelector("#welcomeDialog"),
  welcomeStart: document.querySelector("#welcomeStart"),
  welcomeSkip: document.querySelector("#welcomeSkip"),
  openTour: document.querySelector("#openTour"),
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
  policyDiffGrid: document.querySelector("#policyDiffGrid"),
  policyDiffStatus: document.querySelector("#policyDiffStatus"),
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
  saveSnapshot: document.querySelector("#saveSnapshot"),
  clearSnapshots: document.querySelector("#clearSnapshots"),
  savedSnapshots: document.querySelector("#savedSnapshots"),
  navLinks: [...document.querySelectorAll(".nav a")]
};

const fmt = (value, digits = displayPrecision) =>
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
const TOUR_KEY = "vadkostarsoppan.tourSeen.v1";
const SNAPSHOT_KEY = "vadkostarsoppan.snapshots.v1";
let snapshots = [];

function loadSavedPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (saved.fuel && fuelData[saved.fuel]) selectedFuel = saved.fuel;
    if (saved.county && allCountyEntries().some(item => item.id === saved.county)) selectedCounty = saved.county;
    if (["county","manual","weekly"].includes(saved.mode)) priceMode = saved.mode;
    if (Array.isArray(saved.recent)) {
      recentCounties = saved.recent.filter(id => allCountyEntries().some(item => item.id === id)).slice(0,4);
    }
    if (Array.isArray(saved.favorites)) {
      favoriteCounties = saved.favorites.filter(id => countyEntry(id)?.id !== "riket").slice(0,8);
    }
    if (saved.manualPrice && validPrice(Number(saved.manualPrice)) && priceMode === "manual") {
      els.pumpPrice.value = fmt(Number(saved.manualPrice));
    }
    if (saved.highContrast) document.documentElement.classList.add("high-contrast");
    if (saved.lightTheme) {
      lightTheme = true;
      document.documentElement.classList.add("light-theme");
    }
    if (saved.viewMode === "expert") viewMode = "expert";
    reducedMotion = Boolean(saved.reducedMotion);
    lowDataMode = Boolean(saved.lowDataMode);
    if ([1,2].includes(Number(saved.displayPrecision))) displayPrecision = Number(saved.displayPrecision);
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
      favorites: favoriteCounties,
      highContrast: document.documentElement.classList.contains("high-contrast"),
      lightTheme,
      viewMode,
      reducedMotion,
      lowDataMode,
      displayPrecision
    }));
  } catch {}
}

function toggleFavoriteCounty(id = selectedCounty) {
  if (!id || id === "riket") {
    showToast("Rikssnittet behöver inte sparas som favorit.");
    return;
  }
  if (favoriteCounties.includes(id)) {
    favoriteCounties = favoriteCounties.filter(item => item !== id);
    showToast("Länet togs bort från favoriter.");
  } else {
    favoriteCounties = [id, ...favoriteCounties.filter(item => item !== id)].slice(0,8);
    showToast("Länet sparades som favorit.");
  }
  savePreferences();
  renderFavoriteCounties();
  renderFavoriteComparison();
  renderCountyExplorer();
  updateCountyUI();
}

function renderFavoriteCounties() {
  if (!els.countyFavorites) return;
  els.countyFavorites.innerHTML = "";
  if (!favoriteCounties.length) {
    const span = document.createElement("span");
    span.className = "county-favorite-empty";
    span.textContent = "Inga ännu";
    els.countyFavorites.appendChild(span);
    return;
  }
  favoriteCounties.forEach(id => {
    const item = countyEntry(id);
    if (!item) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "recent-county" + (id === selectedCounty ? " active" : "");
    button.textContent = "★ " + item.name.replace(" län","");
    button.addEventListener("click", () => {
      selectedCounty = id;
      priceMode = "county";
      if (els.countySelect) els.countySelect.value = id;
      applyCountyPrice({announceChange:true});
    });
    els.countyFavorites.appendChild(button);
  });
}

function renderFavoriteComparison() {
  if (!els.favoriteCompareGrid) return;
  els.favoriteCompareGrid.innerHTML = "";
  const rows = favoriteCounties
    .map(id => countyEntry(id))
    .filter(Boolean)
    .map(entry => ({
      entry,
      price: countyPriceForFuel(entry.id)
    }))
    .filter(item => Number.isFinite(item.price))
    .sort((a,b)=>a.price-b.price);

  if (rows.length < 2) {
    const empty = document.createElement("div");
    empty.className = "saved-empty";
    empty.textContent = "Spara minst två län som favoriter för att jämföra dem här.";
    els.favoriteCompareGrid.appendChild(empty);
    if (els.favoriteCompareSummary) els.favoriteCompareSummary.textContent = "Spara minst två län som favoriter.";
    return;
  }

  const min = rows[0].price;
  const max = rows[rows.length-1].price;
  if (els.favoriteCompareSummary) {
    els.favoriteCompareSummary.textContent =
      rows.length + " län · spridning " + fmt(max-min) + " kr/l";
  }

  rows.forEach((item,index) => {
    const card = document.createElement("article");
    card.className = "favorite-compare-card";
    if (index === 0) card.classList.add("lowest");
    if (index === rows.length-1) card.classList.add("highest");
    card.innerHTML = `
      <span>${index === 0 ? "LÄGST AV DINA" : index === rows.length-1 ? "HÖGST AV DINA" : "FAVORIT"}</span>
      <strong>${fmt(item.price)} kr/l</strong>
      <small>${item.entry.name}</small>
      <button type="button">Använd priset</button>
    `;
    card.querySelector("button").addEventListener("click", () => {
      selectedCounty = item.entry.id;
      priceMode = "county";
      if (els.countySelect) els.countySelect.value = selectedCounty;
      applyCountyPrice({announceChange:true});
      jumpToSection("#literpris");
    });
    els.favoriteCompareGrid.appendChild(card);
  });
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

function maybeShowWelcome() {
  if (!els.welcomeDialog || typeof els.welcomeDialog.showModal !== "function") return;
  try {
    if (localStorage.getItem(TOUR_KEY) === "1") return;
  } catch {}
  requestAnimationFrame(() => els.welcomeDialog.showModal());
}

function closeWelcome({ remember = false, jump = false } = {}) {
  if (remember) {
    try { localStorage.setItem(TOUR_KEY, "1"); } catch {}
  }
  if (els.welcomeDialog?.open) els.welcomeDialog.close();
  if (jump) {
    document.querySelector("#literpris")?.scrollIntoView({behavior:"smooth",block:"start"});
    setTimeout(() => els.countySelect?.focus(), 350);
  }
}

function loadSnapshots() {
  try {
    const stored = JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || "[]");
    snapshots = Array.isArray(stored) ? stored.slice(0,5) : [];
  } catch {
    snapshots = [];
  }
}

function saveSnapshots() {
  try { localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshots.slice(0,5))); } catch {}
}

function currentSnapshot() {
  const price = getPrice();
  if (price === null) return null;
  return {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    fuel: selectedFuel,
    county: selectedCounty,
    priceMode,
    price,
    party: els.partyScenario?.value || "current",
    energy: Number(els.energySlider?.value),
    carbon: Number(els.carbonSlider?.value),
    vat: Number(els.vatSlider?.value),
    regulatory: Number(els.regulatorySlider?.value)
  };
}

function renderSnapshots() {
  if (!els.savedSnapshots) return;
  els.savedSnapshots.innerHTML = "";
  if (!snapshots.length) {
    const empty = document.createElement("div");
    empty.className = "saved-empty";
    empty.textContent = "Inga sparade lägen ännu. Tryck “Spara läget” i Literlabbet.";
    els.savedSnapshots.appendChild(empty);
    return;
  }

  snapshots.forEach((snap,index) => {
    const county = countyEntry(snap.county);
    const card = document.createElement("article");
    card.className = "saved-card";
    card.innerHTML = `
      <span class="saved-kicker">LÄGE ${index+1}</span>
      <strong>${fmt(snap.price)} kr/l</strong>
      <small>${fuelData[snap.fuel]?.label || snap.fuel} · ${county?.name || "Hela Sverige"}</small>
      <small>${snap.party && snap.party !== "current" ? "Scenario: " + (politicalScenarios[snap.party]?.name || snap.party) : "Nuvarande regler"}</small>
      <div class="saved-card-actions">
        <button type="button" data-action="apply">Öppna</button>
        <button type="button" data-action="delete">Ta bort</button>
      </div>
    `;
    card.querySelector('[data-action="apply"]').addEventListener("click", () => applySnapshot(snap));
    card.querySelector('[data-action="delete"]').addEventListener("click", () => {
      snapshots = snapshots.filter(item => item.id !== snap.id);
      saveSnapshots();
      renderSnapshots();
      showToast("Sparat läge borttaget.");
    });
    els.savedSnapshots.appendChild(card);
  });
}

function applySnapshot(snap) {
  if (!snap) return;
  if (fuelData[snap.fuel]) selectedFuel = snap.fuel;
  if (countyEntry(snap.county)) selectedCounty = snap.county;
  priceMode = ["county","manual","weekly"].includes(snap.priceMode) ? snap.priceMode : "manual";
  if (els.countySelect) els.countySelect.value = selectedCounty;
  if (validPrice(Number(snap.price))) els.pumpPrice.value = fmt(Number(snap.price));
  if (els.partyScenario && politicalScenarios[snap.party]) els.partyScenario.value = snap.party;

  const applyValue = (range,number,value,min,max) => {
    if (!range || !number || !Number.isFinite(Number(value))) return;
    const safe = clamp(Number(value),min,max);
    range.value = safe;
    number.value = safe;
  };
  applyValue(els.energySlider,els.energyNumber,snap.energy,0,6);
  applyValue(els.carbonSlider,els.carbonNumber,snap.carbon,0,6);
  applyValue(els.vatSlider,els.vatNumber,snap.vat,0,30);
  applyValue(els.regulatorySlider,els.regulatoryNumber,snap.regulatory,-3,8);

  setFuelTabs();
  syncPartyPills();
  update();
  showToast("Sparat läge öppnat.");
  document.querySelector("#literpris")?.scrollIntoView({behavior:"smooth",block:"start"});
}

function sourceTypeLabel(type) {
  return {
    official: "OFFICIELL",
    derived_from_official: "HÄRLEDD",
    community_reported_secondary: "COMMUNITY"
  }[type] || String(type || "KÄLLA").toUpperCase();
}

function renderSourceRegistry() {
  if (!els.registryList) return;
  const sources = Array.isArray(sourceRegistry?.sources) ? sourceRegistry.sources : [];
  const planned = Array.isArray(sourceRegistry?.planned_sources) ? sourceRegistry.planned_sources : [];
  const visible = sourceFilter === "all" ? sources : sources.filter(source => source.authority === sourceFilter);

  els.registryList.innerHTML = "";
  visible.forEach(source => {
    const card = document.createElement("article");
    card.className = "registry-card";
    card.innerHTML = `
      <div class="registry-card-top">
        <span class="registry-type ${source.authority || ""}">${sourceTypeLabel(source.authority)}</span>
        <small>${source.update_frequency || "—"}</small>
      </div>
      <strong>${source.name || source.id}</strong>
      <p>Roll: ${String(source.role || "—").replaceAll("_"," ")}</p>
      ${source.note ? "<p>"+source.note+"</p>" : ""}
      <a href="${source.url}" target="_blank" rel="noopener">Öppna källa ↗</a>
    `;
    els.registryList.appendChild(card);
  });

  if (!visible.length) {
    const empty = document.createElement("div");
    empty.className = "registry-empty";
    empty.textContent = "Inga källor i det här filtret.";
    els.registryList.appendChild(empty);
  }

  if (els.registryPlanned) {
    els.registryPlanned.innerHTML = "";
    planned.forEach(item => {
      const div = document.createElement("div");
      div.className = "registry-gap";
      div.innerHTML = "<strong>" + String(item.role || "Datakälla").replaceAll("_"," ") + "</strong><br>" + (item.note || "");
      els.registryPlanned.appendChild(div);
    });
  }
  if (els.registryCount) els.registryCount.textContent = sources.length + " källor";
  if (els.registryStatus) els.registryStatus.textContent = sources.length ? "Register laddat" : "Register saknas";
}

async function loadSourceRegistry() {
  if (!els.registryList) return;
  try {
    const response = await fetch("/data-sources.json", {cache:"no-store"});
    if (!response.ok) throw new Error("HTTP " + response.status);
    sourceRegistry = await response.json();
    renderSourceRegistry();
  } catch {
    if (els.registryStatus) els.registryStatus.textContent = "Kunde inte ladda register";
    if (els.registryList) els.registryList.innerHTML = '<div class="registry-empty">Källregistret kunde inte laddas just nu.</div>';
  }
}

function updateNetworkStatus() {
  const online = navigator.onLine;
  if (els.networkStatus) els.networkStatus.textContent = online ? "Online" : "Offline";
  if (els.networkPill) els.networkPill.classList.toggle("offline", !online);
}

async function installPwa() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  try {
    await deferredInstallPrompt.userChoice;
  } catch {}
  deferredInstallPrompt = null;
  if (els.installApp) els.installApp.hidden = true;
}

async function checkForAppUpdate({ reload = false } = {}) {
  if (!serviceWorkerRegistration) {
    if (reload) window.location.reload();
    return;
  }
  try {
    await serviceWorkerRegistration.update();
    if (reload) {
      showToast("Kontrollerade ny version.");
      setTimeout(() => window.location.reload(), 350);
    }
  } catch {
    if (reload) showToast("Kunde inte kontrollera ny version.");
  }
}

function captureHistoryState() {
  const price = getPrice();
  if (price === null) return null;
  return {
    fuel: selectedFuel,
    county: selectedCounty,
    priceMode,
    price,
    party: els.partyScenario?.value || "current",
    compareA,
    compareB,
    energy: Number(els.energySlider?.value),
    carbon: Number(els.carbonSlider?.value),
    vat: Number(els.vatSlider?.value),
    regulatory: Number(els.regulatorySlider?.value)
  };
}

function historyKey(state) {
  return state ? JSON.stringify(state) : "";
}

function updateHistoryControls() {
  if (els.undoState) els.undoState.disabled = stateHistory.length < 2;
  if (els.redoState) els.redoState.disabled = redoHistory.length === 0;
  if (els.historyStatus) {
    els.historyStatus.textContent = stateHistory.length
      ? Math.min(stateHistory.length,20) + " lägen i historiken"
      : "Historik redo";
  }
}

function commitHistoryNow() {
  if (isApplyingHistory) return;
  const state = captureHistoryState();
  if (!state) return;
  const last = stateHistory[stateHistory.length - 1];
  if (historyKey(last) === historyKey(state)) return;
  stateHistory.push(state);
  if (stateHistory.length > 20) stateHistory.shift();
  redoHistory = [];
  updateHistoryControls();
}

function scheduleHistoryCommit() {
  if (isApplyingHistory) return;
  clearTimeout(historyTimer);
  historyTimer = setTimeout(commitHistoryNow, 450);
}

function applyHistoryState(state) {
  if (!state) return;
  isApplyingHistory = true;
  selectedFuel = fuelData[state.fuel] ? state.fuel : selectedFuel;
  selectedCounty = countyEntry(state.county) ? state.county : selectedCounty;
  priceMode = ["county","manual","weekly"].includes(state.priceMode) ? state.priceMode : "manual";
  compareA = countyEntry(state.compareA) ? state.compareA : compareA;
  compareB = countyEntry(state.compareB) ? state.compareB : compareB;

  if (els.countySelect) els.countySelect.value = selectedCounty;
  if (els.compareCountyA) els.compareCountyA.value = compareA;
  if (els.compareCountyB) els.compareCountyB.value = compareB;
  if (validPrice(Number(state.price))) els.pumpPrice.value = fmt(Number(state.price));
  if (els.partyScenario && politicalScenarios[state.party]) els.partyScenario.value = state.party;

  const setControl = (range,number,value,min,max) => {
    if (!range || !number || !Number.isFinite(Number(value))) return;
    const safe = clamp(Number(value),min,max);
    range.value = safe;
    number.value = safe;
  };
  setControl(els.energySlider,els.energyNumber,state.energy,0,6);
  setControl(els.carbonSlider,els.carbonNumber,state.carbon,0,6);
  setControl(els.vatSlider,els.vatNumber,state.vat,0,30);
  setControl(els.regulatorySlider,els.regulatoryNumber,state.regulatory,-3,8);

  setFuelTabs();
  syncPartyPills();
  update();
  isApplyingHistory = false;
  updateHistoryControls();
}

function undoCalculatorState() {
  if (stateHistory.length < 2) return;
  clearTimeout(historyTimer);
  const current = stateHistory.pop();
  redoHistory.push(current);
  applyHistoryState(stateHistory[stateHistory.length - 1]);
  showToast("Senaste ändringen ångrades.");
}

function redoCalculatorState() {
  if (!redoHistory.length) return;
  clearTimeout(historyTimer);
  const next = redoHistory.pop();
  stateHistory.push(next);
  applyHistoryState(next);
  showToast("Ändringen gjordes om.");
}

function runDiagnostics() {
  const checks = [];
  const push = (name, ok, detail = "") => checks.push({name,ok,detail});

  push("Bränsledata", Boolean(fuelData.petrol && fuelData.diesel), "bensin + diesel");
  push("Länstäckning", countyRows().length === 21, countyRows().length + " av 21 län");
  push("Unika län", new Set(countyRows().map(item => item.id)).size === countyRows().length);
  push("Rikssnitt", Number.isFinite(countyData.national?.petrol) && Number.isFinite(countyData.national?.diesel));
  push("Veckoreferens", Number.isFinite(marketData.weeklyReference?.petrol) && Number.isFinite(marketData.weeklyReference?.diesel));
  push("Brent", Number.isFinite(marketData.brent?.usdPerBarrel));
  push("USD/SEK", Number.isFinite(marketData.fx?.usdSek));
  push("Politikreferens", Boolean(politicalScenarios.current));
  push("Pumppris", getPrice() !== null, getPrice() !== null ? fmt(getPrice()) + " kr/l" : "ogiltigt");
  push("Service worker", "serviceWorker" in navigator);
  push("Online-status", typeof navigator.onLine === "boolean", navigator.onLine ? "online" : "offline");

  const failed = checks.filter(item => !item.ok);
  if (els.diagnostics) els.diagnostics.hidden = false;
  if (els.diagnosticsTitle) els.diagnosticsTitle.textContent = failed.length ? "Självtest: kontrollera" : "Självtest: PASS";
  if (els.diagnosticsOutput) {
    els.diagnosticsOutput.textContent = checks.map(item =>
      (item.ok ? "✓ " : "✕ ") + item.name + (item.detail ? " — " + item.detail : "")
    ).join("\n");
  }
  showToast(failed.length ? failed.length + " kontrollpunkter behöver ses över." : "Självtest klart: allt ser bra ut.");
  return {checks, failed};
}

function applyViewMode() {
  const expert = viewMode === "expert";
  document.body.classList.toggle("expert-mode", expert);
  document.body.classList.toggle("simple-mode", !expert);
  if (els.simpleMode) els.simpleMode.setAttribute("aria-pressed", String(!expert));
  if (els.expertMode) els.expertMode.setAttribute("aria-pressed", String(expert));
}

function applyPreferenceClasses() {
  document.documentElement.classList.toggle("reduced-motion", reducedMotion);
  document.documentElement.classList.toggle("low-data", lowDataMode);
  if (els.reducedMotionToggle) els.reducedMotionToggle.checked = reducedMotion;
  if (els.lowDataToggle) els.lowDataToggle.checked = lowDataMode;
  if (els.expertModeToggle) els.expertModeToggle.checked = viewMode === "expert";
  if (els.lightThemeToggle) els.lightThemeToggle.checked = lightTheme;
  if (els.highContrastToggle) els.highContrastToggle.checked = document.documentElement.classList.contains("high-contrast");
  if (els.precisionSelect) els.precisionSelect.value = String(displayPrecision);
}

function applyThemeState() {
  document.documentElement.classList.toggle("light-theme", lightTheme);
  if (els.themeToggle) {
    els.themeToggle.setAttribute("aria-pressed", String(lightTheme));
    els.themeToggle.textContent = lightTheme ? "☾" : "☼";
    els.themeToggle.title = lightTheme ? "Växla till mörkt tema" : "Växla till ljust tema";
  }
  applyPreferenceClasses();
}

function updateSensitivityLab(price, reference) {
  if (!els.marketShockSlider) return;
  const shockPct = Number(els.marketShockSlider.value) || 0;
  const factor = 1 + shockPct / 100;
  const newMarket = Math.max(0, reference.marketBase * factor);
  const pretax = newMarket + reference.fuel.energyTax + reference.fuel.carbonTax;
  const scenarioPrice = pretax * (1 + reference.vatRate);
  const scenarioVat = scenarioPrice - pretax;
  const delta = scenarioPrice - price;
  const passThrough = reference.marketBase > 0
    ? delta / (reference.marketBase * shockPct / 100 || 1)
    : 0;

  if (els.marketShockLabel) els.marketShockLabel.textContent = (shockPct > 0 ? "+" : "") + fmt(shockPct,0) + " %";
  if (els.shockBasePrice) els.shockBasePrice.textContent = fmt(price) + " kr/l";
  if (els.shockBaseMarket) els.shockBaseMarket.textContent = "Marknad " + fmt(reference.marketBase) + " kr/l";
  if (els.shockScenarioPrice) els.shockScenarioPrice.textContent = fmt(scenarioPrice) + " kr/l";
  if (els.shockScenarioMarket) els.shockScenarioMarket.textContent = "Marknad " + fmt(newMarket) + " kr/l";
  if (els.shockDelta) els.shockDelta.textContent = signed(delta);
  if (els.shockPassThrough) {
    els.shockPassThrough.textContent = shockPct === 0
      ? "Ingen förändring"
      : "Moms gör att pumpförändringen blir " + fmt(Math.abs(delta),2) + " kr/l.";
  }

  const total = Math.max(.01, scenarioPrice);
  if (els.shockMarketBar) els.shockMarketBar.style.width = pct(newMarket,total) + "%";
  if (els.shockTaxBar) els.shockTaxBar.style.width = pct(reference.excise,total) + "%";
  if (els.shockVatBar) els.shockVatBar.style.width = pct(scenarioVat,total) + "%";
}

function updateTargetSolver(price, reference) {
  if (!els.targetPriceInput || !els.targetPriceSlider) return;
  let target = parseNumber(els.targetPriceInput.value);
  if (!Number.isFinite(target)) target = Number(els.targetPriceSlider.value);
  target = clamp(target, 1, 100);

  const pretaxTarget = target / (1 + reference.vatRate);
  const requiredMarketRaw = pretaxTarget - reference.excise;
  const requiredMarket = Math.max(0, requiredMarketRaw);
  const delta = requiredMarket - reference.marketBase;
  const deltaPct = reference.marketBase > 0 ? delta / reference.marketBase * 100 : 0;
  const floor = reference.excise * (1 + reference.vatRate);

  if (els.targetCurrentMarket) els.targetCurrentMarket.textContent = fmt(reference.marketBase) + " kr/l";
  if (els.targetRequiredMarket) els.targetRequiredMarket.textContent = fmt(requiredMarket) + " kr/l";
  if (els.targetMarketDelta) els.targetMarketDelta.textContent = signed(delta);
  if (els.targetMarketDeltaPct) els.targetMarketDeltaPct.textContent = signed(deltaPct," %");
  if (els.targetMechanicalFloor) els.targetMechanicalFloor.textContent = fmt(floor) + " kr/l";

  if (els.targetMessage) {
    const impossible = requiredMarketRaw < 0;
    els.targetMessage.classList.toggle("impossible", impossible);
    els.targetMessage.textContent = impossible
      ? "Det valda målpriset ligger under det mekaniska golvet i den här modellen. Med oförändrade punktskatter och momssats skulle marknad/kedja behöva bli negativ, vilket modellen inte tillåter."
      : "För att nå " + fmt(target) + " kr/l med oförändrade skatter och momssats skulle marknad/kedja behöva " +
        (Math.abs(deltaPct) < .05 ? "vara ungefär oförändrad." : (delta < 0 ? "minska med " : "öka med ") + fmt(Math.abs(deltaPct),1) + " %.");
  }

  const sliderValue = clamp(target, Number(els.targetPriceSlider.min), Number(els.targetPriceSlider.max));
  if (Math.abs(Number(els.targetPriceSlider.value) - sliderValue) > .05) {
    els.targetPriceSlider.value = sliderValue;
  }
}

function taxShareAtPumpPrice(price, fuel) {
  if (!Number.isFinite(price) || price <= 0 || !fuel) return null;
  const vatRate = fuel.vatRate / 100;
  const beforeVat = price / (1 + vatRate);
  const vat = price - beforeVat;
  const excise = fuel.energyTax + fuel.carbonTax;
  return {
    vat,
    excise,
    total: vat + excise,
    share: (vat + excise) / price * 100
  };
}

function curvePoint(price, share) {
  const x = 50 + ((price - 10) / 25) * 685;
  const y = 220 - ((clamp(share,20,60) - 20) / 40) * 200;
  return {x,y};
}

function updateTaxShareCurve(price, reference) {
  if (!els.taxSharePolyline) return;
  const points = [];
  for (let p = 10; p <= 35.0001; p += .5) {
    const stats = taxShareAtPumpPrice(p, reference.fuel);
    if (!stats) continue;
    const point = curvePoint(p, stats.share);
    points.push(point.x.toFixed(1) + "," + point.y.toFixed(1));
  }
  els.taxSharePolyline.setAttribute("points", points.join(" "));

  const current = taxShareAtPumpPrice(price, reference.fuel);
  if (!current) return;
  const point = curvePoint(clamp(price,10,35), current.share);
  els.taxShareDot.setAttribute("cx", point.x.toFixed(1));
  els.taxShareDot.setAttribute("cy", point.y.toFixed(1));
  els.curveDotLabel.setAttribute("x", Math.min(690,point.x+10).toFixed(1));
  els.curveDotLabel.setAttribute("y", Math.max(18,point.y-10).toFixed(1));
  els.curveDotLabel.textContent = fmt(current.share,1) + " %";

  if (els.curveCurrentPrice) els.curveCurrentPrice.textContent = fmt(price) + " kr/l";
  if (els.curveCurrentTax) els.curveCurrentTax.textContent = fmt(current.total) + " kr/l";
  if (els.curveCurrentShare) els.curveCurrentShare.textContent = fmt(current.share,1) + " %";
  if (els.curveExcise) els.curveExcise.textContent = fmt(current.excise) + " kr/l";
}

function currentReportData(price, reference) {
  const location = countyEntry()?.name || "Hela Sverige";
  const scenario = politicalScenarios[els.partyScenario?.value || "current"] || politicalScenarios.current;
  const modeLabel = priceMode === "manual" ? "Eget pris" : priceMode === "weekly" ? "Veckoreferens" : (selectedCounty === "riket" ? "Rikssnitt" : "Länssnitt");
  return {
    location,
    fuel: reference.fuel.label,
    price,
    market: reference.marketBase,
    taxTotal: reference.politicalDirect,
    energy: reference.fuel.energyTax,
    carbon: reference.fuel.carbonTax,
    vat: reference.vat,
    modeLabel,
    scenarioName: scenario?.name || "Nuvarande regler",
    dataDate: countyData.updatedAt || siteData.dataVersion || "—"
  };
}

function reportText(data, markdown = false) {
  if (!data) return "";
  const lines = markdown
    ? [
        "# Vad kostar soppan?",
        "",
        "**" + data.fuel + " · " + data.location + "**",
        "",
        "- Pumppris: **" + fmt(data.price) + " kr/l**",
        "- Marknad/kedja: " + fmt(data.market) + " kr/l",
        "- Energiskatt: " + fmt(data.energy) + " kr/l",
        "- Koldioxidskatt: " + fmt(data.carbon) + " kr/l",
        "- Moms: " + fmt(data.vat) + " kr/l",
        "- Skatt + moms totalt: " + fmt(data.taxTotal) + " kr/l",
        "- Prisreferens: " + data.modeLabel,
        "- Politikscenario: " + data.scenarioName,
        "- Datadatum: " + data.dataDate,
        "",
        window.location.href
      ]
    : [
        "Vad kostar soppan?",
        data.fuel + " · " + data.location,
        "Pumppris: " + fmt(data.price) + " kr/l",
        "Marknad/kedja: " + fmt(data.market) + " kr/l",
        "Energiskatt: " + fmt(data.energy) + " kr/l",
        "Koldioxidskatt: " + fmt(data.carbon) + " kr/l",
        "Moms: " + fmt(data.vat) + " kr/l",
        "Skatt + moms totalt: " + fmt(data.taxTotal) + " kr/l",
        "Prisreferens: " + data.modeLabel,
        "Politikscenario: " + data.scenarioName,
        "Datadatum: " + data.dataDate,
        window.location.href
      ];
  return lines.join("\n");
}

function updateReport(price, reference) {
  if (!els.reportPrice) return;
  const data = currentReportData(price, reference);
  const share = pct(data.taxTotal, data.price);

  els.reportHeading.textContent = data.fuel + " · " + data.location;
  els.reportVersion.textContent = "v" + (siteData.appVersion || "—");
  els.reportPrice.textContent = fmt(data.price) + " kr/l";
  els.reportTax.textContent = fmt(data.taxTotal) + " kr/l";
  els.reportMarket.textContent = fmt(data.market) + " kr/l";
  els.reportEnergy.textContent = fmt(data.energy) + " kr/l";
  els.reportCarbon.textContent = fmt(data.carbon) + " kr/l";
  els.reportVat.textContent = fmt(data.vat) + " kr/l";
  els.reportMode.textContent = data.modeLabel;
  els.reportPolicy.textContent = data.scenarioName;
  els.reportDate.textContent = data.dataDate;
  els.reportSummary.textContent =
    "Av pumppriset motsvarar cirka " + fmt(share,1) + " % skatt + moms. Marknad/kedja är en restpost tills fler verifierade kostnadsled kan särredovisas.";
}

function updateSimpleExplainer(price, marketBase, politicalDirect) {
  if (!els.simpleExplainerText) return;
  const taxPct = pct(politicalDirect, price);
  const location = countyEntry()?.name || "Hela Sverige";
  els.simpleExplainerText.textContent =
    "För " + (fuelData[selectedFuel]?.label || "bränslet") + " i " + location +
    " går ungefär " + fmt(taxPct,0) + " av 100 kronor till skatt + moms. Resten ligger i marknad och kedja.";
}

function jumpToSection(selector) {
  document.querySelector(selector)?.scrollIntoView({behavior: reducedMotion ? "auto" : "smooth", block:"start"});
}

function closeCommandPalette() {
  if (els.commandDialog?.open) els.commandDialog.close();
}

function runCommand(command) {
  closeCommandPalette();
  if (!command) return;

  if (command.type === "section") {
    jumpToSection(command.target);
  } else if (command.type === "fuel") {
    selectedFuel = command.value;
    setFuelTabs();
    syncCustomControlsFromFuel();
    if (priceMode === "county") {
      const local = countyPriceForFuel();
      if (Number.isFinite(local)) els.pumpPrice.value = fmt(local);
    }
    update();
    jumpToSection("#literpris");
  } else if (command.type === "county") {
    selectedCounty = command.value;
    priceMode = "county";
    if (els.countySelect) els.countySelect.value = selectedCounty;
    applyCountyPrice({announceChange:true});
    jumpToSection("#literpris");
  } else if (command.type === "mode") {
    viewMode = command.value;
    applyViewMode();
    applyPreferenceClasses();
    savePreferences();
  } else if (command.type === "settings") {
    if (typeof els.settingsDialog?.showModal === "function") els.settingsDialog.showModal();
  } else if (command.type === "tour") {
    if (typeof els.welcomeDialog?.showModal === "function") els.welcomeDialog.showModal();
  } else if (command.type === "action" && command.value === "copy-link") {
    copyCurrentScenarioLink();
  } else if (command.type === "action" && command.value === "reset") {
    els.resetAll?.click();
  } else if (command.type === "action" && command.value === "diagnostics") {
    viewMode = "expert";
    applyViewMode();
    runDiagnostics();
    jumpToSection("#kallor");
  }
}

function buildCommandItems() {
  const base = [
    {title:"Literlabbet", subtitle:"Gå till kalkylatorn", icon:"⛽", type:"section", target:"#literpris"},
    {title:"Sverigekollen", subtitle:"Jämför alla län", icon:"⌖", type:"section", target:"#lan"},
    {title:"Marknadsmotorn", subtitle:"Råolja, valuta och benchmark", icon:"↗", type:"section", target:"#marknad"},
    {title:"Kostnadskedjan", subtitle:"Följ kostnaderna per liter", icon:"≡", type:"section", target:"#kostnadskedja"},
    {title:"Politiklabbet", subtitle:"Dokumenterade scenarier", icon:"⚙", type:"section", target:"#politik"},
    {title:"Metod", subtitle:"Så räknar sidan", icon:"?", type:"section", target:"#metod"},
    {title:"Bensin 95", subtitle:"Byt bränsletyp", icon:"95", type:"fuel", value:"petrol"},
    {title:"Diesel", subtitle:"Byt bränsletyp", icon:"D", type:"fuel", value:"diesel"},
    {title:"Enkelt läge", subtitle:"Visa kärnan", icon:"S", type:"mode", value:"simple"},
    {title:"Expertläge", subtitle:"Visa avancerade verktyg", icon:"E", type:"mode", value:"expert"},
    {title:"Inställningar", subtitle:"Tema, rörelse och precision", icon:"⚙", type:"settings"},
    {title:"Snabbstart", subtitle:"Visa introduktionen igen", icon:"▶", type:"tour"},
    {title:"Kopiera aktuell länk", subtitle:"Dela exakt det här läget", icon:"↗", type:"action", value:"copy-link"},
    {title:"Återställ sidan", subtitle:"Till standardvärden", icon:"↺", type:"action", value:"reset"},
    {title:"Kör självtest", subtitle:"Kontrollera data och appstatus", icon:"✓", type:"action", value:"diagnostics"}
  ];

  const counties = (countyData.counties || []).map(item => ({
    title:item.name,
    subtitle:"Välj länssnitt",
    icon:"L",
    type:"county",
    value:item.id
  }));

  return [...base, ...counties];
}

function renderCommandPalette() {
  if (!els.commandList) return;
  const q = (els.commandSearch?.value || "").trim().toLocaleLowerCase("sv");
  commandItems = buildCommandItems().filter(item =>
    !q || (item.title + " " + item.subtitle).toLocaleLowerCase("sv").includes(q)
  );
  commandActiveIndex = clamp(commandActiveIndex, 0, Math.max(0,commandItems.length-1));
  els.commandList.innerHTML = "";

  commandItems.forEach((item,index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "command-item" + (index === commandActiveIndex ? " active" : "");
    button.setAttribute("role","option");
    button.setAttribute("aria-selected", String(index === commandActiveIndex));
    button.innerHTML = `
      <span class="command-icon">${item.icon}</span>
      <span class="command-copy"><strong>${item.title}</strong><small>${item.subtitle}</small></span>
      ${index < 9 ? "<kbd>"+(index+1)+"</kbd>" : ""}
    `;
    button.addEventListener("mouseenter", () => {
      commandActiveIndex = index;
      renderCommandPalette();
    });
    button.addEventListener("click", () => runCommand(item));
    els.commandList.appendChild(button);
  });

  if (!commandItems.length) {
    const empty = document.createElement("div");
    empty.className = "registry-empty";
    empty.textContent = "Inga kommandon matchar sökningen.";
    els.commandList.appendChild(empty);
  }
}

function openCommandPalette() {
  if (!els.commandDialog || typeof els.commandDialog.showModal !== "function") return;
  commandActiveIndex = 0;
  if (els.commandSearch) els.commandSearch.value = "";
  renderCommandPalette();
  els.commandDialog.showModal();
  setTimeout(() => els.commandSearch?.focus(), 0);
}

function glossaryCategories() {
  return [...new Set(glossaryData.map(item => item.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"sv"));
}

function showGlossarySpotlight(item) {
  if (!item || !els.glossarySpotlight) return;
  els.glossarySpotlight.hidden = false;
  els.glossarySpotlightTerm.textContent = item.term;
  els.glossarySpotlightText.textContent = item.short;
}

function renderGlossaryFilters() {
  if (!els.glossaryFilters) return;
  const categories = ["all", ...glossaryCategories()];
  els.glossaryFilters.innerHTML = "";
  categories.forEach(category => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "glossary-filter" + (category === glossaryFilter ? " active" : "");
    button.textContent = category === "all" ? "Alla" : category.charAt(0).toUpperCase()+category.slice(1);
    button.setAttribute("aria-pressed", String(category === glossaryFilter));
    button.addEventListener("click", () => {
      glossaryFilter = category;
      renderGlossaryFilters();
      renderGlossary();
    });
    els.glossaryFilters.appendChild(button);
  });
}

function renderGlossary() {
  if (!els.glossaryGrid) return;
  const q = (els.glossarySearch?.value || "").trim().toLocaleLowerCase("sv");
  let items = [...glossaryData];
  if (glossaryFilter !== "all") items = items.filter(item => item.category === glossaryFilter);
  if (q) items = items.filter(item =>
    (item.term + " " + item.short + " " + item.category).toLocaleLowerCase("sv").includes(q)
  );

  els.glossaryGrid.innerHTML = "";
  items.forEach(item => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "glossary-card";
    card.innerHTML = `
      <span>${item.category || "begrepp"}</span>
      <strong>${item.term}</strong>
      <p>${item.short}</p>
    `;
    card.addEventListener("click", () => showGlossarySpotlight(item));
    els.glossaryGrid.appendChild(card);
  });

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "registry-empty";
    empty.textContent = "Inga begrepp matchar sökningen.";
    els.glossaryGrid.appendChild(empty);
  }
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

function downloadTextFile(filename, content, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], {type:mime});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

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

function populateCompareSelect(select, selected) {
  if (!select) return;
  select.innerHTML = "";
  (Array.isArray(countyData.counties) ? countyData.counties : []).forEach(entry => {
    const option = document.createElement("option");
    option.value = entry.id;
    option.textContent = entry.name;
    select.appendChild(option);
  });
  if (selected && [...select.options].some(option => option.value === selected)) {
    select.value = selected;
  }
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

function percentile(sortedValues, p) {
  if (!sortedValues.length) return null;
  const index = (sortedValues.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sortedValues[lower];
  const weight = index - lower;
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
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

function renderCountyDistribution() {
  if (!els.countyHistogram) return;
  const rows = countyRows().sort((a,b) => a.price-b.price);
  if (!rows.length) return;

  const values = rows.map(row => row.price);
  const q1 = percentile(values,.25);
  const median = percentile(values,.5);
  const q3 = percentile(values,.75);
  const iqr = q3-q1;
  const lowFence = q1 - 1.5*iqr;
  const highFence = q3 + 1.5*iqr;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(.01,max-min);

  const selectedIndex = rows.findIndex(row => row.id===selectedCounty);
  const percentileRank = selectedIndex >= 0 ? (selectedIndex+1)/rows.length*100 : null;

  if (els.countyMedian) els.countyMedian.textContent = fmt(median)+" kr/l";
  if (els.countyQ1) els.countyQ1.textContent = fmt(q1)+" kr/l";
  if (els.countyQ3) els.countyQ3.textContent = fmt(q3)+" kr/l";
  if (els.countyPercentile) els.countyPercentile.textContent = percentileRank === null ? "Riket" : fmt(percentileRank,0)+" %";
  if (els.countyPercentileDetail) {
    els.countyPercentileDetail.textContent = percentileRank === null
      ? "rikssnittet ingår inte i rankingen"
      : "cirka " + fmt(percentileRank,0) + " % av länen ligger på samma eller lägre nivå";
  }

  els.countyHistogram.innerHTML="";
  rows.forEach(row => {
    const bar=document.createElement("button");
    bar.type="button";
    bar.className="hist-bar";
    const outlier=row.price<lowFence || row.price>highFence;
    if (row.id===selectedCounty) bar.classList.add("selected");
    else if (outlier) bar.classList.add("outlier");
    bar.style.height=(18+((row.price-min)/range)*82)+"%";
    bar.dataset.label=row.name.replace(" län","");
    bar.title=row.name+": "+fmt(row.price)+" kr/l";
    bar.setAttribute("aria-label",bar.title);
    bar.addEventListener("click",()=>{
      selectedCounty=row.id;
      priceMode="county";
      if (els.countySelect) els.countySelect.value=row.id;
      applyCountyPrice({announceChange:true});
    });
    els.countyHistogram.appendChild(bar);
  });

  const outliers=rows.filter(row=>row.price<lowFence || row.price>highFence);
  if (els.distributionNote) {
    els.distributionNote.textContent = outliers.length
      ? outliers.length + " län ligger statistiskt utanför kvartilspannet enligt 1,5×IQR-regeln. Det är en signal att granska rapporteringsunderlaget, inte ett bevis på fel data."
      : "Inga län ligger utanför 1,5×IQR-regeln i den aktuella prisfördelningen.";
  }
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
  if (favoritesOnly) rows = rows.filter(item => favoriteCounties.includes(item.id));

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
      <span class="county-row-name">${favoriteCounties.includes(item.id) ? "★ " : ""}${item.name}</span>
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

function compareCountyPayload(id) {
  const entry = countyEntry(id);
  const price = countyPriceForFuel(id);
  if (!entry || !Number.isFinite(price)) return null;
  const ref = getReference(price);
  return {
    entry,
    price,
    market: ref.marketBase,
    tax: ref.politicalDirect
  };
}

function updateCountyComparison() {
  const a = compareCountyPayload(compareA);
  const b = compareCountyPayload(compareB);
  if (!a || !b) return;

  const maxPrice = Math.max(a.price,b.price,.01);
  const delta = b.price - a.price;
  const deltaPct = a.price ? delta / a.price * 100 : 0;

  if (els.compareNameA) els.compareNameA.textContent = a.entry.name;
  if (els.compareNameB) els.compareNameB.textContent = b.entry.name;
  if (els.comparePriceA) els.comparePriceA.textContent = fmt(a.price) + " kr/l";
  if (els.comparePriceB) els.comparePriceB.textContent = fmt(b.price) + " kr/l";
  if (els.compareBreakdownA) els.compareBreakdownA.textContent = "Skatt+moms " + fmt(a.tax) + " · Marknad " + fmt(a.market);
  if (els.compareBreakdownB) els.compareBreakdownB.textContent = "Skatt+moms " + fmt(b.tax) + " · Marknad " + fmt(b.market);
  if (els.compareCountyDelta) els.compareCountyDelta.textContent = signed(delta);
  if (els.compareCountyDeltaPct) els.compareCountyDeltaPct.textContent = signed(deltaPct," %") + " (B mot A)";
  if (els.compareBarNameA) els.compareBarNameA.textContent = a.entry.name.replace(" län","");
  if (els.compareBarNameB) els.compareBarNameB.textContent = b.entry.name.replace(" län","");
  if (els.compareBarA) els.compareBarA.style.width = (a.price/maxPrice*100) + "%";
  if (els.compareBarB) els.compareBarB.style.width = (b.price/maxPrice*100) + "%";
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
  if (els.toggleCountyFavorite) {
    const favorite = entry?.id !== "riket" && favoriteCounties.includes(entry?.id);
    els.toggleCountyFavorite.textContent = favorite ? "★ Favorit sparad" : "☆ Spara favorit";
    els.toggleCountyFavorite.disabled = entry?.id === "riket";
  }

  if (els.priceModeBadge) {
    const labels = { county: entry?.id === "riket" ? "RIKSSNITT" : "LÄNSSNITT", manual: "EGET PRIS", weekly: "VECKOREFERENS" };
    els.priceModeBadge.textContent = labels[priceMode] || "PRIS";
    els.priceModeBadge.classList.toggle("manual", priceMode === "manual");
    els.priceModeBadge.classList.toggle("weekly", priceMode === "weekly");
  }

  const current = parseNumber(els.pumpPrice?.value);
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
  renderFavoriteCounties();
  renderFavoriteComparison();
  renderCountyExplorer();
  renderCountyDistribution();
  updateCountyComparison();
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

function renderPolicyDiff(selectedScenario) {
  if (!els.policyDiffGrid) return;
  const reference = politicalScenarios.current;
  if (!reference || !selectedScenario) return;

  const fields = [
    ["tax","Drivmedelsskatt"],
    ["reduction","Reduktionsplikt"],
    ["bio","Biodrivmedel"],
    ["vat","Moms"],
    ["support","Stöd"]
  ];

  els.policyDiffGrid.innerHTML = "";
  let changedCount = 0;

  fields.forEach(([key,label]) => {
    const currentText = reference.policies?.[key] || "Ej angivet";
    const selectedText = selectedScenario.policies?.[key] || "Ej angivet";
    const changed = currentText.trim() !== selectedText.trim();
    if (changed) changedCount += 1;

    const card = document.createElement("article");
    card.className = "policy-diff-card " + (changed ? "changed" : "same");
    card.innerHTML = `
      <span>${label}</span>
      <strong>${selectedText}</strong>
      <small>${changed ? "Skiljer sig från referenstexten." : "Samma som referensen i nuvarande datamodell."}</small>
    `;
    els.policyDiffGrid.appendChild(card);
  });

  if (els.policyDiffStatus) {
    els.policyDiffStatus.textContent = selectedScenario === reference
      ? "Referensscenario"
      : changedCount + " av " + fields.length + " poster skiljer sig i det dokumenterade underlaget";
  }
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
  renderPolicyDiff(scenario);

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
  url.searchParams.set("cmpA", compareA);
  url.searchParams.set("cmpB", compareB);
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
  updateSimpleExplainer(price, marketBase, politicalDirect);
  updateSensitivityLab(price, reference);
  updateTargetSolver(price, reference);
  updateTaxShareCurve(price, reference);
  updateReport(price, reference);

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
  scheduleHistoryCommit();
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
  const cmpA = params.get("cmpA");
  const cmpB = params.get("cmpB");
  const energy = parseNumber(params.get("energy"));
  const carbon = parseNumber(params.get("carbon"));
  const vat = parseNumber(params.get("vat"));
  const rule = parseNumber(params.get("rule"));

  if (fuel && fuelData[fuel]) selectedFuel = fuel;
  if (county && allCountyEntries().some(item => item.id === county)) selectedCounty = county;
  if (cmpA && countyEntry(cmpA)?.id !== "riket") compareA = cmpA;
  if (cmpB && countyEntry(cmpB)?.id !== "riket") compareB = cmpB;
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

els.targetPriceSlider?.addEventListener("input", () => {
  els.targetPriceInput.value = fmt(Number(els.targetPriceSlider.value));
  update();
});
els.targetPriceInput?.addEventListener("input", update);
els.targetPriceInput?.addEventListener("blur", () => {
  const value = parseNumber(els.targetPriceInput.value);
  if (Number.isFinite(value)) els.targetPriceInput.value = fmt(clamp(value,1,100));
  update();
});
els.targetPresets.forEach(button => {
  button.addEventListener("click", () => {
    const current = getPrice();
    const delta = Number(button.dataset.targetDelta);
    if (current === null || !Number.isFinite(delta)) return;
    const target = clamp(current + delta, 1, 100);
    els.targetPriceInput.value = fmt(target);
    els.targetPriceSlider.value = clamp(target, Number(els.targetPriceSlider.min), Number(els.targetPriceSlider.max));
    update();
  });
});

els.marketShockSlider?.addEventListener("input", update);
els.marketShockPresets.forEach(button => {
  button.addEventListener("click", () => {
    if (!els.marketShockSlider) return;
    els.marketShockSlider.value = button.dataset.marketShock;
    update();
  });
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

els.compareCountyA?.addEventListener("change", () => {
  compareA = els.compareCountyA.value;
  updateCountyComparison();
  updateUrl(getPrice() ?? siteData.defaultPumpPrice);
});
els.compareCountyB?.addEventListener("change", () => {
  compareB = els.compareCountyB.value;
  updateCountyComparison();
  updateUrl(getPrice() ?? siteData.defaultPumpPrice);
});
els.swapCounties?.addEventListener("click", () => {
  [compareA,compareB] = [compareB,compareA];
  els.compareCountyA.value = compareA;
  els.compareCountyB.value = compareB;
  updateCountyComparison();
  updateUrl(getPrice() ?? siteData.defaultPumpPrice);
});
els.useCompareA?.addEventListener("click", () => {
  selectedCounty = compareA;
  priceMode = "county";
  if (els.countySelect) els.countySelect.value = compareA;
  applyCountyPrice({announceChange:true});
});
els.useCompareB?.addEventListener("click", () => {
  selectedCounty = compareB;
  priceMode = "county";
  if (els.countySelect) els.countySelect.value = compareB;
  applyCountyPrice({announceChange:true});
});
els.downloadCountyCsv?.addEventListener("click", () => {
  const rows = countyRows().sort((a,b)=>a.name.localeCompare(b.name,"sv"));
  const header = ["län","bränsle","pris_kr_per_liter","datadatum"];
  const lines = [header.join(";")];
  rows.forEach(row => {
    lines.push([
      '"' + row.name.replaceAll('"','""') + '"',
      '"' + (fuelData[selectedFuel]?.label || selectedFuel) + '"',
      row.price.toFixed(2).replace(".",","),
      countyData.updatedAt || ""
    ].join(";"));
  });
  downloadTextFile(
    "vadkostarsoppan-lanspriser-" + selectedFuel + "-" + (countyData.updatedAt || "data") + ".csv",
    "\ufeff" + lines.join("\n"),
    "text/csv;charset=utf-8"
  );
  showToast("CSV med länspriser skapades.");
});

els.copyCountyTable?.addEventListener("click", async () => {
  const rows = countyRows().sort((a,b)=>a.price-b.price);
  const textValue = rows.map((row,index) =>
    (index+1) + ". " + row.name + " – " + fmt(row.price) + " kr/l"
  ).join("\n");
  try {
    await navigator.clipboard.writeText(textValue);
    showToast("Länstabellen är kopierad.");
  } catch {
    showToast("Kunde inte kopiera länstabellen.");
  }
});

els.downloadScenarioJson?.addEventListener("click", () => {
  const snap = currentSnapshot();
  if (!snap) return;
  const payload = {
    exportedAt: new Date().toISOString(),
    appVersion: siteData.appVersion || null,
    dataVersion: siteData.dataVersion || null,
    scenario: snap
  };
  downloadTextFile(
    "vadkostarsoppan-scenario.json",
    JSON.stringify(payload,null,2),
    "application/json;charset=utf-8"
  );
  showToast("Scenariofilen skapades.");
});

els.copyCountyCompare?.addEventListener("click", async () => {
  const a = compareCountyPayload(compareA);
  const b = compareCountyPayload(compareB);
  if (!a || !b) return;
  const message = a.entry.name + ": " + fmt(a.price) + " kr/l\n" +
    b.entry.name + ": " + fmt(b.price) + " kr/l\nSkillnad: " + signed(b.price-a.price) + "\n" +
    window.location.href;
  try {
    await navigator.clipboard.writeText(message);
    showToast("Länsjämförelsen är kopierad.");
  } catch {
    showToast("Kunde inte kopiera jämförelsen.");
  }
});

els.toggleCountyFavorite?.addEventListener("click", () => toggleFavoriteCounty(selectedCounty));
els.countyFavoritesOnly?.addEventListener("click", () => {
  favoritesOnly = !favoritesOnly;
  els.countyFavoritesOnly.setAttribute("aria-pressed", String(favoritesOnly));
  els.countyFavoritesOnly.textContent = favoritesOnly ? "★ Visar favoriter" : "☆ Bara favoriter";
  renderCountyExplorer();
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

els.commandOpen?.addEventListener("click", openCommandPalette);
els.commandSearch?.addEventListener("input", () => {
  commandActiveIndex = 0;
  renderCommandPalette();
});
els.commandSearch?.addEventListener("keydown", event => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    commandActiveIndex = Math.min(commandItems.length-1, commandActiveIndex+1);
    renderCommandPalette();
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    commandActiveIndex = Math.max(0, commandActiveIndex-1);
    renderCommandPalette();
  } else if (event.key === "Enter") {
    event.preventDefault();
    runCommand(commandItems[commandActiveIndex]);
  }
});

els.settingsOpen?.addEventListener("click", () => {
  applyPreferenceClasses();
  if (typeof els.settingsDialog?.showModal === "function" && !els.settingsDialog.open) {
    els.settingsDialog.showModal();
  }
});

els.reducedMotionToggle?.addEventListener("change", () => {
  reducedMotion = els.reducedMotionToggle.checked;
  applyPreferenceClasses();
  savePreferences();
});
els.lowDataToggle?.addEventListener("change", () => {
  lowDataMode = els.lowDataToggle.checked;
  applyPreferenceClasses();
  savePreferences();
});
els.expertModeToggle?.addEventListener("change", () => {
  viewMode = els.expertModeToggle.checked ? "expert" : "simple";
  applyViewMode();
  applyPreferenceClasses();
  savePreferences();
});
els.lightThemeToggle?.addEventListener("change", () => {
  lightTheme = els.lightThemeToggle.checked;
  applyThemeState();
  savePreferences();
});
els.highContrastToggle?.addEventListener("change", () => {
  document.documentElement.classList.toggle("high-contrast", els.highContrastToggle.checked);
  applyPreferenceClasses();
  savePreferences();
});
els.precisionSelect?.addEventListener("change", () => {
  displayPrecision = Number(els.precisionSelect.value) === 1 ? 1 : 2;
  savePreferences();
  update();
});
els.resetSettings?.addEventListener("click", () => {
  viewMode = "simple";
  lightTheme = false;
  reducedMotion = false;
  lowDataMode = false;
  displayPrecision = 2;
  document.documentElement.classList.remove("high-contrast","light-theme","reduced-motion","low-data");
  applyViewMode();
  applyThemeState();
  applyPreferenceClasses();
  savePreferences();
  update();
  showToast("Inställningarna är återställda.");
});

els.simpleMode?.addEventListener("click", () => {
  viewMode = "simple";
  applyViewMode();
  savePreferences();
  showToast("Enkelt läge är aktivt.");
});
els.expertMode?.addEventListener("click", () => {
  viewMode = "expert";
  applyViewMode();
  savePreferences();
  showToast("Expertläge är aktivt.");
});
els.themeToggle?.addEventListener("click", () => {
  lightTheme = !lightTheme;
  applyThemeState();
  savePreferences();
});

els.contrastToggle?.addEventListener("click", () => {
  const active = document.documentElement.classList.toggle("high-contrast");
  els.contrastToggle.setAttribute("aria-pressed", String(active));
  savePreferences();
  showToast(active ? "Hög kontrast är på." : "Hög kontrast är av.");
});

window.addEventListener("online", () => {
  updateNetworkStatus();
  showToast("Du är online igen.");
});
window.addEventListener("offline", () => {
  updateNetworkStatus();
  showToast("Du är offline. Cachad data används.");
});
window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (els.installApp) els.installApp.hidden = false;
});
window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  if (els.installApp) els.installApp.hidden = true;
  showToast("Appen är installerad.");
});
els.installApp?.addEventListener("click", installPwa);
els.updateApp?.addEventListener("click", () => {
  if (serviceWorkerRegistration?.waiting) {
    serviceWorkerRegistration.waiting.postMessage({type:"SKIP_WAITING"});
  } else {
    checkForAppUpdate({reload:true});
  }
});
els.refreshData?.addEventListener("click", () => checkForAppUpdate({reload:true}));
els.runDiagnostics?.addEventListener("click", runDiagnostics);

document.addEventListener("keydown", event => {
  const tag = document.activeElement?.tagName;
  const typing = ["INPUT","TEXTAREA","SELECT"].includes(tag);

  if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openCommandPalette();
    return;
  }

  if ((event.ctrlKey || event.metaKey) && !event.altKey && !typing) {
    if (event.key.toLowerCase() === "z" && !event.shiftKey) {
      event.preventDefault();
      undoCalculatorState();
      return;
    }
    if ((event.key.toLowerCase() === "z" && event.shiftKey) || event.key.toLowerCase() === "y") {
      event.preventDefault();
      redoCalculatorState();
      return;
    }
  }

  if (event.metaKey || event.ctrlKey || event.altKey) return;
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

els.undoState?.addEventListener("click", undoCalculatorState);
els.redoState?.addEventListener("click", redoCalculatorState);

els.openTour?.addEventListener("click", () => {
  if (typeof els.welcomeDialog?.showModal === "function" && !els.welcomeDialog.open) {
    els.welcomeDialog.showModal();
  }
});

els.welcomeStart?.addEventListener("click", event => {
  event.preventDefault();
  closeWelcome({ remember: true, jump: true });
});

els.welcomeSkip?.addEventListener("click", event => {
  event.preventDefault();
  closeWelcome({ remember: true, jump: false });
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

els.glossarySearch?.addEventListener("input", renderGlossary);

els.registryFilters.forEach(button => {
  button.addEventListener("click", () => {
    sourceFilter = button.dataset.sourceFilter || "all";
    els.registryFilters.forEach(item => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    renderSourceRegistry();
  });
});

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

els.copyReportText?.addEventListener("click", async () => {
  const price = getPrice();
  if (price === null) return;
  const value = reportText(currentReportData(price,getReference(price)),false);
  try {
    await navigator.clipboard.writeText(value);
    showToast("Rapporttexten är kopierad.");
  } catch {
    showToast("Kunde inte kopiera rapporten.");
  }
});
els.copyReportMarkdown?.addEventListener("click", async () => {
  const price = getPrice();
  if (price === null) return;
  const value = reportText(currentReportData(price,getReference(price)),true);
  try {
    await navigator.clipboard.writeText(value);
    showToast("Markdown-rapporten är kopierad.");
  } catch {
    showToast("Kunde inte kopiera rapporten.");
  }
});
els.printReport?.addEventListener("click", () => {
  document.body.classList.add("print-report");
  const cleanup = () => {
    document.body.classList.remove("print-report");
    window.removeEventListener("afterprint",cleanup);
  };
  window.addEventListener("afterprint",cleanup);
  window.print();
  setTimeout(cleanup,1500);
});

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

els.saveSnapshot?.addEventListener("click", () => {
  const snap = currentSnapshot();
  if (!snap) return;
  snapshots = [snap, ...snapshots].slice(0,5);
  saveSnapshots();
  renderSnapshots();
  showToast("Läget är sparat i den här webbläsaren.");
});

els.clearSnapshots?.addEventListener("click", () => {
  snapshots = [];
  saveSnapshots();
  renderSnapshots();
  showToast("Alla sparade lägen är rensade.");
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
loadSnapshots();
renderSnapshots();
populateCompareSelect(els.compareCountyA, compareA);
populateCompareSelect(els.compareCountyB, compareB);
loadSavedPreferences();
applyViewMode();
applyThemeState();
applyPreferenceClasses();
loadStateFromUrl();
updateCountyUI();
renderRecentCounties();
renderFavoriteCounties();
renderFavoriteComparison();
if (els.dataFreshness) els.dataFreshness.textContent = formatDataFreshness(countyData.updatedAt);

if (els.dataVersion) els.dataVersion.textContent = siteData.dataVersion || "—";
if (els.factCheckDate) els.factCheckDate.textContent = siteData.lastFactCheck || "—";
if (els.appVersion) els.appVersion.textContent = siteData.appVersion || "—";
validateDatasets();

buildPartyPills();
setupNavObserver();
maybeShowWelcome();
loadSourceRegistry();
renderGlossaryFilters();
renderGlossary();
updateMarketReferences();
updateHeroReferenceChips();
update();


updateNetworkStatus();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      serviceWorkerRegistration = await navigator.serviceWorker.register("/sw.js");
      serviceWorkerRegistration.addEventListener("updatefound", () => {
        const worker = serviceWorkerRegistration.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            if (els.updateApp) els.updateApp.hidden = false;
            showToast("En ny version av sidan finns.");
          }
        });
      });
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });
    } catch {}
  });
}
