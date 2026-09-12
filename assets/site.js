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
 $$('.reveal').forEach(el=>{if(el.getBoundingClientRect().top>innerHeight*.9){el.classList.add('isPending');if(el.classList.contains('serviceCard'))el.style.setProperty('--reveal-delay',((Number(el.dataset.n)-1)%3)*65+'ms');observer.observe(el);}});
 motion.addEventListener('change',()=>{if(motion.matches){$$('.isPending').forEach(e=>e.classList.remove('isPending'));observer.disconnect();}});
}
let scheduled=false;function progress(){scheduled=false;const height=document.documentElement.scrollHeight-innerHeight;$('.scrollProgress').style.transform=`scaleX(${height>0?Math.min(1,scrollY/height):0})`;}
addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(progress);}},{passive:true});addEventListener('resize',progress);progress();
if('IntersectionObserver'in window){const spy=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){$$('.links a').forEach(a=>{a.removeAttribute('aria-current');if(a.hash==='#'+e.target.id||(e.target.id==='home'&&a.hash==='#top'))a.setAttribute('aria-current','location');});}});},{rootMargin:'-15% 0px -55% 0px',threshold:0});$$('main>section,main>header').forEach(el=>spy.observe(el));}
const imageDialog=$('#imageDialog'),waDialog=$('#waDialog');
function openDialog(dialog){closeMenu();dialog.showModal();document.body.classList.add('modalOpen');}
$$('dialog').forEach(d=>{d.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.classList.remove('modalOpen');});$('.dialogClose',d).addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});});
const gallery=$$('.shot img');let activeImages=[],activeIndex=0;
function showImage(){const source=activeImages[activeIndex];$('#largeImage').src=source.src;$('#largeImage').alt=source.alt;$('#imageCaption').textContent=source.alt+(activeImages.length>1?` · ${activeIndex+1} / ${activeImages.length}`:'');$$('.imagePrev,.imageNext').forEach(b=>b.hidden=activeImages.length<2);}
function changeImage(delta){activeIndex=(activeIndex+delta+activeImages.length)%activeImages.length;showImage();}
gallery.forEach((img,index)=>img.closest('button').addEventListener('click',()=>{activeImages=gallery;activeIndex=index;showImage();openDialog(imageDialog);}));
const building=$('.buildingPreview');if(building)building.addEventListener('click',()=>{activeImages=[$('img',building)];activeIndex=0;showImage();openDialog(imageDialog);});
$('.imagePrev').addEventListener('click',()=>changeImage(-1));$('.imageNext').addEventListener('click',()=>changeImage(1));imageDialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();changeImage(1);}if(e.key==='ArrowLeft'){e.preventDefault();changeImage(-1);}});
$$('a[href^="https://wa.me/"]').forEach(a=>{if(a.hasAttribute('data-direct-wa'))return;a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;if(matchMedia('(min-width:921px) and (pointer:fine)').matches){e.preventDefault();openDialog(waDialog);}});});
})();
