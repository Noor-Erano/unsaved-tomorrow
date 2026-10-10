/* Rendered original tracks; HTMLAudio also supports the local file:// entry point. */
const ScorePlayer=(()=>{
 const tracks={room:['room',.48,1],office:['room',.40,1],doubt:['dread',.46,1],return:['dread',.40,1],pursuit:['pursuit',.55,1],hope:['hope',.40,.96],dawn:['dawn',.53,1]};
 const files={room:'room-chamber-v2.wav',dread:'dread-orchestral-v3.wav',pursuit:'pursuit-orchestral-v3.wav',hope:'dawn-chamber-v2.wav',dawn:'dawn-symphonic-v3.wav'};
 let current=null,volume=.65,serial=0;const live=new Set();
 function gain(p,value,ms=800){clearInterval(p.fade);const start=p.audio.volume,at=performance.now();p.fade=setInterval(()=>{const f=Math.min(1,(performance.now()-at)/ms);p.audio.volume=Math.max(0,Math.min(1,start+(value-start)*f));if(f===1){clearInterval(p.fade);if(value===0&&p!==current)dispose(p);}},25);}
 function dispose(p){clearInterval(p.fade);clearTimeout(p.start);p.audio.pause();p.audio.removeAttribute('src');p.audio.load();live.delete(p);}
 function change(theme,m=.65,delay=0){volume=m;const spec=tracks[theme];if(spec&&current?.key===spec[0]&&!current.failed){current.level=spec[1];current.audio.playbackRate=spec[2];gain(current,volume*current.level);return;}
  const old=current;current=null;if(old)gain(old,0,650);if(!spec)return;
  const p={key:spec[0],level:spec[1],failed:false,audio:new Audio('assets/music/'+files[spec[0]]),id:++serial};current=p;live.add(p);p.audio.loop=true;p.audio.preload='auto';p.audio.volume=0;p.audio.playbackRate=spec[2];
  p.audio.addEventListener('error',()=>{p.failed=true;});
  p.start=setTimeout(()=>{if(current!==p)return;p.audio.play().then(()=>{if(current===p)gain(p,volume*p.level,1200);}).catch(()=>{p.failed=true;});},Math.max(0,delay)*1000);
 }
 function volumes(v){volume=v;if(current&&!current.failed)gain(current,v*current.level,120);}
 function silence(){const old=current;current=null;if(old)gain(old,0,45);}
 function stop(){current=null;for(const p of [...live])dispose(p);}
 return {change,volumes,silence,stop,active:()=>!!current&&!current.failed,status:()=>({track:current?.key||'',failed:!!current?.failed,playing:!!current&&!current.audio.paused,time:current?.audio.currentTime||0,volume:current?.audio.volume||0,players:live.size})};
})();
