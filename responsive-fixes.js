/* V116: shared accessibility and navigation safeguards. */
(function(){
 'use strict';
 window.__mrWebsiteBuildV116='V116_ORIGINAL_RESPONSIVE_GALERIE_2026-09-12';
 var root=document.documentElement;
 var nav=document.querySelector('nav.nav');
 function navOffset(){
  var row=nav&&nav.querySelector('.navin');
  var bottom=row?row.getBoundingClientRect().bottom:0;
  root.style.setProperty('--mr-anchor-offset',Math.max(0,bottom)+20+'px');
 }
 navOffset();
 window.addEventListener('resize',navOffset,{passive:true});
 // Hash changes and browser history must use the same measured anchor as menu clicks.
 function followHash(){
  var id=decodeURIComponent(location.hash.slice(1));
  if(!/^(top|home|about|services|gallery|prices|standort|kontakt)$/.test(id)) return;
  if(id==='top'||id==='home'){
   if(window.__mrPageScrollTo) window.__mrPageScrollTo(0,0);
   return;
  }
  if(window.__mrMenuAnchor22) window.__mrMenuAnchor22(id);
 }
 window.addEventListener('hashchange',followHash);
 var lb=document.getElementById('lightbox');
 if(!lb) return;
 lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-labelledby','galleryInfoTitle');
 var close=document.createElement('button');close.id='mr-lightbox-close';close.type='button';close.textContent='Schliessen ×';close.setAttribute('aria-label','Bildansicht schliessen');lb.appendChild(close);
 var previousFocus=null;
 document.addEventListener('click',function(e){
  if(e.target.closest&&e.target.closest('.shot,.buildingPreview')) previousFocus=e.target;
 },true);
 close.addEventListener('click',function(){
  var image=document.getElementById('lightImg');
  if(image) image.click();
 });
 var wasOpen=false;
 new MutationObserver(function(){
  var open=lb.classList.contains('open');
  if(open&&!wasOpen) close.focus({preventScroll:true});
  if(!open&&wasOpen&&previousFocus&&previousFocus.focus) previousFocus.focus({preventScroll:true});
  wasOpen=open;
 }).observe(lb,{attributes:true,attributeFilter:['class']});
 lb.addEventListener('keydown',function(e){
  if(e.key==='Tab'){e.preventDefault();close.focus();}
 });
})();
