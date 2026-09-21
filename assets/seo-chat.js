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

const designSend=document.getElementById('mrAiDesignSend');

function useMobileWhatsAppFlow(){
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.matchMedia('(max-width:900px)').matches;
}

if(designSend){
  designSend.addEventListener('click',()=>{
    const shareText='Hallo Vlora, ich möchte dir ein Nageldesign zeigen. Kannst du mir sagen, was das bei MR Beauty kosten würde? Ich füge das Foto gleich in WhatsApp hinzu.';
    const url='https://wa.me/41763235996?text='+encodeURIComponent(shareText);

    if(useMobileWhatsAppFlow()){
      window.location.href=url;
      return;
    }

    const waDialog=document.getElementById('waDialog');
    if(waDialog&&typeof waDialog.showModal==='function'){
      const directLink=waDialog.querySelector('[data-direct-wa]');
      if(directLink)directLink.href=url;
      if(!waDialog.open)waDialog.showModal();
      return;
    }

    window.open(url,'_blank','noopener,noreferrer');
  });
}

})();