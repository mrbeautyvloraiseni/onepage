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




// Google Maps – KEIN ZOOM.
// Das Bild bleibt immer exakt so breit wie das bestehende Kartenfenster.
// Nur die Y-Position wird verändert, damit MR Beauty vertikal mittig sitzt.
const mrMapCard=document.querySelector('#standort .mapOnly');
const mrMapImage=mrMapCard&&mrMapCard.querySelector('.pic img');

function positionMrBeautyMapNoZoom(){
 if(!mrMapCard||!mrMapImage||!mrMapImage.naturalWidth||!mrMapImage.naturalHeight)return;

 const cardW=mrMapCard.clientWidth;
 const cardH=mrMapCard.clientHeight;
 if(!cardW||!cardH)return;

 const scale=cardW/mrMapImage.naturalWidth; // exakt 100% Breite, niemals mehr
 const renderedH=mrMapImage.naturalHeight*scale;

 // Vertikale Mitte des MR-Beauty-Bereichs im Originalbild.
 const mrBeautyY=590;

 let top=(cardH/2)-(mrBeautyY*scale);

 // Kein leerer Bereich oben/unten. Falls ein sehr schmales Layout physikalisch
 // nicht exakt zentriert werden kann, wird nur bis zur Bildkante verschoben.
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
 }else{
   addEventListener('resize',positionMrBeautyMapNoZoom,{passive:true});
 }
}

$$('a[href^="https://wa.me/"]').forEach(a=>{if(a.hasAttribute('data-direct-wa'))return;a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;if(matchMedia('(min-width:921px) and (pointer:fine)').matches){e.preventDefault();openDialog(waDialog);}});});
})();
