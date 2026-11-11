/* Systems and the open-ended Three Memories chapter. */
(()=>{'use strict';
const oldTalk=talk,oldInspect=inspect,oldRender=render,oldInteraction=interaction,oldDirection=directional;
let spell='bolt',usedItem=null,conversation=false;
const $items=Gear.items;
const names={food:'食料',herbs:'薬草',arrows:'矢',crystal:'霊晶',wood:'木材',parts:'部品',keys:'調律片',torches:'松明',rope:'ロープ'};
const keywordList=['三つの証','水の記憶','石の記憶','風の記憶','灯台','鉱山','水車','機霊','霊灯','鐘'];
function note(title,text){for(const key of keywordList)if(text.includes(key)&&!s.heard.includes(key))s.heard.push(key);if(!s.notes.some(n=>n.title===title&&n.text===text))s.notes.push({title,text});save()}
function rewardEvidence(key,label){
 if(s.evidence[key])return false;
 s.evidence[key]=true;
 s.gold+=10;
 E.say(s,label+'を手に入れた。謝礼10枚。');
 note(label,'「'+label+'」を受け取った。潮鳴りの灯台で三つの証を重ねられる。');
 return true;
}
function show(title,text,choices=[],isTalk=false){conversation=isTalk;$('modal').classList.toggle('conversation',isTalk);modal(title,text,choices)}
function tell(n,topic,text,after){note(n.name+' / '+topic,text);show(n.name,text,[['話を続ける',()=>{after?.();talk(n)}]],true)}
function obtain(id,qty=1){if($items[id])return Gear.add(s,id,qty);s[id]=(s[id]||0)+qty;return true}
function shop(n,stock){if(E.isNight(s)){show(n.name,'「店は朝に開けるよ。宿か、安全な場所で夜を明かしておいで」',[['話す',()=>talk(n)],['別れる',close]]);return}
 const list=stock.map(entry=>{const [id,basePrice,qty=1]=Array.isArray(entry)?entry:[entry,$items[entry].price,1];const price=basePrice+Math.max(0,-s.reputation)*2;return [(($items[id]?.name||names[id])+(qty>1?' ×'+qty:'')+'　'+price+'G'),()=>{if(s.gold<price){show(n.name,'金貨が足りない。',[['品物に戻る',()=>shop(n,stock)]]);return}if(!obtain(id,qty)){show(n.name,'荷物が重すぎる。仲間に渡すか、置く物を選ぼう。',[['戻る',()=>shop(n,stock)]]);return}s.gold-=price;E.say(s,($items[id]?.name||names[id])+'を買った。');shop(n,stock)}]});show(n.name+' / 商い',`金貨 ${s.gold}G。装備は「アイテム」で仲間ごとに身につけられる。`,[...list,['別れる',close]])}
const dialogue={
 mira:{intro:'「枝の向こうに動く影を見たら、まず射線を見る。矢を放つのは、それからよ」',job:'狩りと弓作り。弓と矢が要るなら、奥の旅支度の箱を使って。村の外へ行く人のために置いているの。',info:'水車が止まってから、獣が街道に下りてくる。東の修道院の鐘も、夜中にひとりで鳴るのよ。',topics:{機霊:'機霊を射つ前に、声を聴いて。水車が止まった日、機霊は逃げる子どもを守っていた。',水車:'水車守ハルは食堂にいる。戸の外の車輪を調べれば、何が折れたか分かるはず。'}},
 miller:{intro:'「水車が止まって、粉が挽けない。旅人にパンも出せないとは情けない」',job:'水車守のハルだ。車輪の軸受けが折れた。部品一つか木材二つで応急修理できる。',info:'昔から村には水の記憶が伝わる。灯台で海の音が消えた時、その意味が分かるだろう。',topics:{'水の記憶':'祖父は、川が三度さかのぼる夜に、灯台の守りが揺らぐと言った。水車を直してくれたら、この記録を託そう。','三つの証':'水、石、風。互いを確かめるために三つに分けたそうだ。村、鉱山、修道院を訪ねるといい。'}},
 farmer:{intro:'「旅の途中かい。畑は踏んでもいいけれど、苗は抜かないでおくれ」',job:'野菜を育てて港へ運ぶの。水車が動かないと、小麦が余ってしまう。',info:'北東の水鏡修道院では古い本を読める。西のノルヴィクには機霊の声を聴く子がいるそうね。',topics:{水車:'水車の軸が折れただけなら木でも支えられる。鍛冶屋さんなら木を分けてくれるんじゃない？'}},
 abbot:{intro:'「ここに答えがあるとは限らない。でも、問いの立て方は残されている」',job:'記録官エナです。年代記の写しと、古い霊術を伝えています。',info:'灯台を起こすには三つの証。水は村、石は鉱山、風はこの鐘に残っています。',topics:{'三つの証':'一つの証だけで装置が動けば、間違いも一人で決められてしまう。古い人々はそれを恐れたのでしょう。','風の記憶':'鐘は三つの時を記憶しています。年代記の端の書き込みを読んでください。','鐘':'三つの音を正しい順で鳴らすと、記録が浮かび上がります。順を外しても壊れません。'}},
 pilgrim:{intro:'「道に迷ったのかね。それとも、迷うために旅をしているのかね」',job:'用事を終えた後も歩いている。寄り道で見つけたもののほうを覚えているものだ。',info:'南の港に宿がある。夜なら眠って朝を待つといい。弓を使うなら矢を買い忘れずにな。',topics:{灯台:'港の東、廃鉱を過ぎて南へ。潮鳴りの灯台は岬の先だ。海へ出る必要はない。'}},
 captain:{intro:'「船は修理中さ。急ぐなら東の街道から岬へ回れる」',job:'船大工ダン。父は灯台守だった。形見の日誌が宿に残っている。',info:'風の記憶？ 父は、夕べの鐘、暁の鐘、正午の鐘、と歌っていた。修道院にその鐘がある。',topics:{'風の記憶':'「夕べ、暁、正午」。日は巡るだけじゃない。いつの記憶かを照らし合わせる合図なんだ。','灯台':'三つの証が揃えば、灯台の共鳴器に使える。すべてを止めるか、声をつなぐか。選ぶのは君だ。','鉱山':'廃鉱は港から東だ。鉱夫ガルが通気口のレバーを探している。'}},
 trader:{intro:'「長旅には、良い装備と一本余分な矢。どちらも命を救うよ」',job:'武具と旅道具を扱っている。仲間ごとに武器、防具、盾、装飾品を選ぶといい。',info:'弓と戦斧は両手がふさがる。盾を使いたければ剣か槍だ。杖と首飾りは霊術を強くする。',topics:{'鉱山':'鉱夫の道具箱には昔の鎧があるそうだ。買うばかりが装備を得る方法じゃない。'}},
 host:{intro:'「波の音で眠れる宿だよ。朝には焼きたてのパンを出そう」',job:'港の宿を預かっているベル。宿泊は5枚で全員分。食料も売っている。',info:'窓辺の航海日誌を読んだかい。船大工ダンの父親が残したものだ。風の記憶について書かれている。',topics:{'風の記憶':'灯台守が残した言葉は、息子のダンに聞くといい。南の波止場にいるよ。'}},
 miner:{intro:'「奥にいる機霊を助けたい。だが守護機が通してくれないんだ」',job:'鉱夫のガルだ。南の入口を入って左側に、通気口のレバーがある。まずそれを引いてくれ。',info:'石の記憶は、奥の機霊が守っている。守護機は調律片を示せば道をあけるかもしれない。',topics:{'石の記憶':'採掘を止めた日に、あの機霊だけは逃げなかった。「まだ下に誰かいる」と言い続けていた。','機霊':'壊れたのかと思った。でも俺には、約束を守っているように見えたよ。'}},
 noa:{intro:'《……声が、届く。君にも、聞こえるのか》',job:'《僕はノア。記憶を渡すために、ここに残った》',info:'《石の記憶を、灯台へ。水と風の記憶を重ねれば、過去の命令と今の声を比べられる》',topics:{'石の記憶':'《命令は「守れ」だった。守る相手が去っても、命令だけが残った。それを変えるには、今の声が必要なんだ》','三つの証':'《三つを重ねるのは、正解を選ぶためではない。誰か一人が、すべてを決めないため》'}},
 lighthouse:{intro:'《三つの記録を照合せよ。過去の命令だけでは、現在を判定できない》',job:'《私は、この海岸へ流れる霊流を保つ》',info:'《水、石、風。その三つの証を、この共鳴器へ》',topics:{灯台:'《封じれば静けさが戻る。つなげば、他の機霊にも今の声が届く》'}}
};
function millerDirections(){
 if(s.flags.finalEnding)return '灯台の知らせは、この村にも届いたよ。旅の話を聞かせてくれ。';
 const places=[];
 if(!s.evidence.stone)places.push('石の証は灰石の廃鉱に');
 if(!s.evidence.wind)places.push('風の証は水鏡修道院に');
 return places.length ? places.join('、')+'あるよ。' : '三つの証がそろったね。潮鳴りの灯台の共鳴器に重ねておくれ。';
}
function dialogueFor(id){
 const entry=dialogue[id];
 if(id!=='miller'||!s.flags.waterwheel)return entry;
 const next=millerDirections();
 return {
  ...entry,
  intro:'「よく挽けているだろう。君に託した水の記憶は、祖父の代から村で守ってきたものだ。'+next+'」',
  job:'水車守のハルだ。君が直してくれた軸受けに油を差して、石臼を回しているよ。',
  info:next,
  topics:{...entry.topics,水車:'ほら、石臼の音が聞こえるだろう。もう村で小麦を挽けるよ。',
   水の記憶:'祖父は、川が三度さかのぼった晩の音を書き留めたんだ。君に託した「水の証」がその記録だよ。'+next,
   水の証:next,三つの証:next}
 };
}
talk=function(n){
 if(!dialogue[n.id]){conversation=true;$('modal').classList.add('conversation');oldTalk(n);const choices=$('choices');
 if(n.id==='smith'&&!s.flags.borrowedBow){let loan=document.createElement('button');loan.textContent='弓と矢を借りる';loan.onclick=()=>{if(Gear.add(s,'bow')){s.flags.borrowedBow=true;s.arrows+=12;tell(n,'旅の弓','旅に使いな。矢も12本つけておく。アイテムから弓を装備して、敵との距離を保つんだ。');save()}};choices.append(loan)}if(n.id==='smith'){let b=document.createElement('button');b.textContent='武器・防具を買う';b.onclick=()=>shop(n,['sword','spear','axe','leather','chainmail','shield','ironshield']);choices.append(b)}
 if(n.id==='celes'){let b=document.createElement('button');b.textContent='東の街道';b.onclick=()=>tell(n,'東の街道','東の石橋を越えるとリーネ村よ。その東には水鏡修道院、南には風待ち港。灯台に残る三つの証を調べたいの。');choices.append(b)}return;
 }
 const receivedWater=n.id==='miller'&&s.flags.waterwheel&&rewardEvidence('water','水の証');
 const d=dialogueFor(n.id),c=[['名前・仕事',()=>{if(n.id==='mira')s.flags.mira=true;tell(n,'仕事',d.job)}],['この土地',()=>tell(n,'この土地',d.info)]];
 for(const [k,text] of Object.entries(d.topics))if(s.heard.includes(k)||d.intro.includes(k)||k==='機霊')c.push([k,()=>tell(n,k,text)]);
 if(n.id==='mira')c.push(['弓と矢を買う',()=>shop(n,['bow','longbow','leather',['arrows',4,12]])],['旅支度を借りる',()=>{s.flags.mira=true;tell(n,'旅支度','奥の箱に弓、革の鎧、矢を用意した。使ってちょうだい。弓は5マス届くけれど、木や壁の向こうには当たらない。')}]);
 if(n.id==='trader')c.push(['品物を見る',()=>shop(n,['longbow','plate','crystalstaff','moon_ring','silver_ring','ward_charm','spirit_charm','herb_charm',['arrows',4,12],['herbs',3,2],['parts',4,1],['wood',3,2],['rope',6,1],['torches',2,2]])]);
 if(n.id==='abbot')c.push(['霊術の道具を買う',()=>shop(n,['staff','robe','moon_ring','spirit_charm',['herbs',3,2]])]);
 if(n.id==='host'||n.id==='miller')c.push(['食料・薬草',()=>shop(n,[['food',3,3],['herbs',3,2],['parts',4,1],['wood',3,2]])]);
 if(n.id==='host')c.push(['宿泊する　5G',()=>{if(s.combat.active||s.gold<5){show(n.name,'今は泊まれないようだね。',[['戻る',()=>talk(n)]]);return}s.gold-=5;s.party.forEach(p=>{p.hp=p.max;p.mp=Gear.stats(p).maxmp});s.turn+=320-s.turn%320;E.say(s,'波音を聴きながら眠り、朝を迎えた。');close()}]);
 if(n.id==='noa'&&s.flags.vent)c.push(['記憶を託して',()=>{rewardEvidence('stone','石の証');if(!s.party.some(p=>p.id==='noa')&&!s.bench?.noa){s.party.push({id:'noa',name:'ノア',role:'記憶の機霊',x:n.x,y:n.y,hp:36,max:36,mp:10,atk:6});Gear.ensure(s);s.party.at(-1).gear.weapon='staff';s.party.at(-1).pack.staff=1;}tell(n,'石の証','《君たちと行こう。命令の続きを、僕自身で選びたい》')}]);
 c.push(['別れる',close]);let intro=d.intro;
 if(receivedWater)intro='「聞こえるかい、石臼の音だ。ありがとう。約束の記録を君に託そう」\n水の証と謝礼の金貨10枚を受け取った。\n'+millerDirections();
 if(n.id==='noa'&&!s.flags.vent)intro='《……空気……通気口……声が……届かない》';if(s.flags.finalEnding)intro+='\n'+(s.flags.finalEnding==='connect'?'遠くの機霊の声が、穏やかに重なっている。':'潮鳴りが静まり、人の暮らしの音が戻っている。');show(n.name,intro,c,true);
};
inspect=function(o){
 if(o.key||!E.World.objects.some(a=>a.id===o.id)){oldInspect(o);return}
 if(s.combat.active){log('戦いが終わってから調べよう。');return}
 const back=[['閉じる',close]];
 if(o.loot){if(o.permission&&!s.flags[o.permission])return show(o.name,'持ち主の旅支度だ。ミラに話してみよう。',back);if(o.locked&&!s.containers[o.id]?.unlocked&&!s.keys)return show(o.name,'鍵がかかっている。調律片で開けられそうだ。',back);const state=s.containers[o.id]??={taken:[]};const items=Object.entries(o.loot).filter(([k])=>!state.taken.includes(k));if(!items.length)return show(o.name,'中は空だ。',back);show(o.name,(o.owned?'誰かの持ち物だ。無断で取ると町の信用が下がる。\n':'')+'中の物を選んで取り出す。',items.map(([id,qty])=>[($items[id]?.name||names[id])+' ×'+qty,()=>{if(!obtain(id,qty)){log('荷物が重すぎる。仲間に分けよう。');return}state.taken.push(id);if(o.owned){s.reputation--;E.say(s,'無断で持ち出した。町の信用が下がった。')}inspect(o)}]).concat(back));return}
 if(o.action==='waterwheel'){if(s.flags.waterwheel)return showRunningMill();show(o.name,'軸受けが折れている。部品1つか木材2つで直せそうだ。',[['部品で直す',()=>repairMill('parts',1)],['木材で直す',()=>repairMill('wood',2)],...back]);return}
 if(o.action==='vent'){s.flags.vent=true;s.enemies.filter(e=>e.id==='mineguard').forEach(e=>{if(s.keys){e.hp=0;s.flags.minePeace=true}});show(o.name,'レバーを引くと空気が通り、奥から声が届いた。\n《……僕は、ノア。誰かいるのか》',back);return}
 if(o.action==='bells'){bell([]);return}
 if(o.action==='final'){finale();return}
 if(o.action==='camp'){show(o.name,'食料を使って休み、全員の体力と霊力を回復する。',[['休息する　食料1',()=>{E.rest(s);close()}],['朝まで野営　食料2',()=>{if(s.food<2||s.combat.active||!E.rest(s)){log('安全な場所と食料2つが必要だ。');return}s.food--;s.turn+=320-s.turn%320;close()}],...back]);return}
 if(o.action==='well'){s.party.forEach(p=>p.hp=Math.min(p.max,p.hp+8));show(o.name,'冷たい水で一息ついた。全員のHPが8回復。',back);return}
 if(o.topic){if(!s.heard.includes(o.topic))s.heard.push(o.topic);note(o.name,o.text);}const choices=o.movable?[[ '押す',()=>{const dx=Math.sign(o.x-s.x),dy=Math.sign(o.y-s.y);if(!E.pushObject(s,o,dx,dy))log('その先には動かせない。反対側へ回ってみよう。');close()}],...back]:back;show(o.name,o.text||'古い暮らしの道具だ。',choices)
};
function showRunningMill(){
 const hint=s.evidence.water?'':'食堂のハルに知らせよう。';
 show('村の水車','車輪が回り、粉を挽く音が戻った。'+hint,[['閉じる',close]]);
}
function repairMill(item,qty){
 if(s.flags.waterwheel)return showRunningMill();
 if(s[item]<qty)return show('水車',item==='wood'?'木材が2つ必要だ。食堂や港の店で買える。':'部品が必要だ。食堂や港の店で買える。',[['閉じる',close]]);
 s[item]-=qty;s.flags.waterwheel=true;s.gold+=8;
 note('水車の修理','水車が回った。リーネ村の食堂でハルに報告しよう。');
 show('水車が回り始める','川の力が歯車に伝わり、村に粉を挽く音が戻った。食堂のハルに知らせよう。',[['続ける',close]]);
}
function bell(seq){if(s.evidence.wind)return show('三音の鐘','風の証は手元にある。鐘は静かに揺れている。',[['閉じる',close]]);if(seq.length===3){if(seq.join(',')==='夕べ,暁,正午'){rewardEvidence('wind','風の証');show('風の記憶','重なった音の中に、灯台守の声が浮かんだ。\n「昨日の命令だけでは、今日を守れない」',[['続ける',close]])}else show('三音の鐘','音がほどけて消えた。年代記か、港の船大工の話に手掛かりがある。',[['もう一度',()=>bell([])],['離れる',close]]);return}show('三音の鐘',`どの鐘を鳴らす？ ${seq.length}/3\n${seq.join(' → ')}`,['暁','正午','夕べ'].map(v=>[v,()=>bell([...seq,v])]).concat([['離れる',close]]))}
function finale(){const missing=[['water','水の証'],['stone','石の証'],['wind','風の証']].filter(([k])=>!s.evidence[k]);if(missing.length)return show('灯台の共鳴器','足りない記録：'+missing.map(v=>v[1]).join('、')+'。\n水は村、石は鉱山、風は修道院。人に尋ね、本を読もう。',[['閉じる',close]]);if(s.flags.finalEnding)return show('潮鳴りの灯台',s.flags.finalEnding==='connect'?'新しい声が海岸の機霊へ届いている。旅はまだ続けられる。':'装置は静かに休んでいる。旅はまだ続けられる。',[['閉じる',close]]);show('三つの記憶が重なる','ユリスは、守り続けた声を聴く。セレスは封印を読み、エドは人々の暮らしを思う。\nノア：《昔の命令を繰り返すか、今の声をつなぐか。僕は、君たちと選びたい》', [['今の声をつなぐ',()=>ending('connect')],['装置を静かに封じる',()=>ending('seal')],['今は決めない',close]])}
function ending(which){s.flags.finalEnding=which;s.gold+=30;E.say(s,'第二章「三つの記憶」を終えた。');show('第二章 / 三つの記憶',which==='connect'?'霊流を伝って、小さな返事が一つ、また一つ届く。\n機霊は命令を待つのをやめ、人々の声に耳を澄ませた。\nノア：《次は、僕たちが聞きに行こう》\n町へ戻ると、人々の言葉も変わっている。':'霊流は穏やかに閉じられ、海岸に静けさが戻った。\nノアは最後の記憶を胸に収める。\n《いつか、もう一度声をつなげる日まで》\nこの世界で、旅を続けられる。',[['旅を続ける',close]])}
function active(){return s.party.find(p=>p.id===selected)||s.party[0]}
function spellbook(){const p=active();const st=Gear.stats(p);show(p.name+' / 霊術',p.id==='ed'?'エドは霊術を使えない。剣と盾で仲間を守ろう。':`MP ${p.mp}/${st.maxmp}　術力 +${st.power}`,p.id==='ed'?[['戻る',close]]:Object.entries(Gear.spells).map(([id,sp])=>[sp.name+'　MP'+sp.mp,()=>{spell=id;spellRange=sp.range||0;show(sp.name,sp.desc,[['唱える',()=>{close();if(sp.kind==='self'){E.cast(s,selected,id);render();save()}else if(sp.kind==='ally'){show('癒し / 相手を選ぶ','射程5以内の仲間を選ぶ。',s.party.map(q=>[q.name+` HP${q.hp}/${q.max}`,()=>{E.cast(s,selected,id,q);close()}]).concat([['戻る',spellbook]]))}else{chooseMode('magic');$('targethint').textContent=sp.name+'：対象を選ぶ（射程'+sp.range+'）';}}],['戻る',spellbook]])}]).concat([['閉じる',close]]))}
$('magic').onclick=()=>{$('commandmenu').hidden=true;spellbook()};
interaction=function(x,y){if(s.combat.active&&mode==='fight'&&!E.enemy(s,x,y)){const p=active(),pos=E.position(s,p),route=E.pathFrom(s,pos.x,pos.y,x,y);if(route.length)E.moveActor(s,selected,route[0][0]-pos.x,route[0][1]-pos.y);render();save();return}if(mode==='magic'){const e=E.enemy(s,x,y);if(e){E.cast(s,selected,spell,e);render();save();return}log('霊術を使う敵を選ぼう。');return}if(mode==='use'&&usedItem){const o=E.obj(s,x,y);if(E.distance(s,{x,y})>1){log('隣まで近づいて使おう。');return}if(!o){log('ここには使えないようだ。');return}if(usedItem==='keys'&&o.locked){s.containers[o.id]??={taken:[]};s.containers[o.id].unlocked=true;chooseMode('explore');inspect(o);return}if(usedItem==='parts'||usedItem==='wood'){if(o.id==='millwheel'){repairMill(usedItem,usedItem==='wood'?2:1);return}if(o.id==='lamp'){repair(usedItem,usedItem==='wood'?2:1);return}}chooseMode('explore');inspect(o);return}oldInteraction(x,y)};
bag=function(){Gear.ensure(s);const p=active(),st=Gear.stats(p);show(p.name+' / アイテム',`金 ${s.gold}G　荷重 ${st.weight}/${st.capacity}\n武器 ${$items[p.gear.weapon]?.name||'素手'} ／ 防御 ${st.def} ／ MP ${p.mp}/${st.maxmp}`,s.party.map(q=>[q.name+(q.id===selected?' ◀':''),()=>{selected=q.id;bag()}]).concat([['装備',equipment],['共有の旅支度',supplies],['閉じる',close]]));const grid=document.createElement('div');grid.className='inventory';for(const [id,qty]of Object.entries(p.pack).filter(([,q])=>q>0)){const b=document.createElement('button');b.textContent=(Object.values(p.gear).includes(id)?'◆ ':'')+$items[id].name+(qty>1?' ×'+qty:'');b.onclick=()=>itemMenu(p,id);grid.append(b)}$('mb').append(grid)};
function itemMenu(p,id){const it=$items[id],st=Gear.stats(p);show(it.name,it.desc+`\n重さ ${it.weight} ／ ${Gear.slots[it.slot]}`,[[Object.values(p.gear).includes(id)?'装備を外す':'装備する',()=>{if(!Gear.equip(p,id))log('両手武器を外すと盾を持てる。');bag()}],['仲間に渡す',()=>show('誰に渡す？','装備中の物は外してから渡そう。',s.party.filter(q=>q!==p).map(q=>[q.name,()=>{if(!Gear.give(p,q,id))log('装備中か、相手の荷物が重すぎる。');bag()}]).concat([['戻る',bag]]))],['地面に置く',()=>{if(s.combat.active){log('戦闘中は荷物を置けない。');return}Gear.takeOff(p,id);p.pack[id]--;s.dropped.push({id:'gear-'+Date.now(),x:s.x,y:s.y,type:it.icon,name:it.name,gearId:id});close()}],['戻る',bag]])}
equipment=function(){const p=active(),st=Gear.stats(p);show(p.name+' / 装備',`攻撃 ${st.atk} ／ 防御 ${st.def} ／ 射程 ${st.range}\n術力 +${st.power} ／ MP ${p.mp}/${st.maxmp}\n荷重 ${st.weight}/${st.capacity}　${Gear.items[p.gear.weapon]?.ammo?'矢 '+s.arrows+'本':''}`,Object.entries(Gear.slots).map(([slot,label])=>[label+'：'+($items[p.gear[slot]]?.name||'なし'),()=>show(label+'を選ぶ','装備を替えると能力と射程が変わる。',Object.keys(p.pack).filter(id=>p.pack[id]>0&&$items[id].slot===slot).map(id=>[$items[id].name,()=>itemMenu(p,id)]).concat([['戻る',equipment]]))]).concat([['道具へ',bag]]))};
function supplies(){show('共有の旅支度',`金 ${s.gold}G。消耗品は全員で共有。装備は各人が持つ。`,Object.entries(names).filter(([id])=>(s[id]||0)>0).map(([id,name])=>[name+' ×'+s[id],()=>show(name,'使うか、足元へ置く。',[['使う',()=>{if(id==='herbs')show('薬草 / 相手を選ぶ','回復したい仲間を選ぶ。',s.party.map(p=>[p.name+' HP'+p.hp+'/'+p.max,()=>{if(!E.useHerb(s,selected,p.id))log('今は使えない。');close()}]).concat([['戻る',supplies]]));else if(id==='food'){E.rest(s);close()}else if(id==='torches'){if(!s.combat.active){s.torches--;s.lightUntil=s.turn+80;E.say(s,'松明に火をともした。')}close()}else if(id==='arrows'){show('矢','弓を装備して攻撃すると、自動で1本ずつ使う。',[['戻る',supplies]])}else{usedItem=id;close();chooseMode('use');$('targethint').hidden=false;$('targethint').textContent=name+'を使う対象を選ぶ';}}],['置く',()=>{if(s.combat.active)return;s[id]--;s.dropped.push({id:'drop-'+Date.now(),key:id,name,x:s.x,y:s.y,type:'chest'});close()}],['戻る',supplies]])]).concat([['道具へ',bag]]))}
// Equipment dropped on the world remains an actual retrievable object.
const inspectWithWorld=inspect;inspect=function(o){if(o.gearId){show(o.name,'地面に置いた装備。',[['拾う',()=>{if(Gear.add(s,o.gearId)){s.dropped=s.dropped.filter(d=>d.id!==o.id);close()}else log('荷物が重すぎる。')}],['そのまま',close]]);return}inspectWithWorld(o)};
$('journal').onclick=()=>{show('旅の手帳',`三つの証　水 ${s.evidence.water?'◆':'◇'}　石 ${s.evidence.stone?'◆':'◇'}　風 ${s.evidence.wind?'◆':'◇'}\n`+(s.flags.finalEnding?'灯台で記憶を重ねた。':'東の街道を自由に旅し、人々の言葉と本の記録を照らし合わせよう。'),[['聞き書き',()=>show('聞き書き',[...s.notes,...s.topics.map(t=>({title:t.title,text:t.text}))].map(n=>n.title+'\n'+n.text).join('\n\n')||'まだ記録はない。',[['閉じる',close]])],['地図',()=>$('map').click()],['閉じる',close]])};
$('map').onclick=()=>{show('街道と荒野 / 旅の地図','白い印が現在地、橙の印が野営地。街の間には草原・森・川が広がる。食料と矢を整えて出発しよう。',[['閉じる',close]]);const cv=document.createElement('canvas'),scale=3;cv.width=E.W*scale;cv.height=E.H*scale;cv.className='mapcanvas';const ctx=cv.getContext('2d');for(let y=0;y<E.H;y++)for(let x=0;x<E.W;x++){ctx.fillStyle={grass:'#698254',flowers:'#698254',marsh:'#476a5b',field:'#a49a5b',orchard:'#516844',water:'#38697c',road:'#c3ad77',bridge:'#e2c58b',wall:'#b6aa86',tree:'#354e36',floor:'#9e8259',door:'#a58a55',stone:'#8a8e78',mountain:'#6c6a64',sand:'#b9ab7a'}[E.terrain(x,y)]||'#6b7b4c';ctx.fillRect(x*scale,y*scale,scale,scale)}ctx.font='11px monospace';for(const [name,x,y]of E.World.regions){const labelX=Math.min(cv.width-name.length*11-8,x*scale-5),labelY=Math.max(15,y*scale);ctx.fillStyle='#18252d';ctx.fillRect(labelX,labelY-12,name.length*11+7,16);ctx.fillStyle='#f4e8be';ctx.fillText(name,labelX+3,labelY)}for(const o of E.objs.filter(o=>o.type==='camp')){ctx.fillStyle='#f4ae62';ctx.fillRect(o.x*scale-2,o.y*scale-2,5,5)}ctx.fillStyle='#fff';ctx.fillRect(s.x*scale-3,s.y*scale-3,7,7);$('mb').append(cv)};
render=function(){oldRender();const p=active(),st=Gear.stats(p);$('place').textContent=E.World.location(s.x,s.y);const hour=Math.floor((s.turn%320)*24/320+6)%24;$('clock').textContent=(s.combat.active?'戦闘 '+s.combat.round+'巡　':'')+String(hour).padStart(2,'0')+':00　'+s.gold+'G　矢'+s.arrows;$('quest').textContent=s.combat.active?`選択中：${p.name}　射程${st.range}　MP ${p.mp}/${st.maxmp}`:'地図をタップで歩く・人や物を調べる ／ A コマンド';const place=E.World.location(s.x,s.y);if(!s.visited.includes(place))s.visited.push(place);for(let i=0;i<s.party.length;i++){const q=s.party[i],node=$('party').children[i],detail=node?.lastChild;if(detail)detail.textContent=($items[q.gear.weapon]?.name||'素手')+' · MP '+q.mp}if(!s.combat.active)$('hint').textContent='';};
$('help').onclick=()=>show('霊流の旅人', '方向キー／十字ボタンで歩く。地図タップで移動・会話・調査。Aでコマンド、Bで戻る。長押しで連続歩行。\n人に聞いた言葉と本の記録が「手帳」に残り、別の人へ尋ねられる話題が増えます。東の橋から村・修道院・港・鉱山へ、好きな順に探索できます。\nアイテムから仲間を選び、武器・防具・盾・装飾品を装備。弓は矢と射線が必要です。戦闘中の装備変更は1行動を使います。両手武器と盾は併用できません。\n戦闘は同じ地図で、生きている仲間が一人ずつ行動。敵が画面の視界に入ると、その場で戦闘が始まります。木・壁の向こうは見えず、夜は視界が狭まります。歩行中は前の仲間の足跡を一列でたどります。戦闘後に離れていたら、歩くか待機すると合流します。仲間とは場所を譲り合うので、狭い通路でもそのまま引き返せます。霊術は攻撃だけでなく回復、眠り、守護、灯火もあります。\n自動保存はこのブラウザー内。前の記録も引き継ぎます。', [['冒険に戻る',close],['最初から（確認）',()=>show('始め直す？','現在の記録を消して、このゲームを最初から始めます。',[['始め直す',()=>{s=E.fresh();prepareState();selected='yuris';chooseMode('explore');close()}],['やめる',close]])]]);
$('rest').onclick=()=>inspect(E.World.objects.find(o=>o.id==='roadcamp'));
// Allow changing equipment out of combat; spells and consumables retain actor-turn limits.
const equipFn=Gear.equip;Gear.equip=(p,id)=>{if(s.combat.active&&!E.canAct(s,p.id)){E.say(s,'この仲間は行動済み。次の巡で持ち替えよう。');return false}const ok=equipFn(p,id);if(ok&&s.combat.active){E.say(s,p.name+'が装備を変更した。');E.finishAction(s,p.id)}return ok};
directional=function(dx,dy){if(mode==='magic'&&!$('modal').open){const p=active(),pos=E.position(s,p),enemy=E.enemy(s,pos.x+dx,pos.y+dy);if(enemy){interaction(enemy.x,enemy.y);return}}oldDirection(dx,dy)};
let holdTimer=null;function stopHold(){clearTimeout(holdTimer);holdTimer=null}
document.querySelectorAll('[data-dir]').forEach(b=>{b.onpointerdown=ev=>{ev.preventDefault();stopHold();const d=b.dataset.dir.split(',').map(Number);directional(...d);const again=()=>{if(s.combat.active){stopHold();return}directional(...d);if(!s.combat.active)holdTimer=setTimeout(again,150)};if(!s.combat.active)holdTimer=setTimeout(again,300);b.setPointerCapture?.(ev.pointerId)};b.onpointerup=stopHold;b.onpointercancel=stopHold;b.onlostpointercapture=stopHold;b.onclick=ev=>{if(ev.detail===0)directional(...b.dataset.dir.split(',').map(Number))}});
globalThis.Adv={dialogue,dialogueFor,keywordList,names,note,show,tell,obtain,shop,supplies,active,spellbook,setUsed:v=>{usedItem=v},isTalk:()=>conversation};
chooseMode('explore');render();save();
})();
