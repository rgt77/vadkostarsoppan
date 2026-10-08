import assert from "node:assert/strict";
import fs from "node:fs";

const script = fs.readFileSync("script.js", "utf8");
const calculateSource = script.match(/^  function calculate\(price\) \{[\s\S]*?^  \}/m)?.[0];
assert.ok(calculateSource, "Production calculation function must be testable");

const scope = {};
new Function("window", fs.readFileSync("fuel-data.js", "utf8"))(scope);

const calculate = new Function("fuelData", "fuelKey", "referenceDate", "price", `
  const state = { fuel: fuelKey };
  const priceData = { updatedAt: referenceDate };
  const validMoney = value => Number.isFinite(value) && value >= 0;
  const validVatRate = value => Number.isFinite(value) && value >= 0 && value <= 100;
  function getTaxPeriod(fuel, date) {
    return fuel?.taxPeriods?.find(period => period.validFrom <= date && date <= period.validTo) ?? null;
  }
  ${calculateSource}
  return calculate(price);
`);

const check = (fuel, price, expectedExcise) => {
  const result = calculate(scope.FUEL_DATA, fuel, "2026-10-08", price);
  assert.ok(result, fuel + " must calculate");
  assert.equal(result.taxPeriod?.validFrom, "2026-10-01");
  assert.ok(Math.abs(result.exciseTax - expectedExcise) < 1e-9);
  assert.ok(Math.abs(result.vat - price / 5) < 1e-9);
  assert.ok(Math.abs(result.market + result.exciseTax + result.vat - price) < 1e-9);
};
check("petrol", 18.70, 2.39);
check("petrol98", 19.72, 2.39);
check("diesel", 22.26, 1.561);

const previous = calculate(scope.FUEL_DATA, "petrol", "2026-09-30", 16.87);
assert.equal(previous.taxPeriod.validFrom, "2026-07-01");
assert.ok(Math.abs(previous.exciseTax - 1.57) < 1e-9);

const e85 = calculate(scope.FUEL_DATA, "e85", "2026-10-08", 15.68);
assert.equal(e85.blendDependent, true);
assert.equal(e85.taxPeriod, null);
assert.ok(Math.abs(e85.tax - e85.vat) < 1e-9);

assert.equal(calculate(scope.FUEL_DATA, "petrol", "2027-01-01", 18.70), null);
assert.equal(calculate(scope.FUEL_DATA, "diesel", "2026-10-08", 0), null);
console.log("Fuel calculations PASS");
