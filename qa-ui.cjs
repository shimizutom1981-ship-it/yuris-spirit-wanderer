'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const noop=()=>{};
function element(tag='div'){
 const el={tag,children:[],style:{},dataset:{},classList:{toggle:noop,add:noop,remove:noop},width:256,height:224,open:false,hidden:true,textContent:'',parentElement:null,
 set innerHTML(v){this.children=[]},get lastChild(){return this.children.at(-1)},append(...a){a.forEach(c=>c.parentElement=this);this.children.push(...a)},replaceChildren(...a){this.children=[];this.append(...a)},setAttribute:noop,focus:noop,
 querySelector(){return this.closeButton??=element('button')},querySelectorAll(){return this.children},getContext(){return new Proxy({},{get:(t,p)=>t[p]??noop,set:(t,p,v)=>(t[p]=v,true)})},show(){this.open=true},showModal(){this.open=true},close(){this.open=false},click(){if(!this.disabled)this.onclick?.()},getBoundingClientRect(){return{left:0,top:0,width:256,height:224}}};return el;
}
function setup(saved){const nodes=new Map(),storage=new Map(saved?[['yuris-spirit-wanderer-v1',JSON.stringify(saved)]]:[]),context={console,Date,setTimeout:fn=>fn(),clearTimeout:noop,document:{getElementById(id){if(!nodes.has(id))nodes.set(id,element());return nodes.get(id)},createElement:element,querySelectorAll:()=>[],addEventListener:noop},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},Painter:{tile:noop,object:noop,sprite:noop,roof:noop,held:noop}};vm.createContext(context);for(const file of ['world.js','equipment.js','engine.js','game.js','side-stories.js','adventure.js','u6.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context,{filename:file});const q={run:code=>vm.runInContext(code,context),nodes,storage,choose(label){const b=nodes.get('choices').children.find(b=>b.textContent===label);assert(b,'choice missing '+label+'; options='+nodes.get('choices').children.map(c=>c.textContent));b.click()},button(id){nodes.get(id).click()},choices(){return nodes.get('choices').children.map(b=>b.textContent)},reset(){q.run("s=E.fresh();prepareState();selected='yuris';mode='explore';$('modal').close();render()")}};return q}
let passed=0;function test(name,fn){fn();passed++;console.log('PASS',name)}
let q=setup();
test('new game initializes map, equipment and autosave',()=>{assert.equal(q.run('s.party[0].gear.weapon'),'dagger');assert.equal(q.run('E.W'),232);assert.equal(q.run('s.arrows'),30);assert(q.storage.has('yuris-spirit-wanderer-v1'))});
test('legacy save retains achievements, coordinates and recruits',()=>{const E=require('./dist/engine');const old=E.fresh();old.flags.lamp='wood';old.flags.ending=true;old.gold=42;delete old.openedDoors;let a=setup(old);assert(a.run("s.flags.ending&&s.gold===42&&s.party[0].gear.weapon==='dagger'"));let n=a.run('s.enemies.length');a.run('prepareState();prepareState()');assert.equal(a.run('s.enemies.length'),n)});
test('all expansion NPCs and interaction targets reachable',()=>{q.reset();q.run("s.enemies=[];s.flags.gate=true;s.opened.push('kiln-shutter');E.World.buildings.forEach(b=>s.openedDoors[b.door.join(',')]=true)");for(const o of q.run('[...E.npcs,...E.objs].filter(o=>!o.isle)'))assert(q.run(`[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>E.path(s,${o.x}+dx,${o.y}+dy).length)`),o.id+' inaccessible')});
test('tap path crosses closed doors without treating walls as doors',()=>{q.reset();assert(q.run('E.travelPath(s,7,17).length>0'));assert(!q.run("E.pass(s,6,19)"));assert(!q.run('E.travelPath(s,4,14).length'))});
test('bow and armour acquired from permissioned chest; loot cannot duplicate',()=>{q.reset();q.run("talk(E.npcs.find(n=>n.id==='mira'))");q.choose('旅支度を借りる');q.run("close();inspect(E.objs.find(o=>o.id==='bowchest'))");q.choose('狩人の弓 ×1');q.choose('革の鎧 ×1');q.choose('矢 ×24');assert(q.run('s.party[0].pack.bow===1&&s.arrows===54'));q.run("inspect(E.objs.find(o=>o.id==='bowchest'))");assert.equal(q.choices().length,1)});
test('equipment changes range; two-handed bow removes shield',()=>{q.reset();q.run("Gear.add(s,'shield');Gear.add(s,'bow');Gear.equip(s.party[0],'shield');Gear.equip(s.party[0],'bow')");assert(q.run('s.party[0].gear.shield===null&&Gear.stats(s.party[0]).range===5'));assert(!q.run("Gear.equip(s.party[0],'shield')"))});
test('bow consumes one arrow, rejects empty quiver and wall shots',()=>{q.reset();q.run("Gear.add(s,'bow');Gear.equip(s.party[0],'bow');s.enemies=[{id:'target',x:17,y:18,hp:100,max:100,atk:0,type:'wolf'}]");assert(q.run('E.attack(s,s.enemies[0],false)'));assert.equal(q.run('s.arrows'),29);q.run("s.combat.active=false;s.combat.acted=[];s.arrows=0");assert(!q.run('E.attack(s,s.enemies[0],false)'));q.run("s.arrows=3;s.x=6;s.y=20;s.enemies[0].x=6;s.enemies[0].y=18");assert(!q.run('E.attack(s,s.enemies[0],false)'));assert.equal(q.run('s.arrows'),3)});
test('spear reaches two tiles and cannot attack through wall',()=>{q.reset();q.run("Gear.add(s,'spear');Gear.equip(s.party[0],'spear');s.enemies=[{id:'target',x:14,y:18,hp:100,max:100,atk:0,type:'wolf'}]");assert(q.run('E.attack(s,s.enemies[0],false)'));assert.equal(q.run('s.enemies[0].hp'),90)});
test('accessory changes max MP and survives save reload',()=>{q.reset();q.run("Gear.add(s,'moon_ring');Gear.equip(s.party[0],'moon_ring');E.rest(s);save()");assert.equal(q.run('s.party[0].mp'),18);const restored=setup(JSON.parse(q.storage.get('yuris-spirit-wanderer-v1')));assert(restored.run("s.party[0].gear.accessory==='moon_ring'&&s.party[0].mp===18"))});
test('armour reduces actual incoming damage',()=>{q.reset();q.run("s.enemies=[{id:'target',x:13,y:18,hp:100,max:100,atk:10,type:'wolf'}];Gear.add(s,'plate');Gear.equip(s.party[0],'plate');E.beginCombat(s);E.waitActor(s,'yuris')");assert.equal(q.run('s.party[0].hp'),35)});
test('sleep holds enemy still and spends caster turn',()=>{q.reset();q.run("E.recruit(s,'ed');s.enemies=[{id:'target',x:14,y:18,hp:100,max:100,atk:10,type:'wolf'}]");assert(q.run("E.cast(s,'yuris','sleep',s.enemies[0])"));assert(q.run("s.enemies[0].sleep===3&&s.combat.acted.includes('yuris')"));assert(!q.run("E.cast(s,'yuris','bolt',s.enemies[0])"));q.run("E.waitActor(s,'ed')");assert.equal(q.run('s.enemies[0].sleep'),2)});
test('heal revives and fire affects adjacent enemies only',()=>{q.reset();q.run("E.recruit(s,'ed');s.party[1].hp=0;s.party[1].x=13;s.party[1].y=18");assert(q.run("E.cast(s,'yuris','heal',s.party[1])"));assert(q.run('s.party[1].hp>0'));q.reset();q.run("s.enemies=[{id:'a',x:14,y:18,hp:40,max:40,atk:0,type:'wolf'},{id:'b',x:15,y:18,hp:40,max:40,atk:0,type:'wolf'},{id:'c',x:18,y:19,hp:40,max:40,atk:0,type:'wolf'}]");assert(q.run("E.cast(s,'yuris','fire',s.enemies[0])"));assert(q.run('s.enemies[0].hp===28&&s.enemies[1].hp===28&&s.enemies[2].hp===40'));assert.equal(q.run('s.party[0].mp'),5)});
test('equipment transfer enforces ownership and capacity',()=>{q.reset();q.run("E.recruit(s,'ed');prepareState();Gear.add(s,'bow');");assert(q.run("Gear.give(s.party[0],s.party[1],'bow')"));assert(!q.run("Gear.give(s.party[0],s.party[1],'bow')"));assert(!q.run("Gear.give(s.party[0],s.party[1],'dagger')"))});
test('item UI equips and drops retrievable gear',()=>{q.reset();q.run("Gear.add(s,'bow');bag()");const grid=q.nodes.get('mb').children.find(el=>el.className==='inventory');grid.children.find(el=>el.textContent==='狩人の弓').click();q.choose('装備する');assert(q.run("s.party[0].gear.weapon==='bow'"));q.run('bag()');q.nodes.get('mb').children.find(el=>el.className==='inventory').children.find(el=>el.textContent.includes('狩人の弓')).click();q.choose('地面に置く');q.run('inspect(s.dropped[0])');q.choose('拾う');assert(q.run('s.dropped.length===0&&s.party[0].pack.bow===1'))});
test('books unlock keywords and bell puzzle uses actual sequence',()=>{q.reset();q.run("inspect(E.objs.find(o=>o.id==='abbeybook'))");assert(q.run("s.heard.includes('三つの証')"));q.run("inspect(E.objs.find(o=>o.id==='abbeybell'))");q.choose('暁');q.choose('暁');q.choose('暁');assert(!q.run('s.evidence.wind'));q.choose('もう一度');q.choose('夕べ');q.choose('暁');q.choose('正午');assert(q.run('s.evidence.wind'))});
function water(){q.run("s.parts++;inspect(E.objs.find(o=>o.id==='millwheel'))");q.choose('部品で直す');q.run("talk(E.npcs.find(n=>n.id==='miller'))");assert(q.run('s.evidence.water'))}
function stone(){q.run("inspect(E.objs.find(o=>o.id==='minelever'));talk(E.npcs.find(n=>n.id==='noa'))");q.choose('記憶を託して')}
function wind(){q.run("inspect(E.objs.find(o=>o.id==='abbeybell'))");q.choose('夕べ');q.choose('暁');q.choose('正午')}
for(const order of [[water,stone,wind],[water,wind,stone],[stone,water,wind],[stone,wind,water],[wind,water,stone],[wind,stone,water]])test('nonlinear chapter completes order '+order.map(f=>f.name).join('-'),()=>{q.reset();for(const task of order)task();q.run("inspect(E.objs.find(o=>o.id==='lighthousecore'))");q.choose('今の声をつなぐ');assert.equal(q.run('s.flags.finalEnding'),'connect');assert(q.run("s.party.some(p=>p.id==='noa')"));const gold=q.run('s.gold');q.run("inspect(E.objs.find(o=>o.id==='lighthousecore'))");assert.equal(q.run('s.gold'),gold)});
test('second ending persists without repeating rewards',()=>{q.reset();water();wind();stone();q.run("inspect(E.objs.find(o=>o.id==='lighthousecore'))");q.choose('装置を静かに封じる');assert.equal(q.run('s.flags.finalEnding'),'seal');assert.equal(JSON.parse(q.storage.get('yuris-spirit-wanderer-v1')).flags.finalEnding,'seal')});
test('save mid-round retains spent action and active equipment',()=>{q.reset();q.run("E.recruit(s,'ed');s.enemies=[{id:'foe',x:13,y:18,hp:100,max:100,atk:0,type:'wolf'}];E.attack(s,s.enemies[0]);save()");const a=setup(JSON.parse(q.storage.get('yuris-spirit-wanderer-v1')));assert(!a.run("E.canAct(s,'yuris')"));assert.equal(a.run("E.nextActor(s)"),'ed')});
test('mid-combat weapon swap consumes exactly one actor action',()=>{q.reset();q.run("E.recruit(s,'ed');prepareState();Gear.add(s,'bow');s.enemies=[{id:'foe',x:14,y:18,hp:100,max:100,atk:0,type:'wolf'}];E.beginCombat(s)");assert(q.run("Gear.equip(s.party[0],'bow')"));assert(q.run("s.combat.acted.includes('yuris')"));assert(!q.run("Gear.equip(s.party[0],'dagger')"));assert.equal(q.run('s.turn'),0)});
test('night destinations are walkable and unoccupied furniture cells',()=>{q.reset();for(const [id,[x,y]]of Object.entries(q.run('E.World.night'))){assert(!q.run(`['water','wall','tree','mountain'].includes(E.terrain(${x},${y}))||E.obj(s,${x},${y})?.solid`),id)}});
test('lethal attack exits individual movement and followers resume',()=>{q.reset();q.run("E.recruit(s,'ed');s.enemies=[{id:'last',x:13,y:18,hp:1,max:1,atk:0,type:'wolf'}];chooseMode('fight');interaction(13,18)");assert.equal(q.run('mode'),'explore');assert(!q.run('s.combat.active'));q.run('directional(0,1)');assert(q.run('E.distance(s,E.position(s,s.party[1]))<=1'))});
test('movement in an attack or spell targeting mode still follows outside combat',()=>{for(const m of ['fight','magic']){q.reset();q.run(`E.recruit(s,'ed');s.enemies=[];chooseMode('${m}');directional(0,1)`);assert(q.run('s.y===19&&E.distance(s,E.position(s,s.party[1]))<=1'));assert(!q.run('s.combat.active'))}});
test('defeating last enemy with a spell resets selected actor and movement',()=>{q.reset();q.run("E.recruit(s,'celes');s.party[1].x=13;s.party[1].y=18;s.enemies=[{id:'last',x:14,y:18,hp:1,max:1,atk:0,type:'wolf'}];selected='celes';chooseMode('magic');interaction(14,18)");assert(q.run("mode==='explore'&&selected==='yuris'&&!s.combat.active"));q.run('directional(0,1)');assert.equal(q.run('s.y'),19)});
test('tap travel stops immediately at visible enemy and preserves player turn',()=>{q.reset();q.run("s.x=70;s.y=18;s.party[0].x=70;s.party[0].y=18;s.enemies=[{id:'field',x:80,y:18,hp:40,max:40,atk:8,type:'wolf'}];walkTo(85,18)");assert(q.run("s.x===73&&s.combat.active&&s.combat.round===1&&s.combat.acted.length===0&&!moving&&s.party[0].hp===40"))});
test('travel map includes entire expanded world',()=>{q.reset();q.button('map');const map=q.nodes.get('mb').children.find(el=>el.tag==='canvas');assert.equal(map.width,696);assert.equal(map.height,504)});
test('first chapter ending does not remove distant field guardians',()=>{q.reset();q.run("s.crystal=1;inspect(E.objs.find(o=>o.id==='altar'))");q.choose('霊晶を接続する');assert(q.run("s.enemies.find(e=>e.id==='sentinel').hp===0&&s.enemies.find(e=>e.id==='old-road-guard').hp>0"))});
// ---- v0.5: command grid, typed keywords, skiff, standing stones, underground, stances.
const at=(x,y)=>q.run(`s.enemies=[];s.x=${x};s.y=${y};s.party[0].x=${x};s.party[0].y=${y};render()`);
const body=(game=q)=>game.nodes.get('mb').children.map(c=>c.textContent).join('\n');
const say=(word,game=q)=>{const form=game.nodes.get('choices').children.find(c=>c.tag==='form');assert(form,'conversation has a keyword field');form.children[0].value=word;form.onsubmit()};
test('look only describes: nothing is taken, opened or switched',()=>{q.reset();at(7,17);q.button('g-look');q.run('interaction(7,18)');assert(q.run("s.wood===0&&!s.opened.includes('crate')&&!$('modal').open"));assert(q.run("s.log[0].includes('工房の資材箱')"));q.run('interaction(6,17)');assert(q.run("s.log[0].includes('鍛冶師オル')&&!$('modal').open"));q.run('interaction(7,16)');assert(q.run("s.log[0].length>0&&mode==='look'"))});
test('get picks up table goods; taking owned goods costs reputation',()=>{q.reset();at(16,26);q.button('g-get');q.run('interaction(16,25)');assert(q.run("s.food===7&&s.reputation===-1&&s.opened.includes('bread')&&!E.obj(s,16,25)"));at(18,24);q.run("chooseMode('get');interaction(17,24)");assert(q.run("s.log[0].includes('持ち運べない')&&E.obj(s,17,24).id==='inn-chair'"));at(119,64);q.run("chooseMode('get');interaction(119,65)");assert.equal(q.run('s.rod'),1)});
test('move shifts a chair to a chosen neighbouring tile',()=>{q.reset();at(18,24);q.button('g-move');q.run('interaction(17,24)');assert(!q.choices().includes('東へ'),'not onto the mover');q.choose('西へ');assert(q.run("E.obj(s,17,24).id==='inn-chair'&&s.log.some(l=>l.includes('動かせない'))"));q.run("chooseMode('move');interaction(17,24)");q.choose('南へ');assert(q.run("E.obj(s,17,25).id==='inn-chair'&&!E.obj(s,17,24)"));q.run("chooseMode('move');interaction(16,24)");assert(q.run("s.log[0].includes('重くて動かせない')"))});
test('typed keywords reach topics that are not yet offered; unknown words are answered',()=>{q.reset();at(128,118);q.run("talk(E.npcs.find(n=>n.id==='captain'))");assert(!q.choices().includes('舟'));say('舟');assert(q.run("s.heard.includes('舟')&&s.notes.some(n=>n.title.includes('舟'))"));assert(body().includes('渡し場'));q.choose('話を続ける');assert(q.choices().includes('舟'));say('竜');assert(body().includes('何も知らない'));q.choose('話を続ける');say('さようなら');assert(!q.run("$('modal').open"));q.run("talk(E.npcs.find(n=>n.id==='celes'))");say('霊流の環');assert(body().includes('立ち石'))});
test('shipwright lends the skiff for materials or coin',()=>{q.reset();at(128,118);q.run("talk(E.npcs.find(n=>n.id==='captain'))");q.choose('舟を借りる');q.choose('20枚払う');assert(!q.run('s.flags.boat'));q.choose('戻る');q.run('s.gold=30');q.choose('舟を借りる');q.choose('20枚払う');assert(q.run('s.flags.boat===true&&s.gold===10'));q.choose('話を続ける');assert(!q.choices().includes('舟を借りる'));q.reset();at(128,118);q.run("s.wood=2;s.parts=1;talk(E.npcs.find(n=>n.id==='captain'))");q.choose('舟を借りる');q.choose('木材2と部品1を渡す');assert(q.run('s.flags.boat&&s.wood===0&&s.parts===0&&s.gold===12'))});
test('use boards the skiff; taps sail, pass under the bridge and land',()=>{q.reset();at(121,74);q.button('g-use');q.run('interaction(121,75)');assert(!q.run('s.aboard'));assert(q.run("s.log[0].includes('船大工')"));q.run('s.flags.boat=true');q.button('g-use');q.run('interaction(121,75)');assert(q.run("s.aboard&&s.x===121&&s.y===75&&mode==='explore'"));q.run('interaction(130,77)');assert(q.run('s.aboard&&s.x===130&&s.y===77'));q.run('interaction(130,90)');assert(q.run("s.aboard&&s.log[0].includes('舟ではそこへ行けない')"));q.run('directional(-1,0)');assert.equal(q.run('s.x'),129);q.run('interaction(110,74)');assert(q.run('!s.aboard&&s.x===110&&s.y===74&&s.boat.x===110&&s.boat.y===75'));assert(q.run("$('place').textContent.length>0"))});
test('use on yourself opens the shared supplies; a torch lights the underground',()=>{q.reset();at(21,56);assert(q.run("$('quest').textContent.includes('暗い')"));q.button('g-use');q.run('interaction(21,56)');assert(q.choices().includes('松明 ×2'));q.choose('松明 ×2');q.choose('使う');assert(q.run('s.lightUntil>s.turn&&s.torches===1'));assert(!q.run("$('quest').textContent.includes('暗い')"))});
test('standing stones link only the ones already touched',()=>{q.reset();at(10,22);q.run("inspect(E.objs.find(o=>o.id==='ring-norvik'))");assert.deepEqual(q.choices(),['離れる']);q.choose('離れる');at(123,117);q.run("inspect(E.objs.find(o=>o.id==='ring-port'))");assert.deepEqual(q.choices(),['ノルヴィクへ','離れる']);q.run("E.recruit(s,'ed')");q.choose('ノルヴィクへ');assert(q.run("E.distance(s,{x:10,y:21})===1&&E.pass(s,s.x,s.y)||s.x!==123"));assert(q.run("E.distance(s,{x:10,y:21})===1&&!$('modal').open"));q.run('directional(1,0);directional(1,0)');assert(q.run('E.distance(s,E.position(s,s.party[1]))<=1'))});
test('rubble needs the pickaxe, the chasm consumes a rope, the core rewards once',()=>{q.reset();at(21,59);q.run("inspect(E.objs.find(o=>o.id==='cave-rubble'))");assert.deepEqual(q.choices(),['閉じる']);q.choose('閉じる');q.run("s.pick=1;inspect(E.objs.find(o=>o.id==='cave-rubble'))");q.choose('つるはしで砕く');assert(q.run("s.opened.includes('cave-rubble')&&E.pass(s,21,60)"));q.run("inspect(E.objs.find(o=>o.id==='cave-chasm'))");assert.deepEqual(q.choices(),['閉じる']);q.choose('閉じる');q.run("s.rope=1;inspect(E.objs.find(o=>o.id==='cave-chasm'))");q.choose('ロープを渡す');assert(q.run("s.rope===0&&E.pass(s,30,64)"));q.run("inspect(E.objs.find(o=>o.id==='deepcore'))");q.choose('約束は果たされたと伝える');assert(q.run("s.flags.deep==='release'&&s.party[0].pack.spirit_charm===1&&s.gold===32"));q.choose('続ける');q.run("inspect(E.objs.find(o=>o.id==='deepcore'))");assert.deepEqual(q.choices(),['閉じる']);assert.equal(q.run('s.gold'),32)});
test('orders set a stance; a companion leaves and rejoins by conversation',()=>{q.reset();at(13,18);q.run("E.recruit(s,'ed');render()");q.button('formation');q.choose('エド：命令');assert.equal(q.run('s.party[1].tactic'),'assault');q.choose('エドと別れる');assert(q.run("s.party.length===1&&s.bench.ed.tactic==='assault'&&selected==='yuris'"));q.choose('閉じる');q.run("talk(E.people(s).find(n=>n.id==='ed'))");q.choose('一緒に来て');assert(q.run("s.party.length===2&&s.party[1].tactic==='assault'&&!s.bench.ed"))});
test('a companion on a stance acts by itself each round; commanded ones wait for the player',()=>{q.reset();q.run("E.recruit(s,'ed');E.recruit(s,'celes');s.party[1].tactic='assault';s.party[1].x=13;s.party[1].y=18;s.party[2].x=11;s.party[2].y=18;s.enemies=[{id:'foe',x:14,y:18,hp:100,max:100,atk:0,type:'wolf'}];render()");assert(q.run("s.combat.active&&s.combat.acted.join()==='ed'&&s.enemies[0].hp<100&&s.combat.round===1"));const hp=q.run('s.enemies[0].hp');q.run('render();render()');assert.equal(q.run('s.enemies[0].hp'),hp);q.run("E.waitActor(s,'yuris');E.waitActor(s,'celes');render()");assert(q.run("s.combat.round===2&&s.combat.acted.join()==='ed'&&s.enemies[0].hp<"+hp))});
test('v0.4 save opens in v0.5 with skiff, stones and underground added once',()=>{const old=require('./dist/engine').fresh();old.worldVersion=4;old.enemies=old.enemies.filter(e=>!e.id.startsWith('cave-'));delete old.boat;delete old.rings;delete old.bench;old.gold=77;old.flags.lamp='wood';const a=setup(old);assert(a.run("s.gold===77&&s.flags.lamp==='wood'&&s.worldVersion===6&&s.boat.x===121&&s.enemies.filter(e=>e.id.startsWith('cave-')).length===5"));a.run('render();render()');assert.equal(a.run("s.enemies.filter(e=>e.id.startsWith('cave-')).length"),5)});
test('direction keys reverse through a companion without overlap or a blocking dialog',()=>{
 q.reset();q.run("s.enemies=[];E.recruit(s,'ed');E.recruit(s,'celes');s.x=11;s.y=11;s.party.forEach((p,i)=>{p.x=11;p.y=11+i});s.openedDoors['11,12']=true;render()");
 q.run('directional(0,1)');assert(q.run("s.x===11&&s.y===12&&!$('modal').open"));
 q.run('directional(0,-1)');assert(q.run("s.y===11&&new Set(s.party.map(p=>p.x+','+p.y)).size===3"));
 const resumed=setup(JSON.parse(q.storage.get('yuris-spirit-wanderer-v1')));resumed.run('directional(0,1)');assert.equal(resumed.run('s.y'),12);
});
test('tap movement passes companions in the only doorway and reforms the line',()=>{
 q.reset();q.run("s.enemies=[];E.recruit(s,'ed');E.recruit(s,'celes');s.x=11;s.y=11;s.party.forEach((p,i)=>{p.x=11;p.y=11+i});s.openedDoors['11,12']=true;render();interaction(11,17)");
 assert(q.run("s.x===11&&s.y===17&&!moving&&!$('modal').open&&new Set(s.party.map(p=>p.x+','+p.y)).size===3"));
 assert(q.run('s.party.every((p,i)=>!i||E.distance(p,s.party[i-1])===1)'));
});
test('reporting the repaired wheel to Hal progresses on the first conversation and survives reload',()=>{
 for(const [item,cost,button] of [['parts',1,'部品で直す'],['wood',2,'木材で直す']]){
  q.reset();
  const wheel=q.run("E.objs.find(o=>o.id==='millwheel')");
  const hal=q.run("E.people(s).find(n=>n.id==='miller')");
  at(hal.x,hal.y+1);
  q.run(`interaction(${hal.x},${hal.y})`);
  assert(body().includes('水車が止まって'));say('水の記憶');assert(!q.run('s.evidence.water'));
  q.choose('話を続ける');q.choose('別れる');
  at(wheel.x,wheel.y-1);
  q.run(`s.${item}=${cost};interaction(${wheel.x},${wheel.y})`);q.choose(button);
  assert.equal(q.run('s.'+item),0);assert(!q.run('s.evidence.water'));q.choose('続ける');
  // Resume at the NPC from a repaired, unclaimed save (also the v0.5.1 format).
  at(hal.x,hal.y+1);q.run('save()');
  const guide=setup(JSON.parse(q.storage.get('yuris-spirit-wanderer-v1')));
  const converse=()=>guide.run(`interaction(${hal.x},${hal.y})`);
  const gold=guide.run('s.gold');guide.button('g-talk');converse();
  assert.equal(guide.run('s.gold'),gold+10);assert(body(guide).includes('水の証と謝礼の金貨10枚を受け取った'));
  assert(body(guide).includes('灰石の廃鉱')&&body(guide).includes('水鏡修道院'));
  assert(guide.run("s.evidence.water&&s.notes.filter(n=>n.title==='水の証').length===1"));
  guide.choose('水の記憶');const reply=body(guide);assert(reply.includes('君に託した')&&!reply.includes('直してくれたら'));
  guide.choose('話を続ける');say('水の記憶',guide);assert.equal(body(guide),reply);
  guide.choose('話を続ける');guide.choose('名前・仕事');assert(body(guide).includes('直してくれた軸受け'));
  guide.choose('話を続ける');say('水車',guide);assert(body(guide).includes('小麦を挽ける'));
  guide.choose('話を続ける');guide.choose('別れる');converse();assert.equal(guide.run('s.gold'),gold+10);
  const after=setup(JSON.parse(guide.storage.get('yuris-spirit-wanderer-v1')));
  after.run(`interaction(${hal.x},${hal.y})`);assert.equal(after.run('s.gold'),gold+10);
  assert(!body(after).includes('金貨10枚'));assert(after.run('s.evidence.water'));
 }
});
test('Hal directs a returning player to only the remaining proof or the lighthouse',()=>{
 for(const [stone,wind,expect,absent] of [[true,false,'水鏡修道院','灰石の廃鉱'],[false,true,'灰石の廃鉱','水鏡修道院'],[true,true,'潮鳴りの灯台','灰石の廃鉱']]){
  q.reset();q.run(`s.flags.waterwheel=true;s.evidence={water:true,stone:${stone},wind:${wind}};talk(E.people(s).find(n=>n.id==='miller'))`);
  assert(body().includes(expect)&&!body().includes(absent));say('水の証');assert(body().includes(expect)&&!body().includes(absent));assert.equal(q.run('s.gold'),12);
 }
});
test('already repaired wheel cannot consume more materials or pay a second repair reward',()=>{
 q.reset();const wheel=q.run("E.objs.find(o=>o.id==='millwheel')");at(wheel.x,wheel.y-1);
 q.run(`s.wood=5;inspect(E.obj(s,${wheel.x},${wheel.y}))`);q.choose('木材で直す');q.choose('続ける');
 const gold=q.run('s.gold');q.run("Adv.setUsed('wood');chooseMode('use')");q.run(`interaction(${wheel.x},${wheel.y})`);
 assert.equal(q.run('s.wood'),3);assert.equal(q.run('s.gold'),gold);assert(body().includes('車輪が回り'));
});
// Walk the actual routes, then interact through the normal tap or command handler.
function visit(game,from,target,command){
 game.run("if($('modal').open)close();chooseMode('explore')");
 const [x,y]=from;
 assert(game.run(`if(s.x!==${x}||s.y!==${y})walkTo(${x},${y});s.x===${x}&&s.y===${y}`),'walk to '+from);
 if(command)game.button(command);
 game.run(`interaction(${target[0]},${target[1]})`);
 assert(game.run("$('modal').open"),'interaction at '+target);
}
function resume(game){return setup(JSON.parse(game.storage.get('yuris-spirit-wanderer-v1')))}
for(const [answer,ending,scene] of [['岸へ帰る舟','boat','両手を口に'],['手袋を振る親子','glove','同じ赤']]){
 test('a town postcard can be delivered on foot: '+ending,()=>{
  let game=setup();
  visit(game,[11,22],[11,23]);game.choose('絵はがきを預かる');
  game=resume(game);game.button('journal');game.choose('寄り道');assert(body(game).includes('三本線の舟板'));
  visit(game,[17,32],[18,32]);game.choose('絵はがきを見せる');game.choose(answer);
  game=resume(game);visit(game,[11,22],[11,23]);const food=game.run('s.food');game.choose('返事の下絵を渡す');
  assert.equal(game.run('s.food'),food+3);game=resume(game);
  visit(game,[11,22],[11,23]);assert(!game.choices().includes('返事の下絵を渡す'));
  visit(game,[10,24],[11,24]);assert(body(game).includes(scene));
  assert.equal(game.run('s.errands.print'),ending);assert.equal(game.run('Object.keys(s.evidence).length'),0);
 });
}
test('kiln can be solved before meeting the potter, with both levers surviving a reload',()=>{
 let game=setup();game.run('s.enemies=[]');
 visit(game,[166,38],[165,38]);assert(body(game).includes('燕の板を立て'));
 visit(game,[169,46],[170,46]);game.choose('板を寝かせる');
 game=resume(game);visit(game,[169,46],[170,46]);assert(game.choices().includes('板を立てる'));game.choose('板を立てる');
 assert(!game.run("s.opened.includes('kiln-shutter')"));
 visit(game,[164,44],[164,43]);game.choose('板を立てる');
 visit(game,[169,46],[170,46]);game.choose('板を寝かせる');assert(body(game).includes('持ち上がった'));
 game=resume(game);assert(game.run("s.opened.includes('kiln-shutter')"));
 visit(game,[165,58],[165,59],'g-get');game.choose('両手碗を包む');game=resume(game);
 game.button('journal');game.choose('寄り道');assert(body(game).includes('両手碗を預かっている'));
 visit(game,[128,21],[128,22]);const gold=game.run('s.gold');game.choose('両手碗を渡す');
 assert.equal(game.run('s.gold'),gold+14);game=resume(game);
 visit(game,[128,21],[128,22]);assert(!game.choices().includes('両手碗を渡す'));
 visit(game,[127,23],[128,23]);assert(body(game).includes('青い碗に筆が二本'));
 assert.equal(game.run('s.errands.cup'),'home');assert.equal(game.run('Object.keys(s.evidence).length'),0);
});
test('finished main story can start the potter errand and keep its ending',()=>{
 const old=require('./dist/engine').fresh();old.flags.finalEnding='seal';old.evidence={water:true,stone:true,wind:true};
 const game=setup(old);game.run('s.enemies=[]');
 visit(game,[128,21],[128,22]);game.choose('両手碗の話を聞く');assert(body(game).includes('燕の道しるべ'));
 const saved=resume(game);assert(saved.run("s.errands.cupAsked&&s.flags.finalEnding==='seal'&&Object.keys(s.evidence).length===3"));
});
console.log(JSON.stringify({passed}));
