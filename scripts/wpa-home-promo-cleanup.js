/* WPA homepage promotional cleanup v1.0 */
(function(){'use strict';
function removeHomePn003(){
  var announce=document.querySelector('.announce .announce-inner');
  if(!announce)return;
  Array.from(announce.children).forEach(function(node){
    var text=String(node.textContent||'');
    if(text.indexOf('New publication')!==-1&&text.indexOf('WPA-PN-003')!==-1){node.remove();}
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',removeHomePn003,{once:true});else removeHomePn003();
})();
