const fuelData = window.FUEL_DATA || {};
const siteData = window.SITE_DATA || {};
const countyData = window.COUNTY_PRICES || {};
const politicalScenarios = window.POLICY_SCENARIOS || {};

const TANK_LITERS = 40;

const els = {
  fuelButtons: [...document.querySelectorAll("[data-fuel]")],
  countySelect: document.querySelector("#countySelect"),
  partySelect: document.querySelector("#partySelect"),
  updatedLabel: document.querySelector("#updatedLabel"),
  fuelLabel: document.querySelector("#fuelLabel"),
  areaLabel: document.querySelector("#areaLabel"),
  tankTotal: document.querySelector("#tankTotal"),
  literPrice: document.querySelector("#literPrice"),
  marketTank: document.querySelector("#marketTank"),
  energyTank: document.querySelector("#energyTank"),
  carbonTank: document.querySelector("#carbonTank"),
  vatTank: document.querySelector("#vatTank"),
  taxTank: document.querySelector("#taxTank"),
  taxShare: document.querySelector("#taxShare"),
  partyResult: document.querySelector("#partyResult"),
  scenarioLabel: document.querySelector("#scenarioLabel"),
  scenarioTankPrice: document.querySelector("#scenarioTankPrice"),
  scenarioTankUnit: document.querySelector("#scenarioTankUnit"),
  scenarioLiterPrice: document.querySelector("#scenarioLiterPrice"),
  scenarioDelta: document.querySelector("#scenarioDelta"),
  scenarioNote: document.querySelector("#scenarioNote"),
  partySource: document.querySelector("#partySource"),
  priceSource: document.querySelector("#priceSource"),
  taxSource: document.querySelector("#taxSource")
};

let selectedFuel = siteData.defaultFuel || "petrol";
let selectedCounty = "riket";

const money = new Intl.NumberFormat("sv-SE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const percent = new Intl.NumberFormat("sv-SE", {
  maximumFractionDigits: 0
});

function fmt(value) {
  return Number.isFinite(value) ? money.format(value) : "—";
}

function areaEntries() {
  return [countyData.national, ...(countyData.counties || [])].filter(Boolean);
}

function areaEntry(id = selectedCounty) {
  return areaEntries().find(item => item.id === id) || countyData.national;
}

function pumpPrice() {
  return Number(areaEntry()?.[selectedFuel]);
}

function getReference(price) {
  const fuel = fuelData[selectedFuel];
  if (!fuel || !Number.isFinite(price)) return null;

  const vatRate = fuel.vatRate / 100;
  const beforeVat = price / (1 + vatRate);
  const vat = price - beforeVat;
  const energy = fuel.energyTax;
  const carbon = fuel.carbonTax;
  const market = Math.max(0, beforeVat - energy - carbon);
  const tax = energy + carbon + vat;

  return { fuel, price, vat, energy, carbon, market, tax };
}

function populateCounties() {
  els.countySelect.innerHTML = "";
  for (const item of areaEntries()) {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    els.countySelect.appendChild(option);
  }
}

function populateParties() {
  const partyOrder = ["c","kd","l","mp","m","s","sd","v"];
  for (const key of partyOrder) {
    const scenario = politicalScenarios[key];
    if (!scenario) continue;
    const option = document.createElement("option");
    option.value = key;
    option.textContent = scenario.name;
    els.partySelect.appendChild(option);
  }
}

function scenarioPricePerLiter(basePrice, scenario) {
  const model = scenario?.priceModel;
  if (!model) return null;

  if (model.type === "baseline") return basePrice;
  if ((model.type === "party_delta" || model.type === "stated_target") && Number.isFinite(model.delta)) {
    return basePrice + model.delta;
  }
  return null;
}

function renderPartyScenario(basePrice) {
  const key = els.partySelect.value;
  const scenario = politicalScenarios[key];

  els.partyResult.className = "party-result";
  els.scenarioTankPrice.className = "";
  els.scenarioDelta.className = "party-delta";

  if (!scenario) {
    els.partyResult.classList.add("empty");
    els.scenarioLabel.textContent = "Välj ett parti";
    els.scenarioTankPrice.textContent = "—";
    els.scenarioTankUnit.hidden = false;
    els.scenarioLiterPrice.textContent = "— kr/l";
    els.scenarioDelta.textContent = "—";
    els.scenarioNote.textContent = "Om ett parti inte har publicerat tillräckligt exakta nivåer visar vi inget påhittat pris.";
    els.partySource.hidden = true;
    return;
  }

  const resultLiter = scenarioPricePerLiter(basePrice, scenario);
  els.scenarioLabel.textContent = scenario.name;

  if (resultLiter === null) {
    els.partyResult.classList.add("unavailable");
    els.scenarioTankPrice.classList.add("text-result");
    els.scenarioTankPrice.textContent = "Ej möjligt att räkna exakt";
    els.scenarioTankUnit.hidden = true;
    els.scenarioLiterPrice.textContent = "";
    els.scenarioDelta.textContent = "";
    els.scenarioNote.textContent = scenario.method || "Det saknas tillräckligt exakta publicerade nivåer för att räkna fram en kostnad.";
  } else {
    const resultTank = resultLiter * TANK_LITERS;
    const baseTank = basePrice * TANK_LITERS;
    const deltaTank = resultTank - baseTank;
    const deltaLiter = resultLiter - basePrice;

    els.scenarioTankPrice.textContent = fmt(resultTank);
    els.scenarioTankUnit.hidden = false;
    els.scenarioLiterPrice.textContent = fmt(resultLiter) + " kr/l";
    els.scenarioDelta.textContent =
      Math.abs(deltaTank) < 0.005
        ? "Samma tankkostnad"
        : (deltaTank > 0 ? "+" : "−") + fmt(Math.abs(deltaTank)) + " kr per 40 l";

    if (deltaTank > 0.005) els.scenarioDelta.classList.add("positive");
    if (deltaTank < -0.005) els.scenarioDelta.classList.add("negative");

    if (scenario.priceModel?.type === "party_delta") {
      els.scenarioNote.textContent =
        (scenario.method || "") +
        " För 40 liter motsvarar " +
        (deltaLiter >= 0 ? "+" : "−") + fmt(Math.abs(deltaLiter)) +
        " kr/l en skillnad på " + fmt(Math.abs(deltaTank)) + " kr per tankning.";
    } else {
      els.scenarioNote.textContent = scenario.method || "";
    }
  }

  if (scenario.source) {
    els.partySource.href = scenario.source;
    els.partySource.hidden = false;
  } else {
    els.partySource.hidden = true;
  }
}

function render() {
  const price = pumpPrice();
  const ref = getReference(price);
  const area = areaEntry();
  if (!ref || !area) return;

  els.fuelButtons.forEach(button => {
    const active = button.dataset.fuel === selectedFuel;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });

  els.fuelLabel.textContent = ref.fuel.label;
  els.areaLabel.textContent = area.name;

  els.tankTotal.textContent = fmt(price * TANK_LITERS);
  els.literPrice.textContent = fmt(price);

  els.marketTank.textContent = fmt(ref.market * TANK_LITERS) + " kr";
  els.energyTank.textContent = fmt(ref.energy * TANK_LITERS) + " kr";
  els.carbonTank.textContent = fmt(ref.carbon * TANK_LITERS) + " kr";
  els.vatTank.textContent = fmt(ref.vat * TANK_LITERS) + " kr";
  els.taxTank.textContent = fmt(ref.tax * TANK_LITERS) + " kr";
  els.taxShare.textContent = percent.format(ref.tax / price * 100) + " % av tankningen";

  els.updatedLabel.textContent = countyData.updatedAt ? "Prisdata " + countyData.updatedAt : "Prisdata";
  if (countyData.source) els.priceSource.href = countyData.source;
  if (ref.fuel.taxSource) els.taxSource.href = ref.fuel.taxSource;

  renderPartyScenario(price);

  const url = new URL(window.location.href);
  url.searchParams.set("fuel", selectedFuel);
  url.searchParams.set("county", selectedCounty);
  if (els.partySelect.value) url.searchParams.set("party", els.partySelect.value);
  else url.searchParams.delete("party");
  history.replaceState(null, "", url);
}

function loadFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const fuel = params.get("fuel");
  const county = params.get("county");
  const party = params.get("party");

  if (fuelData[fuel]) selectedFuel = fuel;
  if (areaEntries().some(item => item.id === county)) selectedCounty = county;
  if (party && politicalScenarios[party]) els.partySelect.value = party;
}

els.fuelButtons.forEach(button => {
  button.addEventListener("click", () => {
    selectedFuel = button.dataset.fuel;
    render();
  });
});

els.countySelect.addEventListener("change", () => {
  selectedCounty = els.countySelect.value;
  render();
});

els.partySelect.addEventListener("change", render);

populateCounties();
populateParties();
loadFromUrl();
els.countySelect.value = selectedCounty;
render();
