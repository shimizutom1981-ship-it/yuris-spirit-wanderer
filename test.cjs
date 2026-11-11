const assert=require('node:assert/strict');const E=require('./dist/engine.js');function openDoors(s){s.openedDoors=Object.fromEntries(E.World.buildings.map(b=>[b.door.join(','),true]));return s}let s=openDoors(E.fresh());assert(E.valid(s));assert(!E.valid({}));assert(E.path(s,12,20).length);for(let n of E.npcs.filter(n=>n.id!=='keeper'&&!n.isle&&!n.chapter))assert([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>E.path(s,n.x+dx,n.y+dy).length),`NPC ${n.id} accessible`);
assert(E.recruit(s,'ed'));assert(!E.recruit(s,'ed'));assert(E.recruit(s,'celes'));assert.equal(s.party.length,3);assert(!E.move(s,100,100));let e=s.enemies[0];s.x=e.x-1;s.y=e.y;let hp=e.hp;assert(E.attack(s,e));assert(e.hp<hp);s.enemies.forEach(e=>e.hp=0);E.endCombat(s);s.party[0].hp=1;assert(E.heal(s));assert(s.party[0].hp>1);let near=E.fresh();near.x=24;near.y=19;assert(!E.rest(near));let r=E.fresh();r.party[0].hp=1;assert(E.rest(r));assert.equal(r.party[0].hp,40);assert(E.valid(JSON.parse(JSON.stringify(s))));
let open=openDoors(E.fresh());open.flags.gate=true;open.opened.push('kiln-shutter');open.enemies.forEach(e=>e.hp=0);for(let o of E.objs.filter(o=>!o.isle&&!o.chapter))assert([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>E.path(open,o.x+dx,o.y+dy).length),`Object ${o.id} accessible`);open.opened=open.opened.filter(id=>id!=='kiln-shutter');assert(E.path(open,37,7).length,'ending reachable');console.log('Engine assertions passed: reachability, recruits, collision, combat, healing, safe rest, save roundtrip.');
// Migration preserves the v1 key and original state while adding party coordinates.
let legacy=E.fresh();E.recruit(legacy,'ed');delete legacy.party[1].x;delete legacy.party[1].y;
assert(E.valid(legacy));E.normalize(legacy);assert.equal(legacy.party[1].x,legacy.x);assert.equal(legacy.party[1].y,legacy.y);
// Followers trail real prior cells, including corners, not an arbitrary render offset.
let trail=E.fresh();E.recruit(trail,'ed');trail.party[1].x=11;trail.party[1].y=18;
assert(E.move(trail,1,0));assert.deepEqual(E.position(trail,trail.party[1]),{x:12,y:18});
assert(E.move(trail,0,1));assert.deepEqual(E.position(trail,trail.party[1]),{x:13,y:18});
// Combat movement affects only the selected member and respects occupied cells.
assert(E.moveActor(trail,'ed',-1,0));assert.equal(trail.x,13);assert.equal(trail.y,19);
assert(!E.moveActor(trail,'ed',2,0));
// Attack is one actor's action and range is measured from that actor.
let battle=E.fresh();E.recruit(battle,'ed');battle.enemies=[{id:'dummy',x:17,y:18,hp:100,max:100,atk:0,type:'wolf'}];
battle.party[1].x=16;battle.party[1].y=18;const dummy=battle.enemies[0];
assert(!E.attack(battle,dummy,false,'yuris'));assert(E.attack(battle,dummy,false,'ed'));assert.equal(dummy.hp,88);
assert(!E.attack(battle,dummy,true,'ed'));assert(!E.attack(battle,dummy,false,'missing'));
battle.party[1].hp=0;assert(!E.moveActor(battle,'ed',0,1));assert(!E.attack(battle,dummy,false,'ed'));
console.log('Party tests passed: v1 migration, real trailing cells, individual movement, individual damage and actor-relative range.');

let doors=E.fresh();assert(!E.pass(doors,6,19));doors.x=6;doors.y=20;assert(E.toggleDoor(doors,6,19));assert(E.pass(doors,6,19));assert(E.move(doors,0,-1));assert(!E.toggleDoor(doors,6,19));assert(E.move(doors,0,-1));assert(E.toggleDoor(doors,6,19));assert(!E.pass(doors,6,19));
let oldDoor=E.fresh();delete oldDoor.openedDoors;oldDoor.x=11;oldDoor.y=12;E.normalize(oldDoor);assert(E.pass(oldDoor,11,12));assert(E.move(oldDoor,0,1));
assert(E.objs.filter(o=>o.desc).length>=10);for(const o of E.objs.filter(o=>o.solid))assert(!E.pass(open,o.x,o.y));console.log('Doors/furniture passed: closed blocking, adjacent toggle, occupied-door safety, legacy migration, furnished room access.');

// Three heroes get one action each before any enemy acts.
let round=E.fresh();E.recruit(round,'ed');E.recruit(round,'celes');round.x=24;round.y=18;round.party[1].x=24;round.party[1].y=19;round.party[2].x=23;round.party[2].y=18;round.enemies=[{id:'round-enemy',x:25,y:18,hp:100,max:100,atk:5,type:'wolf'}];const foe=round.enemies[0];
assert(E.beginCombat(round));assert.equal(E.nextActor(round),'yuris');assert(E.attack(round,foe,false,'yuris'));assert.equal(round.party[0].hp,40);assert.equal(round.turn,0);assert(!E.attack(round,foe,false,'yuris'));assert(!E.move(round,-1,0));assert(!E.tick(round));assert(!E.heal(round));assert(!E.rest(round));assert(!E.endCombat(round));
assert.equal(E.nextActor(round),'ed');assert(E.waitActor(round,'ed'));assert.equal(round.turn,0);assert.equal(E.nextActor(round),'celes');assert(E.waitActor(round,'celes'));assert.equal(round.turn,1);assert.equal(round.party[0].hp,34);assert.equal(round.combat.round,2);assert.equal(round.combat.acted.length,0);
// Resuming a mid-round save cannot let a used member act twice.
assert(E.waitActor(round,'yuris'));let resumed=JSON.parse(JSON.stringify(round));E.normalize(resumed);assert(!E.waitActor(resumed,'yuris'));assert.equal(E.nextActor(resumed),'ed');
// Downed members are skipped, and no nearby living enemy allows safe exit.
round.party[2].hp=0;assert(E.waitActor(round,'ed'));assert.equal(round.combat.round,3);assert.equal(round.turn,2);round.enemies[0].hp=0;assert(E.endCombat(round));assert(!round.combat.active);assert(E.move(round,0,1),'a companion yields after combat');assert(E.move(round,0,-1));
// A legacy save without combat state is migrated without resetting an active round.
let noCombat=E.fresh();delete noCombat.combat;E.normalize(noCombat);assert.deepEqual(noCombat.combat,{active:false,acted:[],round:0});
console.log('Combat rounds passed: one action each, enemy once per round, duplicate-action refusal, wait, dead-member skip, save/resume and safe exit.');
// Opaque endpoints remain inspectable; rays cannot pass through walls/closed doors.
let sight=E.fresh();assert(E.visible(sight,{x:6,y:20},{x:6,y:19}));assert(!E.visible(sight,{x:6,y:20},{x:6,y:18}));sight.openedDoors['6,19']=true;assert(E.visible(sight,{x:6,y:20},{x:6,y:18}));assert(!E.visible(sight,{x:5,y:20},{x:5,y:18}));
sight.x=6;sight.y=20;sight.openedDoors['6,19']=false;sight.enemies=[{id:'hidden',x:6,y:18,hp:30,max:30,atk:4,type:'wolf'}];assert(!E.attack(sight,sight.enemies[0],true));assert.equal(sight.party[0].mp,12);E.tick(sight);assert.deepEqual([sight.enemies[0].x,sight.enemies[0].y],[6,18]);
// NPCs physically walk to their night locations. No teleport or wall-crossing.
let life=E.fresh();life.enemies=[];life.turn=159;let before=E.people(life);for(let i=0;i<157;i++){E.tick(life);let after=E.people(life);for(const p of after){const old=before.find(n=>n.id===p.id);assert(E.distance(old,p)<=1,'NPC teleport '+p.id);if(E.distance(old,p)){assert.equal(life.turn%4,0);assert(!['wall','tree','water'].includes(E.terrain(p.x,p.y)));if(E.terrain(p.x,p.y)==='door')assert(life.openedDoors[`${p.x},${p.y}`])}}before=after}
for(const [id,x,y]of [['ed',17,26],['smith',6,16],['celes',13,7],['inn',17,25]]){const n=E.people(life).find(n=>n.id===id);assert.deepEqual([n.x,n.y],[x,y],id+' reached night location')}
let restored=JSON.parse(JSON.stringify(life));assert.deepEqual(E.people(restored),E.people(life));assert(E.recruit(restored,'ed'));assert.deepEqual(E.position(restored,restored.party[1]),{x:17,y:26});
// Daytime return follows paths too; stationary and combat NPCs remain unchanged.
for(let i=0;i<160;i++)E.tick(life);for(const original of E.npcs.filter(n=>!E.World.npcs.some(w=>w.id===n.id))){const n=E.people(life).find(n=>n.id===original.id);assert.deepEqual([n.x,n.y],[original.x,original.y],original.id+' returned by day')}
const frozen=JSON.stringify(E.people(life));E.beginCombat(life);life.enemies=[{id:'near',x:13,y:18,hp:100,max:100,atk:0,type:'wolf'}];for(let i=0;i<12;i++)E.waitActor(life,'yuris');assert.equal(JSON.stringify(E.people(life)),frozen);
console.log('Visibility and NPC life passed: wall/door occlusion, blocked spell cost, enemy LOS, night/day physical travel, save restore, current-position recruitment and combat freeze.');

// Followers catch up to the living predecessor, route around occupied cells,
// and open ordinary doors. Combat movement remains strictly individual.
function partyForFollow(){const p=E.normalize(E.fresh());E.recruit(p,'ed');E.recruit(p,'celes');p.enemies=[];E.normalize(p);return p}
let catchup=partyForFollow();catchup.x=70;catchup.y=24;catchup.party[1].x=60;catchup.party[1].y=24;catchup.party[2].x=56;catchup.party[2].y=24;
for(let i=0;i<15;i++){const before=catchup.party.map(p=>E.position(catchup,p));E.tick(catchup);for(let j=1;j<3;j++){assert(E.distance(before[j],E.position(catchup,catchup.party[j]))<=3);assert(E.pass(catchup,catchup.party[j].x,catchup.party[j].y))}assert.equal(new Set(catchup.party.map(p=>{const a=E.position(catchup,p);return `${a.x},${a.y}`})).size,3)}
assert.equal(E.distance(catchup,E.position(catchup,catchup.party[1])),1);assert.equal(E.distance(E.position(catchup,catchup.party[1]),E.position(catchup,catchup.party[2])),1);
let doorFollow=partyForFollow();doorFollow.x=11;doorFollow.y=15;doorFollow.party[1].x=11;doorFollow.party[1].y=10;doorFollow.party[2].x=12;doorFollow.party[2].y=10;doorFollow.openedDoors['11,12']=false;
for(let i=0;i<12;i++)E.tick(doorFollow);
assert(doorFollow.openedDoors['11,12']);assert.equal(E.distance(doorFollow,E.position(doorFollow,doorFollow.party[1])),1);assert.equal(E.distance(E.position(doorFollow,doorFollow.party[1]),E.position(doorFollow,doorFollow.party[2])),1);
let movingParty=partyForFollow();movingParty.x=62;movingParty.y=24;movingParty.party[1].x=57;movingParty.party[1].y=24;movingParty.party[2].x=55;movingParty.party[2].y=24;
for(let i=0;i<10;i++)assert(E.move(movingParty,1,0));assert(E.distance(movingParty,E.position(movingParty,movingParty.party[1]))<=1);assert(E.distance(E.position(movingParty,movingParty.party[1]),E.position(movingParty,movingParty.party[2]))<=1);
for(const [dx,dy]of [[0,1],[-1,0],[-1,0],[0,-1],[1,0]]){assert(E.move(movingParty,dx,dy));assert.equal(new Set(movingParty.party.map(p=>{const a=E.position(movingParty,p);return `${a.x},${a.y}`})).size,3)}
let battleFollow=partyForFollow();battleFollow.x=62;battleFollow.y=24;battleFollow.party[1].x=60;battleFollow.party[1].y=24;battleFollow.party[2].x=59;battleFollow.party[2].y=24;battleFollow.enemies=[{id:'test',x:65,y:24,hp:100,max:100,atk:1,type:'wolf'}];E.beginCombat(battleFollow);const held=battleFollow.party.slice(1).map(p=>E.position(battleFollow,p));E.followParty(battleFollow);assert(E.moveActor(battleFollow,'yuris',0,1));assert.deepEqual(battleFollow.party.slice(1).map(p=>E.position(battleFollow,p)),held);
let savedFollow=JSON.parse(JSON.stringify(doorFollow));savedFollow.party[1].x=11;savedFollow.party[1].y=10;for(let i=0;i<15;i++)E.tick(savedFollow);assert(E.distance(savedFollow,E.position(savedFollow,savedFollow.party[1]))<=1);
console.log('Follower regression passed: separated save, continuous walking, turns/reversal, closed doors, collision-free regrouping and combat isolation.');
