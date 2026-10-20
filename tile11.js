/* Three sentences per round, using the existing Tile 8–10 question banks. */
const P11_BANKS=[P8_ITEMS,P9_ITEMS,P10_ITEMS];
const P11_CONNECTORS=['first','next','then'];
const P11_LABELS=['At the zoo','Our picnic','Animal photos'];
let p11Mode='teach',p11Class='',p11Groups=[[],[]],p11Indices=[0,0],p11Scores=[0,0],p11Orders=[],p11States=[],p11Active=[0,0],p11Timers=[null,null];
let p11TeachState=null,p11TeachStage=0;
function p11MakeState(source,item){const s=[p8MakeState,p9MakeState,p10MakeState][source](item);s.source=source;s.commas=[];s.pile=shuffle([...s.pile,{id:Math.max(...s.pile.map(w=>w.id))+1,text:P11_CONNECTORS[source],colour:'green'}]);return s}
function p11MakeRound(item){return [0,1,2].map(source=>p11MakeState(source,item))}
function p11Reset(render=true){p11Timers.forEach(clearTimeout);p11Timers=[null,null];p11Indices=[0,0];p11Scores=[0,0];p11Active=[0,0];const first=shuffle([0,1,2,3,4,5,6]),shift=1+Math.floor(Math.random()*6);p11Orders=[first,first.slice(shift).concat(first.slice(0,shift))];p11States=p11Orders.map(order=>p11MakeRound(order[0]));if(render)p11Render()}
function p11Init(){if(p11Class!==settings.classCode){p11Class=settings.classCode;p11Groups=[[],[]];p11Reset(false)}if(!p11States.length)p11Reset(false);p11Render()}
function p11SetMode(mode){p11Mode=mode;p11Render()}
function p11State(screen){return screen<0?p11TeachState:p11States[Math.floor(screen/3)]?.[screen%3]}
function p11SelectPicture(source,item){p11TeachState=p11MakeState(source,item);p11TeachStage=0;p11Render()}
function p11TeachNext(){if(p11TeachStage<3)p11TeachStage++;else if(p11TeachState.phase==='done')p11TeachState=null;p11Render()}
function p11TeachBack(){if(p11TeachStage>0){p11TeachStage--;p11TeachState=p11MakeState(p11TeachState.source,p11TeachState.item)}else p11TeachState=null;p11Render()}
function p11SelectQuestion(group,question){if(p11Indices[group]>=7)return;p11Active[group]=question;p11Render()}
function p11Move(screen,id,back){const s=p11State(screen);if(!s||s.phase!=='order')return;const from=back?s.answer:s.pile,to=back?s.pile:s.answer,i=from.findIndex(w=>w.id===id);if(i<0)return;to.push(from.splice(i,1)[0]);s.feedback='';p11Render()}
function p11SelectLetter(screen,i){const s=p11State(screen);if(s?.phase!=='punctuation')return;s.selected=i;p11Render()}
function p11ToggleCase(screen){const s=p11State(screen);if(!s||s.phase!=='punctuation'||s.selected<0)return;const c=s.letters[s.selected];s.letters[s.selected]=c===c.toUpperCase()?c.toLowerCase():c.toUpperCase();s.feedback='';p11Render()}
function p11ToggleDot(screen){const s=p11State(screen);if(!s||s.phase!=='punctuation'||s.selected<0)return;s.dots[s.selected]=!s.dots[s.selected];s.feedback='';p11Render()}
function p11ToggleComma(screen){const s=p11State(screen);if(!s||s.phase!=='punctuation'||s.selected<0)return;s.commas[s.selected]=!s.commas[s.selected];s.feedback='';p11Render()}
function p11Sentence(s){return s.letters.map((c,i)=>c+(s.commas[i]?',':'')+(s.dots[i]?'.':'')).join('')}
function p11Editor(s,screen){let pos=0;return `<div class="p11-edit" aria-label="Edit capital letters, commas and full stops">${s.letters.join('').split(' ').map(w=>{const start=pos;pos+=w.length+1;return `<span class="p11-edit-word">${w.split('').map((c,j)=>{const i=start+j;return `<button class="p11-letter ${s.selected===i?'selected':''}" onclick="p11SelectLetter(${screen},${i})" ${s.phase==='done'?'disabled':''} aria-label="Select letter ${p8Escape(c)} at position ${i+1}" aria-pressed="${s.selected===i}">${p8Escape(c)}</button>${s.commas[i]?'<span class="p11-dot">,</span>':''}${s.dots[i]?'<span class="p11-dot">.</span>':''}`}).join('')}</span>`}).join('')}</div>`}
function p11Submit(screen){
 const s=p11State(screen);if(!s||s.phase==='done'||(s.phase==='order'&&s.pile.length))return;
 let correct=false;
 if(s.phase==='order'){
  const sentence=s.answer.map(w=>w.text).join(' '),connector=P11_CONNECTORS[s.source],prefix=connector+' ',body=sentence.slice(prefix.length);
  correct=sentence.startsWith(prefix)&&(s.source===0?body===P8_ITEMS[s.item].answer.slice(0,-1).toLowerCase():[null,p9Accepted,p10Accepted][s.source](s.item).has(body));
  if(correct){s.target=connector[0].toUpperCase()+connector.slice(1)+', '+body.replace(/\bi\b/g,'I')+'.';s.letters=sentence.split('');s.dots=[];s.commas=[];s.selected=-1;s.phase='punctuation'}
 }else if(s.phase==='punctuation'){correct=p11Sentence(s)===s.target;if(correct)s.phase='done'}
 s.good=correct;s.feedback=correct?'You are correct!':'Try again!';playChallengeFx(correct?'good':'bad');
 if(screen>=0){const group=Math.floor(screen/3);p11Scores[group]+=correct?100:-10;
  // A round ends only when all three sentences (including punctuation) are complete.
  if(correct&&s.phase==='done'&&p11States[group].every(q=>q.phase==='done'))p11Timers[group]=setTimeout(()=>{p11Timers[group]=null;p11Indices[group]++;p11Active[group]=0;if(p11Indices[group]<7)p11States[group]=p11MakeRound(p11Orders[group][p11Indices[group]]);p11Render()},1800);
 }
 p11Render();
}
function p11Exercise(s,screen){
 const edit=s.phase==='punctuation'&&s.selected>=0,canSubmit=s.phase==='punctuation'||(s.phase==='order'&&!s.pile.length);
 const tiles=[p8Tiles,p9Tiles,p10Tiles][s.source](s,screen).replace(/p(?:8|9|10)Move/g,'p11Move').replace(/p(?:8|9|10)-/g,'p11-');
 return `${s.phase==='order'?tiles:p11Editor(s,screen)}<div class="p11-feedback ${s.good?'good':''}" role="status">${s.feedback?`<span class="p11-feedback-icon" aria-hidden="true">${s.good?'✓':'✕'}</span><span>${s.feedback}</span>`:''}</div><div class="p11-controls"><button onclick="p11ToggleCase(${screen})" aria-label="Change selected letter case" ${edit?'':'disabled'}>↑</button><button onclick="p11ToggleDot(${screen})" aria-label="Add or remove full stop" ${edit?'':'disabled'}>.</button><button onclick="p11ToggleComma(${screen})" aria-label="Add or remove comma" ${edit?'':'disabled'}>,</button><button onclick="p11Submit(${screen})" style="visibility:${canSubmit?'visible':'hidden'}" ${canSubmit?'':'disabled'}>Submit</button></div>`;
}
function p11Art(source,item){return [p8Art,p9Art,p10Art][source](item)}
function p11Render(){
 const root=document.getElementById('p11Content');if(!root)return;
 document.querySelectorAll('[data-p11-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.p11Mode===p11Mode)));
 if(p11Mode==='teach'){
  if(!p11TeachState){root.innerHTML=`<div class="p11-board">${[0,1,2].map(source=>`<h3>${P11_LABELS[source]}</h3><div class="p11-pictures">${(source===0?[0,1]:[0,1,2]).map(item=>`<button class="p11-picture-button" onclick="p11SelectPicture(${source},${item})" aria-label="${p8Escape(P11_BANKS[source][item].alt)}">${p11Art(source,item)}</button>`).join('')}</div>`).join('')}</div>`;return}
  const s=p11TeachState,q=P11_BANKS[s.source][s.item];let cues;
  if(s.source===0){const words=q.answer.slice(0,-1).toLowerCase().split(' ');cues=[q.cues,words.filter(w=>!q.cues.includes(w)),[]]}else cues=[q.red,q.blue,q.green];
  cues=cues.map((words,i)=>i===0?[P11_CONNECTORS[s.source],...words]:words);
  root.innerHTML=`<div class="p11-board"><h3>${P11_LABELS[s.source]}</h3><div class="p11-feature">${p11Art(s.source,s.item)}</div>${p11TeachStage<3?cues.slice(0,p11TeachStage+1).map((words,i)=>`<div class="p11-cues">${words.map(w=>`<span class="p11-cue ${['red','blue','green'][i]}">${p8Escape(w)}</span>`).join('')}</div>`).join(''):p11Exercise(s,-1)}<div class="p11-teach-footer"><button onclick="p11TeachBack()" aria-label="Previous">←</button><button onclick="p11TeachNext()" aria-label="Next" ${p11TeachStage===3&&s.phase!=='done'?'disabled':''}>→</button></div></div>`;return;
 }
 const finished=p11Indices.every(n=>n>=7);
 root.innerHTML=`<div class="p11-duo">${[0,1].map(group=>{
  const active=p11Active[group],states=p11States[group];
  return `<div class="p11-group"><div class="p11-group-head"><span>${group===0?'Boys':'Girls'}</span><small>Round ${Math.min(p11Indices[group]+1,7)}/7</small></div>${p11Groups[group].length?`<select class="p11-member-select" aria-label="${group===0?'Boys':'Girls'} group members" onchange="this.selectedIndex=0"><option selected disabled>${p8Escape(settings.classCode)} · ${p11Groups[group].length} pupils</option>${p11Groups[group].map(n=>`<option>${p8Escape(n)}</option>`).join('')}</select>`:''}${finished?`<div class="p11-done"><div class="p11-score-value">${p11Scores[group]}</div><div class="p11-score-label">points / 4200</div></div>`:p11Indices[group]>=7?'<div class="p11-complete"><span>✓</span>Finished!</div>':`<div class="p11-question-tabs" aria-label="Questions in this round">${states.map((s,i)=>`<button onclick="p11SelectQuestion(${group},${i})" aria-pressed="${i===active}">Q${i+1}${s.phase==='done'?' ✓':''}</button>`).join('')}</div><div class="p11-round-progress">${states.filter(s=>s.phase==='done').length}/3 completed · ${P11_LABELS[active]}</div>${p11Exercise(states[active],group*3+active)}${states[active].phase==='done'&&states.some(s=>s.phase!=='done')?`<button class="p11-next-question" onclick="p11SelectQuestion(${group},${states.findIndex(s=>s.phase!=='done')})">Next question →</button>`:''}`}</div>`;
 }).join('')}</div><div class="p11-teach-footer"><button onclick="p11Reset()" aria-label="Restart both groups">↻</button></div>`;
}
function p11GroupCall(){
 p11Init();if(settings.classCode!=='2T'){toast('Boys’ and girls’ lists are set up for 2 Terbilang. Select 2T in Settings.');return}
 const present=new Set(challengePresentPupils()),pools=[P9_ROSTER.boys,P9_ROSTER.girls].map(a=>a.filter(n=>present.has(n)));
 if(pools.some(a=>!a.length)){toast('At least one present boy and girl are needed');return}
 p11Groups=pools.map((pool,i)=>p9DrawGroup(pool,'beach-p11-remaining-2T-'+i));p11Reset(false);p11Mode='groups';playConnectSound();p11Render();
}
