const header=document.querySelector('.header');
const menuButton=document.querySelector('.menu-toggle');
const navigation=document.querySelector('#navigation');
function closeMenu(){navigation.classList.remove('open');menuButton.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open')}
menuButton.addEventListener('click',()=>{const open=!navigation.classList.contains('open');navigation.classList.toggle('open',open);menuButton.setAttribute('aria-expanded',String(open));document.body.classList.toggle('menu-open',open)});
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{const target=document.querySelector(link.getAttribute('href'));if(!target)return;event.preventDefault();closeMenu();const top=target.getBoundingClientRect().top+scrollY-header.offsetHeight-12;scrollTo({top,behavior:'smooth'});history.replaceState(null,'',link.getAttribute('href'))}));
addEventListener('scroll',()=>header.classList.toggle('scrolled',scrollY>30),{passive:true});
addEventListener('resize',()=>{if(innerWidth>950)closeMenu()});

const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}}),{threshold:.09,rootMargin:'0px 0px -35px'});
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));
const sections=[...document.querySelectorAll('main section[id]')];
const navLinks=[...navigation.querySelectorAll('a')];
const sectionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+entry.target.id))}}),{rootMargin:'-35% 0px -55%'});
sections.forEach(section=>sectionObserver.observe(section));

const whatsapp='https://wa.me/41763235996?text=Hallo%20MR%20Beauty%2C%20ich%20möchte%20gerne%20einen%20Termin%20anfragen.';
const instagram='https://www.instagram.com/mrbeauty.ch/';
const modal=document.querySelector('.qr-modal');
const modalData={whatsapp:{title:'Termin über WhatsApp',copy:'Scanne den QR-Code mit deinem Smartphone. WhatsApp öffnet sich direkt mit einer vorbereiteten Terminanfrage.',qr:'images/qr-whatsapp.svg',url:whatsapp},instagram:{title:'MR Beauty auf Instagram',copy:'Scanne den QR-Code und schreibe uns direkt über Instagram oder entdecke unsere aktuellen Arbeiten.',qr:'images/qr-instagram.svg',url:instagram}};
document.querySelectorAll('.js-contact').forEach(button=>button.addEventListener('click',()=>{const data=modalData[button.dataset.kind];if(matchMedia('(max-width:600px)').matches){window.open(data.url,'_blank','noopener');return}modal.querySelector('h3').textContent=data.title;modal.querySelector('.modal-copy').textContent=data.copy;modal.querySelector('.qr-frame img').src=data.qr;modal.querySelector('.qr-frame img').alt='QR-Code für '+data.title;modal.querySelector('.modal-direct').href=data.url;modal.showModal()}));
modal.querySelector('.modal-close').addEventListener('click',()=>modal.close());
modal.addEventListener('click',event=>{if(event.target===modal)modal.close()});

const lightbox=document.querySelector('.lightbox');const lightboxImg=lightbox.querySelector('img');
document.querySelectorAll('.gallery-item,.zoomable').forEach(button=>button.addEventListener('click',()=>{const img=button.querySelector('img');lightboxImg.src=img.src;lightboxImg.alt=img.alt;lightbox.querySelector('p').textContent=button.querySelector('span')?.textContent||img.alt;lightbox.showModal()}));
lightbox.querySelector('.lightbox-close').addEventListener('click',()=>lightbox.close());
lightbox.addEventListener('click',event=>{if(event.target===lightbox)lightbox.close()});
