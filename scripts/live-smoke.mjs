const base=(process.env.SITE_URL||"https://vadkostarsoppan.se").replace(/\/$/,"");
const expectedVersion=process.env.EXPECTED_VERSION||null;
const failures=[],checks=[];
const check=(id,condition,message)=>{checks.push({id,ok:Boolean(condition),message});if(!condition)failures.push(message);};
const get=async path=>{const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);try{return await fetch(base+path,{redirect:"follow",signal:controller.signal,headers:{"user-agent":"vadkostarsoppan-live-smoke/1.0","cache-control":"no-cache"}})}finally{clearTimeout(timer)}};

try{
 const home=await get("/"); check("home:http",home.ok,`Startsidan svarade HTTP ${home.status}`);
 const html=await home.text();
 check("home:identity",html.includes("Vad kostar det att tanka?"),"Startsidan saknar huvudrubriken");
 const liveVersion=html.match(/style\.css\?v=([0-9.]+)/)?.[1]||null;
 if(expectedVersion) check("home:version",liveVersion===expectedVersion,`Live-sidan kör ${liveVersion||"okänd version"}, förväntat ${expectedVersion}`);
 else check("home:version",Boolean(liveVersion),liveVersion?`Live-version ${liveVersion}`:"Live-version kunde inte identifieras");
 check("home:canonical",html.includes('href="https://vadkostarsoppan.se/"'),"Canonical saknas live");
 check("home:app-script",html.includes("script.js"),"Applikationsskript saknas live");
 check("home:price-data",html.includes("price-data.js"),"Prisdata-skript saknas live");
 check("home:fuel-data",html.includes("fuel-data.js"),"Bränsledata-skript saknas live");
 const robots=await get("/robots.txt"); const robotsText=await robots.text();
 check("robots:http",robots.ok,`robots.txt svarade HTTP ${robots.status}`);
 check("robots:sitemap",robotsText.includes("https://vadkostarsoppan.se/sitemap.xml"),"robots.txt saknar sitemap");
 const sitemap=await get("/sitemap.xml"); const sitemapText=await sitemap.text();
 check("sitemap:http",sitemap.ok,`sitemap.xml svarade HTTP ${sitemap.status}`);
 check("sitemap:home",sitemapText.includes("<loc>https://vadkostarsoppan.se/</loc>"),"Sitemap saknar startsidan");
 const missing=await get("/__live-smoke-missing-page__");
 check("404:http",missing.status===404,`Okänd sida gav HTTP ${missing.status}, förväntat 404`);
}catch(error){failures.push("Live smoke kunde inte slutföras: "+String(error.message||error));}
const result={checkedAt:new Date().toISOString(),base,expectedVersion,status:failures.length?"error":"ok",checks,failures};
console.log(JSON.stringify(result,null,2));if(failures.length)process.exit(1);
