import assert from "node:assert/strict";
import { parseFuelPrices } from "../scripts/price-parser.mjs";

const fixture = `
  <script>const bogus = "Diesel 99,99 kr/l";</script>
  <h1>Snittpriset på 95-oktanig bensin är just nu 18,70 kr/liter och diesel kostar 22,26 kr/liter</h1>
  <p>Prisdata uppdaterad 2026-10-08</p>
  <div>Bensin 95 18,70 kr/l</div>
  <div>Bensin 98 19,72 kr/l</div>
  <div>Diesel 22,26 kr/l</div>
  <div>Etanol E85 15,68 kr/l</div>
  <table><tr><td>2026-10-07</td><td>18,61 kr</td></tr></table>
`;
assert.deepEqual(parseFuelPrices(fixture), {
  updatedAt: "2026-10-08",
  national: { petrol: 18.70, petrol98: 19.72, e85: 15.68, diesel: 22.26 }
});
assert.equal(parseFuelPrices(fixture.replace(/Snittpriset på 95-oktanig[\s\S]*?<\/h1>/, "")).national.petrol, 18.70);
assert.throws(() => parseFuelPrices(fixture.replace("19,72 kr/l", "saknas")), /petrol98/);
assert.throws(() => parseFuelPrices(fixture.replace("Prisdata uppdaterad 2026-10-08", "")), /date/);
assert.throws(() => parseFuelPrices(fixture.replace("Bensin 95 18,70", "Bensin 95 17,70")), /disagree/);
assert.throws(() => parseFuelPrices(fixture.replace("Diesel 22,26", "Diesel 21,26")), /disagree/);
console.log("Price parser PASS");
