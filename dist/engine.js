(function(root){'use strict';
const World=typeof WorldData!=='undefined'?WorldData:require('./world.js');
const Gear=root.Gear||require('./equipment.js');
const W=World.W,H=World.H,KEY='yuris-spirit-wanderer-v1';
function fresh(){const state={version:1,combat:{active:false,acted:[],round:0},x:12,y:18,turn:0,gold:12,food:6,herbs:3,crystal:0,parts:0,wood:0,keys:0,party:[{id:'yuris',name:'ユリス',role:'霊を聴く旅人',hp:40,max:40,mp:12,atk:8}],flags:{},openedDoors:{},opened:[],enemies:[{id:'wolf1',x:25,y:19,hp:20,max:20,atk:4,type:'wolf'},{id:'wolf2',x:29,y:25,hp:22,max:22,atk:4,type:'wolf'},{id:'sentinel',x:35,y:9,hp:42,max:42,atk:6,type:'golem'}],log:['夜になると、東の森から機霊の声が聞こえる。町を自由に調べよう。']};World.migrate(state);return state;}
const npcs=[{id:'ed',name:'エド',x:14,y:17,color:'#d6a64f'},{id:'celes',name:'セレス',x:10,y:10,color:'#a9a3dc'},{id:'smith',name:'鍛冶師オル',x:6,y:17,color:'#bd7956'},{id:'inn',name:'宿の主人',x:15,y:24,color:'#b19c68'},{id:'keeper',name:'古い機霊',x:36,y:7,color:'#8bcdc3'}];
const objs=[{id:'sign',x:12,y:20,type:'sign',name:'広場の掲示板'},{id:'crate',x:7,y:18,type:'chest',name:'工房の資材箱'},{id:'well',x:12,y:15,type:'well',name:'古い井戸'},{id:'lamp',x:18,y:17,type:'lamp',name:'消えた霊灯'},{id:'herb1',x:23,y:27,type:'herb',name:'薬草'},{id:'herb2',x:30,y:16,type:'herb',name:'薬草'},{id:'cache',x:28,y:7,type:'chest',name:'森の古箱'},{id:'gate',x:33,y:10,type:'gate',name:'遺跡の門'},{id:'altar',x:37,y:6,type:'altar',name:'霊流の中枢'},{id:'crystal',x:39,y:27,type:'crystal',name:'澄んだ霊晶'},{id:'camp',x:24,y:29,type:'camp',name:'旅人の焚き火'}];
objs.push(
{id:'smith-table',x:7,y:15,type:'table',name:'作業台',solid:true,desc:'槌、やすり、曲がった留め具。霊灯の部品と同じ形だ。'},
{id:'smith-chair',x:6,y:15,type:'chair',name:'職人の椅子',desc:'座面に木屑が残っている。'},
{id:'smith-hearth',x:5,y:15,type:'hearth',name:'鍛冶炉',solid:true,desc:'赤い炭が静かに燃えている。'},
{id:'smith-barrel',x:8,y:17,type:'barrel',name:'水桶',solid:true,desc:'焼けた金属を冷やすための桶だ。'},
{id:'library-book',x:9,y:7,type:'book',name:'機霊の手引き',desc:'「調律片は鍵であり、言葉でもある。守護機霊に示せば、剣を抜かずに通じ合える」'},
{id:'library-table',x:10,y:7,type:'table',name:'読書机',solid:true,desc:'東の森の見取り図に、古箱の印がある。'},
{id:'library-chair',x:10,y:8,type:'chair',name:'読書椅子',desc:'小さな足台が添えられている。'},
{id:'library-bed',x:14,y:7,type:'bed',name:'セレスの寝台',solid:true,desc:'薄紫の毛布が丁寧に畳まれている。'},
{id:'library-notes',x:14,y:10,type:'book',name:'封印術の覚え書き',desc:'「霊堂の扉は調律片、または封印を読む者に応える。暴走した霊核には霊晶を接続すること」'},
{id:'inn-table',x:16,y:24,type:'table',name:'食卓',solid:true,desc:'パンの香りがする。食料は宿の主人から買える。'},
{id:'inn-chair',x:17,y:24,type:'chair',name:'食卓の椅子',desc:'旅人が何人も腰を下ろした、磨かれた椅子。'},
{id:'inn-bed',x:14,y:26,type:'bed',name:'旅人の寝台',solid:true,desc:'清潔なシーツ。安全な場所で食料を使って休めば体力と霊力が戻る。'},
{id:'inn-bed2',x:18,y:26,type:'bed',name:'窓辺の寝台',solid:true,desc:'窓の外から川の音が届く。'},
{id:'inn-barrel',x:18,y:23,type:'barrel',name:'食料樽',solid:true,desc:'宿の備蓄だ。無断で持ち出さず、主人と話そう。'},
{id:'inn-hearth',x:14,y:23,type:'hearth',name:'宿の暖炉',solid:true,desc:'鍋がことこと鳴っている。誰かの帰りを待つ火だ。'});

function originalTerrain(x,y){if(x<0||y<0||x>=W||y>=H)return 'water';if(x<2||y<2||x>41||y>33)return 'water';if(x===21&&!(y>=17&&y<=20))return 'water';if(x>=32&&x<=39&&y>=4&&y<=11){if(x===32||x===39||y===4||y===11){if((x===33&&y===11)||(x===32&&y===10))return 'stone';return 'wall'}return 'stone'}for(const [a,b,c,d] of [[4,14,9,19],[8,6,15,12],[13,22,19,28]]){if(x>=a&&x<=c&&y>=b&&y<=d){if(x===a||x===c||y===b||y===d){if(y===d&&x===Math.floor((a+c)/2))return 'door';return 'wall'}return 'floor'}}if((y===18||y===19)&&x>=4&&x<39)return 'road';if((x===12||x===13)&&y>5&&y<29)return 'road';if(x>23&&y<15&&(x*17+y*11)%9<4)return 'tree';if(x>24&&y>21&&(x*13+y*7)%13<3)return 'tree';return 'grass'}
function terrain(x,y){const t=World.terrain(x,y);return t===null?originalTerrain(x,y):t;}
npcs.push(...World.npcs);objs.push(...World.objects);
function obj(s,x,y){return objs.map(o=>s.moved?.[o.id]?{...o,...s.moved[o.id]}:o).find(o=>o.x===x&&o.y===y&&!s.opened.includes(o.id));}function enemy(s,x,y){return s.enemies.find(e=>e.hp>0&&e.x===x&&e.y===y)}function npc(s,x,y){return people(s).find(n=>n.x===x&&n.y===y&&!s.party.some(p=>p.id===n.id))}
const BLOCK=['water','wall','tree','mountain','rock'];
function isNight(s){return s.turn%320>=160}
function isEvening(s){const t=s.turn%320;return t>=160&&t<224}
function people(s){s.npcPositions??={};return npcs.map(n=>{let pos=s.npcPositions[n.id];if(!pos||!Number.isInteger(pos.x)||!Number.isInteger(pos.y))pos=s.npcPositions[n.id]={x:n.x,y:n.y};return {...n,x:pos.x,y:pos.y}})}
function opaque(s,x,y){const t=terrain(x,y);return t==='wall'||t==='tree'||t==='mountain'||t==='rock'||(t==='door'&&!s.openedDoors?.[`${x},${y}`])||(obj(s,x,y)?.id==='gate'&&!s.flags.gate)}
// Bresenham: visible opaque destinations can be inspected, but nothing beyond them.
function visible(s,from,to){if(!from||!to||![from.x,from.y,to.x,to.y].every(Number.isInteger))return false;let x=from.x,y=from.y;const dx=Math.abs(to.x-x),sx=x<to.x?1:-1,dy=-Math.abs(to.y-y),sy=y<to.y?1:-1;let err=dx+dy;while(x!==to.x||y!==to.y){const twice=2*err,nx=x+(twice>=dy?sx:0),ny=y+(twice<=dx?sy:0);if(nx!==x&&ny!==y&&opaque(s,nx,y)&&opaque(s,x,ny))return false;if(twice>=dy){err+=dy;x=nx}if(twice<=dx){err+=dx;y=ny}if(x===to.x&&y===to.y)return true;if(opaque(s,x,y))return false}return true}
function view(from){return {x:Math.max(0,Math.min(W-16,from.x-8)),y:Math.max(0,Math.min(H-14,from.y-7)),w:16,h:14}}
function inSight(s,from,to){const v=view(from);return to.x>=v.x&&to.x<v.x+v.w&&to.y>=v.y&&to.y<v.y+v.h&&(!dark(s,from)||s.lightUntil>s.turn||distance(from,to)<=dark(s,from))&&visible(s,from,to)}
// Underground is dark at any hour; night narrows sight outdoors.
function dark(s,p){return World.under(p.x,p.y)?2:isNight(s)?6:0}
function detectCombat(s){if(s.aboard)return false;if(s.combat.active)return true;if(s.enemies.some(e=>e.hp>0&&inSight(s,s,e))){beginCombat(s);say(s,'敵の姿を捉えた！ 隊列を止め、仲間一人ずつ行動しよう。');return true}return false}
function lifeStep(s){if(s.combat.active||s.turn%4)return;const night={ed:[17,26],smith:[6,16],celes:[13,7],inn:[17,25],...World.night};for(const n of people(s)){if(distance(s,n)>22||!night[n.id]||s.party.some(p=>p.id===n.id))continue;const original=npcs.find(p=>p.id===n.id),[tx,ty]=isEvening(s)&&World.evening[n.id]?World.evening[n.id]:isNight(s)?night[n.id]:[original.x,original.y];if(n.x===tx&&n.y===ty)continue;let queue=[[n.x,n.y]],seen=new Set([`${n.x},${n.y}`]),prev={},step=null;while(queue.length){let [x,y]=queue.shift();if(x===tx&&y===ty){let route=[];while(x!==n.x||y!==n.y){route.unshift([x,y]);[x,y]=prev[`${x},${y}`]}step=route[0];break}for(const [dx,dy]of [[0,1],[1,0],[-1,0],[0,-1]]){const a=x+dx,b=y+dy,k=`${a},${b}`;if(seen.has(k)||BLOCK.includes(terrain(a,b))||obj(s,a,b)?.solid||enemy(s,a,b)||occupied(s,a,b)||people(s).some(p=>p.id!==n.id&&!s.party.some(q=>q.id===p.id)&&p.x===a&&p.y===b))continue;seen.add(k);prev[k]=[x,y];queue.push([a,b])}}if(step){const [x,y]=step;if(terrain(x,y)==='door'&&!s.openedDoors?.[`${x},${y}`]){s.openedDoors[`${x},${y}`]=true;continue}s.npcPositions[n.id]={x,y}}}}
function pass(s,x,y){return !(terrain(x,y)==='door'&&!s.openedDoors?.[`${x},${y}`])&&!obj(s,x,y)?.solid&& !BLOCK.includes(terrain(x,y))&&!enemy(s,x,y)&&!npc(s,x,y)&&!(obj(s,x,y)?.id==='gate'&&!s.flags.gate);}
function say(s,t){s.log.unshift(t);s.log=s.log.slice(0,20)}function distance(a,b){return Math.abs(a.x-b.x)+Math.abs(a.y-b.y)}
// Version-one saves remain valid; coordinates are added lazily on first use.
function position(s,p){return p.id===s.party[0].id?{x:s.x,y:s.y}:{x:Number.isInteger(p.x)?p.x:s.x,y:Number.isInteger(p.y)?p.y:s.y}}
function normalize(s){if(!s.combat||typeof s.combat.active!=='boolean'||!Array.isArray(s.combat.acted))s.combat={active:false,acted:[],round:0};s.combat.round=Number.isInteger(s.combat.round)?s.combat.round:0;s.openedDoors??={};World.migrate(s);Gear.ensure(s);if(terrain(s.x,s.y)==='door')s.openedDoors[`${s.x},${s.y}`]=true;people(s);s.party.forEach(p=>{const v=position(s,p);p.x=v.x;p.y=v.y});return s}
function toggleDoor(s,x,y){normalize(s);if(!canAct(s,s.party[0].id))return false;if(terrain(x,y)!=='door'||distance(s,{x,y})>1)return false;const k=`${x},${y}`;if(s.openedDoors[k]&&(occupied(s,x,y)||enemy(s,x,y))){say(s,'扉のところに誰かがいる。');return false}s.openedDoors[k]=!s.openedDoors[k];say(s,s.openedDoors[k]?'扉を開けた。':'扉を閉めた。');finishAction(s,s.party[0].id);return true}
function occupied(s,x,y,except){return s.party.some(p=>p.id!==except&&p.hp>0&&position(s,p).x===x&&position(s,p).y===y)}
function enemyTurn(s){normalize(s);s.turn++;if(s.ward>0)s.ward--;for(const e of s.enemies.filter(e=>e.hp>0)){if(e.sleep>0){e.sleep--;continue;}const targets=s.party.filter(p=>p.hp>0&&visible(s,e,position(s,p))).sort((a,b)=>distance(position(s,a),e)-distance(position(s,b),e));const p=targets[0];if(!p)continue;const target=position(s,p);if(distance(target,e)<=1){const damage=Math.max(1,e.atk+2-Gear.stats(p).def-(s.ward>0?3:0));p.hp=Math.max(0,p.hp-damage);say(s,`${e.type==='wolf'?'森の獣':'守護機霊'}の攻撃。${p.name}に${damage}。`)}else if(inSight(s,target,e)){const dx=Math.sign(target.x-e.x),dy=Math.sign(target.y-e.y);for(const [x,y] of [[e.x+dx,e.y],[e.x,e.y+dy]])if((x!==e.x||y!==e.y)&&pass(s,x,y)&&!occupied(s,x,y)){e.x=x;e.y=y;break}}}if(s.party.every(p=>p.hp<=0)){s.x=12;s.y=18;s.party.forEach(p=>{p.hp=Math.ceil(p.max*.65);p.x=s.x;p.y=s.y});s.gold=Math.max(0,s.gold-3);s.combat.ended=true;s.combat.active=false;s.combat.acted=[];say(s,'仲間に助けられ町へ戻った。治療費3枚。冒険の記録は失われない。')}}
function nearbyThreat(s){return s.enemies.some(e=>e.hp>0&&s.party.some(p=>p.hp>0&&inSight(s,position(s,p),e)))}
function beginCombat(s){normalize(s);if(!s.combat.active){s.combat.active=true;s.combat.ended=false;s.combat.acted=[];s.combat.round=1;say(s,'戦闘開始。生きている仲間が一人ずつ行動する。')}return true}
function endCombat(s){normalize(s);if(nearbyThreat(s))return false;if(s.combat.active){say(s,'敵の気配が遠のいた。戦闘を終える。');s.combat.ended=true;}s.combat.active=false;s.combat.acted=[];return true}
function canAct(s,id){normalize(s);const p=s.party.find(p=>p.id===id);return !!p&&p.hp>0&&(!s.combat.active||!s.combat.acted.includes(id))}
function nextActor(s){normalize(s);return s.party.find(p=>p.hp>0&&(!s.combat.active||!s.combat.acted.includes(p.id)))?.id||null}
function finishAction(s,id){if(!s.combat.active){tick(s);return}if(!s.combat.acted.includes(id))s.combat.acted.push(id);if(endCombat(s))return;if(s.party.filter(p=>p.hp>0).every(p=>s.combat.acted.includes(p.id))){enemyTurn(s);if(s.combat.active){s.combat.round++;s.combat.acted=[];endCombat(s)}}}
function waitActor(s,id){normalize(s);if(!canAct(s,id))return false;beginCombat(s);say(s,s.party.find(p=>p.id===id).name+'は様子を見る。');finishAction(s,id);return true}
// Legacy tick callers cannot bypass a combat round: this becomes the leader's wait.
function tick(s,previous){normalize(s);if(s.combat.active)return waitActor(s,s.party[0].id);if(s.aboard){s.turn++;if(s.ward>0)s.ward--;lifeStep(s);return true}followParty(s,previous);s.turn++;if(s.ward>0)s.ward--;detectCombat(s);lifeStep(s);return true}
// Follow real walkable routes. Catch up after separation without crossing occupied
// cells, walls or enemies; ordinary doors are opened along the route.
function followerPath(s,p,front){const from=position(s,p),goal=position(s,front);return route(s,from.x,from.y,goal.x,goal.y,true,true,true)}
function followParty(s,previous){
 if(s.combat?.active)return;
 const living=s.party.filter(p=>p.hp>0);
 // Once assembled, every member occupies exactly the predecessor's vacated tile.
 // Snapshot all positions first, so turns cannot shortcut or rotate the order.
 if(previous&&new Set(living.map(p=>previous[p.id].x+','+previous[p.id].y)).size===living.length&&living.every((p,i)=>i===0||distance(previous[p.id],previous[living[i-1].id])===1)){
  for(let i=1;i<living.length;i++){const p=living[i],to=previous[living[i-1].id];p.x=to.x;p.y=to.y;}return;
 }
 if(living.every((p,i)=>i===0||distance(position(s,p),position(s,living[i-1]))===1)&&new Set(living.map(p=>{const a=position(s,p);return a.x+','+a.y})).size===living.length)return;
 let front=s.party[0];
 for(const p of s.party.slice(1)){
  if(p.hp<=0)continue;
  // A rear member already nearer the leader must not walk back and plug
  // a doorway while a separated predecessor is trying to get out.
  const target=front!==s.party[0]&&distance(position(s,p),s)<distance(position(s,front),s)?s.party[0]:front;
  const gap=distance(position(s,p),position(s,target)),budget=gap>3?3:gap>2?2:1;
  for(let step=0;step<budget;step++){
   const route=followerPath(s,p,target);if(!route.length)break;
   const [x,y]=route[0];if(terrain(x,y)==='door')s.openedDoors[`${x},${y}`]=true;
   p.x=x;p.y=y;
  }
  front=p;
 }
}
function move(s,dx,dy){normalize(s);if(s.combat.active)return moveActor(s,s.party[0].id,dx,dy);if(s.aboard)return sail(s,dx,dy);if(Math.abs(dx)+Math.abs(dy)!==1||!pass(s,s.x+dx,s.y+dy))return false;if(occupied(s,s.x+dx,s.y+dy,s.party[0].id)){say(s,'仲間がいる。横に一歩ずれて折り返そう。');return false}const previous=Object.fromEntries(s.party.map(p=>[p.id,position(s,p)]));s.x+=dx;s.y+=dy;s.party[0].x=s.x;s.party[0].y=s.y;tick(s,previous);return true}
// In combat the selected member moves without dragging the rest of the party.
function moveActor(s,id,dx,dy){normalize(s);const p=s.party.find(p=>p.id===id);if(!p||!canAct(s,id)||Math.abs(dx)+Math.abs(dy)!==1)return false;const from=position(s,p),x=from.x+dx,y=from.y+dy;if(!pass(s,x,y)||occupied(s,x,y,id))return false;beginCombat(s);p.x=x;p.y=y;if(p===s.party[0]){s.x=x;s.y=y}finishAction(s,id);return true}
function attack(s,e,magic=false,actorId){normalize(s);const actor=s.party.find(p=>p.id===(actorId||s.party[0].id));if(!actor||!canAct(s,actor.id)||!e||e.hp<=0||distance(position(s,actor),e)>(magic?4:Gear.stats(actor).range))return false;if((magic||Gear.stats(actor).range>1)&&!visible(s,position(s,actor),e)){say(s,'壁や木に遮られている。');return false}if(magic&&(actor.id==='ed'||(actor.mp||0)<3)){say(s,actor.id==='ed'?'エドは霊術を使えない。':'霊力が足りない。安全な場所で休もう。');return false}const weapon=Gear.items[actor.gear.weapon];if(!magic&&weapon?.ammo&&s.arrows<1){say(s,'矢がない。武器を持ち替えるか、霊術を使おう。');return false}beginCombat(s);if(magic)actor.mp-=3;else if(weapon?.ammo)s.arrows--;e.sleep=0;const damage=magic?14+Gear.stats(actor).power:Gear.stats(actor).atk;e.hp=Math.max(0,e.hp-damage);say(s,`${actor.name}の${magic?'霊光':'攻撃'}！ ${damage}ダメージ。`);if(!e.hp){s.gold+=5;s.crystal++;say(s,'敵は動きを止めた。霊晶を1つ手に入れた。');if(e.id==='sentinel')s.flags.sentinel=true}finishAction(s,actor.id);return true}
// One occupancy snapshot per search keeps the larger world responsive.
function route(s,sx,sy,tx,ty,doors=false,party=false,adjacent=false){
 if(tx<0||ty<0||tx>=W||ty>=H)return [];
 const blocked=new Set();
 for(const o of objs){if(s.opened.includes(o.id))continue;const p=s.moved?.[o.id]||o;if(o.solid||o.id==='gate'&&!s.flags.gate)blocked.add(p.y*W+p.x)}
 for(const e of s.enemies)if(e.hp>0)blocked.add(e.y*W+e.x);
 for(const n of people(s))if(!s.party.some(p=>p.id===n.id))blocked.add(n.y*W+n.x);
 if(party)for(const p of s.party)if(p.hp>0){const a=position(s,p);if(a.x!==sx||a.y!==sy)blocked.add(a.y*W+a.x)}
 const start=sy*W+sx,target=ty*W+tx,q=[start],prev=new Int32Array(W*H).fill(-1);prev[start]=start;
 for(let head=0;head<q.length;head++){
  const k=q[head],x=k%W,y=Math.floor(k/W);
  if(adjacent?Math.abs(x-tx)+Math.abs(y-ty)===1:k===target){const out=[];for(let p=k;p!==start;p=prev[p])out.push([p%W,Math.floor(p/W)]);return out.reverse()}
  for(const [a,b]of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){
   if(a<0||b<0||a>=W||b>=H)continue;const n=b*W+a;if(prev[n]!==-1||blocked.has(n))continue;
   const t=terrain(a,b);if(BLOCK.includes(t)||t==='door'&&!doors&&!s.openedDoors?.[a+','+b])continue;
   prev[n]=k;q.push(n);
  }
 }
 return [];
}
function pathFrom(s,sx,sy,tx,ty){return route(s,sx,sy,tx,ty)}
function path(s,tx,ty){return route(s,s.x,s.y,tx,ty)}
function travelPath(s,tx,ty){if(s.aboard)return sailPath(s,tx,ty);return route(s,s.x,s.y,tx,ty,true,true)}
function heal(s){normalize(s);if(!canAct(s,s.party[0].id))return false;if(s.herbs<1)return false;const p=s.party.filter(p=>p.hp<p.max).sort((a,b)=>a.hp/a.max-b.hp/b.max)[0];if(!p)return false;s.herbs--;p.hp=Math.min(p.max,p.hp+22);say(s,`${p.name}に薬草。`);finishAction(s,s.party[0].id);return true}
function rest(s){normalize(s);if(s.combat.active){say(s,'戦闘中は休めない。');return false}if(nearbyThreat(s)){say(s,'近くに敵がいる。安全な場所へ。');return false}if(s.food<1){say(s,'食料が足りない。宿で買おう。');return false}s.food--;s.party.forEach(p=>{p.hp=p.max;p.mp=Gear.stats(p).maxmp});s.turn+=12;say(s,'食事をとり、十分に休んだ。');return true}
function recruit(s,id){normalize(s);if(s.combat.active)return false;if(s.party.some(p=>p.id===id))return false;const n=people(s).find(n=>n.id===id),back=s.bench?.[id];if(!n||!back&&!['ed','celes'].includes(id))return false;if(back){back.x=n.x;back.y=n.y;s.party.push(back);delete s.bench[id];say(s,`${back.name}がふたたび隊に加わった。`);return true}s.party.push({id,x:n.x,y:n.y,name:n.name,role:id==='ed'?'剣と盾':'封印術',hp:32,max:32,mp:8,atk:id==='ed'?7:4});say(s,`${n.name}が仲間に加わった。一人ずつ移動・攻撃できる。`);return true}
function cast(s,id,spellId,target){normalize(s);const p=s.party.find(p=>p.id===id),spell=Gear.spells[spellId];if(!p||!spell||!canAct(s,id)||p.id==='ed'){say(s,'この仲間は霊術を使えない。');return false}if(p.mp<spell.mp){say(s,'霊力が足りない。');return false}const from=position(s,p);if(spell.kind!=='self'&&(!target||distance(from,target)>spell.range||!visible(s,from,target))){say(s,'遠すぎるか、射線が遮られている。');return false}if(spell.kind==='enemy'&&(!s.enemies.includes(target)||target.hp<=0))return false;if(spell.kind==='ally'&&!s.party.includes(target))return false;
 if(spell.kind==='enemy')beginCombat(s);p.mp-=spell.mp;const power=Gear.stats(p).power;
 if(spellId==='bolt'||spellId==='fire'){for(const e of s.enemies.filter(e=>e.hp>0&&(e===target||spellId==='fire'&&distance(e,target)<=1&&visible(s,target,e)))){e.hp=Math.max(0,e.hp-(spellId==='fire'?12:14)-power);e.sleep=0;if(!e.hp){s.gold+=5;s.crystal++;}}}
 if(spellId==='sleep')target.sleep=3;
 if(spellId==='heal')target.hp=Math.min(target.max,target.hp+20+power);
 if(spellId==='light')s.lightUntil=s.turn+60;
 if(spellId==='ward')s.ward=4;
 say(s,`${p.name}は「${spell.name}」を唱えた。`);finishAction(s,id);return true;
}
function useHerb(s,id,targetId){normalize(s);const p=s.party.find(p=>p.id===id),target=s.party.find(p=>p.id===targetId);if(!p||!target||!canAct(s,id)||s.herbs<1||target.hp>=target.max)return false;s.herbs--;target.hp=Math.min(target.max,target.hp+22+Gear.stats(p).healing);say(s,`${p.name}が${target.name}に薬草を使った。`);finishAction(s,id);return true}
function pushObject(s,o,dx,dy){normalize(s);if(s.combat.active||!o.movable||distance(s,o)!==1||Math.abs(dx)+Math.abs(dy)!==1)return false;const x=o.x+dx,y=o.y+dy;if(!pass(s,x,y)||obj(s,x,y)||occupied(s,x,y))return false;s.moved[o.id]={x,y};say(s,o.name+'を動かした。');tick(s);return true}
// ---- v0.5: river skiff. Water and the underside of bridges are navigable;
// stepping toward a walkable bank disembarks and moors the skiff there.
function floats(x,y){const t=terrain(x,y);return t==='water'||t==='bridge'}
function board(s){normalize(s);if(s.combat.active||s.aboard||!s.flags.boat||distance(s,s.boat)!==1)return false;s.aboard=true;s.x=s.boat.x;s.y=s.boat.y;s.party.forEach(p=>{p.x=s.x;p.y=s.y});say(s,'川舟に乗り込んだ。水の上と橋の下を進める。岸へ向かえば降りる。');s.turn++;lifeStep(s);return true}
function sail(s,dx,dy){if(Math.abs(dx)+Math.abs(dy)!==1)return false;const x=s.x+dx,y=s.y+dy;if(x<0||y<0||x>=W||y>=H)return false;
 if(floats(x,y)){if(enemy(s,x,y)||npc(s,x,y))return false;s.x=x;s.y=y;s.boat={x,y};s.party.forEach(p=>{p.x=x;p.y=y});s.turn++;if(s.ward>0)s.ward--;lifeStep(s);return true}
 if(!pass(s,x,y))return false;s.aboard=false;s.x=x;s.y=y;s.party[0].x=x;s.party[0].y=y;say(s,'岸に降りた。舟はここに繋いでおく。');tick(s);return true}
function sailPath(s,tx,ty){if(tx<0||ty<0||tx>=W||ty>=H)return [];const land=!floats(tx,ty);if(land&&!pass(s,tx,ty))return [];
 const start=s.y*W+s.x,q=[start],prev=new Int32Array(W*H).fill(-1);prev[start]=start;
 for(let head=0;head<q.length;head++){const k=q[head],x=k%W,y=Math.floor(k/W);
  if(land?Math.abs(x-tx)+Math.abs(y-ty)===1:x===tx&&y===ty){const out=[];for(let p=k;p!==start;p=prev[p])out.push([p%W,Math.floor(p/W)]);out.reverse();if(land)out.push([tx,ty]);return out}
  for(const [a,b]of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){if(a<0||b<0||a>=W||b>=H)continue;const n=b*W+a;if(prev[n]!==-1||!floats(a,b)||enemy(s,a,b)||npc(s,a,b))continue;prev[n]=k;q.push(n)}}
 return []}
// ---- Companions may leave and return with their own gear.
function leave(s,id){normalize(s);const i=s.party.findIndex(p=>p.id===id);if(i<1||s.combat.active||s.aboard)return false;const p=s.party[i],at=position(s,p);s.party.splice(i,1);s.bench??={};s.bench[id]=p;s.npcPositions[id]={x:at.x,y:at.y};say(s,p.name+'は隊を離れた。話しかければ、また一緒に旅ができる。');return true}
// ---- Combat stances. The leader is always commanded by hand.
const tactics={manual:'命令',assault:'突撃',ranged:'後衛',guard:'護衛'};
function autoAct(s,id){normalize(s);const p=s.party.find(p=>p.id===id);if(!p||p===s.party[0]||!s.combat.active||!canAct(s,id)||!p.tactic||p.tactic==='manual')return false;
 const at=position(s,p),st=Gear.stats(p),e=s.enemies.filter(e=>e.hp>0&&inSight(s,at,e)).sort((a,b)=>distance(at,a)-distance(at,b))[0];
 const strike=()=>!!e&&distance(at,e)<=st.range&&!(Gear.items[p.gear.weapon]?.ammo&&s.arrows<1)&&attack(s,e,false,id);
 const step=(tx,ty)=>{const r=route(s,at.x,at.y,tx,ty,false,true,true);return r.length>0&&moveActor(s,id,r[0][0]-at.x,r[0][1]-at.y)};
 const regroup=()=>distance(at,s)>2&&step(s.x,s.y);
 if(p.tactic==='ranged'){const hurt=s.party.filter(q=>q.hp>0&&q.hp<=q.max*.4&&distance(at,position(s,q))<=5&&visible(s,at,position(s,q))).sort((a,b)=>a.hp/a.max-b.hp/b.max)[0];
  if(hurt&&p.id!=='ed'&&p.mp>=Gear.spells.heal.mp&&cast(s,id,'heal',hurt))return true;
  if(e&&p.id!=='ed'&&p.mp>=Gear.spells.bolt.mp&&distance(at,e)<=Gear.spells.bolt.range&&cast(s,id,'bolt',e))return true;
  return strike()||waitActor(s,id)}
 if(p.tactic==='assault')return strike()||(!!e&&step(e.x,e.y))||regroup()||waitActor(s,id);
 return strike()||regroup()||waitActor(s,id)}
function runAuto(s){let n=0;while(s.combat.active&&n<8){const p=s.party.slice(1).find(p=>p.hp>0&&p.tactic&&p.tactic!=='manual'&&!s.combat.acted.includes(p.id));if(!p)break;if(!autoAct(s,p.id))waitActor(s,p.id);n++}return n}
// ---- Handling the world: shift furniture to any free neighbouring tile; fish.
function movable(o){return !!o&&(!!o.movable||o.type==='chair'||o.type==='barrel')}
function moveObject(s,o,x,y){normalize(s);if(s.combat.active||s.aboard||!movable(o)||distance(s,o)!==1||distance(o,{x,y})!==1||x===s.x&&y===s.y)return false;if(!pass(s,x,y)||terrain(x,y)==='door'||obj(s,x,y)||occupied(s,x,y)||s.dropped?.some(d=>d.x===x&&d.y===y))return false;s.moved[o.id]={x,y};say(s,o.name+'を動かした。');tick(s);return true}
function fish(s,x,y){normalize(s);if(s.combat.active||!(s.rod>0)||terrain(x,y)!=='water'||!s.aboard&&distance(s,{x,y})!==1)return false;if((s.turn*7+x*3+y*5)%3===0){s.food++;say(s,'魚が釣れた。食料が1つ増えた。')}else say(s,'浮きは静かなままだ。もう一度試そう。');tick(s);return true}
function valid(s){return s&&s.version===1&&Number.isInteger(s.x)&&s.x>=0&&s.x<W&&Number.isInteger(s.y)&&s.y>=0&&s.y<H&&Array.isArray(s.party)&&s.party.length>0&&Array.isArray(s.enemies)&&s.flags&&Array.isArray(s.log)&&Array.isArray(s.opened)&&['turn','gold','food','herbs','crystal','parts','wood','keys'].every(k=>Number.isFinite(s[k])&&s[k]>=0)&&s.party.every(p=>typeof p.name==='string'&&Number.isFinite(p.hp)&&Number.isFinite(p.max)&&p.max>0&&Number.isFinite(p.atk))}
root.RPG={isEvening,dark,floats,board,sail,sailPath,leave,tactics,autoAct,runAuto,movable,moveObject,fish,view,inSight,detectCombat,followParty,travelPath,World,Gear,cast,useHerb,pushObject,pathFrom,finishAction,lifeStep,W,H,KEY,fresh,npcs,people,isNight,visible,objs,terrain,obj,enemy,npc,pass,say,distance,position,normalize,toggleDoor,moveActor,beginCombat,endCombat,waitActor,nextActor,canAct,tick,move,attack,path,heal,rest,recruit,valid};if(typeof module!=='undefined')module.exports=root.RPG;
})(typeof window==='undefined'?globalThis:window);
