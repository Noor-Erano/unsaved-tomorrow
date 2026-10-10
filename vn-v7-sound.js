/* Original adaptive score. No external recordings or network requests. */
const Sound=(()=>{
 let ctx,master,music,fx,verb,echo,compressor,noiseBuffer,enabled=false,hidden=false,timer=null;
 let theme='',bar=0,nextBar=0,holdUntil=0,lastState=null,musicVolume=.65,fxVolume=.65;
 const voices=new Set(),buses=new Set();let bus=null;
 const midi=n=>440*Math.pow(2,(n-69)/12);
 const scores={
  room:{beat:.76,chords:[[57,60,64,71],[53,57,60,67],[48,55,59,64],[55,59,62,69]],melody:[76,71,72,64,67,71,69,64],density:.65},
  office:{beat:.70,chords:[[57,60,64,71],[53,60,64,69],[50,57,60,64],[52,59,62,67]],melody:[76,0,72,71,0,67,64,0],density:.62},
  doubt:{beat:.67,chords:[[57,60,64,70],[53,59,60,64],[50,56,60,64],[52,58,59,65]],melody:[76,0,75,71,0,70,64,0],density:.58},
  pursuit:{beat:.53,chords:[[45,52,58,60],[41,48,54,59],[38,45,51,58],[40,47,53,60]],melody:[76,0,75,0,71,70,0,64],density:.75},
  return:{beat:.83,chords:[[57,60,64,70],[53,57,59,66],[50,56,60,65],[52,58,62,65]],melody:[76,71,0,63,0,70,0,64],density:.55},
  call:{beat:.6,chords:[[40,47,53,58]],melody:[0],density:.4},
  loss:{beat:1.05,chords:[[45,52,58,60],[41,48,55,59]],melody:[76,0,0,70,0,0,64,0],density:.5},
  escape:{beat:.88,chords:[[57,60,64,71],[53,57,60,64]],melody:[76,71,72,0,67,0,0,0],density:.5},
  hope:{beat:.76,chords:[[60,64,67,74],[57,60,64,71],[53,57,60,67],[55,59,62,69]],melody:[76,71,72,79,76,74,72,0],density:.7},
  dawn:{beat:.72,chords:[[60,64,67,74],[55,59,62,69],[57,60,64,71],[53,57,60,67]],melody:[76,71,72,79,76,74,72,76],density:.8}
 };
 function select(s){const ending=s.ending||(s.pending?.startsWith('end:')?s.pending.slice(4):'');
  if(ending)return ending==='te'?'dawn':['he','home','ne'].includes(ending)?'hope':ending==='stay'?'escape':'loss';
  if(s.flags.saveFight||s.flags.pressureTwo)return 'pursuit';if(s.panel==='encounter')return 'silent';if(s.flags.callPending)return 'call';
  if(!s.flags.leftHome)return s.known.loop?'return':'room';
  if(s.flags.returnedHome)return 'return';
  if(s.flags.doorAttack||s.flags.knock||s.time>=1330)return 'pursuit';
  if(s.known.vanishing&&!s.flags.wangSafe||s.time>=1315)return 'doubt';
  if(['road','gate','parking'].includes(s.loc))return 'doubt';return 'office';
 }
 function init(){if(ctx)return;ctx=new(window.AudioContext||window.webkitAudioContext)();
  master=ctx.createGain();master.gain.value=.65;compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-18;compressor.knee.value=16;compressor.ratio.value=5;compressor.attack.value=.005;compressor.release.value=.25;
  music=ctx.createGain();fx=ctx.createGain();music.gain.value=musicVolume;fx.gain.value=fxVolume;music.connect(master);fx.connect(master);master.connect(compressor).connect(ctx.destination);
  verb=ctx.createConvolver();const impulse=ctx.createBuffer(2,Math.floor(ctx.sampleRate*2.8),ctx.sampleRate);let seed=731;
  for(let ch=0;ch<2;ch++){const data=impulse.getChannelData(ch);for(let i=0;i<data.length;i++){seed=(seed*16807)%2147483647;data[i]=(seed/1073741824-1)*Math.pow(1-i/data.length,3)*.26;}}verb.buffer=impulse;
  const wet=ctx.createGain();wet.gain.value=.28;verb.connect(wet).connect(music);
  echo=ctx.createDelay(2);echo.delayTime.value=.37;const feedback=ctx.createGain(),echoWet=ctx.createGain();feedback.gain.value=.22;echoWet.gain.value=.15;echo.connect(feedback).connect(echo);echo.connect(echoWet).connect(music);
  noiseBuffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);const data=noiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++){seed=(seed*16807)%2147483647;data[i]=seed/1073741824-1;}
 }
 function track(node,gain,at,duration,extra=[]){const item={node,gain,extra};voices.add(item);node.start(at);node.stop(at+duration+.06);node.onended=()=>{voices.delete(item);node.disconnect();gain.disconnect();extra.forEach(n=>n.disconnect());};}
 function note(n,at,dur,vol=.1,kind='keys',pan=0,target=bus){if(!enabled||hidden||!target)return;const o=ctx.createOscillator(),g=ctx.createGain(),p=ctx.createStereoPanner();p.pan.value=pan;o.type=kind==='pad'?'triangle':'sine';o.frequency.value=midi(n);if(kind==='pad')o.detune.value=pan*8;
  const attack=kind==='pad'?Math.min(.7,dur/3):.012;g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),at+attack);g.gain.exponentialRampToValueAtTime(.0001,at+dur);
  o.connect(g).connect(p).connect(target);track(o,g,at,dur,[p]);
  if(kind==='keys'){const overtone=ctx.createOscillator(),eg=ctx.createGain();overtone.frequency.value=midi(n)*2.002;eg.gain.setValueAtTime(Math.max(.0002,vol*.18),at);eg.gain.exponentialRampToValueAtTime(.0001,at+Math.min(.45,dur));overtone.connect(eg).connect(target);track(overtone,eg,at,Math.min(.45,dur));}
 }
 function air(at,dur,vol,freq,target=bus){if(!enabled||hidden||!target)return;const src=ctx.createBufferSource(),g=ctx.createGain(),filter=ctx.createBiquadFilter();src.buffer=noiseBuffer;src.loop=true;filter.type='bandpass';filter.frequency.value=freq;filter.Q.value=.7;g.gain.setValueAtTime(.0001,at);g.gain.linearRampToValueAtTime(vol,at+Math.min(.2,dur*.2));g.gain.exponentialRampToValueAtTime(.0001,at+dur);src.connect(filter).connect(g).connect(target);track(src,g,at,dur,[filter]);}
 function fadeBus(duration=.8){if(!bus)return;const old=bus;bus=null;old.gain.cancelScheduledValues(ctx.currentTime);old.gain.setTargetAtTime(.0001,ctx.currentTime,Math.max(.01,duration/4));const cleanup=setTimeout(()=>{old.disconnect();buses.delete(old);},duration*1000+300);old.cleanup=cleanup;}
 function change(next,abrupt=false){if(next===theme&&bus)return;ScorePlayer.change(next,musicVolume,Math.max(0,holdUntil-ctx.currentTime));fadeBus(abrupt?.05:1.2);theme=next;bar=0;nextBar=Math.max(ctx.currentTime+.04,holdUntil);if(next==='silent')return;bus=ctx.createGain();bus.gain.setValueAtTime(.0001,ctx.currentTime);bus.gain.exponentialRampToValueAtTime(.85,ctx.currentTime+(abrupt?.12:1.1));bus.connect(music);bus.connect(verb);bus.connect(echo);buses.add(bus);}
 function compose(t){const cfg=scores[theme];if(!cfg||!bus)return;const b=cfg.beat,chord=cfg.chords[bar%cfg.chords.length],phrase=Math.floor(bar/4)%4,d=cfg.density*(phrase===2?.72:1);
  // Sixteen-bar arc: establish, vary, thin out, then answer the opening motif.
  chord.forEach((n,i)=>note(n,t,4*b+.8,.036*d,'pad',(i-1.5)*.42));note(chord[0]-12,t,3.8*b,.105*d,'pad',0);
  if(!['loss','call'].includes(theme))for(let i=0;i<8;i++){if(phrase===2&&i%3)continue;note(chord[[0,2,1,3,2,1,3,2][i]]+12,t+i*b/2,b*1.5,.068*d,'keys',(i%2?1:-1)*.32);}
  if(theme!=='call'){const n=cfg.melody[(bar*2)%cfg.melody.length],answer=cfg.melody[(bar*2+1)%cfg.melody.length];if(n)note(n,t+b*.15,b*2.8,.11*d,'keys',-.1);if(answer&&phrase!==2)note(answer,t+b*2.2,b*2.4,.09*d,'keys',.15);}
  if(['doubt','return','loss'].includes(theme)){air(t+b,2*b,.023,1800);if(bar%2)note(chord[3]+12.12,t+3*b,2*b,.027,'pad',.7);}
  if(theme==='pursuit'){for(let i=0;i<4;i++){note(33,t+i*b,.16,.14,'pad',0);note(38,t+i*b+.19,.1,.075,'pad',0);}air(t,4*b,.065,650+bar%4*300);note(83.2,t+2*b,2*b,.025,'pad',-.8);}
  if(theme==='call'){note(28,t,4*b,.075,'pad',0);[0,.28,1.2,1.48].forEach(offset=>note(78,t+offset,.17,.115,'keys',.3));}
  if(theme==='dawn'&&phrase!==2){note(chord[2]+12,t+b,3*b,.07,'pad',.4);note(chord[3]+12,t+3*b,3*b,.065,'pad',-.4);}
  bar++;return 4*b;
 }
 function pump(){if(ScorePlayer.active())return;if(!enabled||hidden||!ctx||ctx.state!=='running'||theme==='silent'||!bus)return;if(ctx.currentTime<holdUntil)return;if(nextBar<ctx.currentTime-.2)nextBar=ctx.currentTime+.03;while(nextBar<ctx.currentTime+.16)nextBar+=compose(nextBar)||2;}
 function stop(){ScorePlayer.stop();clearInterval(timer);timer=null;for(const {node}of voices){try{node.stop()}catch{}}voices.clear();for(const b of buses){clearTimeout(b.cleanup);b.disconnect();}buses.clear();bus=null;theme='';if(ctx){music.gain.cancelScheduledValues(ctx.currentTime);music.gain.setValueAtTime(0,ctx.currentTime);fx.gain.setValueAtTime(0,ctx.currentTime);}}
 function volumes(m=musicVolume,f=fxVolume){musicVolume=Number.isFinite(m)?Math.max(0,Math.min(1,m)):musicVolume;fxVolume=Number.isFinite(f)?Math.max(0,Math.min(1,f)):fxVolume;ScorePlayer.volumes(musicVolume);if(ctx&&enabled&&!hidden){music.gain.setTargetAtTime(musicVolume,ctx.currentTime,.08);fx.gain.setTargetAtTime(fxVolume,ctx.currentTime,.08);}}
 function setEnabled(on){enabled=!!on;if(!enabled){stop();return;}try{init();ctx.resume();volumes();if(!timer)timer=setInterval(pump,80);}catch{enabled=false;}}
 function update(s){lastState=s;if(!enabled||hidden)return;volumes(s.settings.musicVolume??.65,s.settings.fxVolume??.65);const next=select(s);if(next!==theme||!bus&&next!=='silent')change(next,next==='silent');pump();}
 function cue(kind){if(!enabled||hidden||!ctx)return;const t=ctx.currentTime+.02;
  if(kind==='silence'){change('silent',true);return;}
  if(kind==='rewind'){holdUntil=t+1.1;change('return',true);air(t,.65,.065,900,fx);[76,72,71,64].forEach((n,i)=>note(n,t+i*.11,.3,.045,'keys',0,fx));nextBar=holdUntil;return;}
  if(kind==='scare'){ScorePlayer.silence();holdUntil=t+1.15;fadeBus(.025);theme='';music.gain.cancelScheduledValues(t);music.gain.setValueAtTime(.0001,t);music.gain.setTargetAtTime(musicVolume,t+1.05,.4);air(t,.7,.22,1400,fx);[30,42.2,66.4].forEach(n=>note(n,t,.85,.16,'pad',0,fx));return;}
  // The call motif is scheduled by its own scene, not restarted by each render.
  if(kind==='ring')return;
  if(kind==='proof'){[64,67,71,76].forEach((n,i)=>note(n,t+i*.18,.9,.065,'keys',i*.15,fx));return;}
  if(kind==='message'||kind==='result'){[76,kind==='result'?79:72].forEach((n,i)=>note(n,t+i*.12,.16,.06,'keys',0,fx));return;}
  if(kind==='bottle'){[84,79,83].forEach((n,i)=>note(n,t+i*.07,.07,.035,'keys',.35,fx));return;}
  if(kind==='knock'||kind==='door'){[0,.29].forEach(d=>{note(38,t+d,.12,.18,'pad',-.5,fx);air(t+d,.08,.07,450,fx);});return;}
  if(kind==='typing'){[0,.08,.14].forEach(d=>air(t+d,.035,.04,2400,fx));return;}
  if(kind==='train')air(t,2.8,.12,400,fx);
 }
 document.addEventListener('visibilitychange',()=>{hidden=document.hidden;if(hidden)stop();else if(enabled){setEnabled(true);if(lastState)update(lastState);}});
 return {setEnabled,update,cue,volumes,select,status:()=>({enabled,theme,bar,voices:voices.size,buses:buses.size,musicVolume,fxVolume,context:ctx?.state||'none',recording:ScorePlayer.status()})};
})();
