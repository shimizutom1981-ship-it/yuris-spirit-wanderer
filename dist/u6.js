/* v0.5 — handling the world the way Ultima VI does: a command grid (look, talk,
   use, get, move, drop, attack, cast, rest), typed keywords in conversation,
   combat stances, a river skiff, standing stones and an underground.
   Original text, map and pixels; nothing is taken from the 1990 game. */
(()=>{'use strict';
const A=Adv,D=A.dialogue;
let worldUse=false;
Object.assign(A.names,{rod:'釣り竿',pick:'つるはし'});
A.keywordList.push('舟','離れ野','隠者','霊流の環','地下','つるはし','裂け目','ロープ');

// ---- People: new keywords. Any of them can be typed before it is ever offered.
D.hermit={intro:'「舟で来たか。橋のかからぬ岸へ来る者は、たいてい何かを探している」',job:'トウという。川の音と、岩山の地下から届く声を聴いて暮らしている。',info:'南の岩山に古い坑道が口を開けている。中は昼でも闇だ。松明を持って行きなさい。',topics:{
 地下:'灰石の鉱夫より前に掘られた坑道だ。崩れた岩はつるはしで砕ける。裂け目はロープがなければ渡れん。',
 裂け目:'坑道の奥を断つ深い割れ目だ。ロープを一本渡せば、あとは誰でも通れる。',
 機霊:'地下の広間に、灯りを守り続ける機霊がいる。守る相手が去ったことを、まだ知らんのだ。',
 霊流の環:'庵の東の立ち石だ。触れておけば、ほかの環からここへ戻れる。',
 隠者:'わしのことか。そう呼ばれて久しい。名より先に役目を尋ねる者は珍しいな。'}};
Object.assign(D.captain.topics,{舟:'川舟なら蒼の川の渡し場に繋いである。底板が傷んでいてな。木材二つと部品一つ、でなければ修理代20枚で貸そう。',離れ野:'川を西へ下った先、橋のかからない岸だ。舟でしか渡れん。隠者がひとり住んでいる。'});
Object.assign(D.pilgrim.topics,{離れ野:'蒼の川の西の果てに、道のない岸がある。昔はそこから石を運び出したそうだ。',霊流の環:'町はずれの立ち石を見たかね。一度触れた環どうしは、霊流でつながる。歩き疲れた老人にはありがたい。'});
Object.assign(D.miner.topics,{つるはし:'作業場の西の壁際に一本残してある。持っていけ。岩の崩れなら、あれで砕ける。',地下:'ここより古い坑道が、川向こうの岩山にあると聞く。親方は「下の広間」と呼んでいた。'});
Object.assign(D.host.topics,{隠者:'離れ野のトウさんかい。年に一度、ダンの舟で塩を買いに来るよ。',舟:'ダンに頼んでごらん。渡し場の川舟を直しているはずさ。'});
Object.assign(D.abbot.topics,{霊流の環:'環は古い道標です。触れた者の霊流を覚え、環から環へ送ります。修道院の門の東にもあります。'});
Object.assign(D.trader.topics,{ロープ:'裂け目や崖を越えるなら一本持っておくといい。うちでも扱っているよ。'});
topics.celes.push(['霊流の環','古い立ち石よ。一度触れて霊流を通せば、触れたことのある環へ歩いて渡れる。町の広場の南西にもあるわ。']);
topics.inn.push(['舟','港の船大工が川舟を持っているそうだ。蒼の川の渡し場に繋いであるとか。']);
topics.smith.push(['つるはし','うちにはないな。灰石の廃鉱の作業場になら残っているだろう。']);
topics.ed.push(['隠者','川向こうに一人で暮らす老人がいるらしい。舟がなければ会えないそうだ。']);

function knowledge(n){const d=A.dialogueFor(n.id);if(d)return {名前:d.job,仕事:d.job,土地:d.info,...d.topics};const o=story[n.id];return o?{名前:o.name,土地:o.town,...Object.fromEntries(topics[n.id]||[])}:{}}
function ask(n,word){
 word=String(word||'').trim();if(!word)return;
 if(/^(さようなら|さよなら|別れ|またね|bye)/i.test(word)){close();return}
 if(/仲間|一緒|join/i.test(word)&&E.recruit(s,n.id)){A.show(n.name,'「行こう。支度はできている」',[['旅を続ける',close]],true);return}
 const know=knowledge(n),keys=Object.keys(know),key=keys.find(k=>k===word)||keys.find(k=>word.length>=2&&(k.includes(word)||word.includes(k)));
 if(!key){A.show(n.name,'「'+word+'……？ それについては、何も知らないんだ」',[['話を続ける',()=>talk(n)]],true);return}
 if(A.keywordList.includes(key)&&!s.heard.includes(key))s.heard.push(key);
 A.tell(n,key,know[key]);
}
function boatDeal(n){
 const lend=()=>{s.flags.boat=true;A.note('川舟','船大工ダンから川舟を借りた。蒼の川の渡し場、橋の西の北岸に繋いである。西へ下ると離れ野。');A.tell(n,'舟','「底板は張り替えた。渡し場の北岸に繋いである。橋の下はくぐれるが、岸に上がるときは足元に気をつけな」')};
 const back=[['戻る',()=>talk(n)]];
 A.show(n.name,'「川舟を使いたいのか。直すのに木材二つと部品一つ。手持ちがなければ修理代20枚だ」',[
  ['木材2と部品1を渡す',()=>{if(s.wood<2||s.parts<1){A.show(n.name,'「材料が足りないな」',back,true);return}s.wood-=2;s.parts--;lend()}],
  ['20枚払う',()=>{if(s.gold<20){A.show(n.name,'「金貨が足りないようだ」',back,true);return}s.gold-=20;lend()}],...back],true);
}
const baseTalk=talk;
talk=function(n){
 baseTalk(n);const box=$('choices'),add=(label,fn)=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>{fn();render();save()};box.append(b)};
 if(s.bench?.[n.id]&&D[n.id])add('一緒に来て',()=>{E.recruit(s,n.id);A.show(n.name,'《また、一緒に行こう》',[['旅を続ける',close]],true)});
 if(n.id==='captain'&&!s.flags.boat)add('舟を借りる',()=>boatDeal(n));
 const form=document.createElement('form'),input=document.createElement('input'),go=document.createElement('button');
 form.className='ask';input.type='text';input.placeholder='言葉を入力して尋ねる';input.setAttribute('aria-label','尋ねる言葉');go.type='submit';go.textContent='尋ねる';
 form.onsubmit=ev=>{ev?.preventDefault?.();ask(n,input.value);render();save()};form.append(input,go);box.append(form);
};

// ---- Things: take, read, break, bridge, travel.
function takeObject(o){
 for(const [id,qty]of Object.entries(o.take))if(!A.obtain(id,qty)){E.say(s,'荷物が重すぎる。仲間に分けるか、何かを置こう。');return false}
 s.opened.push(o.id);
 if(o.owned){s.reputation--;E.say(s,o.name+'を黙って持ち出した。町の信用が下がった。')}else E.say(s,o.name+'を手に入れた。');
 return true;
}
function ring(o){
 if(s.aboard)return;const first=!s.rings[o.id];s.rings[o.id]=true;
 const others=E.objs.filter(r=>r.action==='ring'&&r.id!==o.id&&s.rings[r.id]);
 A.show('霊流の環 / '+o.place,(first?'立ち石に触れると、霊流が指先を通り抜けた。この環は君を覚えた。\n':'')+(others.length?'触れたことのある環へ渡れる。':'ほかの土地の環にも触れておけば、ここから渡れるようになる。'),
  others.map(r=>[r.place+'へ',()=>{travel(r);close()}]).concat([['離れる',close]]));
}
function travel(r){
 if(s.combat.active||s.aboard)return false;
 const spot=[[0,1],[1,0],[-1,0],[0,-1]].map(([a,b])=>[r.x+a,r.y+b]).find(([x,y])=>E.pass(s,x,y));if(!spot)return false;
 s.x=spot[0];s.y=spot[1];s.party.forEach(p=>{p.x=s.x;p.y=s.y});s.turn+=4;E.say(s,'霊流に乗り、'+r.place+'の環へ渡った。');return true;
}
function deepcore(o){
 const back=[['閉じる',close]];
 if(s.flags.deep){A.show(o.name,'霊核は穏やかに明滅している。灯りは、もう誰かを待つためのものではない。',back);return}
 const done=(which,text)=>{s.flags.deep=which;s.gold+=20;A.obtain('spirit_charm');A.note('地下の広間','岩山の地下で、灯りを守り続けた機霊に会った。共鳴の首飾りを受け取った。');E.say(s,'共鳴の首飾りを手に入れた。');A.show('地下の広間',text,[['続ける',close]])};
 A.show('地下の霊核','広間の中央で、古い機霊が小さな灯りを抱いている。\n《……交代の者か。皆が戻るまで、灯りを絶やさぬと約束した》\nユリスには分かる。待っていた人々は、もう戻らない。',[
  ['約束は果たされたと伝える',()=>done('release','《そうか。……長い番だった》\n機霊は灯りをユリスの手に移し、静かに目を閉じた。受け取った灯りは、首飾りの形に落ち着いた。')],
  ['一緒に灯りを守ると伝える',()=>done('keep','《では、灯りは二つになる》\n機霊は自分の灯りを分け、首飾りにしてユリスに掛けた。地下の広間が、少しだけ明るくなる。')],
  ['今は何も言わない',close]]);
}
const baseInspect=inspect;
inspect=function(o){
 if(s.combat.active){baseInspect(o);return}
 const back=[['閉じる',close]];
 if(o.take){A.show(o.name,(o.text||'')+(o.owned?'\n持ち主のいる品だ。':''),[['取る',()=>{takeObject(o);close()}],['そのまま',close]]);return}
 if(o.action==='ring'){ring(o);return}
 if(o.action==='rubble'){A.show(o.name,'坑道を岩の崩れが塞いでいる。'+(s.pick?'':'\n砕く道具が要る。灰石の廃鉱の鉱夫に「つるはし」を尋ねてみよう。'),(s.pick?[['つるはしで砕く',()=>{s.opened.push(o.id);E.say(s,'岩を砕いた。奥から冷たい風が吹いてくる。');E.tick(s);close()}]]:[]).concat(back));return}
 if(o.action==='chasm'){A.show(o.name,'底の見えない裂け目が道を断っている。'+(s.rope?'':'\nロープがあれば渡せそうだ。港で手に入る。'),(s.rope?[['ロープを渡す',()=>{s.rope--;s.opened.push(o.id);E.say(s,'ロープを張り、裂け目に渡りをつけた。');E.tick(s);close()}]]:[]).concat(back));return}
 if(o.action==='deepcore'){deepcore(o);return}
 baseInspect(o);
};

// ---- Look never acts: it only describes what is there.
const ground={kiln:'靴の下で、赤い煉瓦に積もった灰が鳴る。',grass:'草が風に揺れている。',flowers:'小さな花が咲いている。',tree:'枝葉の重なる木。通り抜けられない。',water:'冷たい水が流れている。舟があれば進める。',road:'旅人の足跡が残る道。',bridge:'木の橋。下を舟がくぐれる。',wall:'厚い石の壁。',floor:'磨かれた床板。',door:'扉だ。隣から開け閉めできる。',stone:'古い敷石。',mountain:'険しい岩山。',sand:'潮の香りのする砂。',marsh:'足を取られる湿原。',field:'よく耕された畑。',orchard:'実のなる木々。',rock:'硬い岩盤。',cave:'湿った坑道の床。'};
const kinds={chest:'ふたのついた箱。「使う」で開けられる。',book:'読むことができる。',sign:'文字が書かれている。',lever:'引けそうだ。',well:'水をくめる。',camp:'火を囲んで休める。',stones:'古い立ち石の環。',altar:'霊流が脈打っている。',bed:'眠るための寝台。',lamp:'霊流でともる灯り。',bell:'三つの音色を持つ鐘。',wheel:'川の力を受ける車輪。',herb:'摘めそうな薬草。',crystal:'澄んだ霊晶。',gate:'古い門。'};
function describe(o){
 if(o.id==='millwheel'&&s.flags.waterwheel)return '村の水車。軸受けが車輪を支え、石臼が回っている。';
 return o.name+'。'+(o.desc||kinds[o.type]||(o.take||o.key||o.gearId?'':o.text?.split('\n')[0]||''))+(E.movable(o)?' 動かせそうだ。':'')+(o.take||o.key||o.gearId?' 持っていける。':'')+(o.owned?' 持ち主がいる。':'')}
function thingAt(x,y){return s.dropped.find(o=>o.x===x&&o.y===y)||E.obj(s,x,y)}
function lookAt(x,y){
 if(!canSee(x,y)){log('そこは暗いか、遮られていて見えない。');return}
 if(!s.aboard&&s.boat.x===x&&s.boat.y===y){log('川舟だ。'+(s.flags.boat?'隣から「使う」で乗れる。':'船大工ダンの持ち物らしい。'));return}
 const p=s.party.find(p=>{const a=E.position(s,p);return a.x===x&&a.y===y});if(p){log(`${p.name}。${p.role}。HP ${p.hp}/${p.max}。`);return}
 const e=E.enemy(s,x,y);if(e){log((e.type==='wolf'?'牙をむく獣':'古い守護機霊')+'。'+(e.sleep>0?'眠っている。':e.hp<e.max/2?'傷を負っている。':'油断のない構えだ。'));return}
 const n=E.npc(s,x,y);if(n){log(n.name+'が見える。'+(E.isEvening(s)?'仕事を終えて、ひと息ついている。':E.isNight(s)?'一日を終えて休んでいる。':'仕事の手を動かしている。'));return}
 const o=thingAt(x,y);log(o?describe(o):ground[E.terrain(x,y)]||'変わったものは見当たらない。');
}
function getAt(x,y){
 if(s.combat.active){log('戦闘中は拾えない。');return}
 const o=thingAt(x,y);if(!o){log('そこに取れるものはない。');return}
 if(E.distance(s,{x,y})>1){walkNear(x,y,()=>getAt(x,y));return}
 if(o.key){s[o.key]=(s[o.key]||0)+1;s.dropped=s.dropped.filter(a=>a.id!==o.id);E.say(s,o.name+'を拾った。')}
 else if(o.gearId){if(Gear.add(s,o.gearId)){s.dropped=s.dropped.filter(a=>a.id!==o.id);E.say(s,o.name+'を拾った。')}else E.say(s,'荷物が重すぎる。')}
 else if(o.take)takeObject(o);
 else if(o.side==='shelf'||o.loot||o.type==='herb'||['crate','cache','crystal'].includes(o.id)){inspect(o);render();save();return}
 else E.say(s,o.name+'は持ち運べない。'+(E.movable(o)?'「動かす」なら位置を変えられる。':''));
 E.tick(s);render();save();
}
function moveAt(x,y){
 if(s.combat.active){log('戦闘中は物を動かせない。');return}
 const o=E.obj(s,x,y);if(!o||!E.movable(o)){log(o?o.name+'は重くて動かせない。':'そこに動かせるものはない。');return}
 if(E.distance(s,{x,y})!==1){walkNear(x,y,()=>moveAt(x,y));return}
 const dirs=[['北へ',0,-1],['東へ',1,0],['南へ',0,1],['西へ',-1,0]].filter(([,dx,dy])=>!(o.x+dx===s.x&&o.y+dy===s.y));
 A.show(o.name+'を動かす','どちらへ動かす？ 空いた隣のマスへ押すことも、横へずらすこともできる。扉の上には置けない。',
  dirs.map(([label,dx,dy])=>[label,()=>{if(!E.moveObject(s,o,o.x+dx,o.y+dy))E.say(s,'そちらへは動かせない。');close()}]).concat([['やめる',close]]));
}
const baseInteraction=interaction;
interaction=function(x,y){
 if(mode==='look'){lookAt(x,y);return}
 if(mode==='use'&&E.terrain(x,y)==='water'&&s.rod>0&&(s.aboard||E.distance(s,{x,y})===1)){E.fish(s,x,y);render();save();return}
 if(s.aboard){const r=E.sailPath(s,x,y);if(!r.length){log('舟ではそこへ行けない。水の上か、水辺の岸を選ぼう。');return}walkRoute(r);return}
 if(s.boat.x===x&&s.boat.y===y&&(mode==='explore'||mode==='use')&&!s.combat.active){
  if(!s.flags.boat){log('船大工ダンの川舟だ。風待ち港で「舟」と尋ねてみよう。');return}
  if(E.distance(s,{x,y})>1){walkNear(x,y,()=>interaction(x,y));return}
  E.board(s);chooseMode('explore');save();return}
 if(mode==='get'){getAt(x,y);return}
 if(mode==='move'){moveAt(x,y);return}
 if(mode==='use'&&worldUse){
  worldUse=false;
  if(s.party.some(p=>{const a=E.position(s,p);return a.x===x&&a.y===y})){chooseMode('explore');A.supplies();return}
  if(!thingAt(x,y)&&!E.npc(s,x,y)&&E.terrain(x,y)!=='door'){worldUse=true;log('そこに使えるものはない。自分を選ぶと持ち物を使える。');return}
  chooseMode('explore');
 }
 baseInteraction(x,y);
};

// ---- Command grid and cursor targeting for the new verbs.
const hints={get:'取る物を選ぶ',move:'動かす物を選ぶ',use:'使う相手を選ぶ（自分＝持ち物）'};
const baseChoose=chooseMode;
chooseMode=function(id){
 baseChoose(id);if(id!=='use')worldUse=false;
 if(id==='get'||id==='move'||id==='use'&&worldUse){cursor={x:s.x,y:s.y-1};$('targethint').hidden=false;$('targethint').textContent=hints[id];render()}
};
const baseDirection=directional;
directional=function(dx,dy){
 if(!moving&&!$('modal').open&&$('commandmenu').hidden&&!s.combat.active&&['get','move','use'].includes(mode)){
  cursor??={x:s.x,y:s.y};cursor.x=Math.max(0,Math.min(E.W-1,cursor.x+dx));cursor.y=Math.max(0,Math.min(E.H-1,cursor.y+dy));render();return}
 baseDirection(dx,dy);
};
const baseMenu=$('menu').onclick;
$('menu').onclick=()=>{if(cursor&&!$('modal').open&&['get','move','use'].includes(mode)){interaction(cursor.x,cursor.y);return}baseMenu()};
const verbs={'g-look':()=>chooseMode('look'),'g-talk':()=>chooseMode('talk'),'g-use':()=>{A.setUsed(null);worldUse=true;chooseMode('use')},'g-get':()=>chooseMode('get'),'g-move':()=>chooseMode('move'),'g-drop':()=>bag(),'g-attack':()=>chooseMode('fight'),'g-cast':()=>$('magic').onclick(),'g-rest':()=>$('rest').onclick()};
const verbMode={'g-look':'look','g-talk':'talk','g-use':'use','g-get':'get','g-move':'move','g-attack':'fight','g-cast':'magic'};
for(const [id,fn]of Object.entries(verbs))$(id).onclick=()=>{if(moving)return;if($('modal').open)close();$('commandmenu').hidden=true;fn()};

// ---- Stances and partings.
function orders(){
 if(!s.party.some(p=>p.id===selected))selected=s.party[0].id;
 const keys=Object.keys(E.tactics);
 A.show('隊列と作戦','「命令」の仲間は戦闘で自分が動かす。ほかの作戦では、その仲間が巡ごとに自分で1回動く。\n突撃＝近づいて攻撃／後衛＝離れて霊術・弓・回復／護衛＝ユリスのそばで迎え撃つ。先頭のユリスは常に命令。',
  s.party.slice(1).flatMap(p=>[[p.name+'：'+E.tactics[p.tactic||'manual'],()=>{p.tactic=keys[(keys.indexOf(p.tactic||'manual')+1)%keys.length];orders()}],[p.name+'と別れる',()=>{if(!E.leave(s,p.id))E.say(s,'今は別れられない。');orders()}]])
  .concat(s.party.length>2?[['二番目と三番目を入れ替える',()=>{[s.party[1],s.party[2]]=[s.party[2],s.party[1]];orders()}]]:[],[['閉じる',close]]));
}
$('formation').onclick=()=>{$('commandmenu').hidden=true;orders()};

// ---- Rendering additions: skiff, darkness underground, stance labels.
const baseRender=render;
render=function(){
 prepareState();if(!s.party.some(p=>p.id===selected))selected=s.party[0].id;
 E.detectCombat(s);if(s.combat.active)E.runAuto(s);
 baseRender();
 for(let y=0;y<VH;y++)for(let x=0;x<VW;x++){const wx=x+cam.x,wy=y+cam.y;if(E.terrain(wx,wy)==='cave'&&!canSee(wx,wy)){g.fillStyle=s.seen[wx+','+wy]?'#05070bc8':'#05070b';g.fillRect(x*T,y*T,T,T)}}
 if(s.aboard||canSee(s.boat.x,s.boat.y)){g.save();g.translate((s.boat.x-cam.x)*T,(s.boat.y-cam.y)*T);if(s.aboard){Painter.tile(g,E.terrain(s.x,s.y),s.x,s.y);g.save();g.beginPath();g.rect(0,0,16,11);g.clip();g.translate(0,-3);Painter.sprite(g,'#468d9f','person','yuris',s.turn,s.party[0].hp);g.restore()}Painter.object(g,'boat',s);g.restore()}
 if(s.aboard){$('place').textContent=E.World.location(s.x,s.y)+'（舟の上）';$('quest').textContent='舟：水面や岸をタップ、または矢印で進む。岸へ向かうと降りる。'}
 else if(E.World.under(s.x,s.y)&&!(s.lightUntil>s.turn)&&!s.combat.active)$('quest').textContent='暗い。松明（使う→自分→松明）か灯火の術で先まで見える。';
 for(let i=1;i<s.party.length;i++){const detail=$('party').children[i]?.lastChild;if(detail)detail.textContent+=' · '+E.tactics[s.party[i].tactic||'manual']}
 for(const [id,m]of Object.entries(verbMode))$(id).classList.toggle('active',mode===m);
};

// ---- Map: standing stones, skiff, the far bank.
$('map').onclick=()=>{
 A.show('街道と荒野 / 旅の地図','白＝現在地　橙＝野営地　水色＝触れた霊流の環　茶＝川舟。蒼の川は舟で下れる。',[['閉じる',close]]);
 const cv=document.createElement('canvas'),k=3;cv.width=E.W*k;cv.height=E.H*k;cv.className='mapcanvas';const ctx=cv.getContext('2d');
 const col={grass:'#698254',flowers:'#698254',marsh:'#476a5b',field:'#a49a5b',orchard:'#516844',water:'#38697c',road:'#c3ad77',bridge:'#e2c58b',wall:'#b6aa86',tree:'#354e36',floor:'#9e8259',door:'#a58a55',stone:'#8a8e78',mountain:'#6c6a64',sand:'#b9ab7a',rock:'#55554f',cave:'#55554f',kiln:'#966a50'};
 for(let y=0;y<E.H;y++)for(let x=0;x<E.W;x++){ctx.fillStyle=col[E.terrain(x,y)]||'#6b7b4c';ctx.fillRect(x*k,y*k,k,k)}
 ctx.font='11px monospace';
 for(const [name,x,y]of E.World.regions){const lx=Math.max(2,Math.min(cv.width-name.length*11-8,x*k-5)),ly=Math.max(15,y*k);ctx.fillStyle='#18252d';ctx.fillRect(lx,ly-12,name.length*11+7,16);ctx.fillStyle='#f4e8be';ctx.fillText(name,lx+3,ly)}
 for(const o of E.objs){if(o.type==='camp'){ctx.fillStyle='#f4ae62';ctx.fillRect(o.x*k-2,o.y*k-2,5,5)}if(o.action==='ring'&&s.rings[o.id]){ctx.fillStyle='#9fe3e0';ctx.fillRect(o.x*k-2,o.y*k-2,6,6)}}
 ctx.fillStyle='#7a4f2a';ctx.fillRect(s.boat.x*k-2,s.boat.y*k-2,6,6);ctx.fillStyle='#fff';ctx.fillRect(s.x*k-3,s.y*k-3,7,7);$('mb').append(cv);
};
$('help').onclick=()=>A.show('霊流の旅人 / 遊び方','【歩く】矢印・十字ボタン、または地図をタップ。人や物をタップすると近づいて話す・調べる。仲間とは場所を譲り合うので、狭い通路でも引き返せる。\n【コマンド】見る＝説明を読むだけ／話す／使う＝扉・箱・装置・舟、自分を選ぶと持ち物／取る＝地面や机の品を拾う／動かす＝椅子や樽を隣のマスへ／置く＝持ち物を足元に／攻撃／術／休む。押したあと対象をタップ、または矢印でカーソルを動かしてA。Bで戻る。\n【会話】話題のボタンのほか、聞いた言葉を入力して尋ねられる（例：舟、隠者、霊流の環）。「仲間」で誘い、「さようなら」で終える。住人は昼は仕事場、日が暮れると食堂や宿に寄り、夜更けに寝床へ歩く。\n【戦闘】敵が見えると同じ地図で始まり、仲間が一人ずつ行動。仲間との位置交換は操作した人の1行動。メニューの「隊列」で仲間ごとに作戦（命令・突撃・後衛・護衛）を決め、別れることもできる。\n【旅】霊流の環は一度触れると、触れた環どうしを行き来できる。風待ち港の船大工から川舟を借りれば、蒼の川を下って離れ野へ。地下坑道は暗いので松明を。\n保存はこのブラウザーに自動。前の記録も引き継ぐ。',[['冒険に戻る',close],['最初から（確認）',()=>A.show('始め直す？','現在の記録を消して、このゲームを最初から始めます。',[['始め直す',()=>{s=E.fresh();prepareState();selected='yuris';chooseMode('explore');close()}],['やめる',close]])]]);
globalThis.U6={ask,lookAt,getAt,moveAt,travel,orders,takeObject};
chooseMode('explore');render();save();
})();
