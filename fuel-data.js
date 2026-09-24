window.FUEL_DATA = {
  petrol: {
    label: "Bensin 95",
    vatRate: 25,
    taxPeriods: [
      { validFrom: "2026-07-01", validTo: "2026-09-30", energyTax: 0.70, carbonTax: 0.87 },
      { validFrom: "2026-10-01", validTo: "2026-11-30", energyTax: 1.52, carbonTax: 0.87 },
      { validFrom: "2026-12-01", validTo: "2026-12-31", energyTax: 1.52, carbonTax: 3.27 }
    ],
    taxSource: "https://www.skatteverket.se/foretag/skatterochavdrag/punktskatter/energiskatter/skattpabransle.4.15532c7b1442f256bae5e56.html",
    verifiedAt: "2026-09-23"
  },
  petrol98: {
    label: "Bensin 98",
    vatRate: 25,
    taxPeriods: [
      { validFrom: "2026-07-01", validTo: "2026-09-30", energyTax: 0.70, carbonTax: 0.87 },
      { validFrom: "2026-10-01", validTo: "2026-11-30", energyTax: 1.52, carbonTax: 0.87 },
      { validFrom: "2026-12-01", validTo: "2026-12-31", energyTax: 1.52, carbonTax: 3.27 }
    ],
    taxSource: "https://www.skatteverket.se/foretag/skatterochavdrag/punktskatter/energiskatter/skattpabransle.4.15532c7b1442f256bae5e56.html",
    verifiedAt: "2026-09-23"
  },
  e85: {
    label: "E85",
    vatRate: 25,
    taxModel: "blend_dependent",
    taxPeriods: [],
    taxSource: "https://www.skatteverket.se/foretag/skatterochavdrag/punktskatter/energiskatter.4.18e1b10334ebe8bc8000843.html",
    verifiedAt: "2026-09-23"
  },
  diesel: {
    label: "Diesel",
    vatRate: 25,
    taxPeriods: [
      { validFrom: "2026-07-01", validTo: "2026-09-30", energyTax: 0.831, carbonTax: 0.411 },
      { validFrom: "2026-10-01", validTo: "2026-11-30", energyTax: 1.150, carbonTax: 0.411 },
      { validFrom: "2026-12-01", validTo: "2026-12-31", energyTax: 1.150, carbonTax: 2.811 }
    ],
    taxSource: "https://www.skatteverket.se/foretag/skatterochavdrag/punktskatter/energiskatter/skattpabransle.4.15532c7b1442f256bae5e56.html",
    verifiedAt: "2026-09-23"
  }
};

window.SITE_DATA = {
  appVersion: "0.66.0",
  defaultFuel: "petrol",
  typicalTankLiters: 40,
  priceWarningAfterDays: 2,
  marketWarningAfterDays: 7
};
