import fs from "node:fs";
import crypto from "node:crypto";

const registry=JSON.parse(fs.readFileSync("data/source-registry.json","utf8"));
const path="data/official-source-state.json";
const old=fs.existsSync(path)?JSON.parse(fs.readFileSync(path,"utf8")):{sources:{}};
const now=new Date().toISOString();
const next={generatedAt:now,sources:{}};
const changes=[];
const normalize=s=>s.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
for(const src of registry.sources.filter(x=>x.official&&x.automation==="monitor")){
  const r=await fetch(src.url,{redirect:"follow",headers:{"user-agent":"vadkostarsoppan-official-monitor/1.0"}});
  if(!r.ok) throw new Error(`${src.id}: HTTP ${r.status}`);
  const text=normalize(await r.text());
  const hash=crypto.createHash("sha256").update(text).digest("hex");
  next.sources[src.id]={url:src.url,hash,checkedAt:now};
  if(old.sources?.[src.id]?.hash&&old.sources[src.id].hash!==hash) changes.push({id:src.id,url:src.url});
}
fs.writeFileSync(path,JSON.stringify(next,null,2)+"\n");
fs.writeFileSync("data/official-source-changes.json",JSON.stringify({checkedAt:now,changes},null,2)+"\n");
console.log(changes.length?`Official source changes: ${changes.map(x=>x.id).join(", ")}`:"No official source changes.");
