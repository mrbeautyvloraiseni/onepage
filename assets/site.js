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



// MR Beauty Google map – responsive Zentrierung des GESAMTEN MR-Beauty-Bereichs.
// Originalbild: 873 x 1076 px.
// Mittelpunkt von Pin + "MR Beauty Vlora Iseni": ca. X=525, Y=590.
// Ziel: Mitte der sichtbaren Kartenfläche (.pic), NICHT Mitte des ganzen Cards.
const mrMapCard=document.querySelector('#standort .mapOnly');
const mrMapPic=mrMapCard&&mrMapCard.querySelector('.pic');
const mrMapImage=mrMapPic&&mrMapPic.querySelector('img');

function positionMrBeautyMap(){
 if(!mrMapCard||!mrMapPic||!mrMapImage||!mrMapImage.naturalWidth||!mrMapImage.naturalHeight)return;

 const cw=mrMapCard.clientWidth;
 const ch=mrMapCard.clientHeight;
 const ph=mrMapPic.clientHeight;
 if(!cw||!ch||!ph)return;

 const nw=mrMapImage.naturalWidth;
 const nh=mrMapImage.naturalHeight;

 // Mittelpunkt des kompletten MR-Beauty-Bereichs (Pin + Schrift)
 const fx=525;
 const fy=590;

 // Exakte Zielposition: horizontal Mitte der Karte,
 // vertikal Mitte der sichtbaren Kartenfläche oberhalb des Buttons.
 const tx=cw/2;
 const ty=ph/2;

 // So weit zoomen wie nötig, damit trotz Zentrierung keine leeren Ränder entstehen.
 const scale=Math.max(
   tx/fx,
   (cw-tx)/(nw-fx),
   ty/fy,
   (ch-ty)/(nh-fy)
 );

 const w=nw*scale;
 const h=nh*scale;
 const left=tx-(fx*scale);
 const top=ty-(fy*scale);

 mrMapImage.style.width=`${w}px`;
 mrMapImage.style.height=`${h}px`;
 mrMapImage.style.left=`${left}px`;
 mrMapImage.style.top=`${top}px`;
}

if(mrMapImage){
 if(mrMapImage.complete)requestAnimationFrame(positionMrBeautyMap);
 else mrMapImage.addEventListener('load',positionMrBeautyMap,{once:true});

 if('ResizeObserver'in window){
   const mrMapResizeObserver=new ResizeObserver(()=>requestAnimationFrame(positionMrBeautyMap));
   mrMapResizeObserver.observe(mrMapCard);
   mrMapResizeObserver.observe(mrMapPic);
 }else{
   addEventListener('resize',positionMrBeautyMap,{passive:true});
 }
}

$$('a[href^="https://wa.me/"]').forEach(a=>{if(a.hasAttribute('data-direct-wa'))return;a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;if(matchMedia('(min-width:921px) and (pointer:fine)').matches){e.preventDefault();openDialog(waDialog);}});});
})();
