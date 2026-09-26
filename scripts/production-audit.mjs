import fs from "node:fs";

const readJson = file => JSON.parse(fs.readFileSync(file,"utf8"));
const loadWindow = file => { const w={}; new Function("window",fs.readFileSync(file,"utf8"))(w); return w; };
const today = new Intl.DateTimeFormat("sv-SE",{timeZone:"Europe/Stockholm",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
const age = date => Math.floor((Date.parse(today+"T12:00:00Z")-Date.parse(date+"T12:00:00Z"))/86400000);
const failures=[], warnings=[], checks=[];
const check=(id,ok,okMessage,failMessage,severity="error")=>{const message=ok?okMessage:failMessage;checks.push({id,ok,message,severity});if(!ok)(severity==="warning"?warnings:failures).push(message);};

const prices=loadWindow("price-data.js").PRICE_DATA;
const priceHistory=readJson("data/price-history.json");
const market=readJson("data/market-data.json");
const marketHistory=readJson("data/market-history.json");
const health=readJson("data/data-health.json");
const requiredFuelKeys=["petrol","petrol98","e85","diesel"];

check("health:errors",(health.counts?.error??0)===0,"Data health har inga blockerande fel",`Data health har ${health.counts?.error??0} blockerande fel`);
check("health:warnings",(health.counts?.warning??0)===0,"Data health har inga varningar",`Data health har ${health.counts?.warning??0} varning(ar) som bör granskas`,"warning");
check("prices:complete",requiredFuelKeys.every(k=>Number.isFinite(prices.national?.[k])), "Alla fyra nationella bränslepriser finns","Ett eller flera nationella bränslepriser saknas");
check("prices:fresh",age(prices.updatedAt)<=3,`Prisdata är ${age(prices.updatedAt)} dagar gammal`,`Prisdata är för gammal: ${age(prices.updatedAt)} dagar`);
check("prices:history",priceHistory.snapshots?.length>=2,`Prishistorik har ${priceHistory.snapshots?.length??0} mätningar`,"Prishistoriken har färre än 2 mätningar","warning");
check("prices:latest-complete",requiredFuelKeys.every(k=>Number.isFinite(priceHistory.snapshots?.at(-1)?.national?.[k])),"Senaste historikmätningen innehåller alla bränslen","Senaste historikmätningen är ofullständig");
check("prices:latest-history",priceHistory.snapshots?.at(-1)?.date===prices.updatedAt,"Senaste priset finns i historiken","Senaste priset saknas i historiken");
check("market:value",Number.isFinite(market.fx?.usdSek)&&market.fx.usdSek>5&&market.fx.usdSek<20,"USD/SEK är rimlig","USD/SEK saknas eller är orimlig");
check("market:fresh",age(market.fx?.observationDate)<=7,`Marknadsdata är ${age(market.fx?.observationDate)} dagar gammal`,`Marknadsdata är för gammal: ${age(market.fx?.observationDate)} dagar`,"warning");
check("market:history",marketHistory.snapshots?.length>=1,"Marknadshistorik finns","Marknadshistorik saknas");
check("history:price-order",(priceHistory.snapshots??[]).every((x,i,a)=>i===0||a[i-1].date<x.date),"Prishistoriken är strikt kronologisk","Prishistoriken är inte strikt kronologisk");
check("history:market-order",(marketHistory.snapshots??[]).every((x,i,a)=>i===0||a[i-1].date<x.date),"Marknadshistoriken är strikt kronologisk","Marknadshistoriken är inte strikt kronologisk");

const result={date:today,status:failures.length?"error":warnings.length?"warning":"ok",counts:{ok:checks.filter(x=>x.ok).length,warning:warnings.length,error:failures.length},checks};
fs.writeFileSync("data/production-audit.json",JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result,null,2));
if(failures.length) process.exitCode=1;
