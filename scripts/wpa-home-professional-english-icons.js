/* WPA Home Professional English Visual Layer v1.0 */
(function(){
'use strict';
if(window.WPA_HOME_PE_VISUALS_LOADED)return;window.WPA_HOME_PE_VISUALS_LOADED=true;

var items=[
{key:'a_professional_english.6',icon:'🏛',label:'Protocol English'},
{key:'a_professional_english.8',icon:'🌐',label:'Diplomatic English'},
{key:'a_professional_english.10',icon:'✉',label:'Institutional Email English'},
{key:'a_professional_english.12',icon:'🎙',label:'Conference and Moderation English'},
{key:'a_professional_english.14',icon:'📣',label:'Public Presence English'},
{key:'a_professional_english.16',icon:'🛡',label:'Executive Response and Recovery Phrases'}
];

function style(){
 if(document.getElementById('wpa-home-pe-visual-style'))return;
 var s=document.createElement('style');s.id='wpa-home-pe-visual-style';
 s.textContent='.wpa-home-pe-icon{display:inline-grid;place-items:center;width:34px;height:34px;margin:0 10px 0 0;border:1px solid rgba(201,168,76,.48);border-radius:8px;background:rgba(201,168,76,.10);font-size:18px;line-height:1;vertical-align:middle}.wpa-home-pe-title-row{display:flex!important;align-items:center!important;gap:0!important}.wpa-home-pe-toolkit-link{display:inline-flex;align-items:center;justify-content:center;margin-top:16px;padding:10px 14px;border:1px solid rgba(201,168,76,.55);border-radius:6px;background:rgba(201,168,76,.10);color:var(--goldl,#e8d49a)!important;font-size:12px;font-weight:700;letter-spacing:.2px}.wpa-home-pe-toolkit-link:hover{background:rgba(201,168,76,.18)}';
 document.head.appendChild(s);
}

function findHeading(key,label){
 return document.querySelector('[data-i18n="'+key+'"]') || Array.prototype.find.call(document.querySelectorAll('strong'),function(el){return String(el.textContent||'').trim()===label;});
}

function mount(){
 style();
 var first=null;
 items.forEach(function(item){
   var heading=findHeading(item.key,item.label);if(!heading)return;
   var card=heading.parentElement;if(!card)return;
   if(!first)first=card;
   if(card.querySelector('.wpa-home-pe-icon'))return;
   var row=document.createElement('div');row.className='wpa-home-pe-title-row';
   var icon=document.createElement('span');icon.className='wpa-home-pe-icon';icon.setAttribute('aria-hidden','true');icon.textContent=item.icon;
   card.insertBefore(row,heading);row.appendChild(icon);row.appendChild(heading);
 });
 if(first){
   var list=first.parentElement;
   if(list && !list.querySelector('.wpa-home-pe-toolkit-link')){
     var a=document.createElement('a');a.className='wpa-home-pe-toolkit-link';a.href='/professional-english.html';a.textContent='Open Professional English Toolkit →';a.setAttribute('data-no-i18n','true');a.setAttribute('translate','no');list.appendChild(a);
   }
 }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
window.setTimeout(mount,300);window.setTimeout(mount,1200);
})();
