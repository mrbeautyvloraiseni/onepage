/* MR Beauty: alte englische Anker auf deutsche Anker umleiten */
(function(){
  var hashMap = {
    "#about": "#ueber-uns",
    "#services": "#leistungen",
    "#gallery": "#galerie",
    "#prices": "#preise"
  };

  function normalizeHash(){
    var next = hashMap[window.location.hash];
    if (!next) return;

    history.replaceState(null, "", next);

    requestAnimationFrame(function(){
      var target = document.querySelector(next);
      if (target) {
        target.scrollIntoView({ behavior: "auto", block: "start" });
      }
    });
  }

  normalizeHash();
  window.addEventListener("hashchange", normalizeHash);
})();
/* Ende alte englische Anker */
/* MR Beauty — navigation, optional motion and accessible dialogs. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const menu=$('#mobileMenu'),hamb=$('#hamb');
function syncMenuAnchor(){
 const nav=$('.nav');
 if(!nav)return;
 document.documentElement.style.setProperty(
   '--menu-anchor-offset',
   `${Math.max(0,Math.round(nav.getBoundingClientRect().bottom)-1)}px`
 );
}
function closeMenu(){
 menu.classList.remove('isOpen');
 hamb.setAttribute('aria-expanded','false');
 hamb.setAttribute('aria-label','Menü öffnen');
 syncMenuAnchor();
}
syncMenuAnchor();
addEventListener('resize',syncMenuAnchor,{passive:true});
if('ResizeObserver'in window)new ResizeObserver(syncMenuAnchor).observe($('.nav'));
hamb.addEventListener('click',()=>{const open=menu.classList.toggle('isOpen');hamb.setAttribute('aria-expanded',String(open));hamb.setAttribute('aria-label',open?'Menü schliessen':'Menü öffnen');});
$$('a',menu).forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('click',e=>{if(!e.target.closest('.nav'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('isOpen')){closeMenu();hamb.focus();}});
matchMedia('(min-width:921px)').addEventListener('change',closeMenu);
// Preserve old incoming links while using native anchors for all new links.
const legacy=new URLSearchParams(location.search).get('mrsection');
if(legacy&&document.getElementById(legacy)){
 requestAnimationFrame(()=>{
  document.getElementById(legacy).scrollIntoView();
  const cleanUrl=new URL(location.href);
  cleanUrl.searchParams.delete('mrsection');
  cleanUrl.hash='#'+legacy;
  history.replaceState(history.state,'',cleanUrl.pathname+cleanUrl.search+cleanUrl.hash);
 });
}
const motion=matchMedia('(prefers-reduced-motion: reduce)');
if(!motion.matches&&'IntersectionObserver'in window){
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('isPending');observer.unobserve(e.target);}}),{threshold:.08});
 $$('.reveal').forEach((el,index)=>{if(el.getBoundingClientRect().top>innerHeight*.9){el.classList.add('isPending');if(el.classList.contains('serviceCard'))el.style.setProperty('--reveal-delay',(index%3)*65+'ms');observer.observe(el);}});
 motion.addEventListener('change',()=>{if(motion.matches){$$('.isPending').forEach(e=>e.classList.remove('isPending'));observer.disconnect();}});
}
let scheduled=false;function progress(){scheduled=false;const height=document.documentElement.scrollHeight-innerHeight;$('.scrollProgress').style.transform=`scaleX(${height>0?Math.min(1,scrollY/height):0})`;}
addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(progress);}},{passive:true});addEventListener('resize',progress);progress();
if('IntersectionObserver'in window){const spy=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){$$('.links a').forEach(a=>{const href=a.getAttribute('href')||'';const isHome=e.target.id==='home'&&(href==='/'||href==='#startseite'||href==='/#top'||href==='/#home'||a.hash==='#top'||a.hash==='#home'||a.hash==='#startseite');a.removeAttribute('aria-current');if(a.hash==='#'+e.target.id||isHome)a.setAttribute('aria-current','location');});}});},{rootMargin:'-15% 0px -55% 0px',threshold:0});$$('main>section,main>header').forEach(el=>spy.observe(el));}
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
 const title=source.dataset.title||source.alt;
 caption.textContent=title;
 const description=source.dataset.detail||source.dataset.caption||'';
 detail.textContent=description;
 detail.hidden=!description;
}
let imageOpenRequest=0;
let imageCloseTimer=0;
let lastGalleryPreview=null;
let galleryReturnZoomTimer=0;
function waitForLargeImage(image){
  const finish=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));

  const decodeAndFinish=()=>{
    if(typeof image.decode==='function'){
      return image.decode().catch(()=>{}).then(finish);
    }
    return finish();
  };

  if(image.complete&&image.naturalWidth>0){
    return decodeAndFinish();
  }

  return new Promise(resolve=>{
    const done=()=>{
      image.removeEventListener('load',done);
      image.removeEventListener('error',done);
      decodeAndFinish().then(resolve);
    };
    image.addEventListener('load',done,{once:true});
    image.addEventListener('error',done,{once:true});
  });
}
async function openImage(source,list){
  clearTimeout(imageCloseTimer);
  clearTimeout(galleryReturnZoomTimer);
  if(lastGalleryPreview)lastGalleryPreview.classList.remove('isGalleryReturnZoom');
  lastGalleryPreview=source.closest('#galleryCoverflow .shot');
  activeImages=list||[source];
  activeIndex=Math.max(0,activeImages.indexOf(source));
  const request=++imageOpenRequest;
  showImage();
  const large=$('#largeImage');
  if(large)await waitForLargeImage(large);
  if(request!==imageOpenRequest)return;
  closeMenu();
  imageLightbox.classList.remove('isOpen','isClosing','isGalleryImage');
  imageLightbox.hidden=false;
  imageLightbox.classList.toggle('isGalleryImage',Boolean(lastGalleryPreview));
  // Establish the first (slightly zoomed) frame before starting the transition.
  // This avoids Safari treating both states as a single paint.
  void imageLightbox.offsetWidth;
  imageLightbox.classList.add('isOpen');
  document.body.classList.add('modalOpen');
}
function finishCloseImage(){
  clearTimeout(imageCloseTimer);
  imageLightbox.classList.remove('isOpen','isClosing','isGalleryImage');
  imageLightbox.hidden=true;
  document.body.classList.remove('modalOpen');
  if(lastGalleryPreview){
    const preview=lastGalleryPreview;
    preview.classList.remove('isTouchPressed');
    preview.classList.add('isGalleryReturnZoom');
    clearTimeout(galleryReturnZoomTimer);
    galleryReturnZoomTimer=setTimeout(()=>{
      preview.classList.remove('isGalleryReturnZoom');
      if(lastGalleryPreview===preview)lastGalleryPreview=null;
    },850);
  }
}
function closeImage(){
  imageOpenRequest++;
  if(!imageLightbox||imageLightbox.hidden||imageLightbox.classList.contains('isClosing'))return;
  if(imageLightbox.classList.contains('isGalleryImage')&&
     !matchMedia('(prefers-reduced-motion: reduce)').matches){
    imageLightbox.classList.add('isClosing');
    clearTimeout(imageCloseTimer);
    imageCloseTimer=setTimeout(finishCloseImage,380);
  }else{
    finishCloseImage();
  }
}
gallery.forEach(img=>img.closest('button').addEventListener('click',e=>{e.preventDefault();openImage(img,gallery);}));

// MR Beauty: visual Coverflow (no native horizontal scroll, no cloned images).
// Keeping the existing gallery image click handlers preserves the original lightbox.
const coverflow=$('#galleryCoverflow');
const coverflowPrev=$('#galleryCoverflowPrev'),coverflowNext=$('#galleryCoverflowNext');
if(coverflow&&coverflowPrev&&coverflowNext){
 const slides=Array.from(coverflow.querySelectorAll('.shot'));
 const count=slides.length;
 const mod=(n)=>((n%count)+count)%count;
 let current=0,gesture=null,ignoreClickUntil=0;
 // Load the real gallery photos so that repeated cycles have no gaps.
 slides.forEach(slide=>{
  slide.querySelectorAll('img').forEach(img=>{img.loading='eager';});
 });
 function renderCoverflow(dragPixels=0){
  // Desktop: fit all five visible cards within the carousel width.
  // Their centres are positioned using their actual scaled widths plus clear gaps,
  // so neither outer photo gets cropped or hidden behind its neighbour.
  const desktopFive=matchMedia('(min-width:701px) and (pointer:fine)').matches;
  const landscapeFive=matchMedia('(orientation:landscape) and (max-height:600px) and (any-pointer:coarse)').matches;
  const fitFive=desktopFive||landscapeFive;
  // Five fully visible images with regular gaps, even in iPhone landscape.
  const gap=landscapeFive?10:14;
  if(desktopFive){
   const target=Math.min(330,Math.max(140,Math.floor((coverflow.clientWidth-4*gap-28)/4)));
   const value=target+'px';
   if(coverflow.style.getPropertyValue('--mr-card-width')!==value){
    coverflow.style.setProperty('--mr-card-width',value);
   }
  }else if(coverflow.style.getPropertyValue('--mr-card-width')){
   coverflow.style.removeProperty('--mr-card-width');
  }
  const cardWidth=slides[0]?.offsetWidth||280;
  const step=cardWidth*.89;
  const neighbourCentre=cardWidth*.91+gap;
  const outerCentre=cardWidth*1.66+gap*2;
  slides.forEach((slide,i)=>{
   let diff=mod(i-current);
   if(diff>count/2)diff-=count;
   // For eight photos the opposite one is never displayed.
   const distance=Math.abs(diff);
   const visible=distance<=2;
   const focus=distance===0;
   const scale=focus?1:(distance===1?.82:.68);
   const opacity=focus?1:(distance===1?.79:.43);
   const shift=(fitFive&&visible
    ? Math.sign(diff)*(distance===1?neighbourCentre:distance===2?outerCentre:0)
    : diff*step)+dragPixels;
   slide.style.setProperty('--mr-offset',Math.round(shift)+'px');
   slide.style.setProperty('--mr-scale',String(scale));
   slide.style.setProperty('--mr-opacity',visible?String(opacity):'0');
   slide.style.setProperty('--mr-z',String(10-distance));
   slide.style.setProperty('--mr-visibility',visible?'visible':'hidden');
   slide.style.setProperty('--mr-events',visible?'auto':'none');
   slide.dataset.galleryFar=visible?'false':'true';
   slide.setAttribute('aria-hidden',visible?'false':'true');
   slide.tabIndex=visible?0:-1;
  });
 }
 function shiftCoverflow(direction){
  current=mod(current+direction);
  renderCoverflow();
 }
 coverflowPrev.addEventListener('click',()=>shiftCoverflow(-1));
 coverflowNext.addEventListener('click',()=>shiftCoverflow(1));
 coverflow.addEventListener('keydown',event=>{
  if(event.target!==coverflow)return;
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
   event.preventDefault();
   shiftCoverflow(event.key==='ArrowRight'?1:-1);
  }
 });
 // Separate mouse drag from touch swipes for Safari on iPhone.
 function beginGesture(type,id,x,y){
  gesture={type,id,x,y,lastX:x,startedAt:performance.now(),dragged:false};
 }
 function updateGesture(x,y){
  if(!gesture)return false;
  const dx=x-gesture.x,dy=y-gesture.y;
  if(!gesture.dragged){
   // Normal vertical page scrolling remains available.
   if(Math.abs(dy)>12&&Math.abs(dy)>Math.abs(dx)*1.2){
    gesture=null;
    coverflow.classList.remove('isGalleryDragging');
    renderCoverflow();
    return false;
   }
   if(Math.abs(dx)<9||Math.abs(dx)<Math.abs(dy)*1.1)return false;
   gesture.dragged=true;
   coverflow.classList.add('isGalleryDragging');
  }
  gesture.lastX=x;
  renderCoverflow(dx);
  return true;
 }
 function finishGesture(x,cancelled=false){
  if(!gesture)return;
  const drag=gesture;
  gesture=null;
  coverflow.classList.remove('isGalleryDragging');
  if(!drag.dragged){renderCoverflow();return;}
  ignoreClickUntil=performance.now()+500;
  const distance=(typeof x==='number'?x:drag.lastX)-drag.x;
  const step=(slides[0]?.offsetWidth||280)*.89;
  const elapsed=Math.max(1,performance.now()-drag.startedAt);
  const speed=Math.abs(distance)/elapsed;
  let number=Math.max(1,Math.round(Math.abs(distance)/step));
  if(speed>1.5&&Math.abs(distance)<step*.95)number=1;
  number=Math.min(3,number);
  if(!cancelled&&Math.abs(distance)>8){
   current=mod(current+(distance<0?number:-number));
  }
  renderCoverflow();
 }
 // Desktop: drag with a held left mouse button, or click to enlarge.
 coverflow.addEventListener('pointerdown',event=>{
  if(event.pointerType!=='mouse'||event.button!==0)return;
  beginGesture('mouse',event.pointerId,event.clientX,event.clientY);
 });
 coverflow.addEventListener('pointermove',event=>{
  if(!gesture||gesture.type!=='mouse'||event.pointerId!==gesture.id)return;
  if(updateGesture(event.clientX,event.clientY)){
   if(!coverflow.hasPointerCapture(event.pointerId)){
    try{coverflow.setPointerCapture(event.pointerId);}catch(error){}
   }
   if(event.cancelable)event.preventDefault();
  }
 },{passive:false});
 coverflow.addEventListener('pointerup',event=>{
  if(gesture&&gesture.type==='mouse'&&gesture.id===event.pointerId)finishGesture(event.clientX);
 });
 coverflow.addEventListener('pointercancel',event=>{
  if(gesture&&gesture.type==='mouse'&&gesture.id===event.pointerId)finishGesture(gesture.lastX,true);
 });
 coverflow.addEventListener('lostpointercapture',event=>{
  if(gesture&&gesture.type==='mouse'&&gesture.id===event.pointerId)finishGesture(gesture.lastX,true);
 });
 // iOS Safari: Touch Events avoid pointercancel interrupting a finger swipe.
 coverflow.addEventListener('touchstart',event=>{
  if(event.touches.length!==1)return;
  const touch=event.touches[0];
  beginGesture('touch',touch.identifier,touch.clientX,touch.clientY);
 },{passive:true});
 coverflow.addEventListener('touchmove',event=>{
  if(!gesture||gesture.type!=='touch')return;
  if(event.touches.length!==1){finishGesture(gesture.lastX,true);return;}
  const touch=Array.from(event.touches).find(t=>t.identifier===gesture.id);
  if(!touch)return;
  if(updateGesture(touch.clientX,touch.clientY)&&event.cancelable){
   event.preventDefault();
  }
 },{passive:false});
 coverflow.addEventListener('touchend',event=>{
  if(!gesture||gesture.type!=='touch')return;
  const touch=Array.from(event.changedTouches).find(t=>t.identifier===gesture.id);
  if(touch)finishGesture(touch.clientX);
 },{passive:true});
 coverflow.addEventListener('touchcancel',()=>{
  if(gesture&&gesture.type==='touch')finishGesture(gesture.lastX,true);
 },{passive:true});
 // Stop browser-generated "click" after a drag, but let ordinary taps bubble to lightbox.
 coverflow.addEventListener('click',event=>{
  if(performance.now()>ignoreClickUntil)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  ignoreClickUntil=0;
 },true);
 if('ResizeObserver'in window)new ResizeObserver(()=>renderCoverflow()).observe(coverflow);
 else addEventListener('resize',()=>renderCoverflow(),{passive:true});
 renderCoverflow();
}

const building=$('.buildingPreview');if(building)building.addEventListener('click',e=>{
  e.preventDefault();
  openImage($('img',building),[$('img',building)]);
});
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

// On roomy two-column layouts, both contact cards match the tall price card.
// The two seven-row grids in CSS keep corresponding separator lines aligned.
const priceReference=$('#preise .priceTabs>.priceCard');
const contactGrid=$('#kontakt .contactGrid');
if(priceReference&&contactGrid){
 const syncContactHeight=()=>{
   const height=priceReference.getBoundingClientRect().height;
   if(height>0)contactGrid.style.setProperty('--contact-price-height',`${height}px`);
 };
 if('ResizeObserver'in window)new ResizeObserver(syncContactHeight).observe(priceReference);
 else addEventListener('resize',syncContactHeight,{passive:true});
 if(document.fonts)document.fonts.ready.then(syncContactHeight);
 syncContactHeight();
}


$$('a[href^="https://wa.me/"]').forEach(a=>{if(a.hasAttribute('data-direct-wa'))return;a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;if(matchMedia('(min-width:921px) and (pointer:fine)').matches){e.preventDefault();openDialog(waDialog);}});});
const phoneContact=$('#phoneContact'),phoneDialog=$('#phoneDialog'),phoneQr=$('#phoneQr');
let qrCodeLoader;
function loadQrCode(){
 if(typeof qrcode==='function')return Promise.resolve();
 if(qrCodeLoader)return qrCodeLoader;
 qrCodeLoader=new Promise((resolve,reject)=>{
   const script=document.createElement('script');
   script.src='assets/qrcode-generator.js';
   script.async=true;
   script.onload=()=>resolve();
   script.onerror=reject;
   document.head.appendChild(script);
 });
 return qrCodeLoader;
}
if(phoneContact&&phoneDialog&&phoneQr){
 phoneContact.addEventListener('click',async e=>{
   if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
   if(!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
   e.preventDefault();
   try{await loadQrCode();}catch(error){console.error(error);return;}
   if(typeof qrcode!=='function')return;
   if(!phoneQr.firstElementChild){
     const code=qrcode(0,'M');
     code.addData('tel:+41763235996');
     code.make();
     phoneQr.innerHTML=code.createSvgTag({
       cellSize:6,
       margin:4,
       alt:'QR-Code: MR Beauty unter +41 76 323 59 96 anrufen'
     });
   }
   openDialog(phoneDialog);
 });
}
// Externe Kontaktlinks (z. B. E-Mail-Signatur): mobil direkt, Desktop mit vorhandenem QR-Dialog.
const mrExternalContact=new URLSearchParams(location.search).get('mrcontact');
if(mrExternalContact==='whatsapp'||mrExternalContact==='phone'){
 const cleanUrl=new URL(location.href);
 cleanUrl.searchParams.delete('mrcontact');
 history.replaceState(history.state,'',cleanUrl.pathname+cleanUrl.search+cleanUrl.hash);
 const desktop=matchMedia('(hover:hover) and (pointer:fine)').matches;
 if(!desktop){
   location.href=mrExternalContact==='whatsapp'?'https://wa.me/41763235996':'tel:+41763235996';
 }else if(mrExternalContact==='whatsapp'&&waDialog){
   requestAnimationFrame(()=>openDialog(waDialog));
 }else if(mrExternalContact==='phone'&&phoneDialog&&phoneQr){
   loadQrCode().then(()=>{
     if(typeof qrcode!=='function')return;
     if(!phoneQr.firstElementChild){
       const code=qrcode(0,'M');
       code.addData('tel:+41763235996');
       code.make();
       phoneQr.innerHTML=code.createSvgTag({cellSize:6,margin:4,alt:'QR-Code: MR Beauty unter +41 76 323 59 96 anrufen'});
     }
     openDialog(phoneDialog);
   }).catch(error=>console.error(error));
 }
}
})();

/* Touch: Kontaktknopf und Logo nicht als Link-/Bildvorschau ziehen */
(()=>{
 const touch=matchMedia('(any-pointer:coarse)');
 document.querySelectorAll('.floatWhats, .brand').forEach(link=>{
   link.addEventListener('contextmenu',event=>{
     if(touch.matches)event.preventDefault();
   });
   link.addEventListener('dragstart',event=>{
     if(touch.matches)event.preventDefault();
   });
 });
})();
/* iPhone/iPad: alle anklickbaren Elemente ohne Link-Vorschau */
(()=>{
  const isAppleTouch =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (!isAppleTouch) return;

  document.documentElement.classList.add('appleTouch');

  document.querySelectorAll('a, button').forEach(element => {
    const isContactRow = element.matches('#kontakt .contactList > a');
    const isGalleryShot = element.matches('#galleryCoverflow .shot');
    let startX = 0;
    let startY = 0;
    let moved = false;

    const clearPressed = () => {
      element.classList.remove('isTouchPressed');
    };

    element.addEventListener('touchstart', event => {
      const touch = event.touches[0];
      if (!touch) return;

      startX = touch.clientX;
      startY = touch.clientY;
      moved = false;
      element.classList.add('isTouchPressed');
    }, { passive: true });

    element.addEventListener('touchmove', event => {
      const touch = event.touches[0];
      if (!touch) return;

      if (Math.abs(touch.clientX - startX) > 10 ||
          Math.abs(touch.clientY - startY) > 10) {
        moved = true;
        clearPressed();
      }
    }, { passive: true });

    element.addEventListener('touchend', () => {
      setTimeout(clearPressed, moved ? 0 : (isContactRow ? 0 : (isGalleryShot ? 420 : 90)));
    }, { passive: true });

    element.addEventListener('touchcancel', clearPressed, { passive: true });
    element.addEventListener('contextmenu', event => event.preventDefault());
    element.addEventListener('dragstart', event => event.preventDefault());
  });
})();

/* MR Beauty: Galerie-Auswahl verhindern */
document.querySelectorAll(".gallery, .buildingPreview, .imageLightbox, .portrait, .location .pic").forEach(element=>{
  element.addEventListener("selectstart",event=>event.preventDefault());
  element.addEventListener("dragstart",event=>event.preventDefault());
});
