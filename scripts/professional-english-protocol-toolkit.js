/* WPA Professional English Protocol Toolkit v1.0 */
(function(){
'use strict';
if(window.WPA_PE_TOOLKIT_LOADED)return;window.WPA_PE_TOOLKIT_LOADED=true;
var phrases=[
{cat:'Addressing',en:'Your Excellency,',mk:'Ваша Екселенцијо — формално обраќање до амбасадор во службен контекст.'},
{cat:'Addressing',en:'His Excellency the Ambassador of [Country]',mk:'Неговата Екселенција, амбасадорот на [држава] — формално писмено наведување.'},
{cat:'Addressing',en:'Her Excellency the Ambassador of [Country]',mk:'Нејзината Екселенција, амбасадорката на [држава] — формално писмено наведување.'},
{cat:'Opening',en:'Excellencies, distinguished guests, ladies and gentlemen,',mk:'Свечено отворање пред дипломатски кор, високи гости и публика.'},
{cat:'Opening',en:'It is a distinct honour to welcome you on behalf of [institution].',mk:'Формално институционално добредојде.'},
{cat:'Courtesy',en:'May I extend our sincere appreciation for your presence today.',mk:'Учтиво изразување благодарност за присуството.'},
{cat:'Courtesy',en:'We greatly value the constructive spirit of our cooperation.',mk:'Дипломатска формулација за позитивна билатерална соработка.'},
{cat:'Request',en:'We would be grateful if you could kindly confirm your availability.',mk:'Формално и ненаметливо барање за потврда.'},
{cat:'Request',en:'May we respectfully request your guidance on the following matter?',mk:'Учтиво институционално барање насока или став.'},
{cat:'Clarification',en:'Allow me to clarify this point in a precise and neutral manner.',mk:'Контролирана формулација за појаснување без конфронтација.'},
{cat:'Clarification',en:'For the sake of accuracy, I would prefer to verify the details before responding definitively.',mk:'Rescue phrase кога е потребна проверка пред конечен одговор.'},
{cat:'Disagreement',en:'We fully respect your position; however, our institutional assessment differs on this point.',mk:'Дипломатско несогласување со задржување на почит.'},
{cat:'Disagreement',en:'Perhaps we may consider an alternative formulation acceptable to all sides.',mk:'Формулација за деескалација и барање компромис.'},
{cat:'Moderation',en:'I now have the honour of inviting His/Her Excellency to address the audience.',mk:'Формално најавување амбасадор или висок дипломатски претставник.'},
{cat:'Moderation',en:'With your permission, I will now move to the next item on the agenda.',mk:'Учтиво управување со агенда и време.'},
{cat:'Time control',en:'May I kindly ask the speaker to conclude within the next minute?',mk:'Професионално ограничување на време без непочитување.'},
{cat:'Follow-up',en:'Further to our meeting, please find below the agreed next steps.',mk:'Институционален follow-up по состанок.'},
{cat:'Follow-up',en:'We remain at your disposal for any further clarification.',mk:'Формално затворање со понуда за дополнителна поддршка.'},
{cat:'Apology',en:'Please accept our sincere apologies for any inconvenience caused.',mk:'Формално институционално извинување.'},
{cat:'Closing',en:'Please accept, Your Excellency, the assurances of our highest consideration.',mk:'Високо формално дипломатско затворање на кореспонденција.'}
];
function copyText(t,b){if(navigator.clipboard){navigator.clipboard.writeText(t).then(function(){var old=b.textContent;b.textContent='✓ Copied';setTimeout(function(){b.textContent=old;},1200);});}}
function style(){var s=document.createElement('style');s.id='wpa-pe-toolkit-style';s.textContent='.pe-toolkit{padding:74px 0;background:#fff}.pe-toolkit-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.pe-phrase{border:1px solid #ddd3c3;border-radius:16px;padding:18px;background:#fffaf0;box-shadow:0 8px 24px rgba(20,31,52,.06)}.pe-phrase small{color:#9a7728;font-weight:900;text-transform:uppercase;letter-spacing:.5px}.pe-phrase blockquote{margin:10px 0;font:700 17px/1.45 Georgia,serif;color:#162947}.pe-copy{border:0;border-radius:999px;padding:8px 12px;background:#162947;color:#fff;font-weight:800;cursor:pointer}.pe-address-tool{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:22px 0}.pe-address-output{margin-top:14px;padding:16px;border-radius:14px;background:#07101d;color:#fff;white-space:pre-wrap}.pe-module-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.pe-module-actions button{background:#162947;color:#fff}.pe-top-link{padding:8px 12px!important;border-radius:999px;background:#f4d697;color:#162947!important}.pe-phrase-strip{background:#0f1b30;color:#fff;padding:9px 0;font-size:13px}.pe-phrase-strip .container{display:flex;gap:14px;align-items:center;overflow:auto;white-space:nowrap}.pe-phrase-strip a{color:#f4d697;font-weight:800}@media(max-width:800px){.pe-toolkit-grid,.pe-address-tool{grid-template-columns:1fr}}';document.head.appendChild(s);}
function addTopLink(){var ul=document.querySelector('header nav ul');if(!ul||ul.querySelector('[href="#diplomatic-language"]'))return;var li=document.createElement('li');li.innerHTML='<a class="pe-top-link" href="#diplomatic-language">Diplomatic Language</a>';ul.appendChild(li);var strip=document.createElement('div');strip.className='pe-phrase-strip';strip.innerHTML='<div class="container"><strong>Diplomatic English:</strong><a href="#diplomatic-language">Your Excellency</a><span>•</span><span>formal titles</span><span>•</span><span>protocol greetings</span><span>•</span><span>moderation phrases</span><span>•</span><span>rescue phrases</span></div>';var header=document.querySelector('header');if(header&&header.parentNode)header.parentNode.insertBefore(strip,header.nextSibling);}
function enhanceModules(){document.querySelectorAll('#modules .module-card').forEach(function(card){if(card.querySelector('.pe-module-actions'))return;var actions=document.createElement('div');actions.className='pe-module-actions';['Open phrases','Build example'].forEach(function(label,j){var b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=function(){if(j===0){location.hash='diplomatic-language';}else{location.hash='builder';}};actions.appendChild(b);});card.appendChild(actions);});}
function mount(){if(document.getElementById('diplomatic-language'))return;style();addTopLink();enhanceModules();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
