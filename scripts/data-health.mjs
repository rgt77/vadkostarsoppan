import fs from "node:fs";

const loadWindow = file => {
  const w = {};
  new Function("window", fs.readFileSync(file, "utf8"))(w);
  return w;
};
const utcDay = value => {
  const ms = Date.parse(value + "T00:00:00Z");
  return Number.isFinite(ms) ? Math.floor(ms / 86400000) : null;
};
const todayUtcDay = utcDay(new Date().toISOString().slice(0,10));
const days = date => {
  const day = utcDay(date);
  return day === null || todayUtcDay === null ? null : todayUtcDay - day;
};
const prices = loadWindow("price-data.js").PRICE_DATA;
const fuels = loadWindow("fuel-data.js").FUEL_DATA;
const policies = loadWindow("policy-data.js").POLICY_SCENARIOS;
const policyState = JSON.parse(fs.readFileSync("data/policy-source-state.json","utf8"));
const now = new Date().toISOString();
const market = JSON.parse(fs.readFileSync("data/market-data.json","utf8"));
const duty = JSON.parse(fs.readFileSync("data/reduction-duty.json","utf8"));
const today = now.slice(0,10);
const activeDuty=(duty.periods||[]).find(p=>p.validFrom<=today&&today<=p.validTo);
const checks = []; // Health status excludes informational anomalies from warning severity; source access limits are classified separately.

const add=(id,status,message,source=null)=>checks.push({id,status,message,source});
const priceAge = days(prices.updatedAt);
const retrievalAge = days(prices.retrievedAt);
add("prices:freshness", priceAge!==null && priceAge>=0 && priceAge<=3 ? "ok":"error", priceAge===null ? "Prisdatum saknas eller är ogiltigt" : priceAge<0 ? "Prisdatum ligger i framtiden" : `Prisdata är ${priceAge} dag(ar) gammal`, prices.source);
add("prices:retrieval", retrievalAge!==null && retrievalAge>=0 && retrievalAge<=2 ? "ok":"error", retrievalAge===null ? "Hämtningsdatum saknas eller är ogiltigt" : retrievalAge<0 ? "Hämtningsdatum ligger i framtiden" : `Priskällan hämtades för ${retrievalAge} dag(ar) sedan`, prices.source);
add("prices:dates", prices.retrievedAt >= prices.updatedAt ? "ok":"error", prices.retrievedAt >= prices.updatedAt ? "Hämtningsdatum är förenligt med källdatum" : "Hämtningsdatum är äldre än källdatum", prices.source);
for (const [fuelKey,fuel] of Object.entries(fuels)) {
  if (fuel.taxModel === "blend_dependent") {
    add(`tax:${fuelKey}`,"ok","Blandningsberoende punktskatt hanteras utan konstruerad fast skattesats",fuel.taxSource);
    continue;
  }
  const active=(fuel.taxPeriods||[]).find(p=>p.validFrom<=today&&today<=p.validTo);
  add(`tax:${fuelKey}`,active?"ok":"error",active?`Giltig skatteperiod ${active.validFrom}–${active.validTo}`:"Ingen giltig skatteperiod",fuel.taxSource);
}
for (const [key,p] of Object.entries(policies)) {
  const monitored=policyState.sources?.[key];
  const healthy = monitored?.status === "ok" || (monitored?.hash && !monitored?.status);
  const blocked = monitored?.status === "access_blocked";
  add(`policy:${key}`, healthy || blocked ? "ok" : "warning", healthy ? "Officiell källa bevakas" : blocked ? "Officiell källa verifierad men blockerar automatisk hämtning (HTTP 403)" : monitored ? "Källan kunde inte nås vid senaste kontroll" : "Bevakning ännu ej initialiserad", p.source);
}
const requiredFuelKeys = ["petrol","petrol98","e85","diesel"];
const invalidPrices = requiredFuelKeys.filter(k => !Number.isFinite(prices.national?.[k]) || prices.national[k] < 5 || prices.national[k] > 50);
add("prices:plausibility", invalidPrices.length ? "error" : "ok", invalidPrices.length ? `Orimligt eller saknat rikssnitt: ${invalidPrices.join(", ")}` : "Fyra rimliga nationella rikssnitt", prices.source);
const priceHistory = JSON.parse(fs.readFileSync("data/price-history.json","utf8"));
const snapshots = priceHistory.snapshots || [];
const latestHistory = snapshots.at(-1);
const latestHistoryComplete = requiredFuelKeys.every(k => Number.isFinite(latestHistory?.national?.[k]));
add("prices:history-sync", latestHistory?.date === prices.updatedAt && latestHistoryComplete ? "ok":"error", latestHistory?.date === prices.updatedAt && latestHistoryComplete ? "Senaste historikdatum matchar publicerat rikssnitt" : "Prishistorik och publicerat rikssnitt är inte komplett synkroniserade", prices.source);
const validHistoryDates = snapshots.every(row => /^\\d{4}-\\d{2}-\\d{2}$/.test(row.date));
const orderedHistory = validHistoryDates && snapshots.every((row,index)=>index===0 || snapshots[index-1].date < row.date);
add("prices:history-order", orderedHistory ? "ok":"error", orderedHistory ? "Prishistoriken är strikt kronologisk" : "Prishistoriken innehåller dubbletter eller fel ordning", prices.source);
add("policy:reduction-duty",activeDuty?"ok":"error",activeDuty?`Reduktionsplikt ${activeDuty.petrolPct}% bensin / ${activeDuty.dieselPct}% diesel`:"Ingen aktiv reduktionspliktsperiod",duty.source);
const fxAge=market.fx?.observationDate ? days(market.fx.observationDate) : null;
add("market:usdsek",market.fx?.usdSek>0 && fxAge!==null && fxAge>=0 && fxAge<=7?"ok":"warning",market.fx?.usdSek>0?(fxAge===null?"USD/SEK har ogiltigt observationsdatum":fxAge<0?"USD/SEK-observationen ligger i framtiden":`USD/SEK ${market.fx.usdSek}, ${fxAge} dag(ar) gammal`):"Väntar på första Riksbankshämtningen",market.fx?.source);
const summary={
  date: now.slice(0,10),
  status:checks.some(x=>x.status==="error")?"error":checks.some(x=>x.status==="warning")?"warning":"ok",
  counts:{ok:checks.filter(x=>x.status==="ok").length,warning:checks.filter(x=>x.status==="warning").length,error:checks.filter(x=>x.status==="error").length},
  checks,
  anomalies:[]
};
fs.writeFileSync("data/data-health.json",JSON.stringify(summary,null,2)+"\n");
console.log(JSON.stringify(summary,null,2));
if(summary.status==="error") process.exitCode=1;
