(()=>{'use strict';
const map={
  '#startseite':['startseite','/startseite'],
  '#ueber-uns':['ueber-uns','/ueber-uns'],
  '#leistungen':['leistungen','/leistungen'],
  '#galerie':['galerie','/galerie'],
  '#preise':['preise','/preise'],
  '#standort':['standort','/standort'],
  '#kontakt':['kontakt','/kontakt']
};
const pathMap=Object.fromEntries(Object.values(map).map(([id,path])=>[path,id]));
const normalizePath=()=>location.pathname.replace(/\/+$/,'')||'/';
const scrollToId=(id,behavior='auto')=>{
  const el=document.getElementById(id);
  if(el) el.scrollIntoView({behavior,block:'start'});
};

let initialId=null;
try{
  const pending=sessionStorage.getItem('mrBeautyCleanRoute');
  if(pending&&pathMap[pending]){
    sessionStorage.removeItem('mrBeautyCleanRoute');
    history.replaceState(history.state,'',pending);
    initialId=pathMap[pending];
  }
}catch(e){}

if(!initialId&&map[location.hash]){
  const [id,path]=map[location.hash];
  history.replaceState(history.state,'',path);
  initialId=id;
}
if(!initialId){
  initialId=pathMap[normalizePath()]||null;
}
if(initialId){
  requestAnimationFrame(()=>requestAnimationFrame(()=>scrollToId(initialId,'auto')));
}

document.addEventListener('click',event=>{
  const a=event.target.closest('a');
  if(!a)return;
  const entry=map[a.getAttribute('href')];
  if(!entry)return;
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  const [id,path]=entry;
  history.pushState(history.state,'',path);
  scrollToId(id,'smooth');
},true);

addEventListener('popstate',()=>{
  const id=pathMap[normalizePath()];
  if(id) scrollToId(id,'auto');
  else if(normalizePath()==='/') scrollTo({top:0,behavior:'auto'});
});
})();