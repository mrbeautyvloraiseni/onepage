(()=>{'use strict';
const shell=document.querySelector('[data-mr-ai-chat]');
if(!shell)return;

const endpoint=shell.getAttribute('data-endpoint');
const messages=document.getElementById('mrAiMessages');
const form=document.getElementById('mrAiForm');
const input=document.getElementById('mrAiInput');
const send=document.getElementById('mrAiSend');
const quick=[...shell.querySelectorAll('[data-question]')];
const history=[];
let busy=false;

function addMessage(role,text,extraClass=''){
  const item=document.createElement('div');
  item.className='mrAiMessage '+(role==='user'?'mrAiMessage--user':'mrAiMessage--assistant')+(extraClass?' '+extraClass:'');
  item.textContent=text;
  messages.appendChild(item);
  messages.scrollTop=messages.scrollHeight;
  return item;
}

function setBusy(next){
  busy=next;
  input.disabled=next;
  send.disabled=next;
  send.textContent=next?'Antwortet …':'Frage senden';
}

async function ask(question){
  const text=(question||'').trim();
  if(!text||busy)return;
  if(text.length>600)return;

  addMessage('user',text);
  input.value='';
  setBusy(true);

  const status=addMessage('assistant','Einen Moment …','mrAiMessage--status');
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),25000);

  try{
    const response=await fetch(endpoint,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({message:text,history:history.slice(-6)}),
      signal:controller.signal
    });

    let data={};
    try{data=await response.json();}catch(_){}

    status.remove();

    if(!response.ok||!data.answer){
      if(response.status===429){
        addMessage('assistant','Du hast gerade viele Fragen gesendet. Versuch es bitte in ein paar Minuten nochmals oder schreib Vlora direkt auf WhatsApp.');
      }else{
        addMessage('assistant','Der KI-Chat ist gerade nicht erreichbar. Für eine sichere Auskunft oder einen Termin schreib Vlora bitte direkt auf WhatsApp.');
      }
      return;
    }

    const answer=String(data.answer).trim();
    addMessage('assistant',answer);
    history.push({role:'user',content:text},{role:'assistant',content:answer});
    if(history.length>8)history.splice(0,history.length-8);
  }catch(error){
    status.remove();
    addMessage('assistant',error&&error.name==='AbortError'
      ?'Die Antwort dauert gerade zu lange. Versuch es bitte nochmals oder schreib Vlora direkt auf WhatsApp.'
      :'Der KI-Chat ist gerade nicht erreichbar. Für eine sichere Auskunft oder einen Termin schreib Vlora bitte direkt auf WhatsApp.');
  }finally{
    clearTimeout(timer);
    setBusy(false);
    input.focus();
  }
}

form.addEventListener('submit',event=>{
  event.preventDefault();
  ask(input.value);
});

input.addEventListener('keydown',event=>{
  if(event.key==='Enter'&&!event.shiftKey){
    event.preventDefault();
    ask(input.value);
  }
});

quick.forEach(button=>button.addEventListener('click',()=>{
  ask(button.getAttribute('data-question')||button.textContent);
}));

const photoInput=document.getElementById('mrAiPhotoInput');
const photoPick=document.getElementById('mrAiPhotoPick');
const photoPreview=document.getElementById('mrAiPhotoPreview');
const photoImage=document.getElementById('mrAiPhotoImage');
const photoShare=document.getElementById('mrAiPhotoShare');
const photoClear=document.getElementById('mrAiPhotoClear');
const photoStatus=document.getElementById('mrAiPhotoStatus');
let photoFile=null;
let photoUrl='';

function clearPhoto(){
  photoFile=null;
  if(photoUrl){
    URL.revokeObjectURL(photoUrl);
    photoUrl='';
  }
  if(photoInput)photoInput.value='';
  if(photoImage)photoImage.removeAttribute('src');
  if(photoPreview)photoPreview.hidden=true;
  if(photoStatus)photoStatus.textContent='';
  if(photoPick)photoPick.textContent='Foto auswählen';
}

if(photoPick&&photoInput){
  photoPick.addEventListener('click',()=>photoInput.click());

  photoInput.addEventListener('change',()=>{
    const file=photoInput.files&&photoInput.files[0];
    if(!file)return;

    const allowed=new Set(['image/jpeg','image/png','image/webp']);
    if(!allowed.has(file.type)){
      clearPhoto();
      if(photoStatus)photoStatus.textContent='Bitte wähle ein JPG-, PNG- oder WEBP-Bild.';
      return;
    }

    if(file.size>25*1024*1024){
      clearPhoto();
      if(photoStatus)photoStatus.textContent='Das Foto ist zu gross. Bitte wähle ein Bild unter 25 MB.';
      return;
    }

    if(photoUrl)URL.revokeObjectURL(photoUrl);
    photoFile=file;
    photoUrl=URL.createObjectURL(file);
    photoImage.src=photoUrl;
    photoPreview.hidden=false;
    photoPick.textContent='Anderes Foto wählen';
    photoStatus.textContent='';
  });
}

if(photoClear)photoClear.addEventListener('click',clearPhoto);

if(photoShare){
  photoShare.addEventListener('click',async()=>{
    if(!photoFile){
      if(photoStatus)photoStatus.textContent='Bitte wähle zuerst ein Foto aus.';
      return;
    }

    const shareText='Hallo Vlora, ich möchte ungefähr dieses Nageldesign. Kannst du mir sagen, was das bei MR Beauty kosten würde?';

    try{
      if(navigator.share&&navigator.canShare&&navigator.canShare({files:[photoFile]})){
        photoStatus.textContent='Wähle im Teilen-Menü WhatsApp und sende das Foto an Vlora.';
        await navigator.share({
          title:'Nageldesign für MR Beauty',
          text:shareText,
          files:[photoFile]
        });
        photoStatus.textContent='Foto wurde über die Geräte-Teilen-Funktion weitergegeben.';
        return;
      }
    }catch(error){
      if(error&&error.name==='AbortError'){
        photoStatus.textContent='Teilen abgebrochen. Das Foto bleibt nur auf deinem Gerät.';
        return;
      }
    }

    const url='https://wa.me/41763235996?text='+encodeURIComponent(shareText+'\n\nBitte füge das ausgewählte Foto in WhatsApp hinzu.');
    window.open(url,'_blank','noopener,noreferrer');
    photoStatus.textContent='WhatsApp wurde geöffnet. Bitte hänge dort das ausgewählte Foto an.';
  });
}

window.addEventListener('pagehide',()=>{
  if(photoUrl)URL.revokeObjectURL(photoUrl);
});
})();