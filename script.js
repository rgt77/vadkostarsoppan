(() => {
  "use strict";

  const fuelData = window.FUEL_DATA ?? {};
  const siteData = window.SITE_DATA ?? {};
  const priceData = window.PRICE_DATA ?? {};
  const scenarios = window.POLICY_SCENARIOS ?? {};
  const comparisons = window.POLICY_COMPARISON ?? {};
  const statusMeta = window.POLICY_STATUS_META ?? {};
  const adConfig = window.AD_CONFIG ?? { enabled: false };

  let tankLiters = Number(siteData.typicalTankLiters) || 40;
  const partyOrder = ["c", "kd", "l", "mp", "m", "s", "sd", "v"];
  const evidenceLabels = { party_estimate: "Partiets uppskattning", party_stated_target: "Partiets uttalade mål", quantified_inputs: "Delvis beräkningsbart underlag", not_quantified: "Ej numeriskt kvantifierat" };
  const partyLogos = {
    c: "/party-logos/c.svg",
    kd: "/party-logos/kd.svg",
    l: "/party-logos/l.svg",
    mp: "/party-logos/mp.png",
    m: "/party-logos/m.svg",
    s: "/party-logos/s.png",
    sd: "https://www.sd.se/wp-content/uploads/2022/07/logo_sd_logo_blasippa.png",
    v: "/party-logos/v.svg"
  };

  const $ = id => document.getElementById(id);
  const els = {
    fuelButtons: [...document.querySelectorAll("[data-fuel]")],
    tankLiterLabels: [...document.querySelectorAll("[data-tank-liters]")],
    tankSizeButtons: [...document.querySelectorAll("[data-tank-size]")],
    partyGrid: $("partyGrid"),
    updatedLabel: $("updatedLabel"),
    fuelLabel: $("fuelLabel"),
    tankTotal: $("tankTotal"),
    literPrice: $("literPrice"),
    marketPriceLabel: $("marketPriceLabel"),
    marketTank: $("marketTank"),
    energyTaxLabel: $("energyTaxLabel"),
    energyTank: $("energyTank"),
    carbonTaxLabel: $("carbonTaxLabel"),
    carbonTank: $("carbonTank"),
    vatTank: $("vatTank"),
    taxSummaryLabel: $("taxSummaryLabel"),
    taxTank: $("taxTank"),
    taxShare: $("taxShare"),
    nonTaxShare: $("nonTaxShare"),
    taxBarFill: $("taxBarFill"),
    policyDetails: $("policyDetails"),
    partyResult: $("partyResult"),
    scenarioLabel: $("scenarioLabel"),
    scenarioTankPrice: $("scenarioTankPrice"),
    scenarioTankUnit: $("scenarioTankUnit"),
    scenarioLiterPrice: $("scenarioLiterPrice"),
    scenarioDelta: $("scenarioDelta"),
    scenarioNote: $("scenarioNote"),
    partySource: $("partySource"),
    scenarioReferenceDate: $("scenarioReferenceDate"),
    scenarioMeta: $("scenarioMeta"), partyAnswer: $("partyAnswer"),
    scenarioReset: $("scenarioReset"),
    scenarioComparison: $("scenarioComparison"),
    scenarioBaseTank: $("scenarioBaseTank"),
    scenarioResultTank: $("scenarioResultTank"),
    policyFacts: $("policyFacts"),
    policyComparison: $("policyComparison"), policyStatus: $("policyStatus"), policyStatusHelp: $("policyStatusHelp"), policyFuels: $("policyFuels"), policyInstrument: $("policyInstrument"), policyCompensation: $("policyCompensation"), policyReason: $("policyReason"),
    priceSource: $("priceSource"),
    taxSource: $("taxSource"),
    dataStatus: $("dataStatus"),
  };

  const state = {
    fuel: fuelData[siteData.defaultFuel] ? siteData.defaultFuel : "petrol",
    party: "",

  };

  const money = new Intl.NumberFormat("sv-SE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const wholePercent = new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 });
  const swedishDate = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  const fmt = value => Number.isFinite(value) ? money.format(value) : "—";
  const setText = (node, value) => {
    if (node && node.textContent !== value) node.textContent = value;
  };

  function todayIso() {
    return swedishDate.format(new Date());
  }

  function daysBetween(olderIso, newerIso = todayIso()) {
    if (!olderIso || !newerIso) return null;
    const older = Date.parse(olderIso + "T12:00:00Z");
    const newer = Date.parse(newerIso + "T12:00:00Z");
    return Number.isFinite(older) && Number.isFinite(newer)
      ? Math.floor((newer - older) / 86400000)
      : null;
  }
  function taxTransitionCrossed(fuel, fromDate, toDate = todayIso()) {
    if (!fuel || !fromDate || !toDate || fromDate >= toDate) return false;
    const transitions = fuel.taxModel === "blend_dependent"
      ? (fuel.taxTransitionDates || [])
      : (fuel.taxPeriods || []).slice(1).map(period => period.validFrom);
    return transitions.some(date => fromDate < date && date <= toDate);
  }

  function priceState() {
    const value = Number(priceData.national?.[state.fuel]);
    const updatedAge = daysBetween(priceData.updatedAt);
    const retrievedAge = daysBetween(priceData.retrievedAt);
    if (!Number.isFinite(value) || value < 5 || value > 50) return { status: "invalid", value: NaN, updatedAge, retrievedAge };
    if (updatedAge === null || updatedAge < 0 || retrievedAge === null || retrievedAge < 0) return { status: "invalid_date", value, updatedAge, retrievedAge };
    if (updatedAge > 3 || retrievedAge > 2) return { status: "stale", value, updatedAge, retrievedAge };
    if (taxTransitionCrossed(fuelData[state.fuel], priceData.updatedAt)) return { status: "tax_transition", value, updatedAge, retrievedAge };
    return { status: "fresh", value, updatedAge, retrievedAge };
  }

  function getPrice() {
    return priceState().value;
  }

  function getTaxPeriod(fuel, date = todayIso()) {
    return fuel?.taxPeriods?.find(period => period.validFrom <= date && date <= period.validTo) ?? null;
  }

  const validMoney = value => Number.isFinite(value) && value >= 0;
  const validVatRate = value => Number.isFinite(value) && value >= 0 && value <= 100;

  function calculate(price) {
    const fuel = fuelData[state.fuel];
    if (!fuel || !Number.isFinite(price) || price <= 0 || !validVatRate(fuel.vatRate)) return null;

    const vatFactor = 1 + fuel.vatRate / 100;
    const beforeVat = price / vatFactor;
    const vat = price - beforeVat;
    if (!validMoney(beforeVat) || !validMoney(vat)) return null;

    if (fuel.taxModel === "blend_dependent") {
      return { fuel, taxPeriod: null, vat, market: beforeVat, tax: vat, total: price, blendDependent: true };
    }

    const taxDate = priceData.updatedAt || todayIso();
    const taxPeriod = getTaxPeriod(fuel, taxDate);
    if (!taxPeriod || !validMoney(taxPeriod.energyTax) || !validMoney(taxPeriod.carbonTax)) return null;
    const exciseTax = taxPeriod.energyTax + taxPeriod.carbonTax;
    const market = beforeVat - exciseTax;
    const tax = exciseTax + vat;
    if (!validMoney(market) || !validMoney(tax)) return null;

    const reconstructed = market + exciseTax + vat;
    if (Math.abs(reconstructed - price) > 0.000001) return null;

    return { fuel, taxPeriod, vat, market, exciseTax, tax, total: price, blendDependent: false };
  }

  function scenarioEvaluation(basePrice, scenario) {
    const model = scenario?.priceModel;
    const referenceDate = priceData.updatedAt || todayIso();
    if (!scenario || !model) return { status: "missing" };
    if (!Number.isFinite(basePrice) || basePrice <= 0) return { status: "invalid_price" };
    if (!["party_delta", "stated_target"].includes(model.type) || !Number.isFinite(model.delta)) return { status: "not_quantified" };
    if (model.validFrom && referenceDate < model.validFrom) return { status: "outside_date", referenceDate };
    if (model.validTo && referenceDate > model.validTo) return { status: "outside_date", referenceDate };
    if (Array.isArray(model.fuels) && !model.fuels.includes(state.fuel)) return { status: "unsupported_fuel", referenceDate };
    const price = basePrice + model.delta;
    if (!Number.isFinite(price) || price <= 0) return { status: "invalid_result", referenceDate };
    return { status: "available", price, referenceDate };
  }

  function scenarioUnavailableText(evaluation, scenario) {
    if (evaluation.status === "unsupported_fuel") return "Det dokumenterade scenariot gäller inte " + fuelData[state.fuel].label + ".";
    if (evaluation.status === "outside_date") return "Referensdagen ligger utanför scenariots dokumenterade giltighet.";
    if (evaluation.status === "invalid_price") return "Rikssnittet kan inte verifieras. Partiets prisförändring beräknas inte.";
    if (evaluation.status === "invalid_result") return "Underlaget ger inget giltigt beräkningsresultat.";
    return scenario.method;
  }

  function loadStateFromUrl() {
    const params = new URLSearchParams(location.search);
    const fuel = params.get("fuel");
    const party = params.get("party");
    const tank = Number(params.get("tank"));

    if (fuelData[fuel]) state.fuel = fuel;
    if (partyOrder.includes(party) && scenarios[party]) state.party = party;
    else if (party !== null) state.party = "";
    if ([30,40,50,60].includes(tank)) tankLiters = tank;
    else if (params.has("tank")) tankLiters = Number(siteData.typicalTankLiters) || 40;
  }

  function syncUrl() {
    const url = new URL(location.href);
    url.searchParams.set("fuel", state.fuel);
    tankLiters === siteData.typicalTankLiters ? url.searchParams.delete("tank") : url.searchParams.set("tank", String(tankLiters));
    state.party ? url.searchParams.set("party", state.party) : url.searchParams.delete("party");

    const next = url.pathname + url.search + url.hash;
    const current = location.pathname + location.search + location.hash;
    if (next !== current) history.replaceState(null, "", next);
  }

  function buildPartyButtons() {
    const fragment = document.createDocumentFragment();

    for (const key of partyOrder) {
      const scenario = scenarios[key];
      if (!scenario) continue;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "party-button";
      button.dataset.party = key;
      button.setAttribute("aria-label", scenario.name);
      button.setAttribute("aria-pressed", "false");

      const logoBox = document.createElement("span");
      logoBox.className = "party-logo-box " + key;

      const image = document.createElement("img");
      image.className = "party-logo";
      image.src = partyLogos[key];
      image.alt = "";
      image.decoding = "async";
      image.loading = "lazy";
      image.addEventListener("error", () => button.classList.add("logo-failed"), { once: true });

      const fallback = document.createElement("span");
      fallback.className = "party-abbr";
      fallback.textContent = key.toUpperCase();

      const label = document.createElement("span");
      label.className = "party-name";
      label.textContent = key.toUpperCase();

      logoBox.append(image, fallback);
      button.append(logoBox, label);
      fragment.append(button);
    }

    els.partyGrid?.replaceChildren(fragment);
    updatePartySelection();
  }

  function updatePartySelection() {
    for (const button of els.partyGrid?.children ?? []) {
      const selected = button.dataset.party === state.party;
      button.setAttribute("aria-pressed", String(selected));
      button.classList.toggle("selected", selected);
      button.tabIndex = selected || !state.party ? 0 : -1;
    }
  }

  function renderScenario(basePrice) {
    const scenario = scenarios[state.party];
    setText(els.scenarioReferenceDate, priceData.updatedAt || "—");
    if (els.scenarioReset) els.scenarioReset.hidden = !scenario;
    if (els.scenarioComparison) els.scenarioComparison.hidden = true;
    if (els.policyFacts) els.policyFacts.replaceChildren();
    if (els.policyComparison) els.policyComparison.hidden = true;
    if (els.partyAnswer) { els.partyAnswer.hidden = true; els.partyAnswer.textContent = ""; }
    if (els.policyDetails) { els.policyDetails.hidden = !scenario; els.policyDetails.open = false; }

    els.partyResult.className = "party-result";
    els.scenarioTankPrice.className = "";
    els.scenarioDelta.className = "party-delta";

    if (!scenario) {
      els.partyResult.classList.add("empty");
      setText(els.scenarioLabel, "Välj ett parti ovan");
      setText(els.scenarioTankPrice, "");
      els.scenarioTankUnit.hidden = true;
      setText(els.scenarioLiterPrice, "");
      setText(els.scenarioDelta, "");
      setText(els.scenarioNote, "Om ett parti inte har publicerat tillräckligt exakta nivåer visar vi inget påhittat pris.");
      if (els.policyDetails) els.policyDetails.hidden = true;
      if (els.scenarioMeta) { els.scenarioMeta.hidden = true; els.scenarioMeta.textContent = ""; }
      return;
    }

    setText(els.scenarioLabel, scenario.name);
    if (els.scenarioMeta) {
      els.scenarioMeta.hidden = false;
      els.scenarioMeta.textContent = (evidenceLabels[scenario.evidence] || "Dokumenterat underlag") + " · Prisdata " + (priceData.updatedAt || "—") + " · Politik verifierad " + (scenario.verifiedAt || "—");
    }
    const comparison = comparisons[state.party];
    if (comparison && els.policyComparison) {
      els.policyComparison.hidden = false;
      const status = statusMeta[comparison.calculability] || { label: "Ej exakt beräkningsbart", detail: "" };
      setText(els.policyStatus, status.label);
      setText(els.policyStatusHelp, status.detail);
      const applicableFuels = scenario.priceModel?.fuels;
      setText(els.policyFuels, Array.isArray(applicableFuels) ? applicableFuels.map(fuel => fuelData[fuel]?.label || fuel).join(" · ") : "Övergripande policy");
      setText(els.policyInstrument, comparison.instrument);
      setText(els.policyCompensation, comparison.compensation);
      setText(els.policyReason, comparison.reason);
      els.policyComparison.dataset.calculability = comparison.calculability;
      els.policyComparison.setAttribute("aria-label", scenario.name + ": " + status.label);
    }
    const evaluation = scenarioEvaluation(basePrice, scenario);
    const resultLiter = evaluation.status === "available" ? evaluation.price : null;
    if (els.partyAnswer && comparison) {
      els.partyAnswer.hidden = false;
      els.partyAnswer.textContent = evaluation.status === "unsupported_fuel"
        ? "Ingen dokumenterad prisberäkning för " + fuelData[state.fuel].label + ". " + comparison.known
        : resultLiter === null
          ? comparison.known
          : "Dokumenterad prisuppgift: " + fmt(resultLiter) + " kr/l · " + tankLiters + " liter = " + fmt(resultLiter * tankLiters) + " kr.";
    }

    if (resultLiter === null) {
      els.partyResult.classList.add("unavailable");
      els.scenarioTankPrice.classList.add("text-result");
      setText(els.scenarioTankPrice, evaluation.status === "unsupported_fuel" ? "Gäller inte valt bränsle" : "Ingen exakt prisuppgift");
      els.scenarioTankUnit.hidden = true;
      setText(els.scenarioLiterPrice, "");
      setText(els.scenarioDelta, "");
      setText(els.scenarioNote, scenarioUnavailableText(evaluation, scenario) + (evaluation.status === "not_quantified" ? "" : " " + scenario.method));
    } else {
      const baseTank = basePrice * tankLiters;
      const resultTank = resultLiter * tankLiters;
      const deltaTank = resultTank - baseTank;
      if (els.scenarioComparison) els.scenarioComparison.hidden = false;
      setText(els.scenarioBaseTank, fmt(baseTank) + " kr");
      setText(els.scenarioResultTank, fmt(resultTank) + " kr");

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

      if (scenario.priceModel.type === "party_delta") {
        const deltaLiter = resultLiter - basePrice;
        const sign = deltaLiter >= 0 ? "+" : "−";
        setText(
          els.scenarioNote,
          scenario.method +
          " För " + tankLiters + " liter motsvarar " + sign + fmt(Math.abs(deltaLiter)) +
          " kr/l en skillnad på " + fmt(Math.abs(deltaTank)) + " kr."
        );
      } else {
        setText(els.scenarioNote, scenario.method);
      }
    }

    
    const background = scenario.method;
    if (background && els.policyFacts) {
      els.policyFacts.hidden = false;
      const title = document.createElement("strong");
      title.textContent = "Dokumenterad bakgrund";
      const text = document.createElement("p");
      text.textContent = background;
      els.policyFacts.append(title, text);
    }

    els.partySource.href = scenario.source;
    els.partySource.setAttribute("aria-label", "Öppna officiell källa för " + scenario.name);
  }

  function renderDataStatus(ref) {
    const health = priceState();
    const dateLabel = priceData.updatedAt || "—";
    setText(els.updatedLabel, "Prisdata " + dateLabel + (
      health.status === "stale" ? " · äldre data" :
      health.status === "tax_transition" ? " · väntar på dagens pris" :
      health.status === "fresh" ? "" : " · kontrollera"
    ));

    if (health.status === "invalid" || health.status === "invalid_date") {
      els.dataStatus.className = "data-status data-status--error";
      els.dataStatus.innerHTML = "<strong>Datastatus</strong> Prisunderlaget kan inte verifieras. Resultatet ska inte användas förrän nästa giltiga uppdatering.";
      return;
    }
    if (health.status === "stale") {
      els.dataStatus.className = "data-status data-status--warning";
      els.dataStatus.innerHTML = "<strong>Datastatus</strong> Senaste verifierade rikssnittet är " + health.updatedAge + " dagar gammalt. Beloppen visas som senast kända värden.";
      return;
    }
    if (health.status === "tax_transition") {
      els.dataStatus.className = "data-status data-status--warning";
      els.dataStatus.innerHTML = "<strong>Datastatus</strong> Senaste verifierade rikssnittet är från " + dateLabel + ". Skatten har ändrats sedan dess, så prisets delar visas med skattesatsen som gällde när rikssnittet mättes. Sidan växlar automatiskt när ett nytt rikssnitt publiceras.";
      return;
    }
    els.dataStatus.className = "data-status data-status--ok";
    if (ref?.blendDependent) {
      els.dataStatus.innerHTML = "<strong>Datastatus</strong> Prisdata aktuell. För E85 beror punktskatten på bränslets faktiska bio-/bensinandel; vi visar därför inte en konstruerad fast punktskatt.";
    } else if (ref?.taxPeriod) {
      els.dataStatus.innerHTML = "<strong>Datastatus</strong> Prisdata aktuell. Skattesatsen gäller " + ref.taxPeriod.validFrom + "–" + ref.taxPeriod.validTo + ".";
    } else {
      els.dataStatus.className = "data-status data-status--error";
      els.dataStatus.innerHTML = "<strong>Datastatus</strong> Ingen giltig skatteperiod finns för dagens datum. Kalkylen behöver uppdateras.";
    }
  }








  function calculationViewModel(price, liters = tankLiters) {
    const ref = calculate(price);
    if (!ref || !Number.isFinite(liters) || liters <= 0) return null;
    const taxPct = ref.tax / price * 100;
    const boundedTaxPct = Math.max(0, Math.min(100, taxPct));
    return {
      ref,
      price,
      liters,
      tankTotal: price * liters,
      marketTank: ref.market * liters,
      energyTank: ref.blendDependent ? null : ref.taxPeriod.energyTax * liters,
      carbonTank: ref.blendDependent ? null : ref.taxPeriod.carbonTax * liters,
      vatTank: ref.vat * liters,
      taxTank: ref.tax * liters,
      taxPct,
      boundedTaxPct
    };
  }

  function renderCalculation(view) {
    if (!view) {
      setText(els.tankTotal, "Data saknas");
      setText(els.literPrice, "—");
      return;
    }
    const { ref, price, liters, tankTotal, marketTank, energyTank, carbonTank, vatTank, taxTank, taxPct, boundedTaxPct } = view;
    setText(els.fuelLabel, ref.fuel.label);
    setText(els.tankTotal, fmt(tankTotal));
    setText(els.literPrice, fmt(price));
    setText(els.marketPriceLabel, ref.blendDependent ? "Pris före moms (punktskatt ej särredovisad)" : "Pris före skatt & moms");
    setText(els.marketTank, fmt(marketTank) + " kr");
    setText(els.energyTaxLabel, "Energiskatt");
    setText(els.carbonTaxLabel, "Koldioxidskatt");
    setText(els.energyTank, ref.blendDependent ? "Varierar med bränslemixen" : fmt(energyTank) + " kr");
    setText(els.carbonTank, ref.blendDependent ? "Varierar med bränslemixen" : fmt(carbonTank) + " kr");
    setText(els.vatTank, fmt(vatTank) + " kr");
    setText(els.taxSummaryLabel, ref.blendDependent ? "Moms (känd del)" : "Skatt och moms");
    setText(els.taxTank, fmt(taxTank) + " kr");
    setText(els.taxShare, ref.blendDependent ? wholePercent.format(taxPct) + " % moms" : wholePercent.format(taxPct) + " % skatt och moms");
    setText(els.nonTaxShare, ref.blendDependent ? "Punktskatt varierar med bränslemixen" : wholePercent.format(100 - taxPct) + " % övrigt");
    if (els.taxBarFill) {
      els.taxBarFill.style.width = boundedTaxPct + "%";
      els.taxBarFill.parentElement?.setAttribute("aria-valuenow", String(Math.round(boundedTaxPct)));
    }
    els.priceSource.href = priceData.source;
    els.taxSource.href = ref.fuel.taxSource;
  }

  function renderSelections() {
    for (const button of els.fuelButtons) button.setAttribute("aria-pressed", String(button.dataset.fuel === state.fuel));
    for (const button of els.tankSizeButtons) button.setAttribute("aria-pressed", String(Number(button.dataset.tankSize) === tankLiters));
    for (const node of els.tankLiterLabels) setText(node, String(tankLiters));
  }

  function render() {
    const price = getPrice();
    const health = priceState();
    const view = calculationViewModel(price);
    renderSelections();
    renderCalculation(view);
    renderDataStatus(view?.ref ?? null);
    if (["fresh","stale","tax_transition"].includes(health.status)) renderScenario(price);
    else renderScenario(NaN);
    syncUrl();
  }

  const allowedTankLiters = new Set([30,40,50,60]);
  function setFuel(fuel) { if (!fuelData[fuel] || fuel === state.fuel) return; state.fuel = fuel; render(); }
  function setTankLiters(liters) { if (!allowedTankLiters.has(liters) || liters === tankLiters) return; tankLiters = liters; render(); }
  function setParty(party) { if (party && (!partyOrder.includes(party) || !scenarios[party])) return; if (party === state.party) return; state.party = party; updatePartySelection(); const health = priceState(); renderScenario(["fresh","stale","tax_transition"].includes(health.status) ? getPrice() : NaN); syncUrl(); }

  function bindEvents() {
    for (const button of els.tankSizeButtons) {
      button.addEventListener("click", () => {
        const liters = Number(button.dataset.tankSize);
        if (!Number.isFinite(liters) || liters <= 0) return;
        setTankLiters(liters);
      });
    }
    for (const button of els.fuelButtons) {
      button.addEventListener("click", () => {
        setFuel(button.dataset.fuel);
      });
    }


    els.scenarioReset?.addEventListener("click", () => {
      setParty("");
    });

  els.partyGrid?.addEventListener("keydown", event => {
      if (!["ArrowLeft","ArrowRight","Home","End"].includes(event.key)) return;
      const buttons = [...els.partyGrid.querySelectorAll("[data-party]")];
      if (!buttons.length) return;
      const current = Math.max(0, buttons.indexOf(document.activeElement));
      const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
      event.preventDefault();
      buttons[next]?.focus();
    });

    els.partyGrid?.addEventListener("click", event => {
      const button = event.target.closest("[data-party]");
      if (!button) return;

      setParty(button.dataset.party);
    });
  }

  function initAds() {
    const containers = [...document.querySelectorAll("[data-ad-slot]")];
    if (!containers.length || !adConfig.enabled || adConfig.provider !== "adsense") return;
    if (!/^ca-pub-\d+$/.test(adConfig.client || "")) return;

    // A certified CMP must supply the IAB TCF interface. No CMP = no ad requests.
    if (typeof window.__tcfapi !== "function") return;
    const configured = containers.filter(container =>
      /^\d+$/.test(adConfig.slots?.[container.dataset.adSlot] || "")
    );
    if (!configured.length) return;
    let initialized = false;

    window.__tcfapi("addEventListener", 2, (tcData, success) => {
      if (!success || initialized || !["tcloaded", "useractioncomplete"].includes(tcData?.eventStatus)) return;
      const consent = tcData.gdprApplies === false ||
        (tcData.purpose?.consents?.[1] === true && tcData.vendor?.consents?.[755] === true);
      if (!consent) return;
      initialized = true;

      const adsScript = document.createElement("script");
      adsScript.async = true;
      adsScript.crossOrigin = "anonymous";
      adsScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" +
        encodeURIComponent(adConfig.client);
      adsScript.addEventListener("error", () => {
        for (const container of configured) container.hidden = true;
      }, { once: true });
      document.head.append(adsScript);

      for (const container of configured) {
        const ad = document.createElement("ins");
        ad.className = "adsbygoogle";
        ad.dataset.adClient = adConfig.client;
        ad.dataset.adSlot = adConfig.slots[container.dataset.adSlot];
        ad.dataset.adFormat = "auto";
        ad.dataset.fullWidthResponsive = "true";
        container.querySelector(".ad-slot-inner")?.append(ad);
        container.hidden = false;
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    });
  }

  window.addEventListener("popstate", () => { loadStateFromUrl(); updatePartySelection(); render(); });
  window.addEventListener("error", () => document.documentElement.classList.add("runtime-error"));
  window.addEventListener("unhandledrejection", () => document.documentElement.classList.add("runtime-error"));

  loadStateFromUrl();
  buildPartyButtons();
  for (const choice of els.tankSizeButtons) choice.setAttribute("aria-pressed", String(Number(choice.dataset.tankSize) === tankLiters));
  for (const node of els.tankLiterLabels) setText(node, String(tankLiters));
  bindEvents();
  render();
  initAds();

})();
