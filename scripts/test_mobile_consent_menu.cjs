"use strict";
/* Dependency-free runtime test: unknown/accept/reject/settings consent, GA4 gate.
   Also enforces single Home mobile menu owner and accessibility attributes.
   Does not claim real-browser rendering or axe accessibility certification. */
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const analytics=fs.readFileSync(path.join(root,"scripts/wpa-analytics.js"),"utf8");
const home=fs.readFileSync(path.join(root,"index.html"),"utf8");
const institute=fs.readFileSync(path.join(root,"institute.html"),"utf8");
const core=fs.readFileSync(path.join(root,"scripts/wpa-performance-core.js"),"utf8");

function harness(options={}){
 const map=new Map(),callbacks={},consent=new Map(),scripts=[];
 if(options.consent)consent.set("wpa.analytics.consent.v1",options.consent);
 class El{
  constructor(tag){this.tag=tag;this.attrs={};this.listeners={};this.hidden=false;this.checked=false;this.children=new Map();this.textContent="";this.id="";this.innerHTML="";this._focused=false;}
  setAttribute(k,v){this.attrs[k]=String(v);}
  getAttribute(k){return this.attrs[k]||null;}
  addEventListener(k,f){this.listeners[k]=f;}
  click(){if(this.listeners.click)this.listeners.click.call(this,{type:"click"});}
  focus(){this._focused=true;}
  querySelector(selector){if(!this.children.has(selector))this.children.set(selector,new El(selector));return this.children.get(selector);}
  remove(){if(this.id)map.delete(this.id);this._removed=true;}
  appendChild(child){if(child.id)map.set(child.id,child);scripts.push({tag:child.tag,id:child.id,src:child.src||""});return child;}
 }
 const doc={
  readyState:"loading",
  documentElement:{lang:options.lang||"mk"},
  body:new El("body"),
  head:new El("head"),
  addEventListener:(name,cb)=>callbacks[name]=cb,
  getElementById:id=>map.get(id)||null,
  createElement:tag=>new El(tag)
 };
 const win={};
 const env={
  window:win,
  document:doc,
  navigator:{doNotTrack:options.dnt||"0",globalPrivacyControl:options.gpc||false},
  localStorage:{getItem:key=>consent.get(key)||null,setItem:(key,v)=>consent.set(key,v),removeItem:key=>consent.delete(key)},
  fetch:async url=>({ok:true,json:async()=>({measurementId:"G-1234567890",consentRequired:false})}),
  encodeURIComponent,console,Date
 };
 vm.runInNewContext(analytics,env,{filename:"wpa-analytics.js",timeout:5000});
 return {env,win,doc,consent,scripts,async boot(){callbacks.DOMContentLoaded();await new Promise(resolve=>setImmediate(resolve));await new Promise(resolve=>setImmediate(resolve));return doc.getElementById("wpaAnalyticsConsentBanner");}};
}
async function run(){
 let n=0;
 const a=harness();
 const banner=await a.boot();
 assert(banner,"unknown consent must show banner even if config.consentRequired=false");n++;
 assert(!a.scripts.some(x=>x.id==="wpaGoogleTagLoader"),"GA4 loaded pre-consent");n++;
 for(const selector of [".wpa-accept",".wpa-decline",".wpa-settings-toggle",".wpa-analytics-save",".wpa-analytics-cancel","#wpaAnalyticsOptIn"]){
  assert(banner.querySelector(selector),selector+" missing");n++;
 }
 banner.querySelector(".wpa-settings-toggle").click();
 assert.equal(banner.querySelector("#wpaAnalyticsPreferences").hidden,false);n++;
 assert.equal(banner.querySelector(".wpa-settings-toggle").attrs["aria-expanded"],"true");n++;
 banner.querySelector(".wpa-analytics-cancel").click();
 assert.equal(banner.querySelector("#wpaAnalyticsPreferences").hidden,true);n++;
 assert.equal(banner.querySelector(".wpa-settings-toggle")._focused,true);n++;
 banner.querySelector(".wpa-decline").click();
 assert.equal(a.consent.get("wpa.analytics.consent.v1"),"denied");n++;
 assert(!a.scripts.some(x=>x.id==="wpaGoogleTagLoader"),"GA4 loaded after reject");n++;
 const b=harness(),bBanner=await b.boot();
 bBanner.querySelector(".wpa-accept").click();
 assert.equal(b.consent.get("wpa.analytics.consent.v1"),"granted");n++;
 assert(b.scripts.some(x=>x.id==="wpaGoogleTagLoader"),"GA4 absent after explicit accept");n++;
 const c=harness(),cBanner=await c.boot();
 cBanner.querySelector(".wpa-settings-toggle").click();
 cBanner.querySelector("#wpaAnalyticsOptIn").checked=false;
 cBanner.querySelector(".wpa-analytics-save").click();
 assert.equal(c.consent.get("wpa.analytics.consent.v1"),"denied");n++;
 assert(!c.scripts.some(x=>x.id==="wpaGoogleTagLoader"));n++;
 const d=harness({lang:"en"}),dBanner=await d.boot();
 assert.equal(dBanner.querySelector(".wpa-settings-toggle").textContent,"Settings");n++;
 dBanner.querySelector(".wpa-settings-toggle").click();
 dBanner.querySelector("#wpaAnalyticsOptIn").checked=true;
 dBanner.querySelector(".wpa-analytics-save").click();
 assert.equal(d.consent.get("wpa.analytics.consent.v1"),"granted");n++;
 assert(d.scripts.some(x=>x.id==="wpaGoogleTagLoader"));n++;
 const e=harness({gpc:true}),eBanner=await e.boot();
 assert.equal(eBanner,null);n++;
 assert(!e.scripts.some(x=>x.id==="wpaGoogleTagLoader"),"GA4 loaded under GPC");n++;
 const f=harness({consent:"denied"}),fBanner=await f.boot();
 assert.equal(fBanner,null);n++;
 assert(!f.scripts.some(x=>x.id==="wpaGoogleTagLoader"));n++;

 assert(!analytics.includes("if (config.consentRequired === false)"),"old pre-consent bypass present");n++;
 assert(analytics.includes("min-height:44px")&&analytics.includes("wpa-analytics-preferences"),"consent settings/touch targets missing");n++;
 assert(home.includes('aria-controls", "wpaMobileDrawerV14"'),"home menu lacks aria-controls");n++;
 assert(home.includes("if (wasOpen) parts.btn.focus()"),"home menu lacks focus return");n++;
 assert(home.includes('var focusables = Array.prototype.slice.call(parts.drawer.querySelectorAll'),"home menu lacks Tab trapping");n++;
 assert(!home.includes("mt.addEventListener('click'"),"duplicate static mToggle handler still installed");n++;
 assert(!core.includes("installAnchorFallback();installMobileMenu();"),"recovery script still binds duplicate mToggle");n++;
 assert(institute.includes('btn.setAttribute("aria-controls", nav.id)'),"Institute menu lacks controls attribute");n++;
 assert(institute.includes('btn.focus();'),"Institute menu lacks focus return");n++;
 console.log("WPA mobile + consent deterministic contract PASS:",n,"assertions (real browser required separately).");
}
run().catch(e=>{console.error(e);process.exitCode=1;});
