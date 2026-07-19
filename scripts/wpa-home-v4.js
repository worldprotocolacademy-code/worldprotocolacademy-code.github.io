(function(){
  "use strict";
  var toggle=document.querySelector("[data-menu-toggle]");
  var nav=document.querySelector("[data-nav-links]");
  function closeMenu(){if(!toggle||!nav)return;nav.classList.remove("is-open");toggle.setAttribute("aria-expanded","false");}
  if(toggle&&nav){
    toggle.addEventListener("click",function(){var open=nav.classList.toggle("is-open");toggle.setAttribute("aria-expanded",open?"true":"false");});
    nav.addEventListener("click",function(event){if(event.target.closest("a"))closeMenu();});
    document.addEventListener("keydown",function(event){if(event.key==="Escape")closeMenu();});
    window.addEventListener("resize",function(){if(window.innerWidth>1050)closeMenu();});
  }
  var year=document.querySelector("[data-current-year]");
  if(year)year.textContent=String(new Date().getFullYear());
  var items=document.querySelectorAll(".reveal");
  if(!("IntersectionObserver" in window)||window.matchMedia("(prefers-reduced-motion: reduce)").matches){items.forEach(function(item){item.classList.add("is-visible");});return;}
  var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target);}});},{threshold:.12});
  items.forEach(function(item){observer.observe(item);});
})();
