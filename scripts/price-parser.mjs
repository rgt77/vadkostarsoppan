// Isolated, testable parser for Carculated national pump-price data.
const parseNumber = raw => Number(raw.replace(",", "."));

export function parseFuelPrices(html) {
  const text = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&aring;/gi, "å").replace(/&auml;/gi, "ä").replace(/&ouml;/gi, "ö")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ").trim();

  const date = text.match(/Prisdata uppdaterad\s+(\d{4}-\d{2}-\d{2})/i)?.[1];
  const headline = text.match(/Snittpriset på 95-oktanig bensin är just nu\s+([\d,.]+)\s+kr\/liter och diesel kostar\s+([\d,.]+)\s+kr\/liter/i);
  const card = label => text.match(new RegExp(label + "\\s+([\\d,.]+)\\s+kr\\/l", "i"))?.[1];

  const headline95 = headline ? parseNumber(headline[1]) : null;
  const headlineDiesel = headline ? parseNumber(headline[2]) : null;
  const card95 = card("Bensin 95");
  const cardDiesel = card("Diesel");
  const petrol = headline95 ?? (card95 ? parseNumber(card95) : NaN);
  const diesel = headlineDiesel ?? (cardDiesel ? parseNumber(cardDiesel) : NaN);
  const petrol98Raw = card("Bensin 98");
  const e85Raw = card("Etanol E85");
  const national = {
    petrol, petrol98: petrol98Raw ? parseNumber(petrol98Raw) : NaN,
    e85: e85Raw ? parseNumber(e85Raw) : NaN, diesel
  };

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date + "T12:00:00Z"))) {
    throw new Error("Missing or invalid price source date");
  }
  for (const [fuel, value] of Object.entries(national)) {
    if (!Number.isFinite(value) || value < 5 || value > 50) {
      throw new Error("Missing or implausible national price: " + fuel);
    }
  }
  if (headline && card95 && Math.abs(headline95 - parseNumber(card95)) > 0.01) {
    throw new Error("Bensin 95 headline and price card disagree");
  }
  if (headline && cardDiesel && Math.abs(headlineDiesel - parseNumber(cardDiesel)) > 0.01) {
    throw new Error("Diesel headline and price card disagree");
  }
  return { updatedAt: date, national };
}
