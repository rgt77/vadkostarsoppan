import fs from "node:fs";
import crypto from "node:crypto";

const registry=JSON.parse(fs.readFileSync("data/source-registry.json","utf8"));
const path="data/official-source-state.json";
const old=fs.existsSync(path)?JSON.parse(fs.readFileSync(path,"utf8")):{sources:{}};
const next={sources:{}};
const changes=[];
const normalize=s=>s.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();

for(const src of registry.sources.filter(x=>x.official&&x.automation==="monitor")){
  const previous=old.sources?.[src.id];
  try{
    const r=await fetch(src.url,{redirect:"follow",headers:{"user-agent":"vadkostarsoppan-official-monitor/1.0"}});
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    const text=normalize(await r.text());
    const hash=crypto.createHash("sha256").update(text).digest("hex");
    next.sources[src.id]={url:src.url,hash,status:"ok",checkedAt:new Date().toISOString()};
    if(previous?.hash&&previous.hash!==hash) changes.push({id:src.id,url:src.url,oldHash:previous.hash,newHash:hash});
  }catch(error){
    const message=String(error.message??error);
    next.sources[src.id]={url:src.url,hash:previous?.hash??null,status:message.includes("HTTP 403")?"access_blocked":"unreachable",error:message,checkedAt:new Date().toISOString()};
  }
}
fs.writeFileSync(path,JSON.stringify(next,null,2)+"\n");
fs.writeFileSync("data/official-source-changes.json",JSON.stringify({changes},null,2)+"\n");
console.log(changes.length?`Official source changes: ${changes.map(x=>x.id).join(", ")}`:"No official source changes.");
