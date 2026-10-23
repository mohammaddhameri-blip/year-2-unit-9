/* Tile 12: Year 2 DSKP animal vocabulary. The DSKP category also lists
   "skeleton", included here as a clearly labelled related-vocabulary bonus. */
const P12_ITEMS=[
 {word:"butterfly",clue:"I have colourful wings. I begin life as a caterpillar and visit flowers."},
 {word:"camel",clue:"I live in the desert. I have a hump on my back and can walk in hot weather."},
 {word:"caterpillar",clue:"I am small and long. I eat leaves and later change into a butterfly."},
 {word:"cheetah",clue:"I am a wild cat with black spots. I can run very fast."},
 {word:"cow",clue:"I am a farm animal. I say 'moo' and give people milk."},
 {word:"fish",clue:"I live in water. I have fins and breathe through gills."},
 {word:"fly",clue:"I am a small insect with two wings. I buzz around food."},
 {word:"goat",clue:"I am a farm animal with horns. I can climb rocky hills."},
 {word:"human",clue:"I am a person. I can speak, read, write and learn."},
 {word:"jellyfish",clue:"I live in the sea. My soft body looks like an umbrella and I have tentacles."},
 {word:"kangaroo",clue:"I live in Australia. I jump on strong back legs and carry a baby in a pouch."},
 {word:"koala",clue:"I live in Australia. I sleep in trees and eat eucalyptus leaves."},
 {word:"ladybird",clue:"I am a tiny round beetle. I often have red wings with black spots."},
 {word:"parrot",clue:"I am a colourful bird with a curved beak. I can copy sounds."},
 {word:"penguin",clue:"I am a bird that cannot fly. I swim very well and have flippers."},
 {word:"polar bear",clue:"I am a large white bear. I live in the very cold Arctic."},
 {word:"shark",clue:"I am a large fish with sharp teeth. I swim in the ocean."},
 {word:"sheep",clue:"I am a farm animal with a thick woolly coat. I say 'baa'."},
 {word:"whale",clue:"I am a very large animal that lives in the sea. I breathe air through a blowhole."},
 {word:"skeleton",clue:"I am made of bones. I help support the body of a person or animal.",bonus:true}
];
let p12Mode="practice",p12Practice=null,p12Teams=null,p12Members=[[],[]];
function p12Order(){const nums=Array.from({length:P12_ITEMS.length},(_,i)=>i);for(let i=nums.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[nums[i],nums[j]]=[nums[j],nums[i]]}return nums}
function p12State(order){return {order:order,index:0,letters:"",misses:0,score:0,solved:false,feedback:""}}
function p12ResetPractice(){p12Practice=p12State(p12Order());p12Render()}
function p12ResetTeams(){const order=p12Order();p12Teams=[p12State(order.slice()),p12State(order.slice())];p12Render()}
function p12Init(){if(!p12Practice)p12Practice=p12State(p12Order());if(!p12Teams){const order=p12Order();p12Teams=[p12State(order.slice()),p12State(order.slice())]}p12Render()}
function p12SetMode(mode){if(mode!=="practice"&&mode!=="groups")return;p12Mode=mode;p12Init()}
function p12Get(id){return id===-1?p12Practice:p12Teams&&p12Teams[id]}
function p12Item(state){return state.index<state.order.length?P12_ITEMS[state.order[state.index]]:null}
function p12Letters(word){return word.replace(/[^a-z]/gi,"").toUpperCase()}
function p12Escape(s){return String(s).replace(/[&<>"']/g,function(m){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]})}
function p12SetInput(id,value){
 const state=p12Get(id);if(!state||state.solved||!p12Item(state))return;
 const full=p12Letters(p12Item(state).word);
 state.letters=String(value).replace(/[^a-z]/gi,"").toUpperCase().slice(0,full.length-1);
 state.feedback="";
 const input=document.getElementById("p12Input"+id);
 if(input&&input.value!==state.letters)input.value=state.letters;
 document.querySelectorAll('[data-p12-letter="'+id+'"]').forEach(function(el){const n=Number(el.dataset.pos);el.textContent=state.letters[n]||" ";el.classList.toggle("filled",!!state.letters[n])});
 const status=document.getElementById("p12Status"+id);if(status){status.textContent="";status.className="p12-feedback"}
 const submit=document.getElementById("p12Submit"+id);if(submit)submit.disabled=state.letters.length!==full.length-1;
}
function p12Add(id,ch){const s=p12Get(id);if(!s||s.solved||!p12Item(s))return;p12SetInput(id,s.letters+ch)}
function p12Delete(id){const s=p12Get(id);if(!s||s.solved)return;p12SetInput(id,s.letters.slice(0,-1))}
function p12Submit(id){
 const s=p12Get(id),item=s&&p12Item(s);if(!item||s.solved)return;
 const full=p12Letters(item.word);
 if(s.letters.length!==full.length-1){s.feedback="Complete all the blank letters first.";p12Render();return}
 if((full[0]+s.letters)===full){s.solved=true;s.score+=100;s.feedback="Correct! +100 points";if(typeof playChallengeFx==="function")playChallengeFx("good")}
 else{s.misses++;s.feedback="Not quite. Look at the description and try again.";if(typeof playChallengeFx==="function")playChallengeFx("bad")}
 p12Render();
}
function p12Next(id){
 const s=p12Get(id);if(!s||!s.solved)return;
 s.index++;s.letters="";s.misses=0;s.solved=false;s.feedback="";p12Render()
}
function p12InputKey(event,id){if(event.key==="Enter"){event.preventDefault();p12Submit(id)}}
function p12Keyboard(id){
 return '<div class="p12-keyboard" aria-label="On-screen letter keyboard">'+
 ["QWERTYUIOP","ASDFGHJKL","ZXCVBNM"].map(function(row){
  return '<div class="p12-keyrow">'+Array.from(row).map(function(ch){
   return '<button type="button" class="p12-key" onclick="p12Add('+id+',\''+ch+'\')" aria-label="Letter '+ch+'">'+ch+'</button>';
  }).join("")+'</div>';
 }).join("")+
 '<button type="button" class="p12-back" onclick="p12Delete('+id+')" aria-label="Delete last letter">⌫ Delete</button></div>';
}
function p12Card(id){
 const s=p12Get(id),item=p12Item(s),isTeam=id!==-1;
 const heading=isTeam?(id===0?"Boys":"Girls"):"Let's spell!";
 const head='<div class="p12-card-head"><strong>'+heading+'</strong><span>'+(item?"Word "+(s.index+1)+" / "+P12_ITEMS.length:"Completed")+'</span></div>';
 const score='<div class="p12-points">Score <strong>'+s.score+'</strong> / '+(P12_ITEMS.length*100)+'</div>';
 if(!item)return '<div class="p12-card">'+head+'<div class="p12-result"><div class="p12-trophy">🏆</div><h3>All words completed!</h3><p>'+s.score+' / '+(P12_ITEMS.length*100)+' points</p></div>'+score+'</div>';
 let remaining=-1;
 const slots=Array.from(item.word).map(function(ch,i){
  if(ch===" ")return '<span class="p12-space" aria-hidden="true"></span>';
  if(i===0)return '<span class="p12-slot first" aria-label="Given first letter">'+p12Escape(ch.toUpperCase())+'</span>';
  remaining++;
  return '<span class="p12-slot'+(s.letters[remaining]?" filled":"")+'" data-p12-letter="'+id+'" data-pos="'+remaining+'">'+(s.letters[remaining]||" ")+'</span>';
 }).join("");
 const complete=s.solved;
 const msg='<div id="p12Status'+id+'" class="p12-feedback'+(complete?" correct":s.feedback?" error":"")+'" role="status" aria-live="polite">'+p12Escape(s.feedback)+'</div>';
 const input='<label class="p12-input-label" for="p12Input'+id+'">Missing letters</label>'+
 '<input id="p12Input'+id+'" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" autocorrect="off" spellcheck="false" maxlength="'+(p12Letters(item.word).length-1)+'" value="'+p12Escape(s.letters)+'" oninput="p12SetInput('+id+',this.value)" onkeydown="p12InputKey(event,'+id+')" placeholder="Type here" '+(complete?"disabled":"")+' aria-label="Type all the missing letters">';
 const actions=complete?'<button type="button" class="p12-primary p12-next" onclick="p12Next('+id+')">'+(s.index===P12_ITEMS.length-1?"See results":"Next word →")+'</button>':
 '<button id="p12Submit'+id+'" type="button" class="p12-primary" onclick="p12Submit('+id+')" '+(s.letters.length!==p12Letters(item.word).length-1?"disabled":"")+'>Check answer</button>';
 return '<div class="p12-card">'+head+score+
 '<div class="p12-clue-caption">Read the description</div>'+
 '<p class="p12-clue">'+p12Escape(item.clue)+'</p>'+
 (item.bonus?'<div class="p12-bonus">BONUS · Related vocabulary (not an animal)</div>':'')+
 '<div class="p12-slots" role="group" aria-label="Word completion with first letter given">'+slots+'</div>'+
 (complete?'<div class="p12-reveal">Well done! '+p12Escape(item.word.toUpperCase())+'</div>':input)+
 msg+(complete?"":p12Keyboard(id))+
 '<div class="p12-actions">'+actions+'</div></div>';
}
function p12Render(){
 const root=document.getElementById("p12Content");if(!root)return;
 document.querySelectorAll("[data-p12-mode]").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.p12Mode===p12Mode))});
 const cards=p12Mode==="practice"?p12Card(-1):'<div class="p12-duo">'+p12Card(0)+p12Card(1)+'</div>';
 root.innerHTML=cards+'<div class="p12-footer"><span>Year 2 DSKP · '+P12_ITEMS.length+' vocabulary entries</span><button type="button" onclick="'+(p12Mode==="practice"?"p12ResetPractice()":"p12ResetTeams()")+'">↻ Restart '+(p12Mode==="practice"?"practice":"both groups")+'</button></div>';
}
