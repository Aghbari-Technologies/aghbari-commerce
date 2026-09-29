import { useEffect, useState } from 'react';

type InstallPromptEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:'accepted'|'dismissed'}>};

export default function PwaInstallPrompt(){
 const [promptEvent,setPromptEvent]=useState<InstallPromptEvent|null>(null);
 const [installed,setInstalled]=useState(false);
 const [busy,setBusy]=useState(false);
 useEffect(()=>{
  const standalone=window.matchMedia('(display-mode: standalone)').matches||Boolean((navigator as Navigator&{standalone?:boolean}).standalone);
  setInstalled(standalone);
  const onBeforeInstall=(event:Event)=>{event.preventDefault();setPromptEvent(event as InstallPromptEvent);};
  const onInstalled=()=>{setInstalled(true);setPromptEvent(null);};
  window.addEventListener('beforeinstallprompt',onBeforeInstall);
  window.addEventListener('appinstalled',onInstalled);
  return()=>{window.removeEventListener('beforeinstallprompt',onBeforeInstall);window.removeEventListener('appinstalled',onInstalled);};
 },[]);
 if(installed||!promptEvent)return null;
 async function install(){
  if(!promptEvent||busy)return;
  setBusy(true);
  try{await promptEvent.prompt();const choice=await promptEvent.userChoice;if(choice.outcome==='accepted'){setInstalled(true);setPromptEvent(null);}}catch{}finally{setBusy(false);}
 }
 return <aside className="pwa-install-banner" role="status"><div className="pwa-install-icon" aria-hidden="true">أ</div><div><strong>ثبّت الأغبري على جهازك</strong><small>وصول أسرع إلى الكتالوج والطلبات مع تجربة تشغيل مستقلة.</small></div><button type="button" onClick={()=>void install()} disabled={busy}>{busy?'جارٍ فتح نافذة التثبيت…':'تثبيت التطبيق'}</button></aside>;
}
