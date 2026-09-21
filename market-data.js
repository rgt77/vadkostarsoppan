window.MARKET_DATA = {
  updatedAt: "2026-09-21",
  weeklyReference: {
    asOf: "17 september 2026",
    sourceName: "EU-kommissionens Weekly Oil Bulletin",
    source: "https://energy.ec.europa.eu/data-and-analysis/weekly-oil-bulletin_en",
    petrol: 17.09,
    diesel: 22.36,
    note: "Svenskt veckoreferenspris vid pump. Används som referens, inte som ett individuellt stationspris."
  },
  brent: {
    asOf: "15 september 2026",
    usdPerBarrel: 130.80,
    sourceName: "U.S. EIA – Brent Europe spot",
    source: "https://www.eia.gov/dnav/pet/PET_PRI_SPT_S1_D.htm",
    note: "Råoljepris. Det är en marknadsdrivare och ska inte likställas med färdig bensin eller diesel."
  },
  fx: {
    asOf: "21 september 2026",
    usdSek: 9.6899,
    sourceName: "ECB-baserad USD/SEK-referens",
    source: "https://ycharts.com/indicators/swedish_krona_to_us_dollar_exchange_rate",
    note: "Omräknad från 1 SEK = 0,1032 USD."
  },
  constants: {
    litersPerBarrel: 158.987294928
  }
};
