(() => {
  "use strict";

  const fuelData = window.FUEL_DATA ?? {};
  const siteData = window.SITE_DATA ?? {};
  const countyData = window.COUNTY_PRICES ?? {};
  const scenarios = window.POLICY_SCENARIOS ?? {};

  const tankLiters = Number(siteData.typicalTankLiters) || 40;
  const areas = [countyData.national, ...(countyData.counties ?? [])].filter(Boolean);
  const areasById = new Map(areas.map(area => [area.id, area]));
  const partyOrder = ["c", "kd", "l", "mp", "m", "s", "sd", "v"];

  const $ = id => document.getElementById(id);
  const els = {
    fuelButtons: [...document.querySelectorAll("[data-fuel]")],
    tankLiterLabels: [...document.querySelectorAll("[data-tank-liters]")],
    countySelect: $("countySelect"),
    partySelect: $("partySelect"),
    updatedLabel: $("updatedLabel"),
    fuelLabel: $("fuelLabel"),
    areaLabel: $("areaLabel"),
    tankTotal: $("tankTotal"),
    literPrice: $("literPrice"),
    marketTank: $("marketTank"),
    energyTank: $("energyTank"),
    carbonTank: $("carbonTank"),
    vatTank: $("vatTank"),
    taxTank: $("taxTank"),
    taxShare: $("taxShare"),
    partyResult: $("partyResult"),
    scenarioLabel: $("scenarioLabel"),
    scenarioTankPrice: $("scenarioTankPrice"),
    scenarioTankUnit: $("scenarioTankUnit"),
    scenarioLiterPrice: $("scenarioLiterPrice"),
    scenarioDelta: $("scenarioDelta"),
    scenarioNote: $("scenarioNote"),
    partySource: $("partySource"),
    priceSource: $("priceSource"),
    taxSource: $("taxSource")
  };

  const state = {
    fuel: fuelData[siteData.defaultFuel] ? siteData.defaultFuel : "petrol",
    county: areasById.has("riket") ? "riket" : areas[0]?.id,
    party: ""
  };

  const money = new Intl.NumberFormat("sv-SE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const wholePercent = new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 });

  const fmt = value => Number.isFinite(value) ? money.format(value) : "—";
  const setText = (node, value) => {
    if (node && node.textContent !== value) node.textContent = value;
  };

  function getArea() {
    return areasById.get(state.county) ?? areas[0];
  }

  function getPrice() {
    return Number(getArea()?.[state.fuel]);
  }

  function calculate(price) {
    const fuel = fuelData[state.fuel];
    if (!fuel || !Number.isFinite(price)) return null;

    const vatRate = fuel.vatRate / 100;
    const beforeVat = price / (1 + vatRate);
    const vat = price - beforeVat;
    const energy = fuel.energyTax;
    const carbon = fuel.carbonTax;
    const market = beforeVat - energy - carbon;

    if (![vat, energy, carbon, market].every(Number.isFinite) || market < 0) return null;

    return { fuel, price, vat, energy, carbon, market, tax: energy + carbon + vat };
  }

  function scenarioPrice(basePrice, scenario) {
    const model = scenario?.priceModel;
    if (!model) return null;
    if (model.type === "baseline") return basePrice;
    if (["party_delta", "stated_target"].includes(model.type) && Number.isFinite(model.delta)) {
      return basePrice + model.delta;
    }
    return null;
  }

  function populateSelect(select, entries, selected) {
    const fragment = document.createDocumentFragment();
    for (const [value, label] of entries) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      fragment.append(option);
    }
    select.replaceChildren(fragment);
    if (selected) select.value = selected;
  }

  function initializeControls() {
    populateSelect(
      els.countySelect,
      areas.map(area => [area.id, area.name]),
      state.county
    );

    const partyEntries = [["", "Välj parti…"]];
    for (const key of partyOrder) {
      if (scenarios[key]) partyEntries.push([key, scenarios[key].name]);
    }
    populateSelect(els.partySelect, partyEntries, state.party);

    for (const node of els.tankLiterLabels) setText(node, String(tankLiters));
  }

  function renderScenario(basePrice) {
    const scenario = scenarios[state.party];

    els.partyResult.className = "party-result";
    els.scenarioTankPrice.className = "";
    els.scenarioDelta.className = "party-delta";

    if (!scenario) {
      els.partyResult.classList.add("empty");
      setText(els.scenarioLabel, "Välj ett parti");
      setText(els.scenarioTankPrice, "—");
      els.scenarioTankUnit.hidden = false;
      setText(els.scenarioLiterPrice, "— kr/l");
      setText(els.scenarioDelta, "—");
      setText(els.scenarioNote, "Om ett parti inte har publicerat tillräckligt exakta nivåer visar vi inget påhittat pris.");
      els.partySource.hidden = true;
      return;
    }

    setText(els.scenarioLabel, scenario.name);
    const resultLiter = scenarioPrice(basePrice, scenario);

    if (resultLiter === null) {
      els.partyResult.classList.add("unavailable");
      els.scenarioTankPrice.classList.add("text-result");
      setText(els.scenarioTankPrice, "Ej möjligt att räkna exakt");
      els.scenarioTankUnit.hidden = true;
      setText(els.scenarioLiterPrice, "");
      setText(els.scenarioDelta, "");
      setText(els.scenarioNote, scenario.method || "Det saknas tillräckligt exakta publicerade nivåer för att räkna fram en kostnad.");
    } else {
      const resultTank = resultLiter * tankLiters;
      const baseTank = basePrice * tankLiters;
      const deltaTank = resultTank - baseTank;
      const deltaLiter = resultLiter - basePrice;

      setText(els.scenarioTankPrice, fmt(resultTank));
      els.scenarioTankUnit.hidden = false;
      setText(els.scenarioLiterPrice, fmt(resultLiter) + " kr/l");

      if (Math.abs(deltaTank) < 0.005) {
        setText(els.scenarioDelta, "Samma tankkostnad");
      } else {
        const sign = deltaTank > 0 ? "+" : "−";
        setText(els.scenarioDelta, sign + fmt(Math.abs(deltaTank)) + " kr per " + tankLiters + " l");
        els.scenarioDelta.classList.add(deltaTank > 0 ? "positive" : "negative");
      }

      if (scenario.priceModel?.type === "party_delta") {
        const sign = deltaLiter >= 0 ? "+" : "−";
        setText(
          els.scenarioNote,
          (scenario.method || "") +
          " För " + tankLiters + " liter motsvarar " + sign + fmt(Math.abs(deltaLiter)) +
          " kr/l en skillnad på " + fmt(Math.abs(deltaTank)) + " kr."
        );
      } else {
        setText(els.scenarioNote, scenario.method || "");
      }
    }

    if (scenario.source) {
      els.partySource.href = scenario.source;
      els.partySource.hidden = false;
    } else {
      els.partySource.hidden = true;
    }
  }

  function syncUrl() {
    const url = new URL(location.href);
    url.searchParams.set("fuel", state.fuel);
    url.searchParams.set("county", state.county);
    state.party ? url.searchParams.set("party", state.party) : url.searchParams.delete("party");

    const next = url.pathname + url.search + url.hash;
    const current = location.pathname + location.search + location.hash;
    if (next !== current) history.replaceState(null, "", next);
  }

  function render() {
    const price = getPrice();
    const ref = calculate(price);
    const area = getArea();

    if (!ref || !area) {
      setText(els.tankTotal, "Data saknas");
      return;
    }

    for (const button of els.fuelButtons) {
      const active = button.dataset.fuel === state.fuel;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    }

    setText(els.fuelLabel, ref.fuel.label);
    setText(els.areaLabel, area.name);
    setText(els.tankTotal, fmt(price * tankLiters));
    setText(els.literPrice, fmt(price));
    setText(els.marketTank, fmt(ref.market * tankLiters) + " kr");
    setText(els.energyTank, fmt(ref.energy * tankLiters) + " kr");
    setText(els.carbonTank, fmt(ref.carbon * tankLiters) + " kr");
    setText(els.vatTank, fmt(ref.vat * tankLiters) + " kr");
    setText(els.taxTank, fmt(ref.tax * tankLiters) + " kr");
    setText(els.taxShare, wholePercent.format(ref.tax / price * 100) + " % av tankningen");
    setText(els.updatedLabel, countyData.updatedAt ? "Prisdata " + countyData.updatedAt : "Prisdata");

    if (countyData.source) els.priceSource.href = countyData.source;
    if (ref.fuel.taxSource) els.taxSource.href = ref.fuel.taxSource;

    renderScenario(price);
    syncUrl();
  }

  function loadStateFromUrl() {
    const params = new URLSearchParams(location.search);
    const fuel = params.get("fuel");
    const county = params.get("county");
    const party = params.get("party");

    if (fuelData[fuel]) state.fuel = fuel;
    if (areasById.has(county)) state.county = county;
    if (scenarios[party] && partyOrder.includes(party)) state.party = party;
  }

  function bindEvents() {
    for (const button of els.fuelButtons) {
      button.addEventListener("click", () => {
        state.fuel = button.dataset.fuel;
        render();
      });
    }

    els.countySelect.addEventListener("change", () => {
      state.county = els.countySelect.value;
      render();
    });

    els.partySelect.addEventListener("change", () => {
      state.party = els.partySelect.value;
      renderScenario(getPrice());
      syncUrl();
    });
  }

  function clearLegacyOfflineLayer() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations()
        .then(registrations => Promise.all(registrations.map(registration => registration.unregister())))
        .catch(() => {});
    }
    if ("caches" in window) {
      caches.keys()
        .then(keys => Promise.all(keys.filter(key => key.startsWith("vadkostarsoppan-")).map(key => caches.delete(key))))
        .catch(() => {});
    }
  }

  loadStateFromUrl();
  initializeControls();
  els.countySelect.value = state.county;
  els.partySelect.value = state.party;
  bindEvents();
  render();
  clearLegacyOfflineLayer();
})();
