import fs from "node:fs";

const readJson = file => JSON.parse(fs.readFileSync(file,"utf8"));
const loadWindow = file => { const w={}; new Function("window",fs.readFileSync(file,"utf8"))(w); return w; };
const today = new Intl.DateTimeFormat("sv-SE",{timeZone:"Europe/Stockholm",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
const age = date => Math.floor((Date.parse(today+"T12:00:00Z")-Date.parse(date+"T12:00:00Z"))/86400000);
const failures=[], warnings=[], checks=[];
const check=(id,ok,message,severity="error")=>{checks.push({id,ok,message,severity});if(!ok)(severity==="warning"?warnings:failures).push(message);};

const prices=loadWindow("price-data.js").PRICE_DATA;
const priceHistory=readJson("data/price-history.json");
const market=readJson("data/market-data.json");
const marketHistory=readJson("data/market-history.json");
const health=readJson("data/data-health.json");

check("health:status",health.status==="ok",`Data health: ${health.status}`);
check("prices:fresh",age(prices.updatedAt)<=3,`Prisdata är ${age(prices.updatedAt)} dagar gammal`);
check("prices:history",priceHistory.snapshots?.length>=2,`Prishistorik har ${priceHistory.snapshots?.length??0} mätningar`,"warning");
check("prices:latest-history",priceHistory.snapshots?.at(-1)?.date===prices.updatedAt,"Senaste priset saknas i historiken");
check("market:value",Number.isFinite(market.fx?.usdSek)&&market.fx.usdSek>5&&market.fx.usdSek<20,"USD/SEK saknas eller är orimlig");
check("market:fresh",age(market.fx?.observationDate)<=7,`Marknadsdata är ${age(market.fx?.observationDate)} dagar gammal`,"warning");
check("market:history",marketHistory.snapshots?.length>=1,"Marknadshistorik saknas");
check("history:price-order",(priceHistory.snapshots??[]).every((x,i,a)=>i===0||a[i-1].date<x.date),"Prishistoriken är inte strikt kronologisk");
check("history:market-order",(marketHistory.snapshots??[]).every((x,i,a)=>i===0||a[i-1].date<x.date),"Marknadshistoriken är inte strikt kronologisk");

const result={date:today,status:failures.length?"error":warnings.length?"warning":"ok",counts:{ok:checks.filter(x=>x.ok).length,warning:warnings.length,error:failures.length},checks};
fs.writeFileSync("data/production-audit.json",JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result,null,2));
if(failures.length) process.exitCode=1;
