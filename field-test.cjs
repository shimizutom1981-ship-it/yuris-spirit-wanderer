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
const held=line.party.map(point);E.tick(line);assert.deepEqual(line.party.map(point),held);assert(!E.move(line,line.party[1].x-line.x,line.party[1].y-line.y));assert.deepEqual(line.party.map(point),held);
const copy=JSON.parse(JSON.stringify(line));assert(E.move(copy,1,0));assert.deepEqual(point(copy.party[1]),point(line));
console.log('PASS formation: 90 turns/steps retain exact order, waiting/save/resume and occupied-tile reversal');
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
