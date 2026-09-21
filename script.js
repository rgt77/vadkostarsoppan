const fuelData = {
  petrol: {
    label: "Bensin 95",
    energyTax: 0.70,
    carbonTax: 0.87,
    period: "1 juli–30 september 2026"
  },
  diesel: {
    label: "Diesel",
    energyTax: 0.831,
    carbonTax: 0.411,
    period: "1 juli–30 september 2026"
  }
};

let selectedFuel = "petrol";

const els = {
  input: document.querySelector("#pumpPrice"),
  totalPrice: document.querySelector("#totalPrice"),
  energyTax: document.querySelector("#energyTax"),
  carbonTax: document.querySelector("#carbonTax"),
  vat: document.querySelector("#vat"),
  other: document.querySelector("#other"),
  taxShare: document.querySelector("#taxShare"),
  tankTotal: document.querySelector("#tankTotal"),
  tankTax: document.querySelector("#tankTax"),
  donut: document.querySelector("#donut"),
  periodText: document.querySelector("#periodText"),
  tabs: [...document.querySelectorAll(".fuel-tab")]
};

const fmt = (value, digits = 2) =>
  new Intl.NumberFormat("sv-SE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value);

function parsePrice(value) {
  return Number(String(value).trim().replace(/\s/g, "").replace(",", "."));
}

function update() {
  const price = parsePrice(els.input.value);
  const fuel = fuelData[selectedFuel];

  if (!Number.isFinite(price) || price <= 0) return;

  const vat = price - price / 1.25;
  const energy = fuel.energyTax;
  const carbon = fuel.carbonTax;
  const excise = energy + carbon;
  const other = Math.max(0, price / 1.25 - excise);
  const totalTax = vat + excise;
  const taxPct = totalTax / price * 100;

  els.totalPrice.textContent = fmt(price);
  els.energyTax.textContent = fmt(energy) + " kr";
  els.carbonTax.textContent = fmt(carbon) + " kr";
  els.vat.textContent = fmt(vat) + " kr";
  els.other.textContent = fmt(other) + " kr";
  els.taxShare.textContent = fmt(taxPct, 1) + " %";
  els.tankTotal.textContent = fmt(price * 50) + " kr";
  els.tankTax.textContent = fmt(totalTax * 50) + " kr";
  els.periodText.textContent = "Skattesatserna på sidan gäller " + fuel.period + ".";

  const parts = [energy, carbon, vat, other];
  const colors = [
    "var(--energy)",
    "var(--carbon)",
    "var(--vat)",
    "var(--other)"
  ];

  let cursor = 0;
  const gradient = parts.map((part, i) => {
    const start = cursor;
    cursor += (part / price) * 360;
    return `${colors[i]} ${start.toFixed(2)}deg ${cursor.toFixed(2)}deg`;
  }).join(", ");

  els.donut.style.background = `conic-gradient(${gradient})`;
  els.donut.setAttribute(
    "aria-label",
    `${fuel.label}: ${fmt(taxPct, 1)} procent av pumppriset är energiskatt, koldioxidskatt och moms.`
  );
}

els.tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    selectedFuel = tab.dataset.fuel;
    els.tabs.forEach(btn => {
      const active = btn === tab;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", String(active));
    });
    update();
  });
});

els.input.addEventListener("input", update);
els.input.addEventListener("blur", () => {
  const price = parsePrice(els.input.value);
  if (Number.isFinite(price) && price > 0) {
    els.input.value = fmt(price);
  }
  update();
});

update();