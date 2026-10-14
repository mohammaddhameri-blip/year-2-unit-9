/* 2 Terbilang grouping reviewed and approved by the teacher. */
const P9_ROSTER={"boys": ["AKASYAH BIN HIRMAN", "ARIFF RAYHAN BIN MOHD. ARIFFIN", "AYRIEL EISYAM BIN AHMAD NAFIS", "HARITH RAYYAN BIN RAZRI", "MOHAMAD NABEEL AARIZ BIN MOHAMAD ARIFF", "MOHAMMAD ASYRAF LUTHFI BIN MOHAMMAD RAIME", "MOHAMMAD DZULFAQIEM BIN HASMADI", "MOHAMMAD EIYAD LUTHFI BIN KHAIRUL AZLAN", "MOHAMMAD FARHAN RAMADHAN BIN MOHAMMAD FIRDAUS", "MUHAMMAD AKMAL FIRDAUS BIN NAZRI", "MUHAMMAD FIRAZ ABDULLAH BIN FAHD ABDULLAH", "NURHAFIDIE BIN NORMAN", "QARIZH UWAIS BIN MOHAMMAD NAZID"], "girls": ["ALYA FITTEA BINTI SAJIMAN", "ANNUR ISZRYEN AREESYA BINTI ABDULLAH", "ARIEQA DANISYA BINTI HAIREE", "AUBREY YAHAIRA AD QAIZ BINTI MOHAMMAD HANAFIZ", "AYRA AZHARAH BINTI AZAMEIN", "DARWISYAH SAFFIYAH BINTI MOHAMAD SHAMSUL", "DAYANG NAZIHA TANDANGSARI BINTI ABANG NOOR HISHAM", "FAIRIZIANA FAIYANA BINTI FAIZAL", "NOR SYAFIYYA DAMIA BINTI MOHAMMAD DAUD", "NUR ADRIANA RISNA BINTI JEFFRI", "NUR RIZHANA BINTI MOHAMAD FAZLI", "NURMEDINA AZZAHRA BINTI MOHAMAD KHAIRUL AIZZAT", "NURULSYAHERA BINTI SARBINI"]};
const P9_ITEMS=[
 {red:['sat','together','sandwiches'],blue:['down','ate','garden'],green:['we','and','in','the'],answer:'We sat down together and ate sandwiches in the garden.',food:'sandwiches',verb:'ate',place:'in the garden',down:true,together:true,alt:'A family sitting on a mat in the garden and eating sandwiches'},
 {red:['sat','lunch','tree'],blue:['we','down','under'],green:['and','had','a'],answer:'We sat down under a tree and had lunch.',food:'lunch',verb:'had',place:'under a tree',down:true,together:false,alt:'A family sitting under a tree and having lunch'},
 {red:['sat','lunch','bench'],blue:['we','and','on'],green:['had','together','a'],answer:'We sat together on a bench and had lunch.',food:'lunch',verb:'had',place:'on a bench',down:false,together:true,alt:'A family sitting on a bench and having lunch'},
 {red:['sat','together','ice cream'],blue:['down','ate','garden'],green:['we','and','in','the'],answer:'We sat down together and ate ice cream in the garden.',food:'ice cream',verb:'ate',place:'in the garden',down:true,together:true},
 {red:['sat','pizzas','tree'],blue:['we','down','under'],green:['and','ate','a'],answer:'We sat down under a tree and ate pizzas.',food:'pizzas',verb:'ate',place:'under a tree',down:true,together:false},
 {red:['sat','burgers','bench'],blue:['we','and','on'],green:['ate','together','a'],answer:'We sat together on a bench and ate burgers.',food:'burgers',verb:'ate',place:'on a bench',down:false,together:true},
 {red:['sat','juice','bench'],blue:['we','and','on'],green:['drank','together','a'],answer:'We sat together on a bench and drank juice.',food:'juice',verb:'drank',place:'on a bench',down:false,together:true}
];
function p9Accepted(item){
 const q=P9_ITEMS[item],sit='sat'+(q.down?' down':''),eat=q.verb+' '+q.food,p=q.place;
 const base=[`${sit} ${p} and ${eat}`,`${sit} and ${eat} ${p}`,`${eat} and ${sit} ${p}`,`${eat} ${p} and ${sit}`];
 const options=[];
 if(!q.together)options.push(...base.map(s=>'we '+s));
 else for(const sentence of base){
  // Together can modify either action or the whole sentence, without splitting noun phrases.
  for(const phrase of [sit,eat])options.push('we '+sentence.replace(phrase,phrase+' together'));
  options.push('we '+sentence+' together');
  options.push('we together '+sentence);
  options.push('we '+sentence.replace(p,p+' together'));
 }
 options.push(q.answer.slice(0,-1).toLowerCase());
 return new Set(options);
}
let p9Mode='teach',p9TeachItem=null,p9TeachStage=0,p9TeachState=null;
let p9Class='',p9Groups=[[],[]],p9States=[],p9Orders=[],p9Indices=[0,0],p9Scores=[0,0],p9Timers=[null,null];
const p9Escape=p8Escape;
function p9Art(i){return `<div class="p9-art" role="img" aria-label="${P9_ITEMS[i].alt}" style="background-position:0 ${i*50}%"></div>`}
function p9MakeState(item){let id=0;const q=P9_ITEMS[item];const tiles=['red','blue','green'].flatMap(colour=>q[colour].map(text=>({id:id++,text,colour})));let pile=shuffle(tiles);if(p9Accepted(item).has(pile.map(w=>w.text).join(' ')))pile.push(pile.shift());return {item,pile,answer:[],phase:'order',letters:[],dots:[],selected:-1,feedback:'',good:false,target:''}}
function p9Init(){if(p9Class!==settings.classCode){p9Class=settings.classCode;p9Groups=[[],[]];p9Reset(false)}if(!p9States.length)p9Reset(false);p9Render()}
function p9Reset(render=true){p9Timers.forEach(clearTimeout);p9Timers=[null,null];p9Indices=[0,0];p9Scores=[0,0];const first=shuffle(P9_ITEMS.map((_,i)=>i)),shift=1+Math.floor(Math.random()*6);p9Orders=[first,first.slice(shift).concat(first.slice(0,shift))];p9States=p9Orders.map(a=>p9MakeState(a[0]));if(render)p9Render()}
function p9SetMode(mode){p9Mode=mode;p9Render()}
function p9SelectPicture(i){p9TeachItem=i;p9TeachStage=0;p9TeachState=p9MakeState(i);p9Render()}
function p9TeachNext(){if(p9TeachItem===null)return;if(p9TeachStage<3)p9TeachStage++;else if(p9TeachState.phase==='done'){p9TeachItem=null;p9TeachStage=0}p9Render()}
function p9TeachBack(){if(p9TeachStage>0){p9TeachStage--;if(p9TeachStage<3)p9TeachState=p9MakeState(p9TeachItem)}else p9TeachItem=null;p9Render()}
function p9State(screen){return screen<0?p9TeachState:p9States[screen]}
function p9Move(screen,id,back){const s=p9State(screen);if(!s||s.phase!=='order')return;const from=back?s.answer:s.pile,to=back?s.pile:s.answer,i=from.findIndex(w=>w.id===id);if(i<0)return;to.push(from.splice(i,1)[0]);s.feedback='';p9Render()}
function p9SelectLetter(screen,i){const s=p9State(screen);if(s?.phase!=='punctuation')return;s.selected=i;p9Render()}
function p9ToggleCase(screen){const s=p9State(screen);if(!s||s.phase!=='punctuation'||s.selected<0)return;const c=s.letters[s.selected];s.letters[s.selected]=c===c.toUpperCase()?c.toLowerCase():c.toUpperCase();s.feedback='';p9Render()}
function p9ToggleDot(screen){const s=p9State(screen);if(!s||s.phase!=='punctuation'||s.selected<0)return;s.dots[s.selected]=!s.dots[s.selected];s.feedback='';p9Render()}
function p9Sentence(s){return s.letters.map((c,i)=>c+(s.dots[i]?'.':'')).join('')}
function p9Submit(screen){
 const s=p9State(screen);if(!s||s.phase==='done'||(s.phase==='order'&&s.pile.length))return;
 let correct=false;
 if(s.phase==='order'){
  const sentence=s.answer.map(w=>w.text).join(' ');
  correct=p9Accepted(s.item).has(sentence);
  if(correct){s.target=sentence[0].toUpperCase()+sentence.slice(1)+'.';s.letters=sentence.split('');s.dots=[];s.selected=-1;s.phase='punctuation'}
 }else if(s.phase==='punctuation'){
  correct=p9Sentence(s)===s.target;
  if(correct)s.phase='done';
 }
 s.good=correct;s.feedback=correct?'You are correct!':'Try again!';playChallengeFx(correct?'good':'bad');
 if(screen>=0){
  p9Scores[screen]+=correct?100:-10;
  if(correct&&s.phase==='done')p9Timers[screen]=setTimeout(()=>{p9Timers[screen]=null;p9Indices[screen]++;if(p9Indices[screen]<7)p9States[screen]=p9MakeState(p9Orders[screen][p9Indices[screen]]);p9Render()},1800);
 }
 p9Render();
}
function p9Tiles(s,screen){const word=(w,back)=>`<button class="p9-word ${w.colour}" onclick="p9Move(${screen},${w.id},${back})" aria-label="${back?'Return':'Add'} ${p9Escape(w.text)}">${p9Escape(w.text)}</button>`;return `<div class="p9-answer" aria-label="Answer words">${s.answer.map(w=>word(w,true)).join('')}</div><div class="p9-pile" aria-label="Jumbled words">${s.pile.map(w=>word(w,false)).join('')}</div>`}
function p9Editor(s,screen){let pos=0;return `<div class="p9-edit" aria-label="Edit capital letters and full stops">${s.letters.join('').split(' ').map(w=>{const start=pos;pos+=w.length+1;return `<span class="p9-edit-word">${w.split('').map((c,j)=>{const i=start+j;return `<button class="p9-letter ${s.selected===i?'selected':''}" onclick="p9SelectLetter(${screen},${i})" ${s.phase==='done'?'disabled':''} aria-label="Select letter ${p9Escape(c)} at position ${i+1}" aria-pressed="${s.selected===i}">${p9Escape(c)}</button>${s.dots[i]?'<span class="p9-dot">.</span>':''}`}).join('')}</span>`}).join('')}</div>`}
function p9Exercise(s,screen){const edit=s.phase==='punctuation'&&s.selected>=0,canSubmit=s.phase==='punctuation'||(s.phase==='order'&&!s.pile.length);return `${s.phase==='order'?p9Tiles(s,screen):p9Editor(s,screen)}<div class="p9-feedback ${s.good?'good':''}" role="status">${s.feedback?`<span class="p9-feedback-icon" aria-hidden="true">${s.good?'✓':'✕'}</span><span>${s.feedback}</span>`:''}</div><div class="p9-controls"><button onclick="p9ToggleCase(${screen})" aria-label="Change selected letter case" ${edit?'':'disabled'}>↑</button><button onclick="p9ToggleDot(${screen})" aria-label="Add or remove full stop" ${edit?'':'disabled'}>.</button><button onclick="p9Submit(${screen})" style="visibility:${canSubmit?'visible':'hidden'}" ${canSubmit?'':'disabled'}>Submit</button></div>`}
function p9Render(){
 const root=document.getElementById('p9Content');if(!root)return;
 document.querySelectorAll('[data-p9-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.p9Mode===p9Mode)));
 if(p9Mode==='teach'){
  if(p9TeachItem===null){root.innerHTML=`<div class="p9-board"><p class="p9-title">You are having a picnic</p><div class="p9-pictures">${[0,1,2].map(i=>`<button class="p9-picture-button" onclick="p9SelectPicture(${i})" aria-label="${P9_ITEMS[i].alt}">${p9Art(i)}</button>`).join('')}</div></div>`;return}
  const q=P9_ITEMS[p9TeachItem];const cues=['red','blue','green'].slice(0,p9TeachStage+1).map(colour=>`<div class="p9-cues">${q[colour].map(w=>`<span class="p9-cue ${colour}">${w}</span>`).join('')}</div>`).join('');
  root.innerHTML=`<div class="p9-board"><p class="p9-title">What did you do?</p><div class="p9-feature">${p9Art(p9TeachItem)}</div>${p9TeachStage<3?cues:p9Exercise(p9TeachState,-1)}<div class="p9-teach-footer"><button onclick="p9TeachBack()" aria-label="Previous">←</button><button onclick="p9TeachNext()" aria-label="Next" ${p9TeachStage===3&&p9TeachState.phase!=='done'?'disabled':''}>→</button></div></div>`;return;
 }
 const finished=p9Indices.every(n=>n>=7);
 root.innerHTML=`<div class="p9-duo">${[0,1].map(i=>`<div class="p9-group" data-p9-group="${i}"><div class="p9-group-head"><span>${i===0?'Boys':'Girls'}</span><small>${Math.min(p9Indices[i]+1,7)}/7</small></div>${p9Groups[i].length?`<select class="p9-member-select" aria-label="${i===0?'Boys':'Girls'} group members" onchange="this.selectedIndex=0"><option value="" selected disabled>${p9Escape(settings.classCode)} · ${p9Groups[i].length} pupils</option>${p9Groups[i].map(n=>`<option>${p9Escape(n)}</option>`).join('')}</select>`:''}${finished?`<div class="p9-done"><div class="p9-score-value">${p9Scores[i]}</div><div class="p9-score-label">points / 1400</div></div>`:p9Indices[i]>=7?'<div class="p9-complete"><span>✓</span>Finished!</div>':p9Exercise(p9States[i],i)}</div>`).join('')}</div>`;
}
function p9DrawGroup(pool,key){
 let remaining=[];try{remaining=JSON.parse(localStorage.getItem(key)||'[]')}catch(e){}
 if(!Array.isArray(remaining))remaining=[];remaining=[...new Set(remaining)].filter(n=>pool.includes(n));
 const chosen=[],count=Math.min(7,pool.length);
 while(chosen.length<count){if(!remaining.length)remaining=shuffle(pool.filter(n=>!chosen.includes(n)));const n=remaining.shift();if(n&&!chosen.includes(n))chosen.push(n)}
 try{localStorage.setItem(key,JSON.stringify(remaining))}catch(e){}return chosen;
}
function p9GroupCall(){
 p9Init();if(settings.classCode!=='2T'){toast('Boys’ and girls’ lists are set up for 2 Terbilang. Select 2T in Settings.');return}
 const present=new Set(challengePresentPupils());const pools=[P9_ROSTER.boys,P9_ROSTER.girls].map(a=>a.filter(n=>present.has(n)));
 if(pools.some(a=>!a.length)){toast('At least one present boy and girl are needed');return}
 p9Groups=pools.map((pool,i)=>p9DrawGroup(pool,'beach-p9-remaining-2T-'+i));p9Reset(false);p9Mode='groups';playConnectSound();p9Render();
}
