"use strict";
/* Pure template regression for MK-first Institute Brief Builder.
   Runs original wpa-translator.js in isolated Node VM (no network, real DOM or mail). */
const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const path = require("node:path");
const script = fs.readFileSync(path.resolve(__dirname, "../wpa-translator.js"),"utf8");
const callbacks = {};
const env = {
  window:{},
  document:{
    readyState:"loading",
    documentElement:{ getAttribute:k=>k==="data-wpa-page"?"institute":null },
    getElementById:()=>null,
    querySelector:()=>null,
    querySelectorAll:()=>[],
    addEventListener:(name,fn)=>{callbacks[name]=fn}
  },
  localStorage:{setItem:()=>{},getItem:()=>null},
  navigator:{},
  CustomEvent:class{},
  setTimeout:()=>{},
  alert:()=>{},
  prompt:()=>{}
};
vm.runInNewContext(script,env,{filename:"wpa-translator.js",timeout:4000});
const core=env.window.WPAInstituteBriefCore;
assert(core&&typeof core.render==="function"&&typeof core.describeLocale==="function","Missing pure renderer");
const purposes=["institutional","services","briefing","correction","opc2027","lecture","journal"];
const domains=["protocol","diplomacy","communication","security","research","education"];
let assertions=0;
for(const locale of ["mk","en"]){
  const desc=core.describeLocale(locale);
  assert.equal(desc.locale,locale);
  assert.equal(desc.route,locale==="mk"?"/institute.html":"/en/institute.html");
  assert.equal(desc.languageLabel,locale==="mk"?"Македонски":"English");
  assertions+=3;
  for(const purpose of purposes)for(const domain of domains){
    const output=core.render({locale,purpose,domain,context:"Nastavna-proba-101"});
    assert.equal(output.locale,locale);
    assert.equal(output.route,desc.route);
    assert.equal(output.languageLabel,desc.languageLabel);
    assert(output.text.includes("Nastavna-proba-101"));
    assert(output.text.includes("\n\n"),"Must contain actual paragraph newlines");
    assert(!output.text.includes("Language: /institute.html"),"Route must never be used as Language");
    assert(!output.text.includes("Language: /en/institute.html"),"Route must never be used as Language");
    if(locale==="mk"){
      assert(output.text.startsWith("Бриф за WPA Институтот\n"),"MK-first header");
      assert(output.text.includes("Јазик: Македонски\nСтраница: /institute.html"),"MK labels and route");
      assert(output.text.includes("Институционална граница:"),"MK boundary");
      assert(!output.text.includes("Requested next step:"),"No stray EN heading in MK result");
    } else {
      assert(output.text.startsWith("WPA Institute Brief\n"),"EN header");
      assert(output.text.includes("Language: English\nPage: /en/institute.html"),"EN labels and route");
      assert(output.text.includes("Institutional boundary:"),"EN boundary");
      assert(!output.text.includes("Баран следен чекор:"),"No stray MK heading in EN result");
    }
    assertions+=11;
  }
}
assert(script.includes('id="wicBriefLocale"')&&!script.includes('id="wicLang"'),"UI must not conflate language selector with global route");
assert(script.includes("OPC 2027 expression of interest"),"Preserve current OPC 2027 inquiry type");
assert(script.includes("mailto:info@worldprotocolacademy.mk"),"Use canonical public contact");
assert(!script.includes("Both MK/EN"),"Mixed-language mode must be disabled to avoid hybrid output");
assert(!script.includes("mailto:institute@worldprotocolacademy.mk"),"Retire unverified address for this builder");
assert(!script.includes("window.location.href=value"),"Builder must not navigate based on language field");
assert.equal(typeof callbacks.DOMContentLoaded,"function");
assertions+=7;
const invalid=core.render({locale:"/institute.html",purpose:"unknown",domain:"unknown"});
assert.equal(invalid.locale,"mk");
assert(invalid.text.includes("Јазик: Македонски")&&invalid.text.includes("Страница: /institute.html"));
assertions+=2;
console.log("WPA Institute Brief Builder locale regression PASS:", assertions, "deterministic assertions for 84 MK/EN combinations.");
