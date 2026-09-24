import fs from "node:fs";

const html=fs.readFileSync("index.html","utf8");
const css=fs.readFileSync("style.css","utf8");
const js=fs.readFileSync("script.js","utf8");
const failures=[];
const ok=(condition,message)=>{if(!condition)failures.push(message);};

const requiredMeta=[
  '<meta name="viewport"',
  '<meta name="description"',
  '<link rel="canonical"',
  'property="og:title"',
  'name="twitter:card"'
];
requiredMeta.forEach(x=>ok(html.includes(x),"Saknad metadata: "+x));
ok(html.includes('<html lang="sv">'),"Saknat svenskt lang-attribut");
ok(!html.includes('target="_blank"')||html.includes('rel="noopener'),"Extern länk saknar noopener");
ok(!/href=["']javascript:/i.test(html),"javascript:-länk hittad");
ok(!/<img\b(?![^>]*\balt=)[^>]*>/i.test(html),"Bild saknar alt-attribut");
ok(!/<button\b(?![^>]*\btype=)[^>]*>/i.test(html),"Knapp saknar type-attribut");
ok(css.includes("@media (max-width: 380px)")&&css.includes("@media(max-width:520px)")&&css.includes("@media (max-width: 640px)"),"Smala brytpunkter saknas");
ok(css.includes("prefers-reduced-motion"),"Reduced-motion-stöd saknas");
ok(css.includes(":focus-visible"),"Synligt tangentbordsfokus saknas");
ok(js.includes("history.replaceState"),"URL-state saknas");
ok(js.includes("try {")&&js.includes("catch"),"Frontend saknar defensiv felhantering");

const report={date:new Intl.DateTimeFormat("sv-SE",{timeZone:"Europe/Stockholm"}).format(new Date()),status:failures.length?"error":"ok",checks:13,failures};
fs.writeFileSync("data/release-audit.json",JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify(report,null,2));
if(failures.length)process.exit(1);
