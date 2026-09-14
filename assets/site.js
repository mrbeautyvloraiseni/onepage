/* MR Beauty — navigation, optional motion and accessible dialogs. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const menu=$('#mobileMenu'),hamb=$('#hamb');
function closeMenu(){menu.classList.remove('isOpen');hamb.setAttribute('aria-expanded','false');hamb.setAttribute('aria-label','Menü öffnen');}
hamb.addEventListener('click',()=>{const open=menu.classList.toggle('isOpen');hamb.setAttribute('aria-expanded',String(open));hamb.setAttribute('aria-label',open?'Menü schliessen':'Menü öffnen');});
$$('a',menu).forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('click',e=>{if(!e.target.closest('.nav'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('isOpen')){closeMenu();hamb.focus();}});
matchMedia('(min-width:921px)').addEventListener('change',closeMenu);
// Preserve old incoming links while using native anchors for all new links.
const legacy=new URLSearchParams(location.search).get('mrsection');
if(legacy&&document.getElementById(legacy)){requestAnimationFrame(()=>document.getElementById(legacy).scrollIntoView());}
const motion=matchMedia('(prefers-reduced-motion: reduce)');
if(!motion.matches&&'IntersectionObserver'in window){
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('isPending');observer.unobserve(e.target);}}),{threshold:.08});
 $$('.reveal').forEach((el,index)=>{if(el.getBoundingClientRect().top>innerHeight*.9){el.classList.add('isPending');if(el.classList.contains('serviceCard'))el.style.setProperty('--reveal-delay',(index%3)*65+'ms');observer.observe(el);}});
 motion.addEventListener('change',()=>{if(motion.matches){$$('.isPending').forEach(e=>e.classList.remove('isPending'));observer.disconnect();}});
}
let scheduled=false;function progress(){scheduled=false;const height=document.documentElement.scrollHeight-innerHeight;$('.scrollProgress').style.transform=`scaleX(${height>0?Math.min(1,scrollY/height):0})`;}
addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(progress);}},{passive:true});addEventListener('resize',progress);progress();
if('IntersectionObserver'in window){const spy=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){$$('.links a').forEach(a=>{a.removeAttribute('aria-current');if(a.hash==='#'+e.target.id||(e.target.id==='home'&&a.hash==='#top'))a.setAttribute('aria-current','location');});}});},{rootMargin:'-15% 0px -55% 0px',threshold:0});$$('main>section,main>header').forEach(el=>spy.observe(el));}
const imageLightbox=$('#imageLightbox'),waDialog=$('#waDialog');
function openDialog(dialog){closeMenu();dialog.showModal();document.body.classList.add('modalOpen');}
$$('dialog').forEach(d=>{
 d.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.classList.remove('modalOpen');});
 const close=$('.dialogClose',d); if(close)close.addEventListener('click',()=>d.close());
 d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
});
const gallery=$$('.shot img');let activeImages=[],activeIndex=0;
function showImage(){
 const source=activeImages[activeIndex];
 const large=$('#largeImage'),caption=$('#imageCaptionText'),detail=$('#imageCaptionDetail');
 large.src=source.currentSrc||source.src;large.alt=source.alt;
 caption.textContent=source.dataset.caption||source.alt;
 detail.textContent=source.dataset.detail||'';
 detail.hidden=!source.dataset.detail;
}
function openImage(source,list){
 activeImages=list||[source];activeIndex=Math.max(0,activeImages.indexOf(source));showImage();closeMenu();
 imageLightbox.hidden=false;document.body.classList.add('modalOpen');
 requestAnimationFrame(()=>imageLightbox.classList.add('isOpen'));
}
function closeImage(){
 if(!imageLightbox||imageLightbox.hidden)return;
 imageLightbox.classList.remove('isOpen');
 document.body.classList.remove('modalOpen');
 setTimeout(()=>{imageLightbox.hidden=true;},220);
}
gallery.forEach(img=>img.closest('button').addEventListener('click',e=>{e.preventDefault();openImage(img,gallery);}));
const building=$('.buildingPreview');if(building)building.addEventListener('click',e=>{e.preventDefault();openImage($('img',building),[$('img',building)]);});
const largeImage=$('#largeImage');
if(largeImage){
 largeImage.addEventListener('click',closeImage);
 largeImage.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();closeImage();}});
}
if(imageLightbox)imageLightbox.addEventListener('click',e=>{if(e.target===imageLightbox)closeImage();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&imageLightbox&&!imageLightbox.hidden){e.preventDefault();closeImage();}});




// Google Maps – KEIN ZOOM, KEINE ABDECKUNG.
// Das Bild bleibt immer exakt 100% breit.
// Es wird nur nach oben verschoben, bis der gelbe Pfeil vollständig
// oberhalb des weissen ROUTE-Buttons endet.
const mrMapCard=document.querySelector('#standort .mapOnly');
const mrMapImage=mrMapCard&&mrMapCard.querySelector('.pic img');
const mrMapRouteButton=mrMapCard&&mrMapCard.querySelector('.maps-button-two-line');

function positionMrBeautyMapNoZoom(){
 if(!mrMapCard||!mrMapImage||!mrMapRouteButton||
    !mrMapImage.naturalWidth||!mrMapImage.naturalHeight)return;

 const cardW=mrMapCard.clientWidth;
 const cardH=mrMapCard.clientHeight;
 if(!cardW||!cardH)return;

 // Niemals zoomen: Bildbreite = exakt Fensterbreite.
 const scale=cardW/mrMapImage.naturalWidth;
 const renderedH=mrMapImage.naturalHeight*scale;

 // Original googlemap.jpg:
 // MR-Beauty-Bereich ca. Y=590
 // unterstes sichtbares Ende des gelben Pfeils ca. Y=940
 const mrBeautyY=590;
 const arrowBottomY=940;

 const cardRect=mrMapCard.getBoundingClientRect();
 const buttonRect=mrMapRouteButton.getBoundingClientRect();
 const buttonTop=buttonRect.top-cardRect.top;

 // Wunsch 1: MR Beauty möglichst mittig im Kartenbereich oberhalb des Buttons.
 const centreTarget=buttonTop/2;
 const centreTop=centreTarget-(mrBeautyY*scale);

 // Wunsch 2: Pfeilende muss vollständig oberhalb des Buttons liegen.
 const gap=8;
 const arrowTop=(buttonTop-gap)-(arrowBottomY*scale);

 // Falls beides gleichzeitig nicht möglich ist, hat "kein Pfeil unter dem Button"
 // Vorrang. Es wird ausschließlich nach oben verschoben.
 let top=Math.min(centreTop,arrowTop)+30;

 // Das Bild ist hoch genug; trotzdem verhindern wir vorsichtshalber leere Flächen.
 const minTop=Math.min(0,cardH-renderedH);
 top=Math.max(minTop,Math.min(0,top));

 mrMapImage.style.width='100%';
 mrMapImage.style.height='auto';
 mrMapImage.style.left='0px';
 mrMapImage.style.top=`${top}px`;
}

if(mrMapImage){
 if(mrMapImage.complete)requestAnimationFrame(positionMrBeautyMapNoZoom);
 else mrMapImage.addEventListener('load',positionMrBeautyMapNoZoom,{once:true});

 if('ResizeObserver'in window){
   const mrMapNoZoomResizeObserver=new ResizeObserver(
     ()=>requestAnimationFrame(positionMrBeautyMapNoZoom)
   );
   mrMapNoZoomResizeObserver.observe(mrMapCard);
   mrMapNoZoomResizeObserver.observe(mrMapRouteButton);
 }else{
   addEventListener('resize',positionMrBeautyMapNoZoom,{passive:true});
 }
}


// iPhone portrait: all service cards exactly as high as the longest text needs.
const mrServiceCards=[...document.querySelectorAll('#services .serviceCard')];

function syncPortraitServiceCardHeights(){
  if(!mrServiceCards.length)return;

  const portrait=matchMedia('(max-width:600px) and (orientation:portrait)').matches;

  // Landscape / larger screens: do not interfere with existing layout.
  if(!portrait){
    mrServiceCards.forEach(card=>{
      card.style.removeProperty('height');
      card.style.removeProperty('min-height');
      card.style.removeProperty('max-height');
    });
    return;
  }

  // First release all heights so each card can reveal its natural content size.
  mrServiceCards.forEach(card=>{
    card.style.setProperty('height','auto','important');
    card.style.setProperty('min-height','0','important');
    card.style.setProperty('max-height','none','important');
  });

  let maxContent=0;
  let padTop=0;
  let padBottom=0;

  mrServiceCards.forEach(card=>{
    const cs=getComputedStyle(card);
    const h3=card.querySelector('h3');
    const p=card.querySelector('p');
    if(!h3||!p)return;

    const h3s=getComputedStyle(h3);
    const contentHeight=
      h3.getBoundingClientRect().height+
      parseFloat(h3s.marginBottom||0)+
      p.getBoundingClientRect().height;

    maxContent=Math.max(maxContent,contentHeight);
    padTop=parseFloat(cs.paddingTop||0);
    padBottom=parseFloat(cs.paddingBottom||0);
  });

  const target=Math.ceil(maxContent+padTop+padBottom);

  mrServiceCards.forEach(card=>{
    card.style.setProperty('height',`${target}px`,'important');
    card.style.setProperty('min-height',`${target}px`,'important');
    card.style.setProperty('max-height',`${target}px`,'important');
  });
}

if(mrServiceCards.length){
  const runServiceCardSync=()=>requestAnimationFrame(syncPortraitServiceCardHeights);

  if(document.fonts&&document.fonts.ready){
    document.fonts.ready.then(runServiceCardSync);
  }else{
    addEventListener('load',runServiceCardSync,{once:true});
  }

  addEventListener('resize',runServiceCardSync,{passive:true});
  addEventListener('orientationchange',runServiceCardSync,{passive:true});
}


// Kontaktfenster V65:
// Zeilen/Abstände bleiben unverändert.
// Nur die untere Kartenkante wird so gesetzt, dass unten derselbe sichtbare
// Abstand wie oben zwischen Kartenkante und Titel entsteht.
const mrContactBoxV65=document.querySelector('#kontakt .contactBox');
const mrHoursBoxV65=document.querySelector('#kontakt .hours');

function setCardHeightV65(card,height){
  const h=`${Math.ceil(height)}px`;
  card.style.setProperty('height',h,'important');
  card.style.setProperty('min-height',h,'important');
  card.style.setProperty('max-height',h,'important');
}

function naturalizeCardV65(card){
  card.style.setProperty('height','auto','important');
  card.style.setProperty('min-height','0','important');
  card.style.setProperty('max-height','none','important');
}

function trimmedHeightV65(card,lastContent){
  const cardRect=card.getBoundingClientRect();
  const title=card.querySelector('h3');
  if(!title||!lastContent)return cardRect.height;

  const titleRect=title.getBoundingClientRect();
  const lastRect=lastContent.getBoundingClientRect();

  // Abstand oben: Kartenkante -> sichtbarer Titelanfang
  const topGap=titleRect.top-cardRect.top;

  // Unterkante = Ende des letzten sichtbaren Textes + exakt derselbe Abstand.
  return (lastRect.bottom-cardRect.top)+topGap;
}

function syncContactCardsV65(){
  if(!mrContactBoxV65||!mrHoursBoxV65)return;

  naturalizeCardV65(mrContactBoxV65);
  naturalizeCardV65(mrHoursBoxV65);

  requestAnimationFrame(()=>{
    const cRect=mrContactBoxV65.getBoundingClientRect();
    const hRect=mrHoursBoxV65.getBoundingClientRect();

    const contactLast=
      mrContactBoxV65.querySelector('.contactList>a:last-child span') ||
      mrContactBoxV65.querySelector('.contactList>a:last-child');

    const hoursLast=
      mrHoursBoxV65.querySelector('.hoursRow:last-child b') ||
      mrHoursBoxV65.querySelector('.hoursRow:last-child');

    // Stehen die Fenster untereinander?
    const stacked=Math.abs(cRect.top-hRect.top)>8;

    if(stacked){
      // Hochformat / gestapelt:
      // jedes Fenster bekommt nur seine eigene überschüssige Leerfläche entfernt.
      setCardHeightV65(
        mrContactBoxV65,
        trimmedHeightV65(mrContactBoxV65,contactLast)
      );
      setCardHeightV65(
        mrHoursBoxV65,
        trimmedHeightV65(mrHoursBoxV65,hoursLast)
      );
    }else{
      // Nebeneinander (Desktop / iPad / iPhone quer):
      // Öffnungszeiten ist ausdrücklich die Referenzhöhe für BEIDE.
      const ref=trimmedHeightV65(mrHoursBoxV65,hoursLast);
      setCardHeightV65(mrHoursBoxV65,ref);
      setCardHeightV65(mrContactBoxV65,ref);
    }
  });
}

if(mrContactBoxV65&&mrHoursBoxV65){
  const runContactV65=()=>requestAnimationFrame(syncContactCardsV65);

  if(document.fonts&&document.fonts.ready){
    document.fonts.ready.then(runContactV65);
  }else{
    addEventListener('load',runContactV65,{once:true});
  }

  addEventListener('resize',runContactV65,{passive:true});
  addEventListener('orientationchange',runContactV65,{passive:true});
}

$$('a[href^="https://wa.me/"]').forEach(a=>{if(a.hasAttribute('data-direct-wa'))return;a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;if(matchMedia('(min-width:921px) and (pointer:fine)').matches){e.preventDefault();openDialog(waDialog);}});});
})();
