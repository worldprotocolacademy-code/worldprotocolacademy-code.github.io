/* WPA Video v1.0: local facilitator simulator; no live media backend. */
(function(){'use strict';
var remaining=5400,timer=null,muted=true,hands=[],questions=[];
function q(id){return document.getElementById(id);}function name(){return(q('participant').value||'Student').trim().slice(0,60);}function safe(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function clock(){var m=Math.floor(remaining/60),s=remaining%60;q('clock').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');}
function policy(cap){cap=Number(cap);if(cap<=50)return'1 host + 1 moderator · open discussion windows · up to 5 breakout groups.';if(cap<=100)return'1 host + 2 moderators