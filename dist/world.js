/* Original world, characters and dialogue for Yuris. Coordinates retain v0.2 saves. */
(function(root){'use strict';
const buildings=[
 {id:'smithhouse',x:4,y:14,w:6,h:6,door:[6,19],name:'鍛冶工房',roof:'#92533c'},
 {id:'library',x:8,y:6,w:8,h:7,door:[11,12],name:'書斎',roof:'#665e83'},
 {id:'innhouse',x:13,y:22,w:7,h:7,door:[16,28],name:'旅人の宿',roof:'#8d673f'},
 {id:'millhouse',x:52,y:13,w:9,h:8,door:[56,20],name:'リーネの食堂',roof:'#a56842'},
 {id:'bowhouse',x:65,y:14,w:9,h:7,door:[69,20],name:'弓師の家',roof:'#6b7650'},
 {id:'archives',x:83,y:5,w:12,h:11,door:[89,15],name:'水鏡修道院',roof:'#687d89'},
 {id:'harborinn',x:51,y:49,w:10,h:8,door:[56,56],name:'港の宿',roof:'#8b6048'},
 {id:'harborshop',x:65,y:49,w:9,h:8,door:[69,56],name:'航海商店',roof:'#76648b'},
 {id:'mine',x:91,y:47,w:14,h:15,door:[97,61],name:'廃鉱の作業場',roof:'#665953'},
 {id:'tower',x:98,y:68,w:10,h:10,door:[102,77],name:'潮鳴りの灯台',roof:'#6b7683'}
];
const compactBuildings=buildings.map(b=>({...b,door:[...b.door]}));
const regions=[['ノルヴィク',12,18],['リーネ村',61,24],['水鏡修道院',89,18],['風待ち港',61,59],['灰石の廃鉱',97,63],['潮鳴りの灯台',102,77]];
const inside=(x,y,b)=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h;
function compactTerrain(x,y){
 if(x<0||y<0||x>=112||y>=80)return 'water';
 if(x>=39&&x<=49&&y>=18&&y<=19)return x<=41?'road':'bridge';
 if(x<44&&y<36)return null;
 if(x<46||x>109||y<2||y>78)return 'water';
 for(const b of compactBuildings.slice(3))if(inside(x,y,b)){if(b.door[0]===x&&b.door[1]===y)return 'door';return x===b.x||y===b.y||x===b.x+b.w-1||y===b.y+b.h-1?'wall':'floor'}
 // Broad, hand-connected roads; the river is crossed at two real bridges.
 if((y===24||y===25)&&x>=48&&x<=90||(x===61||x===62)&&y>=18&&y<=60||(y===59||y===60)&&x>=48&&x<=103||(x===89||x===90)&&y>=16&&y<=60||(x===102||x===103)&&y>=60&&y<=77)return y>=37&&y<=40?'bridge':'road';
 for(const [cx,top,bottom] of [[56,20,25],[69,20,25],[89,15,25],[56,56,60],[69,56,60],[97,61,64]])if(x===cx&&y>=top&&y<=bottom)return 'road';
 if(y>=37&&y<=40)return 'water';
 if(x>=49&&x<=58&&y>=26&&y<=32)return 'field';
 if(x>=76&&x<=83&&y>=25&&y<=33)return 'orchard';
 if(x>=83&&x<=86&&y>=45&&y<=56)return 'mountain';
 if(x>=95&&y>=30&&y<=44)return 'mountain';
 if(x>=75&&x<=87&&y>=65&&y<=74)return 'water';
 if((x>=93&&y>=64)||(y>=73&&x<75))return 'sand';
 if(((x>=48&&x<=51)||(x>=76&&x<=81))&&y>=4&&y<=21)return (x+y)%4===0?'grass':'tree';
 if(x>=65&&x<=80&&y>=43&&y<=47)return (x*3+y)%5<3?'tree':'grass';
 if(x>=48&&x<=59&&y>=63&&y<=70)return (x+y)%4===0?'grass':'tree';
 if(x>=94&&y>=17&&y<=24)return (x+y)%4<2?'tree':'grass';
 if((x*7+y*13)%41===0)return 'flowers';
 return 'grass';
}
const npcs=[
{id:'mira',name:'弓師ミラ',x:69,y:18,color:'#83a26d'},
{id:'miller',name:'水車守ハル',x:56,y:18,color:'#c2a67b'},
{id:'farmer',name:'農婦リナ',x:55,y:28,color:'#cf986f'},
{id:'abbot',name:'記録官エナ',x:88,y:10,color:'#a9b9bd'},
{id:'pilgrim',name:'巡礼の老人',x:91,y:18,color:'#b5aa84'},
{id:'captain',name:'船大工ダン',x:64,y:61,color:'#638ca6'},
{id:'trader',name:'商人マル',x:69,y:53,color:'#a27cab'},
{id:'host',name:'宿主ベル',x:55,y:53,color:'#c79065'},
{id:'miner',name:'鉱夫ガル',x:97,y:64,color:'#b7aa8c'},
{id:'noa',name:'ノア',x:94,y:55,color:'#8dc5c1',kind:'golem'},
{id:'lighthouse',name:'灯台守の記録',x:104,y:70,color:'#a7d9d1',kind:'golem'}
];
const night={mira:[67,16],miller:[54,15],farmer:[58,16],abbot:[91,7],captain:[57,53],trader:[70,51],host:[53,51],miner:[95,49]};
const objects=[
{id:'eastsign',x:48,y:19,type:'sign',name:'街道の道標',text:'東へ リーネ村。北東へ 水鏡修道院。南へ 風待ち港。\n同じ空の下、道はどこへでも続いている。'},
{id:'villagesign',x:63,y:24,type:'sign',name:'リーネ村の道標',text:'北西：食堂／北東：弓師。東の街道は修道院、南の街道は港へ。'},
{id:'portsign',x:63,y:59,type:'sign',name:'港の案内板',text:'西：旅人の宿。北東：航海商店。東：廃鉱。南東：潮鳴りの灯台。'},
{id:'abbeybook',x:85,y:8,type:'book',name:'水鏡の年代記',topic:'三つの証',text:'「水の記憶は人が伝え、石の記憶は機霊が守り、風の記憶は潮を数える。三つを灯台で重ねよ。」\n頁の端に、鐘は『夕べ、暁、正午』とある。'},
{id:'abbeybell',x:91,y:12,type:'bell',name:'三音の鐘',action:'bells'},
{id:'abbeychest',x:92,y:8,type:'chest',name:'修道院の箱',loot:{moon_ring:1,herbs:2},locked:true},
{id:'millbook',x:54,y:16,type:'book',name:'水車守の日記',topic:'水の記憶',text:'「水車が止まった時、川は上流でなく海へ逆らって鳴った。あの灯台と同じ、三つの音だった。」\nハルに『水の記憶』を尋ねてみよう。'},
{id:'millwheel',x:59,y:22,type:'wheel',name:'止まった水車',action:'waterwheel'},
{id:'villagesupply',x:58,y:17,type:'chest',name:'村の備蓄箱',loot:{food:3,arrows:12},owned:true},
{id:'bowchest',x:71,y:16,type:'chest',name:'ミラの旅支度',loot:{bow:1,leather:1,arrows:24},permission:'mira'},
{id:'minelever',x:93,y:59,type:'lever',name:'鉱道の通気レバー',action:'vent'},
{id:'minecart',x:96,y:57,type:'cart',name:'線路を塞ぐトロッコ',solid:true,movable:true,text:'古い車輪はまだ動く。隣から押せそうだ。'},
{id:'minecache',x:101,y:49,type:'chest',name:'鉱夫の道具箱',loot:{axe:1,chainmail:1,crystal:2}},
{id:'minebook',x:94,y:51,type:'book',name:'鉱山監督の手紙',topic:'石の記憶',text:'「採掘を止めたのは獣のせいではない。眠る機霊が『下で誰かが待っている』と繰り返すからだ。通気口を開けば声を聴ける。」'},
{id:'portletter',x:58,y:51,type:'book',name:'航海日誌',topic:'風の記憶',text:'「灯台は夜にだけ呼ぶ。風待ち港の船大工ダンは、父から潮の数え方を受け継いだ。彼に風の記憶を尋ねよ。」'},
{id:'portchest',x:71,y:54,type:'chest',name:'商店の倉庫',loot:{longbow:1,ward_charm:1},owned:true,locked:true},
{id:'beachcache',x:94,y:69,type:'chest',name:'砂に埋もれた小箱',loot:{spear:1,silver_ring:1,arrows:18}},
{id:'lighthousecore',x:102,y:72,type:'altar',name:'灯台の共鳴器',action:'final'},
{id:'roadcamp',x:65,y:34,type:'camp',name:'川辺の野営地',action:'camp'},
{id:'southcamp',x:90,y:64,type:'camp',name:'岬の野営地',action:'camp'},
{id:'villagewell',x:59,y:24,type:'well',name:'村の井戸',action:'well'},
{id:'portwell',x:60,y:58,type:'well',name:'港の井戸',action:'well'}
];
// Furnish every new interior; books and furniture are tangible targets.
for(const b of buildings.slice(3)){
 for(const [suffix,dx,dy,type,solid]of [['table',2,3,'table',true],['chair',2,4,'chair',false],['bed',b.w-3,2,'bed',true],['lamp',1,1,'lamp',false]]){
 const x=b.x+dx,y=b.y+dy;if(objects.some(o=>o.x===x&&o.y===y)||npcs.some(n=>n.x===x&&n.y===y))continue;
 objects.push({id:b.id+'-'+suffix,x,y,type,solid,name:{table:'食器の並ぶ机',chair:'木の椅子',bed:'旅人の寝台',lamp:'霊灯'}[type],text:type==='bed'?'よく手入れされた寝台だ。宿の主人に頼めば一晩休める。':'使い込まれた暮らしの道具。ここで人が生活している。'});
 }
}
const foes=[
['roadwolf',75,23,24,4,'wolf'],['forestwolf',72,45,28,5,'wolf'],['mineguard',99,54,50,6,'golem'],['minewolf',100,58,25,4,'wolf'],['coastguard',99,66,44,5,'golem'],['marshwolf',52,68,30,5,'wolf']
].map(([id,x,y,hp,atk,type])=>({id,x,y,hp,max:hp,atk,type}));
// Insert wilderness between intact settlements. Never scale buildings or sprites.
const W=232,H=168;
function expandPoint(p){return {...p,x:p.x+(p.x>=78?120:p.x>=46?64:0),y:p.y+(p.y>=65?88:p.y>=37?56:0)}}
function compactPoint(x,y){
 if(x>=46&&x<110||x>=142&&x<198||y>=37&&y<93||y>=121&&y<153)return null;
 return {x:x-(x>=198?120:x>=110?64:0),y:y-(y>=153?88:y>=93?56:0)};
}
for(const list of [buildings,npcs,objects,foes])for(const item of list){const p=expandPoint(item);item.x=p.x;item.y=p.y;if(item.door){const d=expandPoint({x:item.door[0],y:item.door[1]});item.door=[d.x,d.y]}}
for(const r of regions){const p=expandPoint({x:r[1],y:r[2]});r[1]=p.x;r[2]=p.y}
for(const [id,[x,y]]of Object.entries(night)){const p=expandPoint({x,y});night[id]=[p.x,p.y]}
// v0.5: the far bank no bridge reaches. A hermit's hut and a rock massif whose
// carved tunnels form the underground. Reached only by river skiff.
const hut={id:'hermithut',x:24,y:38,w:7,h:6,door:[27,43],name:'隠者の庵',roof:'#5f6f5a'};
const carve=[[21,50,21,54],[17,54,25,57],[9,56,17,56],[7,54,11,60],[25,55,31,55],[30,53,35,58],[21,57,21,62],[15,62,27,65],[27,64,33,64],[31,62,35,70],[8,63,15,63],[7,63,11,70]];
function caveTerrain(x,y){if(x<5||x>37||y<50||y>72)return null;return carve.some(([a,b,c,d])=>x>=a&&x<=c&&y>=b&&y<=d)?'cave':'rock'}
function under(x,y){return caveTerrain(x,y)==='cave'}
buildings.push(hut);regions.push(['離れ野',22,47]);
function terrain(x,y){
 if(x<2||y<2||x>=W-2||y>=H-1)return 'water';
 const cave=caveTerrain(x,y);if(cave)return cave;
 if(inside(x,y,hut))return hut.door[0]===x&&hut.door[1]===y?'door':x===hut.x||y===hut.y||x===hut.x+hut.w-1||y===hut.y+hut.h-1?'wall':'floor';
 if(x<44&&y<36)return compactTerrain(x,y);
 const old=compactPoint(x,y),t=old?compactTerrain(old.x,old.y):null;
 // Keep every previously walkable tile, interior, and object in its local setting.
 if(t&&t!=='water')return t==='bridge'?'road':t;
 const road=((y===18||y===19)&&x>=39&&x<=125)||((y===24||y===25)&&x>=110&&x<=210)||((x===125||x===126)&&y>=18&&y<=116)||((x===209||x===210)&&y>=16&&y<=116)||((y===115||y===116)&&x>=110&&x<=224)||((x===222||x===223)&&y>=116&&y<=165);
 const river=(x>=43&&x<=46&&y<75)||(y>=75&&y<=78); // v0.5: the two rivers now meet
 if(road)return river?'bridge':'road';
 if(river)return 'water';
 if(x>=195&&x<=207&&y>=153&&y<=162)return 'water';
 if(x>=224&&y>=120||y>=159&&x<180)return 'sand';
 // Woodland has broad clear lanes; ridges and lakes create route choices.
 if(x>=162&&x<=171&&y>=35&&y<=63)return 'mountain';
 if(x>=68&&x<=83&&y>=4&&y<=13)return 'water';
 if(x>=150&&x<=178&&y>=129&&y<=143)return (x+y)%6<4?'mountain':'stone';
 const forest=(x>=56&&x<=85&&y>=27&&y<=59)||(x>=146&&x<=185&&y>=6&&y<=18)||(x>=137&&x<=158&&y>=88&&y<=106)||(x>=187&&x<=204&&y>=130&&y<=148);
 if(forest&&x%9!==0&&y%8!==0)return (x*7+y*3)%5<3?'tree':'grass';
 if(y>=82&&y<=91&&x>=90&&x<=185)return (x+y)%13===0?'flowers':'marsh';
 if((x*7+y*13)%23===0)return 'flowers';
 return 'grass';
}
const wildernessFoes=[
 ['plains-wolf-a',57,18,22,4,'wolf'],['plains-wolf-b',63,21,22,4,'wolf'],
 ['lake-wolf',79,18,26,4,'wolf'],['old-road-guard',99,19,36,5,'golem'],
 ['grove-wolf-a',58,39,26,4,'wolf'],['grove-wolf-b',75,48,26,4,'wolf'],
 ['abbey-wolf-a',153,24,28,5,'wolf'],['abbey-wolf-b',157,28,24,4,'wolf'],
 ['ridge-guard',181,25,38,5,'golem'],['ridge-wolf',184,32,28,4,'wolf'],
 ['south-wolf-a',125,47,25,4,'wolf'],['south-wolf-b',131,51,25,4,'wolf'],
 ['river-guard',125,72,36,5,'golem'],['marsh-wolf-a',121,87,26,4,'wolf'],
 ['marsh-wolf-b',129,90,26,4,'wolf'],['port-road-guard',125,101,38,5,'golem'],
 ['abbey-road-wolf',209,48,28,5,'wolf'],['east-river-guard',209,72,40,5,'golem'],
 ['mine-road-wolf-a',155,115,28,5,'wolf'],['mine-road-wolf-b',163,119,28,5,'wolf'],
 ['mine-road-guard',185,115,42,5,'golem'],['cape-wolf',222,135,30,5,'wolf'],
 ['cape-guard',222,151,44,5,'golem'],['south-grove-wolf',198,139,28,5,'wolf']
].map(([id,x,y,hp,atk,type])=>({id,x,y,hp,max:hp,atk,type}));
objects.push(
 {id:'plainscamp',x:88,y:23,type:'camp',name:'大草原の野営地',action:'camp'},
 {id:'rivercamp',x:120,y:64,type:'camp',name:'渡し場の野営地',action:'camp'},
 {id:'ridgecamp',x:173,y:29,type:'camp',name:'尾根の野営地',action:'camp'},
 {id:'mine-road-camp',x:174,y:111,type:'camp',name:'鉱山街道の野営地',action:'camp'},
 {id:'plainsway',x:49,y:20,type:'sign',name:'大草原の道標',text:'東：風渡りの大草原を越えてリーネ村。\n道中は獣や機霊がいる。姿が見えたら隊列を止めて戦おう。'},
 {id:'riverway',x:127,y:68,type:'sign',name:'蒼の川の道標',text:'北：リーネ村。南：橋と湿原を越えて風待ち港。\n西岸の焚き火で休み、食料と矢を確かめよう。'}
);
const caveFoes=[['cave-beast-a',19,56,30,5,'wolf'],['cave-guard-a',33,56,46,6,'golem'],['cave-beast-b',18,64,32,6,'wolf'],['cave-beast-c',24,63,32,6,'wolf'],['cave-guard-b',33,65,54,7,'golem']].map(([id,x,y,hp,atk,type])=>({id,x,y,hp,max:hp,atk,type}));
npcs.push({id:'hermit',name:'隠者トウ',x:26,y:40,color:'#9aa07c',isle:true});
// Evening gatherings: after dusk some people sit at a table before going to bed.
const evening={farmer:[119,17],captain:[120,111]};
objects.push(
 {id:'ring-norvik',x:10,y:21,type:'stones',name:'霊流の環',action:'ring',place:'ノルヴィク'},
 {id:'ring-liene',x:124,y:22,type:'stones',name:'霊流の環',action:'ring',place:'リーネ村'},
 {id:'ring-abbey',x:212,y:20,type:'stones',name:'霊流の環',action:'ring',place:'水鏡修道院'},
 {id:'ring-port',x:123,y:118,type:'stones',name:'霊流の環',action:'ring',place:'風待ち港'},
 {id:'ring-tower',x:220,y:152,type:'stones',name:'霊流の環',action:'ring',place:'潮鳴りの岬'},
 {id:'ring-isle',x:33,y:46,type:'stones',name:'霊流の環',action:'ring',place:'離れ野',isle:true},
 {id:'ferrysign',x:122,y:73,type:'sign',name:'渡し場の立て札',text:'川舟は風待ち港の船大工ダンのもの。借りたい者は港で「舟」と尋ねること。\n舟は橋の下をくぐれる。川を西へ下ると、橋のかからない岸「離れ野」がある。'},
 {id:'rod',x:119,y:65,type:'rod',name:'釣り竿',take:{rod:1},text:'旅人が置いていった釣り竿。水辺で使えば魚が釣れる。'},
 {id:'bread',x:16,y:25,type:'bread',name:'焼きたてのパン',take:{food:1},owned:true,text:'宿の食卓のパン。黙って取れば、町の信用が下がる。'},
 {id:'coil',x:127,y:118,type:'rope',name:'古いロープ',take:{rope:1},text:'船をつなぐための丈夫なロープ。'},
 {id:'pick',x:213,y:108,type:'pick',name:'つるはし',take:{pick:1},text:'鉱夫のつるはし。崩れた岩を砕ける。'},
 {id:'islesign',x:41,y:44,type:'sign',name:'離れ野の舟着き',isle:true,text:'西：隠者の庵。南：岩山の口。\n岩山の中は昼でも暗い。松明か灯火の術を。'},
 {id:'hermitbook',x:28,y:39,type:'book',name:'隠者の覚え書き',isle:true,topic:'地下',text:'「岩山の地下には、灰石の鉱夫より古い坑道がある。崩れた岩はつるはしで、裂け目はロープで越えよ。奥で、まだ誰かが待っている。」'},
 {id:'huttorch',x:25,y:41,type:'torch',name:'松明の束',take:{torches:2},isle:true,text:'油を染ませた松明。'},
 {id:'cave-rubble',x:21,y:60,type:'rubble',name:'崩れた岩',solid:true,action:'rubble',isle:true},
 {id:'cave-chasm',x:30,y:64,type:'chasm',name:'深い裂け目',solid:true,action:'chasm',isle:true},
 {id:'cavechest-a',x:8,y:55,type:'chest',name:'坑夫の置き箱',loot:{torches:2,herbs:3},isle:true},
 {id:'cavebook',x:10,y:59,type:'book',name:'煤けた日誌',isle:true,topic:'地下',text:'「掘り進むほど、石が歌う。下の広間の機霊は、我らが去ったあとも灯りを絶やさぬと約束した。」'},
 {id:'cavechest-b',x:34,y:54,type:'chest',name:'守りの間の箱',loot:{ironshield:1,arrows:20},isle:true},
 {id:'cavechest-c',x:8,y:69,type:'chest',name:'水のしたたる箱',loot:{crystalstaff:1,crystal:2},isle:true},
 {id:'deepcore',x:33,y:68,type:'altar',name:'地下の霊核',action:'deepcore',isle:true}
);
function migrate(s){
 const previous=s.worldVersion||0;
 if(!previous){s.enemies.push(...foes.map(e=>{const p=compactPoint(e.x,e.y);return {...e,...p}}));s.arrows??=30;s.torches??=2;s.rope??=0;s.reputation??=0;s.heard??=['機霊','霊灯'];s.visited??=['ノルヴィク'];s.lightUntil??=0;s.turnStart??=s.turn;}
 if(previous<4){
  const move=p=>{if(p&&Number.isInteger(p.x)&&Number.isInteger(p.y)){const next=expandPoint(p);p.x=next.x;p.y=next.y}};
  move(s);s.party.forEach(move);s.enemies.forEach(move);(s.dropped||[]).forEach(move);Object.values(s.moved||{}).forEach(move);Object.values(s.npcPositions||{}).forEach(move);
  for(const key of ['openedDoors','seen'])if(s[key])s[key]=Object.fromEntries(Object.entries(s[key]).map(([k,v])=>{const [x,y]=k.split(',').map(Number),p=expandPoint({x,y});return [p.x+','+p.y,v]}));
  s.enemies.push(...wildernessFoes.filter(e=>!s.enemies.some(q=>q.id===e.id)).map(e=>({...e})));
  s.worldVersion=4;s.log.unshift('街道の先に広い草原と森が続く。敵を見つけたら戦闘になる。');
 }
 if((s.worldVersion||0)<5){
  s.enemies.push(...caveFoes.filter(e=>!s.enemies.some(q=>q.id===e.id)).map(e=>({...e})));
  for(const p of [s,...s.party,...s.enemies])if(p&&p.y===74&&p.x>=43&&p.x<=46)p.x=47; // strip that became river
  s.worldVersion=5;s.log.unshift('古い立ち石「霊流の環」が目を覚ました。風待ち港の船大工は川舟を直しているらしい。');
 }
 s.rings??={};s.rod??=0;s.pick??=0;s.bench??={};s.boat??={x:121,y:75};s.aboard??=false;
 s.moved??={};s.heard??=[];s.evidence??={};s.visited??=[];s.containers??={};s.notes??=[];
}
function location(x,y){
 if(x<44&&y<36)return x>31&&y<13?'忘れられた霊堂':x>21?'東の森':'ノルヴィク';
 if(x<43&&y>=36&&y<75)return under(x,y)?'離れ野の地下坑道':'川向こうの離れ野';
 if(x>=211&&y>=156)return '潮鳴りの灯台';
 if(x>=211&&y>=103&&y<=120)return '灰石の廃鉱';
 if(x>=202&&y<22)return '水鏡修道院';
 if(x>=113&&x<=139&&y>=104&&y<=120)return '風待ち港';
 if(x>=113&&x<=139&&y>=12&&y<=33)return 'リーネ村';
 if(y>=73&&y<=80)return '蒼の川・渡り橋';
 if(y>=81&&y<=96)return '蒼の湿原';
 if(y>=121)return '潮風の荒野';
 if(y>=100)return '鉱山へ続く草原';
 if(x>=142&&y<35)return '白樺の街道';
 if(x>=56&&x<=85&&y>=27&&y<=59)return 'さざめきの森';
 if(y>=35)return '南の大平原';
 return '風渡りの大草原';
}
root.WorldData={under,evening,caveFoes,hut,W,H,terrain,buildings,regions,npcs,objects,night,migrate,location,expandPoint,wildernessFoes};if(typeof module!=='undefined')module.exports=root.WorldData;
})(typeof window==='undefined'?globalThis:window);
