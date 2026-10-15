/* Tile 10 shares the teacher-reviewed class roster with Tile 9. */
const P10_ROSTER=P9_ROSTER;
const P10_ITEMS=['elephant','giraffe','camel','zebra','lion','tiger','hippo'].map(animal=>{
 const article=animal==='elephant'?'an':'a';
 return {red:['took','photos',animal],blue:['I','many','of','camera'],green:['with','my',article],
 answer:`I took many photos of ${article} ${animal} with my camera.`,
 alt:`A child taking photos of ${article} ${animal} with a camera`};
});
function p10Accepted(item){
 const q=P10_ITEMS[item],animal=q.green[2]+' '+q.red[2];
 return new Set([`i took many photos of ${animal} with my camera`,`with my camera i took many photos of ${animal}`,`i took many photos with my camera of ${animal}`]);
}
let p10Mode='teach',p10TeachItem=null,p10TeachStage=0,p10TeachState=null;
let p10Class='',p10Groups=[[],[]],p10States=[],p10Orders=[],p10Indices=[0,0],p10Scores=[0,0],p10Timers=[null,null];
const p10Escape=p8Escape;
function p10Art(i){return `<div class="p10-art" role="img" aria-label="${P10_ITEMS[i].alt}" style="background-position:0 ${i*50}%"></div>`}
function p10MakeState(item){let id=0;const q=P10_ITEMS[item];const tiles=['red','blue','green'].flatMap(colour=>q[colour].map(text=>({id:id++,text:text.toLowerCase(),colour})));let pile=shuffle(tiles);if(p10Accepted(item).has(pile.map(w=>w.text).join(' ')))pile.push(pile.shift());return {item,pile,answer:[],phase:'order',letters:[],dots:[],selected:-1,feedback:'',good:false,target:''}}
function p10Init(){if(p10Class!==settings.classCode){p10Class=settings.classCode;p10Groups=[[],[]];p10Reset(false)}if(!p10States.length)p10Reset(false);p10Render()}
function p10Reset(render=true){p10Timers.forEach(clearTimeout);p10Timers=[null,null];p10Indices=[0,0];p10Scores=[0,0];const first=shuffle(P10_ITEMS.map((_,i)=>i)),shift=1+Math.floor(Math.random()*6);p10Orders=[first,first.slice(shift).concat(first.slice(0,shift))];p10States=p10Orders.map(a=>p10MakeState(a[0]));if(render)p10Render()}
function p10SetMode(mode){p10Mode=mode;p10Render()}
function p10SelectPicture(i){p10TeachItem=i;p10TeachStage=0;p10TeachState=p10MakeState(i);p10Render()}
function p10TeachNext(){if(p10TeachItem===null)return;if(p10TeachStage<3)p10TeachStage++;else if(p10TeachState.phase==='done'){p10TeachItem=null;p10TeachStage=0}p10Render()}
function p10TeachBack(){if(p10TeachStage>0){p10TeachStage--;if(p10TeachStage<3)p10TeachState=p10MakeState(p10TeachItem)}else p10TeachItem=null;p10Render()}
function p10State(screen){return screen<0?p10TeachState:p10States[screen]}
function p10Move(screen,id,back){const s=p10State(screen);if(!s||s.phase!=='order')return;const from=back?s.answer:s.pile,to=back?s.pile:s.answer,i=from.findIndex(w=>w.id===id);if(i<0)return;to.push(from.splice(i,1)[0]);s.feedback='';p10Render()}
function p10SelectLetter(screen,i){const s=p10State(screen);if(s?.phase!=='punctuation')return;s.selected=i;p10Render()}
function p10ToggleCase(screen){const s=p10State(screen);if(!s||s.phase!=='punctuation'||s.selected<0)return;const c=s.letters[s.selected];s.letters[s.selected]=c===c.toUpperCase()?c.toLowerCase():c.toUpperCase();s.feedback='';p10Render()}
function p10ToggleDot(screen){const s=p10State(screen);if(!s||s.phase!=='punctuation'||s.selected<0)return;s.dots[s.selected]=!s.dots[s.selected];s.feedback='';p10Render()}
function p10Sentence(s){return s.letters.map((c,i)=>c+(s.dots[i]?'.':'')).join('')}
function p10Submit(screen){
 const s=p10State(screen);if(!s||s.phase==='done'||(s.phase==='order'&&s.pile.length))return;
 let correct=false;
 if(s.phase==='order'){
  const sentence=s.answer.map(w=>w.text).join(' ');
  correct=p10Accepted(s.item).has(sentence);
  if(correct){s.target=(sentence[0].toUpperCase()+sentence.slice(1)).replace(/\bi\b/g,'I')+'.';s.letters=sentence.split('');s.dots=[];s.selected=-1;s.phase='punctuation'}
 }else if(s.phase==='punctuation'){
  correct=p10Sentence(s)===s.target;
  if(correct)s.phase='done';
 }
 s.good=correct;s.feedback=correct?'You are correct!':'Try again!';playChallengeFx(correct?'good':'bad');
 if(screen>=0){
  p10Scores[screen]+=correct?100:-10;
  if(correct&&s.phase==='done')p10Timers[screen]=setTimeout(()=>{p10Timers[screen]=null;p10Indices[screen]++;if(p10Indices[screen]<7)p10States[screen]=p10MakeState(p10Orders[screen][p10Indices[screen]]);p10Render()},1800);
 }
 p10Render();
}
function p10Tiles(s,screen){const word=(w,back)=>`<button class="p10-word ${w.colour}" onclick="p10Move(${screen},${w.id},${back})" aria-label="${back?'Return':'Add'} ${p10Escape(w.text)}">${p10Escape(w.text)}</button>`;return `<div class="p10-answer" aria-label="Answer words">${s.answer.map(w=>word(w,true)).join('')}</div><div class="p10-pile" aria-label="Jumbled words">${s.pile.map(w=>word(w,false)).join('')}</div>`}
function p10Editor(s,screen){let pos=0;return `<div class="p10-edit" aria-label="Edit capital letters and full stops">${s.letters.join('').split(' ').map(w=>{const start=pos;pos+=w.length+1;return `<span class="p10-edit-word">${w.split('').map((c,j)=>{const i=start+j;return `<button class="p10-letter ${s.selected===i?'selected':''}" onclick="p10SelectLetter(${screen},${i})" ${s.phase==='done'?'disabled':''} aria-label="Select letter ${p10Escape(c)} at position ${i+1}" aria-pressed="${s.selected===i}">${p10Escape(c)}</button>${s.dots[i]?'<span class="p10-dot">.</span>':''}`}).join('')}</span>`}).join('')}</div>`}
function p10Exercise(s,screen){const edit=s.phase==='punctuation'&&s.selected>=0,canSubmit=s.phase==='punctuation'||(s.phase==='order'&&!s.pile.length);return `${s.phase==='order'?p10Tiles(s,screen):p10Editor(s,screen)}<div class="p10-feedback ${s.good?'good':''}" role="status">${s.feedback?`<span class="p10-feedback-icon" aria-hidden="true">${s.good?'✓':'✕'}</span><span>${s.feedback}</span>`:''}</div><div class="p10-controls"><button onclick="p10ToggleCase(${screen})" aria-label="Change selected letter case" ${edit?'':'disabled'}>↑</button><button onclick="p10ToggleDot(${screen})" aria-label="Add or remove full stop" ${edit?'':'disabled'}>.</button><button onclick="p10Submit(${screen})" style="visibility:${canSubmit?'visible':'hidden'}" ${canSubmit?'':'disabled'}>Submit</button></div>`}
function p10Render(){
 const root=document.getElementById('p10Content');if(!root)return;
 document.querySelectorAll('[data-p10-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.p10Mode===p10Mode)));
 if(p10Mode==='teach'){
  if(p10TeachItem===null){root.innerHTML=`<div class="p10-board"><p class="p10-title">You are taking photos at the zoo</p><div class="p10-pictures">${[0,1,2].map(i=>`<button class="p10-picture-button" onclick="p10SelectPicture(${i})" aria-label="${P10_ITEMS[i].alt}">${p10Art(i)}</button>`).join('')}</div></div>`;return}
  const q=P10_ITEMS[p10TeachItem];const cues=['red','blue','green'].slice(0,p10TeachStage+1).map(colour=>`<div class="p10-cues">${q[colour].map(w=>`<span class="p10-cue ${colour}">${w}</span>`).join('')}</div>`).join('');
  root.innerHTML=`<div class="p10-board"><p class="p10-title">What did you do?</p><div class="p10-feature">${p10Art(p10TeachItem)}</div>${p10TeachStage<3?cues:p10Exercise(p10TeachState,-1)}<div class="p10-teach-footer"><button onclick="p10TeachBack()" aria-label="Previous">←</button><button onclick="p10TeachNext()" aria-label="Next" ${p10TeachStage===3&&p10TeachState.phase!=='done'?'disabled':''}>→</button></div></div>`;return;
 }
 const finished=p10Indices.every(n=>n>=7);
 root.innerHTML=`<div class="p10-duo">${[0,1].map(i=>`<div class="p10-group" data-p10-group="${i}"><div class="p10-group-head"><span>${i===0?'Boys':'Girls'}</span><small>${Math.min(p10Indices[i]+1,7)}/7</small></div>${p10Groups[i].length?`<select class="p10-member-select" aria-label="${i===0?'Boys':'Girls'} group members" onchange="this.selectedIndex=0"><option value="" selected disabled>${p10Escape(settings.classCode)} · ${p10Groups[i].length} pupils</option>${p10Groups[i].map(n=>`<option>${p10Escape(n)}</option>`).join('')}</select>`:''}${finished?`<div class="p10-done"><div class="p10-score-value">${p10Scores[i]}</div><div class="p10-score-label">points / 1400</div></div>`:p10Indices[i]>=7?'<div class="p10-complete"><span>✓</span>Finished!</div>':p10Exercise(p10States[i],i)}</div>`).join('')}</div>`;
}
function p10DrawGroup(pool,key){
 let remaining=[];try{remaining=JSON.parse(localStorage.getItem(key)||'[]')}catch(e){}
 if(!Array.isArray(remaining))remaining=[];remaining=[...new Set(remaining)].filter(n=>pool.includes(n));
 const chosen=[],count=Math.min(7,pool.length);
 while(chosen.length<count){if(!remaining.length)remaining=shuffle(pool.filter(n=>!chosen.includes(n)));const n=remaining.shift();if(n&&!chosen.includes(n))chosen.push(n)}
 try{localStorage.setItem(key,JSON.stringify(remaining))}catch(e){}return chosen;
}
function p10GroupCall(){
 p10Init();if(settings.classCode!=='2T'){toast('Boys’ and girls’ lists are set up for 2 Terbilang. Select 2T in Settings.');return}
 const present=new Set(challengePresentPupils());const pools=[P10_ROSTER.boys,P10_ROSTER.girls].map(a=>a.filter(n=>present.has(n)));
 if(pools.some(a=>!a.length)){toast('At least one present boy and girl are needed');return}
 p10Groups=pools.map((pool,i)=>p10DrawGroup(pool,'beach-p10-remaining-2T-'+i));p10Reset(false);p10Mode='groups';playConnectSound();p10Render();
}
