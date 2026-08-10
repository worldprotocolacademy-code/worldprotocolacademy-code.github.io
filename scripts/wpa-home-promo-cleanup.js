/* WPA homepage promotional cleanup v1.1 */
(function(){'use strict';
function removeHomePn003(){
  var announce=document.querySelector('.announce .announce-inner');
  if(!announce)return;
  Array.from(announce.children).forEach(function(node){
    var text=String(node.textContent||'');
    if(text.indexOf('New publication')!==-1&&text.indexOf('WPA-PN-003')!==-1){node.remove();}
  });
}

function addAcademicLinkedIn(){
  var academicHeading=document.querySelector('.footer-col h5[data-i18n="ftAcad"]');
  if(!academicHeading)return;
  var list=academicHeading.parentElement&&academicHeading.parentElement.querySelector('ul');
  if(!list)return;

  var linkedinUrl='https://www.linkedin.com/in/asst-prof-sande-smiljanov-ph-d-a6706323b/';
  if(list.querySelector('a[href="'+linkedinUrl+'"]'))return;

  var item=document.createElement('li');
  var link=document.createElement('a');
  link.href=linkedinUrl;
  link.target='_blank';
  link.rel='noopener noreferrer';
  link.textContent='LinkedIn';
  item.appendChild(link);

  var orcid=Array.from(list.querySelectorAll('a')).find(function(a){
    return String(a.href||'').indexOf('orcid.org/0009-0008-3219-394X')!==-1;
  });
  var orcidItem=orcid&&orcid.closest('li');
  if(orcidItem&&orcidItem.nextSibling){
    list.insertBefore(item,orcidItem.nextSibling);
  }else if(orcidItem){
    list.appendChild(item);
  }else{
    list.appendChild(item);
  }
}

function run(){
  removeHomePn003();
  addAcademicLinkedIn();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
