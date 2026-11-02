/* THE DESERT ADVENTURE · 2:45 INTERACTIVE SOUND EXPERIENCE
   To use your final recorded mix: place an audio file at audio/final-mix.mp3,
   or click ADD YOUR FINAL MIX on the page. The six photographs are your originals.
*/
const TOTAL = 165;
const $ = (selector) => document.querySelector(selector);
const app = $('#app'), startScreen = $('#intro'), experience = $('#experience'), ending = $('#ending');
const audio = $('#soundtrack');
const scenes = [
  {at:0, until:30, key:'drive',num:'01 / 05',kicker:'THE DRIVE',title:'THE ROAD ENDS HERE.',image:'assets/interior.jpg',voice:'FRIEND 1',line:'“You sure this is the right way?”'},
  {at:30, until:55, key:'radio',num:'02 / 05',kicker:'THE INTERFERENCE',title:'SOMETHING IN THE STATIC.',image:'assets/radio.jpg',voice:'FRIEND 1',line:'“What’s wrong with the radio?”'},
  {at:55, until:85, key:'stuck',num:'03 / 05',kicker:'NO WAY OUT',title:'THE SAND WON’T LET GO.',image:'assets/tire.jpg',voice:'FRIEND 2',line:'“Wait… try again.”'},
  {at:85, until:120, key:'outside',num:'04 / 05',kicker:'OUTSIDE THE CAR',title:'WE ARE NOT ALONE.',image:'assets/desert.jpg',voice:'FRIEND 1 · WHISPER',line:'“Did you hear that?”'},
  {at:120, until:165, key:'return',num:'05 / 05',kicker:'THE RETURN',title:'IT REMEMBERS US.',image:'assets/dashboard.jpg',voice:'RADIO · DISTORTED',line:'“You sure this is the right way?”'}
];
let elapsed=0, running=false, lastTick=0, lastScene='', fileLoaded=false, volume=.65, soundEngine=null, lastEffect=-1, hadThreeKnocks=false, lastFootstep=-1;
const fmt=n=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(Math.floor(n%60)).padStart(2,'0')}`;
let imageToggle=false;
function setBackground(url){const incoming=imageToggle?$('#backdrop'):$('#backdrop-next');const outgoing=imageToggle?$('#backdrop-next'):$('#backdrop');incoming.style.backgroundImage=`url("${url}")`;incoming.style.opacity='1';outgoing.style.opacity='0';imageToggle=!imageToggle;}
function showScene(scene){if(scene.key===lastScene)return;lastScene=scene.key;app.dataset.scene=scene.key;setBackground(scene.image);$('#chapter-number').textContent=scene.num;$('#scene-kicker').textContent=scene.kicker;$('#scene-title').textContent=scene.title;$('#speaker').textContent=scene.voice;$('#subtitle').textContent=scene.line;$('#explore-hint').classList.toggle('hidden',scene.key!=='outside');$('#radio-status').textContent=scene.key==='return'?'UNKNOWN':scene.key==='radio'?'WEAK SIGNAL':'CONNECTED';$('#station').innerHTML=scene.key==='return'?'??? <span>FM</span>':scene.key==='radio'?'--.- <span>FM</span>':'87.5 <span>FM</span>';if(scene.key==='outside')$('#footprint-layer').innerHTML='';}
function timeline(){if(!running)return;const now=performance.now();const delta=Math.min((now-lastTick)/1000,.15);lastTick=now;if(fileLoaded && !audio.paused && Number.isFinite(audio.currentTime))elapsed=audio.currentTime;else if(!fileLoaded)elapsed+=delta;elapsed=Math.min(TOTAL,elapsed);const scene=scenes.find((s)=>elapsed>=s.at&&elapsed<s.until);if(scene)showScene(scene);$('#clock').textContent=`${fmt(elapsed)} / 02:45`;$('#progress').style.width=`${elapsed/TOTAL*100}%`;narrativeUpdates();if(!fileLoaded)playDemo(elapsed);if(elapsed>=TOTAL-.06)finish();else requestAnimationFrame(timeline);}
function narrativeUpdates(){let text=null,voice=null;const t=elapsed;
  if(t>=12&&t<30){voice='FRIEND 2';text='“Relax. We’ve been here before.”'}
  if(t>=38&&t<55){voice='RADIO';text='— krrshh — the signal fades in and out.'}
  if(t>=69&&t<85){voice='FRIEND 2';text='“It’s not starting…”'}
  if(t>=104&&t<120){voice='SOMETHING OUT THERE';text='Their footsteps stop. The other footsteps don’t.'}
  if(t>=123&&t<145){voice='FRIEND 1';text='“Start the car. START THE CAR.”'}
  if(t>=145&&t<155){voice='RADIO · THEIR OWN VOICES';text='“Relax. We’ve been here before.”'}
  if(t>=155){voice='THREE SLOW KNOCKS';text='KNOCK. &nbsp; KNOCK. &nbsp; KNOCK.'}
  const s=scenes.find(s=>t>=s.at&&t<s.until);if(!s)return;
  $('#speaker').textContent=voice||s.voice;$('#subtitle').innerHTML=text||s.line;
  if(t>=157&&t<163&&!hadThreeKnocks){hadThreeKnocks=true;$('#lightning').classList.remove('flash');void $('#lightning').offsetWidth;$('#lightning').classList.add('flash');}
}
function initAudio(){if(soundEngine)return;const ctx=new (window.AudioContext||window.webkitAudioContext)();soundEngine={ctx};}
function makeTone(freq=110,seconds=.16,type='sawtooth',gain=.04,endFreq=freq){if(!soundEngine)return;const ctx=soundEngine.ctx,o=ctx.createOscillator(),g=ctx.createGain(),now=ctx.currentTime;o.type=type;o.frequency.setValueAtTime(freq,now);o.frequency.exponentialRampToValueAtTime(Math.max(10,endFreq),now+seconds);g.gain.setValueAtTime(.00001,now);g.gain.linearRampToValueAtTime(gain*volume,now+.02);g.gain.exponentialRampToValueAtTime(.00001,now+seconds);o.connect(g).connect(ctx.destination);o.start(now);o.stop(now+seconds+.01);}
function makeNoise(seconds=.25,gain=.04,lowPass=0){if(!soundEngine)return;const ctx=soundEngine.ctx,buffer=ctx.createBuffer(1,Math.max(1,Math.floor(ctx.sampleRate*seconds)),ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1);const source=ctx.createBufferSource(),g=ctx.createGain();source.buffer=buffer;let tail=source;if(lowPass){const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=lowPass;source.connect(filter);tail=filter;}tail.connect(g).connect(ctx.destination);const now=ctx.currentTime;g.gain.setValueAtTime(.00001,now);g.gain.linearRampToValueAtTime(gain*volume,now+.025);g.gain.exponentialRampToValueAtTime(.00001,now+seconds);source.start();}
function playDemo(t){if(!soundEngine)return;const second=Math.floor(t);if(second===lastEffect)return;lastEffect=second;
 // All demo sounds are procedural previews, not substitutes for original field recordings.
 if(second===0){makeTone(75,.9,'sawtooth',.16,130);makeNoise(.18,.09,1100)}
 if(second===2||second===3)makeTone(380,.09,'square',.035,290);
 if(second>3&&second<55&&second%3===0)makeTone(90,.65,'sawtooth',.027,110);
 if(second>28&&second<60){if(second%2===0)makeNoise(.34,.055,2000);if(second%6===0)makeTone(620,.16,'triangle',.022,300)}
 if(second===55||second===60||second===65)makeTone(105,1.5,'sawtooth',.13,46);
 if(second>57&&second<72&&second%2===0)makeNoise(.36,.06,900);
 if(second===77)makeNoise(.4,.07,200);
 if(second>=85&&second<145){if(second%4===0)makeNoise(1.8,.035,420);if(second%3===0&&second<120)makeNoise(.14,.055,650)}
 if(second>=111&&second<122&&second%2===0)makeNoise(.18,.09,400);
 if(second>120&&second<137&&second%2===0)makeNoise(.18,.11,800);
 if(second===135||second===136||second===139)makeTone(79,.85,'sawtooth',.12,43);
 if(second===145)makeTone(730,.5,'sine',.07,250);
 if(second>=147&&second<160&&second%2===0)makeNoise(.25,.09,2600);
 if([156,158,160].includes(second)){makeTone(74,.2,'sine',.19,55);makeNoise(.10,.09,360)}
 if(second===163)makeNoise(1.5,.22,4500);
}
function startJourney(){running=false;elapsed=0;lastScene='';lastEffect=-1;hadThreeKnocks=false;$('#footprint-layer').innerHTML='';startScreen.classList.add('hidden');ending.classList.add('hidden');experience.classList.remove('hidden');initAudio();soundEngine.ctx.resume();if(fileLoaded){audio.currentTime=0;audio.volume=volume;audio.play().catch(()=>{});}running=true;lastTick=performance.now();timeline();$('#pause').textContent='Ⅱ PAUSE';}
function finish(){running=false;audio.pause();experience.classList.add('hidden');ending.classList.remove('hidden');app.dataset.scene='end';}
function pauseToggle(){if(running){running=false;if(fileLoaded)audio.pause();$('#pause').textContent='▶ RESUME';$('#status').textContent='JOURNEY PAUSED';}else{running=true;lastTick=performance.now();if(fileLoaded)audio.play().catch(()=>{});if(soundEngine)soundEngine.ctx.resume();$('#pause').textContent='Ⅱ PAUSE';$('#status').textContent='JOURNEY IN PROGRESS';timeline();}}
$('#start').addEventListener('click',startJourney);$('#replay').addEventListener('click',startJourney);$('#restart').addEventListener('click',startJourney);$('#pause').addEventListener('click',pauseToggle);$('#brand').addEventListener('click',e=>{e.preventDefault();running=false;audio.pause();ending.classList.add('hidden');experience.classList.add('hidden');startScreen.classList.remove('hidden');app.dataset.scene='intro';lastScene='';setBackground('assets/defender.jpg');});
$('#volume').addEventListener('input',e=>{volume=Number(e.target.value)/100;audio.volume=volume;$('#vol-label').textContent=e.target.value+'%';});
let tuning=0;$('#tune').addEventListener('click',()=>{tuning++;makeNoise(.3,.10,3200);$('#station').innerHTML=`${(87.5+(tuning*2.1)%19).toFixed(1)} <span>FM</span>`;setTimeout(()=>{if(app.dataset.scene==='radio')$('#station').innerHTML='--.- <span>FM</span>';if(app.dataset.scene==='return')$('#station').innerHTML='??? <span>FM</span>';},1200);});
$('#file-audio').addEventListener('change',e=>{const file=e.target.files[0];if(!file)return;audio.pause();audio.src=URL.createObjectURL(file);audio.load();fileLoaded=true;audio.volume=volume;$('#audio-mode').textContent='YOUR ORIGINAL SOUNDTRACK';$('#audio-help').textContent=file.name+' · loaded. Restart to sync from 0:00.';if(running){audio.currentTime=Math.min(elapsed, Math.max(0,(audio.duration||TOTAL)-1));audio.play().catch(()=>{});}});
audio.addEventListener('loadedmetadata',()=>{if(audio.currentSrc && audio.duration>0){fileLoaded=true;$('#audio-mode').textContent='ORIGINAL SOUNDTRACK';$('#audio-help').textContent='Final mix detected. Use START JOURNEY to play it.';}});
audio.addEventListener('ended',finish);
audio.addEventListener('error',()=>{if(!fileLoaded){$('#audio-help').textContent='Add your finished audio mix here when ready. Interactive demo sound works now.';}});
// Hover/click in the outdoor scene to reveal tracks in the sand.
function createFootprint(x,y){if(app.dataset.scene!=='outside')return;const f=document.createElement('div');f.className='footprint';f.style.left=(x-8)+'px';f.style.top=(y-10)+'px';$('#footprint-layer').append(f);setTimeout(()=>f.remove(),7200);if(!fileLoaded)makeNoise(.10,.035,600);}
app.addEventListener('pointermove',e=>{if(!running||app.dataset.scene!=='outside')return;const tick=performance.now();if(tick-lastFootstep<280)return;lastFootstep=tick;if(e.clientY<window.innerHeight*.35)return;createFootprint(e.clientX,e.clientY);});
app.addEventListener('click',e=>{if(!running||app.dataset.scene!=='outside'||e.target.closest('button,input'))return;createFootprint(e.clientX,e.clientY);});
