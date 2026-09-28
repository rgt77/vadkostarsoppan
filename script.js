(() => {
  "use strict";

  const fuelData = window.FUEL_DATA ?? {};
  const siteData = window.SITE_DATA ?? {};
  const priceData = window.PRICE_DATA ?? {};
  const scenarios = window.POLICY_SCENARIOS ?? {};
  const comparisons = window.POLICY_COMPARISON ?? {};
  const statusMeta = window.POLICY_STATUS_META ?? {};

  let tankLiters = Number(siteData.typicalTankLiters) || 40;
  const partyOrder = ["c", "kd", "l", "mp", "m", "s", "sd", "v"];
  const evidenceLabels = { party_estimate: "Partiets uppskattning", party_stated_target: "Partiets uttalade mål", quantified_inputs: "Delvis beräkningsbart underlag", not_quantified: "Ej numeriskt kvantifierat" };
  const partyLogos = {
    c: "https://commons.wikimedia.org/wiki/Special:FilePath/C%20v1.svg",
    kd: "https://commons.wikimedia.org/wiki/Special:FilePath/Kd%20v1.svg",
    l: "https://commons.wikimedia.org/wiki/Special:FilePath/L%20v1.svg",
    mp: "/party-logos/mp.png",
    m: "https://commons.wikimedia.org/wiki/Special:FilePath/Moderate%20Party%20logo.svg",
    s: "/party-logos/s.png",
    sd: "https://www.sd.se/wp-content/uploads/2022/07/logo_sd_logo_blasippa.png",
    v: "https://commons.wikimedia.org/wiki/Special:FilePath/V%C3%A4nsterpartiet%20logo.svg"
  };

  const policyBackground = {
      "mp": "Miljöpartiets budgetmotion för 2026 beräknar ett prispåslag vid pump på cirka 2,2 kr/l under infasningen av ett svenskt handelssystem. Underlaget anger 12 % reduktionsplikt för bensin och 25 % för diesel samt höjd koldioxidskatt på bensin. Intäkter på cirka 4,05 miljarder kronor kopplas till en grön utdelning på 2 900 kr per vuxen och år för vissa lands- och glesbygdshushåll med lägre inkomster; barn anges få halva beloppet. Utdelningen visas som separat kompensation och räknas inte av från pumppriset.",
      "v": "Vänsterpartiet vill höja reduktionsplikten från dagens 10 %, men anger ingen exakt ny nivå. Partiet motsatte sig 2026 års tillfälliga sänkning av bensin- och dieselskatten och föreslår i stället riktad kompensation till bilägare med lägre inkomster, med avtrappning upp till 45 000 kr/mån och högre stöd där kollektivtrafiken är särskilt dålig. På sikt vill V också ha geografiskt differentierad vägtrafikbeskattning. Sverigebiljetten föreslås kosta 450 kr/mån för vuxna och 225 kr för barn, unga och pensionärer från 2027. Stöden påverkar hushållens kostnad men är inte ett nationellt pumppris.",
      "c": "Centerpartiets aktuella 2026-förslag vill skattebefria biodrivmedel som blandas i bensin och diesel och beskriver en ökning från 10 till 17 procent 2028 utan högre pumppris som mål. Partiet vill också bygga upp en biodieselreserv på 2 miljarder kronor. Äldre Tanka svenskt-material innehåller prisuppskattningar, men de byggde på 30,5 procents inblandning och dåtidens skatter och används därför inte som ett 2026-prisscenario.",
      "s": "Socialdemokraterna kräver 2026 en tillfällig skattesänkning på bensin och diesel men anger ingen exakt kr/l-nivå. I budgetunderlaget för 2026 finns också Sverigebränslet: 19,3 % basinblandning för diesel och 10,0 % för bensin, plus en rörlig tilläggsinblandning som ska kunna anpassas efter prisbilden. Ett äldre S-underlag uppskattade minst 4 kr/l lägre dieselpris under dåvarande 2024-förutsättningar; den siffran är historisk och används inte på dagens pris.",
      "l": "Liberalerna står bakom 10 procents reduktionsplikt och beskrev skattesänkning som kompensation för prispåslaget. Under energikrisen 2026 presenterade partiet tillsammans med regeringen en tillfällig sänkning av bränsleskatten med 3 kr/l. L drev också halverat periodkort i kollektivtrafiken 1 juli–31 december 2026 där regionerna genomför stödet. Kollektivtrafikstödet påverkar inte pumppriset och 3-kronorsåtgärden behandlas som tidsbunden, inte som ett permanent L-pris.",
      "kd": "KD:s aktuella 2026-linje är att reduktionsplikten ska ligga på EU:s miniminivå. Äldre underlag anger 6 % för bensin och diesel från 2024 och uppskattade då cirka 5,50 kr/l lägre dieselpris. Samma äldre källa jämförde 2026 med ett dåvarande motförslag och angav 7 kr/l lägre diesel. Dessa siffror är historiska eller kontrafaktiska och används inte som avdrag från dagens pumppris.",
      "m": "Moderaternas aktuella underlag anger cirka 1,03 kr/l för bensin och 0,40 kr/l för diesel vid full prisövervältring när skatten sänks till EU:s miniminivå, samt ytterligare 3 kr/l 1 juli–30 november 2026. Reduktionsplikten anges till 10 % för bensin och diesel och skatten indexeras inte upp under 2026. Partiet säger att den tillfälliga sänkningen kan förlängas om omvärldsläget består, men ingen sådan framtida period antas här. Separat stöd till kollektivtrafik påverkar inte pumppriset.",
      "sd": "SD:s drivmedelssida redovisar Bensin 95: 23,54 → 14,34 kr/l och diesel: 26,46 → 16,09 kr/l mellan juni 2022 och juli 2026. Det är ett observerat historiskt prisutfall, inte en isolerad kausal partieffekt. Under 2026 genomfördes också tidsbegränsade skattesänkningar: först till EU:s miniminivå och därefter ytterligare 2,40 kr/l i koldioxidskatt, cirka 3 kr/l inklusive moms vid full övervältring. Eftersom dessa åtgärder redan påverkar dagens rikssnitt dras de inte av igen i ett SD-scenario."
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
  function priceState() {
    const value = Number(priceData.national?.[state.fuel]);
    const updatedAge = daysBetween(priceData.updatedAt);
    const retrievedAge = daysBetween(priceData.retrievedAt);
    if (!Number.isFinite(value) || value < 5 || value > 50) return { status: "invalid", value: NaN, updatedAge, retrievedAge };
    if (updatedAge === null || updatedAge < 0 || retrievedAge === null || retrievedAge < 0) return { status: "invalid_date", value, updatedAge, retrievedAge };
    if (updatedAge > 3 || retrievedAge > 2) return { status: "stale", value, updatedAge, retrievedAge };
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

    const taxPeriod = getTaxPeriod(fuel);
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
      setText(els.scenarioLabel, "Välj ett parti");
      setText(els.scenarioTankPrice, "—");
      els.scenarioTankUnit.hidden = false;
      setText(els.scenarioLiterPrice, "— kr/l");
      setText(els.scenarioDelta, "—");
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
          : "Dokumenterad prisuppgift: " + fmt(resultLiter) + " kr/l · " + state.liters + " liter = " + fmt(resultLiter * state.liters) + " kr.";
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

    
    const background = policyBackground[state.party];
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
    setText(els.updatedLabel, "Prisdata " + dateLabel + (health.status === "stale" ? " · äldre data" : health.status === "fresh" ? "" : " · kontrollera"));

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
    if (health.status === "fresh" || health.status === "stale") renderScenario(price);
    else renderScenario(NaN);
    syncUrl();
  }

  const allowedTankLiters = new Set([30,40,50,60]);
  function setFuel(fuel) { if (!fuelData[fuel] || fuel === state.fuel) return; state.fuel = fuel; render(); }
  function setTankLiters(liters) { if (!allowedTankLiters.has(liters) || liters === tankLiters) return; tankLiters = liters; render(); }
  function setParty(party) { if (party && (!partyOrder.includes(party) || !scenarios[party])) return; if (party === state.party) return; state.party = party; updatePartySelection(); const health = priceState(); renderScenario(health.status === "fresh" || health.status === "stale" ? getPrice() : NaN); syncUrl(); }

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

  window.addEventListener("popstate", () => { loadStateFromUrl(); updatePartySelection(); render(); });
  window.addEventListener("error", () => document.documentElement.classList.add("runtime-error"));
  window.addEventListener("unhandledrejection", () => document.documentElement.classList.add("runtime-error"));

  loadStateFromUrl();
  buildPartyButtons();
  for (const choice of els.tankSizeButtons) choice.setAttribute("aria-pressed", String(Number(choice.dataset.tankSize) === tankLiters));
  for (const node of els.tankLiterLabels) setText(node, String(tankLiters));
  bindEvents();
  render();

})();
