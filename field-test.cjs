const assert=require('node:assert/strict'),E=require('./dist/engine');
const point=p=>({x:p.x,y:p.y});
function safe(){const s=E.normalize(E.fresh());s.enemies=[];return s}
function team(){const s=safe();E.recruit(s,'ed');E.recruit(s,'celes');s.party.push({id:'noa',name:'ノア',hp:36,max:36,mp:10,atk:6,x:57,y:18});s.x=60;s.y=18;s.party.forEach((p,i)=>{p.x=60-i;p.y=18});return E.normalize(s)}
// Genuine v0.3 state: transform every coordinate-bearing field exactly once.
const old={...E.fresh(),worldVersion:3,x:69,y:18,gold:53,party:[{id:'yuris',name:'ユリス',hp:20,max:40,mp:8,atk:8,x:69,y:18},{id:'ed',name:'エド',hp:30,max:32,mp:0,atk:7,x:68,y:18}],enemies:[{id:'roadwolf',x:75,y:23,hp:0,max:24,atk:4,type:'wolf'}],flags:{lamp:'wood',waterwheel:true},npcPositions:{mira:{x:67,y:16}},dropped:[{id:'saved-drop',x:56,y:56,key:'herbs'}],moved:{minecart:{x:97,y:57}},openedDoors:{'69,20':true,'56,56':true},seen:{'69,18':true,'56,56':true},combat:{active:true,acted:['yuris'],round:3}};
E.normalize(old);assert.deepEqual(point(old),{x:133,y:18});assert.deepEqual(point(old.party[1]),{x:132,y:18});assert.equal(old.enemies[0].hp,0);assert.equal(old.gold,53);assert(old.flags.waterwheel);assert(old.openedDoors['133,20']);assert(old.openedDoors['120,112']);assert(old.seen['120,112']);assert.deepEqual(old.moved.minecart,{x:217,y:113});assert.deepEqual(point(old.dropped[0]),{x:120,y:112});assert.deepEqual(old.npcPositions.mira,{x:131,y:16});assert.deepEqual(old.combat,{active:true,acted:['yuris'],round:3});
const once=JSON.stringify(old);E.normalize(old);assert.equal(JSON.stringify(old),once);assert.equal(old.enemies.filter(e=>e.id.startsWith('plains-wolf')).length,2);assert(E.valid(old));
console.log('PASS migration: locations, doors, NPCs, explored tiles, items, defeated foes and active turn retained; idempotent');
// Towns retain their dimensions; long, connected journeys and every spawn are valid.
assert.equal(E.W,232);assert.equal(E.H,168);const s=safe();s.flags.gate=true;for(const b of E.World.buildings)s.openedDoors[b.door.join(',')]=true;
const village=E.World.regions.find(r=>r[0]==='リーネ村'),port=E.World.regions.find(r=>r[0]==='風待ち港');
assert(E.path(s,village[1],village[2]).length>110);s.x=village[1];s.y=village[2];assert(E.path(s,port[1],port[2]).length>=90);
for(const e of E.World.wildernessFoes)assert(E.pass(s,e.x,e.y),'spawn '+e.id+' on '+E.terrain(e.x,e.y));assert.equal(E.World.wildernessFoes.length,24);
assert.equal(E.World.buildings.find(b=>b.id==='archives').w,12);
console.log('PASS world: intact towns, long connected routes, 24 valid field enemies');
// Exact four-member train through repeated corners; no shortcut, drift or overlap.
const line=team();const square=[...[...Array(10)].map(()=>[1,0]),...[...Array(5)].map(()=>[0,1]),...[...Array(10)].map(()=>[-1,0]),...[...Array(5)].map(()=>[0,-1])];
for(let lap=0;lap<3;lap++)for(const [dx,dy]of square){const before=line.party.map(p=>E.position(line,p));assert(E.move(line,dx,dy));for(let i=1;i<4;i++)assert.deepEqual(E.position(line,line.party[i]),before[i-1]);assert.equal(new Set(line.party.map(p=>p.x+','+p.y)).size,4)}
const held=line.party.map(point);E.tick(line);assert.deepEqual(line.party.map(point),held);
const copy=JSON.parse(JSON.stringify(line));assert(E.move(copy,1,0));assert.deepEqual(point(copy.party[1]),point(line));
console.log('PASS formation: 90 turns/steps retain exact order, waiting and save/resume');
// A narrow building exit and bridge retain the same exact trail.
for(const start of [{x:11,y:11,dx:0,dy:1},{x:125,y:73,dx:0,dy:1}]){const t=team();t.x=start.x;t.y=start.y;t.party.forEach((p,i)=>{p.x=t.x;p.y=t.y-i});t.openedDoors['11,12']=true;for(let k=0;k<7;k++){const before=t.party.map(p=>E.position(t,p));assert(E.move(t,start.dx,start.dy));for(let i=1;i<4;i++)assert.deepEqual(E.position(t,t.party[i]),before[i-1]);}}
console.log('PASS formation: single-door exit and river bridge');
// Same viewport/LOS/night predicate as the renderer; no free enemy hit on sighting.
function encounter(x,y){const a=safe();a.x=x;a.y=y;a.party[0].x=x;a.party[0].y=y;a.enemies=[{id:'vision',x:x+7,y,hp:50,max:50,atk:8,type:'wolf'}];return a}
let a=encounter(70,18);assert(E.inSight(a,a,a.enemies[0]));const hp=a.party[0].hp,enemyBefore=point(a.enemies[0]);assert(E.detectCombat(a));assert.equal(a.party[0].hp,hp);assert.deepEqual(point(a.enemies[0]),enemyBefore);assert.equal(a.combat.acted.length,0);assert.equal(a.combat.round,1);
a=encounter(70,18);a.enemies[0].x=78;assert(!E.detectCombat(a));assert(E.move(a,1,0));assert(a.combat.active);assert.equal(a.party[0].hp,40);assert.equal(a.enemies[0].x,78);
a=encounter(70,18);a.turn=160;assert(!E.detectCombat(a));a.enemies[0].x=76;assert(E.detectCombat(a));a=encounter(70,18);a.turn=160;a.lightUntil=200;assert(E.detectCombat(a));
a=encounter(6,20);a.enemies[0].x=6;a.enemies[0].y=18;assert(!E.detectCombat(a));a.openedDoors['6,19']=true;assert(E.detectCombat(a));
a=encounter(70,18);a.enemies[0].hp=0;assert(!E.detectCombat(a));
console.log('PASS encounter: screen edge, stepping into view, closed/open door, night/light, defeated enemy; player acts first');

// ---- v0.5: far bank, skiff, underground, stances, partings, furniture, fishing.
const openAll=st=>{st.flags.gate=true;for(const b of E.World.buildings)st.openedDoors[b.door.join(',')]=true;return st};
const reach=(st,o)=>[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>st.x===o.x+dx&&st.y===o.y+dy||E.path(st,o.x+dx,o.y+dy).length);
// The far bank cannot be walked to; from its landing everything is reachable once the rubble and chasm are dealt with.
let far=openAll(safe());assert(!E.path(far,42,45).length,'far bank must need the skiff');assert(E.floats(44,74),'rivers meet');
far.x=42;far.y=45;far.party[0].x=42;far.party[0].y=45;
const isle=[...E.npcs,...E.objs].filter(o=>o.isle);assert(isle.length>=12);
for(const o of isle){const t=E.terrain(o.x,o.y);assert(!['water','wall','rock','tree','door'].includes(t),o.id+' on '+t);assert.equal([...E.npcs,...E.objs].filter(p=>p.x===o.x&&p.y===o.y).length,1,o.id+' shares a tile')}
assert(!reach(far,E.objs.find(o=>o.id==='deepcore')),'core is behind rubble and chasm');
far.opened.push('cave-rubble');assert(!reach(far,E.objs.find(o=>o.id==='deepcore')),'chasm still blocks');assert(reach(far,E.objs.find(o=>o.id==='cavechest-c')));
far.opened.push('cave-chasm');for(const o of isle)assert(reach(far,o),o.id+' unreachable from landing');
for(const e of E.World.caveFoes)assert.equal(E.terrain(e.x,e.y),'cave');
console.log('PASS far bank: skiff-only, '+isle.length+' targets reachable from the landing, rubble and chasm gate the core');
// Migration from v0.4 adds the underground once and rescues anyone on the strip that became river.
const v4=E.normalize(E.fresh());v4.worldVersion=4;v4.enemies=v4.enemies.filter(e=>!e.id.startsWith('cave-'));delete v4.boat;delete v4.rings;v4.x=44;v4.y=74;v4.party[0].x=44;v4.party[0].y=74;const count=v4.enemies.length;
E.normalize(v4);assert.equal(v4.worldVersion,6);assert.equal(v4.enemies.length,count+5);assert.deepEqual(point(v4),{x:47,y:74});assert(E.pass(v4,v4.x,v4.y));assert.deepEqual(v4.boat,{x:121,y:75});assert(E.valid(v4));
const again=JSON.stringify(v4);E.normalize(v4);assert.equal(JSON.stringify(v4),again);
console.log('PASS migration v0.4 to v0.5: underground foes once, strip rescue, skiff and stones initialised, idempotent');
// Skiff: needs the shipwright's leave; sails water and under bridges; steps ashore; nobody fights from the water.
let boat=team();boat.x=121;boat.y=74;boat.party.forEach((p,i)=>{p.x=121+i;p.y=74});E.normalize(boat);
assert(!E.board(boat),'no boarding without permission');boat.flags.boat=true;assert(E.board(boat));assert(boat.aboard);assert.deepEqual(point(boat),{x:121,y:75});
boat.enemies=[{id:'shore',x:118,y:74,hp:30,max:30,atk:5,type:'wolf'}];assert(!E.detectCombat(boat));
assert(!E.path(boat,42,45).length);const voyage=E.travelPath(boat,42,45);assert(voyage.length>100,'voyage '+voyage.length);
assert(voyage.slice(0,-1).every(([x,y])=>E.floats(x,y)));
boat.enemies=[];for(const [x,y]of voyage)assert(E.move(boat,x-boat.x,y-boat.y),'sail step '+x+','+y);
assert(!boat.aboard);assert.deepEqual(point(boat),{x:42,y:45});assert(E.floats(boat.boat.x,boat.boat.y));assert.equal(E.distance(boat,boat.boat),1);
for(let i=0;i<6;i++)assert(E.move(boat,-1,0));for(const p of boat.party)assert(E.pass(boat,p.x,p.y)||p===boat.party[0],p.id+' left on the water');
assert.equal(new Set(boat.party.map(p=>p.x+','+p.y)).size,4);
const under=team();under.flags.boat=true;under.x=124;under.y=74;under.party.forEach((p,i)=>{p.x=124-i;p.y=74});under.boat={x:124,y:75};assert(E.board(under));assert(E.move(under,1,0));assert.equal(E.terrain(under.x,under.y),'bridge');assert(E.move(under,1,0)&&E.move(under,1,0));assert.equal(E.terrain(under.x,under.y),'water');
console.log('PASS skiff: permission, '+voyage.length+'-step voyage to the far bank, landing, followers disembark, passes under the bridge, no combat afloat');
// Underground is dark by day: two tiles without light, the whole screen with it.
let cave=safe();cave.x=21;cave.y=56;cave.party[0].x=21;cave.party[0].y=56;cave.enemies=[{id:'lurker',x:25,y:56,hp:30,max:30,atk:5,type:'wolf'}];
assert(E.World.under(21,56));assert(!E.isNight(cave));assert(!E.detectCombat(cave));cave.lightUntil=cave.turn+80;assert(E.detectCombat(cave));
cave=safe();cave.x=21;cave.y=56;cave.party[0].x=21;cave.party[0].y=56;cave.enemies=[{id:'lurker',x:23,y:56,hp:30,max:30,atk:5,type:'wolf'}];assert(E.detectCombat(cave));
assert(!E.visible(cave,{x:21,y:49},{x:19,y:56}),'rock hides the hall');
console.log('PASS underground: darkness, torchlight, rock occlusion');
// Stances: one automatic action each per round; the leader is never automatic.
function fightTeam(){const t=team();t.x=60;t.y=18;[[60,18],[60,19],[59,18],[59,19]].forEach(([x,y],i)=>{t.party[i].x=x;t.party[i].y=y});t.enemies=[{id:'dummy',x:63,y:18,hp:200,max:200,atk:1,type:'wolf'}];E.beginCombat(t);return t}
let t=fightTeam();const ed=t.party[1],celes=t.party[2],noa=t.party[3];ed.tactic='assault';celes.tactic='ranged';noa.tactic='guard';t.party[0].tactic='assault';
assert(!E.autoAct(t,'yuris'));const mp=celes.mp,edAt=point(ed),noaAt=point(noa);assert.equal(E.runAuto(t),3);
assert.deepEqual(t.combat.acted.sort(),['celes','ed','noa']);assert.equal(celes.mp,mp-3);assert.equal(t.enemies[0].hp,200-14-E.Gear.stats(celes).power);
assert.equal(E.distance(ed,t.enemies[0]),E.distance(edAt,t.enemies[0])-1,'assault closes in');assert.deepEqual(point(noa),noaAt,'guard holds near the leader');
assert.equal(E.runAuto(t),0);assert(E.waitActor(t,'yuris'));assert.equal(t.combat.round,2);
t=fightTeam();t.party[2].tactic='ranged';t.party[1].hp=5;const before=t.enemies[0].hp;assert(E.autoAct(t,'celes'));assert(t.party[1].hp>5,'ranged stance heals the badly hurt first');assert.equal(t.enemies[0].hp,before);
t=fightTeam();t.party.slice(1).forEach(p=>p.tactic='assault');t.enemies[0].x=62;t.party[0].hp=0;let guard=0;while(t.combat.active&&guard++<60)assert(E.runAuto(t)<=8);assert(!t.combat.active&&t.enemies[0].hp===0,'a fully automatic party finishes the fight in bounded batches');
console.log('PASS stances: assault closes and strikes, ranged casts and heals, guard holds, leader stays manual');
// A companion may leave with their gear and return with it.
let band=safe();E.recruit(band,'ed');E.normalize(band);E.Gear.add(band,'axe',1,band.party[1]);assert(E.Gear.equip(band.party[1],'axe'));band.party[1].x=13;band.party[1].y=18;
assert(!E.leave(band,'yuris'));assert(E.leave(band,'ed'));assert.equal(band.party.length,1);assert.deepEqual(point(E.npc(band,13,18)),{x:13,y:18});
const kept=JSON.parse(JSON.stringify(band));assert(E.recruit(kept,'ed'));assert.equal(kept.party[1].gear.weapon,'axe');assert(!kept.bench.ed);assert(!E.recruit(kept,'ed'));
console.log('PASS partings: leave, stand where left, rejoin with own gear after reload');
// Furniture shifts to any free neighbour, never onto a door, wall or another object.
let room=openAll(safe());room.x=18;room.y=24;room.party[0].x=18;room.party[0].y=24;const chair=E.obj(room,17,24);assert.equal(chair.type,'chair');assert(E.movable(chair));
assert(!E.moveObject(room,chair,16,24),'table in the way');assert(!E.moveObject(room,chair,18,24),'own tile');assert(E.moveObject(room,chair,17,25));assert(!E.obj(room,17,24));assert.equal(E.obj(room,17,25).id,'inn-chair');
assert(!E.movable(E.obj(room,16,24)),'tables stay put');
room.moved['inn-chair']={x:16,y:27};room.x=16;room.y=26;room.party[0].x=16;room.party[0].y=26;assert.equal(E.terrain(16,28),'door');assert(!E.moveObject(room,E.obj(room,16,27),16,28),'never onto a door');
console.log('PASS furniture: sideways shift, blocked by objects, own tile and doors');
// Fishing needs a rod and water beside you; three casts always include a catch.
let angler=safe();angler.x=121;angler.y=74;angler.party[0].x=121;angler.party[0].y=74;assert(!E.fish(angler,121,75));angler.rod=1;assert(!E.fish(angler,121,73));const food=angler.food;for(let i=0;i<3;i++)assert(E.fish(angler,121,75));assert(angler.food>food);
console.log('PASS fishing: rod, adjacent water, catch within three casts');
// Dusk: the farmer walks to the eating house table, then to bed, one tile at a time.
let dusk=openAll(safe());dusk.x=125;dusk.y=24;dusk.party[0].x=125;dusk.party[0].y=24;dusk.turn=158;let prev=E.people(dusk);
const stroll=n=>{for(let i=0;i<n;i++){E.tick(dusk);const now=E.people(dusk);for(const p of now)assert(E.distance(prev.find(q=>q.id===p.id),p)<=1,'no teleport '+p.id);prev=now}};
stroll(62);assert(E.isEvening(dusk)&&E.isNight(dusk));assert.deepEqual(point(E.people(dusk).find(n=>n.id==='farmer')),{x:119,y:17});
stroll(90);assert(!E.isEvening(dusk)&&E.isNight(dusk));assert.deepEqual(point(E.people(dusk).find(n=>n.id==='farmer')),{x:122,y:16});
stroll(120);assert(!E.isNight(dusk));assert.deepEqual(point(E.people(dusk).find(n=>n.id==='farmer')),{x:119,y:28});
console.log('PASS daily round: field by day, eating-house table at dusk, bed at night');

// v0.5.1: a party must never seal its own only exit, on foot or by tap.
const unique=st=>assert.equal(new Set(st.party.filter(p=>p.hp>0).map(p=>{const a=E.position(st,p);return a.x+','+a.y})).size,st.party.filter(p=>p.hp>0).length);
function doorway(size){const st=team();st.party=st.party.slice(0,size);st.x=11;st.y=11;st.party.forEach((p,i)=>{p.x=11;p.y=11+i});st.openedDoors['11,12']=true;return st}
for(const size of [2,3,4]){
 let st=JSON.parse(JSON.stringify(doorway(size)));const ids=st.party.map(p=>p.id),gold=st.gold;
 const path=E.travelPath(st,11,17);assert.equal(path.length,6,'companions must not block the only doorway');
 for(const [x,y]of path){assert(E.move(st,x-st.x,y-st.y));unique(st);assert(st.party.every(p=>E.pass(st,p.x,p.y)));}
 for(let lap=0;lap<3;lap++)for(const dy of [-1,1])for(let step=0;step<6;step++){
  assert(E.move(st,0,dy),'reverse into a companion');unique(st);assert(st.party.every(p=>E.pass(st,p.x,p.y)));
 }
 assert.deepEqual(st.party.map(p=>p.id),ids,'chosen party order remains intact');assert.equal(st.gold,gold);assert.equal(st.turn,42);
 assert(st.party.every((p,i)=>!i||E.distance(p,st.party[i-1])===1),'formation reforms');
 st=JSON.parse(JSON.stringify(st));assert(E.move(st,0,-1));unique(st);
}
console.log('PASS yielding: 2/3/4-member parties leave a blocked doorway, reverse repeatedly, reform and resume a stuck save');
// Walls, closed doors, enemies and residents remain solid; failed moves cost nothing.
let barrier=doorway(4);barrier.openedDoors['11,12']=false;const fixed=barrier.party.map(point),turn=barrier.turn;
assert(!E.move(barrier,0,1));assert.deepEqual(barrier.party.map(point),fixed);assert.equal(barrier.turn,turn);
barrier.openedDoors['11,12']=true;assert(E.move(barrier,0,1));assert(!E.move(barrier,1,0));unique(barrier);
let blocked=team();blocked.enemies=[{id:'blocker',x:61,y:18,hp:30,max:30,atk:1,type:'wolf'}];assert(!E.move(blocked,1,0));assert.equal(blocked.turn,0);
blocked.enemies=[];blocked.npcPositions.smith={x:61,y:18};assert(!E.move(blocked,1,0));assert.equal(blocked.turn,0);
console.log('PASS collision boundaries: yielding never bypasses closed doors, walls, enemies or residents');
// A manual combat swap consumes exactly the acting member's turn; automatic
// follow is suspended, and swapping the leader keeps camera/world coordinates in sync.
let swap=team();swap.party=swap.party.slice(0,2);swap.enemies=[{id:'observer',x:66,y:18,hp:90,max:90,atk:1,type:'wolf'}];E.beginCombat(swap);
const swappedGear=swap.party.map(p=>JSON.stringify(p.gear));assert(E.moveActor(swap,'ed',1,0));
assert.deepEqual(point(swap),{x:59,y:18});assert.deepEqual(point(swap.party[0]),point(swap));assert.deepEqual(point(swap.party[1]),{x:60,y:18});
assert.deepEqual(swap.combat.acted,['ed']);assert.equal(swap.turn,0);assert(!E.moveActor(swap,'ed',-1,0));unique(swap);
swap=JSON.parse(JSON.stringify(swap));assert(E.moveActor(swap,'yuris',1,0));assert.equal(swap.turn,1);assert.equal(swap.combat.round,2);unique(swap);
assert.deepEqual(swap.party.map(p=>JSON.stringify(p.gear)),swappedGear);
console.log('PASS combat yielding: leader/companion exchange, one action, no duplicate turn, save/resume and equipment retained');
// Teleports and old saves may start with all companions on the leader's tile.
let stacked=team();stacked.party.forEach(p=>{p.x=stacked.x;p.y=stacked.y});
for(let i=0;i<5;i++)assert(E.move(stacked,1,0));unique(stacked);
assert(stacked.party.every((p,i)=>!i||E.distance(p,stacked.party[i-1])===1));
console.log('PASS overlap recovery: an existing stacked party walks out and forms a line');

// These stories start on the mainland with no plot flags or special equipment.
const errands=safe();
for(const id of ['printer','ferryman','potter','kiln-turn','kiln-cache','kiln-tile','kiln-fish','kiln-swallow','kiln-shutter']){
 const target=[...E.npcs,...E.objs].find(item=>item.id===id);
 assert(reach(errands,target),id+' reachable from starting square');
}
const shelf=E.objs.find(item=>item.id==='kiln-shelf');
assert(!reach(errands,shelf),'closed shutter has no bypass from the overworld');
assert(!E.visible(errands,{x:167,y:50},{x:167,y:52}));
errands.opened.push('kiln-shutter');
assert(reach(errands,shelf));
assert(E.visible(errands,{x:167,y:50},{x:167,y:52}));
assert(E.World.under(shelf.x,shelf.y)&&!E.World.under(167,34));
const beforeKiln=safe();beforeKiln.worldVersion=5;delete beforeKiln.errands;
beforeKiln.flags.waterwheel=true;beforeKiln.evidence.water=true;
E.normalize(beforeKiln);
assert.equal(beforeKiln.enemies.filter(e=>e.id==='kiln-watch').length,1);
const watch=beforeKiln.enemies.find(e=>e.id==='kiln-watch');
beforeKiln.x=watch.x;beforeKiln.y=watch.y-1;Object.assign(beforeKiln.party[0],point(beforeKiln));
assert(E.detectCombat(beforeKiln),'kiln watch starts a normal sight encounter');
watch.hp=0;E.normalize(beforeKiln);assert.equal(beforeKiln.enemies.filter(e=>e.id==='kiln-watch').length,1);
assert.equal(watch.hp,0);assert(beforeKiln.evidence.water&&beforeKiln.flags.waterwheel);
console.log('PASS side dungeon: unassisted approach, enclosed rooms, sight, shutter and v0.5 save upgrade');
