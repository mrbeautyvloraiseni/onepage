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
 const title=source.dataset.title||source.alt;
 caption.textContent=title;
 const description=source.dataset.detail||source.dataset.caption||'';
 detail.textContent=description;
 detail.hidden=!description;
}
function openImage(source,list){
  activeImages=list||[source];
  activeIndex=Math.max(0,activeImages.indexOf(source));
  showImage();
  closeMenu();
  imageLightbox.hidden=false;
  imageLightbox.classList.add("isOpen");
  document.body.classList.add("modalOpen");
}
function closeImage(){
  if(!imageLightbox||imageLightbox.hidden)return;
  imageLightbox.classList.remove("isOpen");
  imageLightbox.hidden=true;
  document.body.classList.remove("modalOpen");
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
if(phoneContact&&phoneDialog&&phoneQr){
 phoneContact.addEventListener('click',e=>{
   if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
   if(!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
   if(typeof qrcode!=='function')return;
   e.preventDefault();
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
/* iPhone/iPad: vollständige Kontaktzeile beim Drücken markieren */
(()=>{
 const isAppleTouch =
   /iPad|iPhone|iPod/.test(navigator.userAgent) ||
   (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);

 if(!isAppleTouch)return;

 document.querySelectorAll('#kontakt .contactList > a').forEach(link=>{
   let startX=0;
   let startY=0;

   const clearPressed=()=>{
     link.classList.remove('isTouchPressed');
   };

   link.addEventListener('touchstart',event=>{
     const touch=event.touches[0];
     if(!touch)return;
     startX=touch.clientX;
     startY=touch.clientY;
     link.classList.add('isTouchPressed');
   },{passive:true});

   link.addEventListener('touchmove',event=>{
     const touch=event.touches[0];
     if(!touch)return;

     if(Math.abs(touch.clientX-startX)>10 ||
        Math.abs(touch.clientY-startY)>10){
       clearPressed();
     }
   },{passive:true});

   link.addEventListener('touchend',()=>{
     setTimeout(clearPressed,0);
   },{passive:true});

   link.addEventListener('touchcancel',clearPressed,{passive:true});
   link.addEventListener('contextmenu',event=>event.preventDefault());
   link.addEventListener('dragstart',event=>event.preventDefault());
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
      setTimeout(clearPressed, moved ? 0 : 90);
    }, { passive: true });

    element.addEventListener('touchcancel', clearPressed, { passive: true });
    element.addEventListener('contextmenu', event => event.preventDefault());
    element.addEventListener('dragstart', event => event.preventDefault());
  });
})();

/* MR Beauty: Galerie auf iPhone vorladen */
(()=>{
  if (!window.matchMedia("(max-width:600px) and (orientation:portrait)").matches) return;

  const section=document.querySelector("#galerie");
  const images=[...document.querySelectorAll("#galerie .shot img")];
  const preloads=[];

  if (!section || !images.length || !("IntersectionObserver" in window)) return;

  const warmImage=(image)=>{
    const preload=new Image();
    preload.decoding="async";
    preload.src=image.currentSrc || image.src;
    preloads.push(preload);
    if (preload.decode) preload.decode().catch(()=>{});
  };

  const observer=new IntersectionObserver((entries)=>{
    if (!entries.some(entry=>entry.isIntersecting)) return;
    images.forEach((image,index)=>setTimeout(()=>warmImage(image),index*70));
    observer.disconnect();
  },{rootMargin:"450px 0px"});

  observer.observe(section);
})();
/* MR Beauty: Galerie-Auswahl verhindern */
document.querySelectorAll(".gallery, .buildingPreview, .imageLightbox, .portrait, .location .pic").forEach(element=>{
  element.addEventListener("selectstart",event=>event.preventDefault());
  element.addEventListener("dragstart",event=>event.preventDefault());
});
