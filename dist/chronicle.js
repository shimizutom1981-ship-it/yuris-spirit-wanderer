// A playable adaptation of the novel's winter opening. Each adventure keeps its
// own party and location under the existing save key; only the inactive one is nested.
const Chronicle=(()=>{
 'use strict';
 const M=E.World.valley;
 const places=Object.fromEntries([...M.objects,...M.npcs].map(a=>[a.keyName,a]));
 const closeChoice=()=>[['地図へ戻る',close]];
 const steps={
  ...FirstMeeting.steps,
  marker:['雪の中の少年','marker','オスカー、ノアと峠を見回り、氷の道標を確かめる。'],
  slope:['雪の中の少年','slope','ノアが見ている斜面で、雪の中の動きを探す。'],
  fire:['名を告げる','fire','オスカーと少年を屋敷へ運び、居間の暖炉で迎える。'],
  trust:['封蝋とスープ','victor','扉を閉めて、ヴィクトルと母の封書を確かめる。'],
  soup:['封蝋とスープ','table','小卓で、エドが自分でスープを飲めるよう手を貸す。'],
  plans:['回想・初めての動力機','doran','あの冬より前。工房のドーランと、巻き胴の図面を引く。'],
  govern:['回想・初めての動力機','drive','工房の試作機で、荷が跳ねる理由をノアと確かめる。'],
  hoist:['回想・初めての動力機','hoist','鉱山の巻き場で、荷が変わっても回る動力機を試す。'],
  morning:['向かいの席','table','救出の翌朝。屋敷の食卓に戻り、エドを町へ誘う。'],
  grinder:['動き始めた領地','grinder','エドと工房へ行き、接続用の輪で砥石を回す。'],
  shards:['捨て石から霊晶へ','shards','親方が取っておいた欠片を、ノアと調べる。'],
  before:['捨て石から霊晶へ','bench','精製する前の灰色の欠片で、試験台の重りを上げてみる。'],
  furnace:['捨て石から霊晶へ','furnace','リネアの金具を炉に取り付け、残った霊流を整える。'],
  after:['捨て石から霊晶へ','bench','冷ました同じ石を試験台に戻し、同じ重りで比べる。'],
  sorting:['石が灯す朝','linea','リネア、フィン、エドと、精製した石を使い道別に分ける。'],
  works:['仕事が変わる町','bellows','工房でふいごを試し、丘で農夫と春の水路の図面を広げる。'],
  report:['仕事が変わる町','victor','屋敷でヴィクトルに、できた仕事と次の課題を報告する。'],
  end:['ノルヴィクの再生',null,'動き始めた巻き場と工房、春を待つ畑を自由に訪ねられる。']
 };
 function goal(){
  const c=s.chapter,[title,key,hint]=steps[c.step];
  const target=c.step==='works'&&c.bellows?'plot':key;
  return {title,site:places[target],hint};
 }
 function direction(p){
  if(!p)return '';
  const dx=p.x-s.x,dy=p.y-s.y;
  if(Math.abs(dx)+Math.abs(dy)<=1)return 'すぐそば';
  return (dy<0?'北':dy>0?'南':'')+(dx<0?'西':dx>0?'東':'')+'へ';
 }
 function info(title,body){Adv.show(title,body,closeChoice())}
 function action(title,body,label,run){Adv.show(title,body,[[label,run],...closeChoice()])}
 // Only a change of narrative time cuts to another location. All errands are walked.
 function cutTo(x,y){
  s.x=M.west+x;s.y=y;
  s.party.forEach((p,i)=>{p.x=s.x-i;p.y=y});
 }
 function advance(step,title,body){
  s.chapter.step=step;
  if(step==='plans')cutTo(28,19);
  if(step==='morning'){cutTo(18,18);s.turn=0}
  E.say(s,title);save();
  const text=body+'\n\n次は '+goal().hint;
  if(s.chapter.restingInMine)action(title,text,'目の前を確かめる',walkGoal);
  else info(title,text);
 }
 function partyMember(id,name,role,x,y){
  return {id,name,role,x,y,hp:32,max:32,mp:0,atk:4};
 }
 function makeChapter(){
  const n=E.fresh();n.chapter={step:'marker'};n.enemies=[];n.log=['ノアの四つの足跡が、オスカーの踏み跡に収まっている。'];
  n.x=M.west+7;n.y=10;n.party[0].x=n.x;n.party[0].y=n.y;n.party[0].role='ノルヴィクの若い領主';
  n.party.push(partyMember('noa','ノア','四足の相棒',n.x-1,10),partyMember('oscar','オスカー','見回りの護衛',n.x-2,10));
  return n;
 }
 function switchScene(next){
  s=next;selected='yuris';cursor=null;prepareState();
  if($('modal').open)$('modal').close();
  chooseMode('explore');render();save();
 }
 function enter(){
  if(moving||s.chapter)return;
  const field=s,prior=field.winterRecord;
  delete field.beginNovel;delete field.winterRecord;
  const next=prior||makeChapter();next.freeAdventure=field;
  switchScene(next);
  if(prior){journal();return}
  action('ユリスと眠れる文明　雪の中の少年','ノルヴィクの峠道。手袋でこすっても、道標の文字から氷が落ちない。右の靴の中だけ、じんじんと冷たかった。\n十六歳の領主ユリスは、護衛のオスカーと小さな四足のノアを振り返った。雪が深くなる前に、町へ戻らなければ。','峠を見回る',close);
 }
 function leave(){
  if(!s.chapter||moving)return;
  if(s.memoryReturn){returnFromReplay();return}
  const chapter=s,field=chapter.freeAdventure;
  if(!field)return;
  delete chapter.freeAdventure;field.winterRecord=chapter;switchScene(field);
 }
 function resumePrompt(){
  if(s.chapter){journal();return}
  const last=s.winterRecord;
  action('ユリスと眠れる文明',last?'「'+steps[last.chapter.step][0]+'」の続きから。自由冒険へは、このボタンからいつでも戻れます。':'雪の峠でひとりの少年を見つける冬から、ノルヴィクの工房に再び槌音が響くまで。自由冒険の仲間と現在地は、戻るときまで保存されます。',last?'物語の続きを遊ぶ':'雪の峠から遊ぶ',enter);
 }
 function walkGoal(){
  const p=goal().site;if(!p)return;
  if(s.chapter.restingInMine){scene(p.keyName);return}
  close();chooseMode('explore');
  if(E.distance(s,p)<=1)interaction(p.x,p.y);
  else walkNear(p.x,p.y,()=>interaction(p.x,p.y));
 }
 function goalButton(){return [s.chapter.restingInMine?'目の前を確かめる':'目印まで歩く',walkGoal]}
 function journal(){
  const {title,site,hint}=goal();
  const done=s.chapter.step==='end';
  const ledger=s.chapter.bellows?'ふいご　試運転済み':'ふいご　未試験';
  const farm=s.chapter.plot?'丘の水路　試験区画の図面あり':'丘の水路　相談前';
  Adv.show('原作の物語　'+title,hint+(site?'\n目印　'+site.name+'（'+direction(site)+'）':'')+(['works','report','end'].includes(s.chapter.step)?'\n\n'+ledger+'\n'+farm:''),
   [...(site?[goalButton()]:[]),['領内地図',map],...(canReplay(s.chapter.step)?[['フィンとノアの回想を遊ぶ',replay]]:[]),...(s.memoryReturn?[['元の物語に戻る',returnFromReplay]]:[[done?'自由冒険を遊ぶ':'自由冒険に戻る',leave]]),...closeChoice()]);
 }
 function map(){
  const {site}=goal();
  const mine=s.y>=M.mineTop&&s.y<=M.mineBottom;
  const top=mine?M.mineTop:0,height=mine?M.mineBottom-top+1:M.height,k=8;
  Adv.show(mine?'旧坑道の地図':'冬のノルヴィク領',mine?'白が現在地、金が次の目印。上の坑道と、その下にある部屋を示す。':'白が現在地、金が次の目印。北に峠と巻き場、中央に屋敷と工房、南に丘の畑がある。',[...(site?[goalButton()]:[]),['物語の手帳',journal],...closeChoice()]);
  const cv=document.createElement('canvas');cv.width=M.width*k;cv.height=height*k;cv.className='mapcanvas';
  const ctx=cv.getContext('2d'),palette={mountain:'#657487',tree:'#44675b',water:'#4a829b',snowTrack:'#c0ab8a',floor:'#866a53',door:'#bd965c',wall:'#504b50',winterField:'#978b72',stone:'#82818a',rock:'#33363d',cave:'#906f53',ancientFloor:'#8badae'};
  for(let y=0;y<height;y++)for(let x=0;x<M.width;x++){ctx.fillStyle=palette[M.terrain(M.west+x,y+top)]||'#d5dfdc';ctx.fillRect(x*k,y*k,k,k)}
  ctx.font='12px sans-serif';
  const labels=mine?[['坑口側',4,42],['岩棚',30,42],...(s.chapter.restingInMine?[['白い台',19,58]]:[])]:[['峠',5,8],['巻き場',25,7],['屋敷',13,13],['工房',25,14],['畑',9,25]];
  for(const [label,x,y] of labels){
   ctx.fillStyle='#263036';ctx.fillRect(x*k,(y-top)*k-12,label.length*13+4,15);ctx.fillStyle='#fff5d8';ctx.fillText(label,x*k+2,(y-top)*k);
  }
  if(site){ctx.fillStyle='#f5bc4c';ctx.fillRect((site.x-M.west)*k-2,(site.y-top)*k-2,k+4,k+4)}
  ctx.fillStyle='#253c49';ctx.fillRect((s.x-M.west)*k-1,(s.y-top)*k-1,k+2,k+2);ctx.fillStyle='#fff';ctx.fillRect((s.x-M.west)*k,(s.y-top)*k,k,k);
  $('mb').append(cv);
 }
 // A completed or advanced chapter may predate the playable flashback.
 function canReplay(step){return Boolean(steps[step])&&!FirstMeeting.steps[step]&&!['marker','slope','fire','trust','soup'].includes(step)}
 function replay(){
  if(moving||s.memoryReturn)return;
  const original=s,chapter=makeChapter();
  chapter.memoryReturn=original;switchScene(chapter);meeting.start();
 }
 function returnFromReplay(){
  if(moving||!s.memoryReturn)return;
  switchScene(s.memoryReturn);journal();
 }
 const meeting=FirstMeeting.create({advance,cutTo,info,action,partyMember,finish(){
  if(s.memoryReturn){returnFromReplay();return}
  delete s.chapter.restingInMine;
  advance('plans','雪の上の足跡','ノアは前足を雪から抜いて、担架の横に並んだ。フィンの靴の跡の隣に、小さな四つ足の跡が続いた。\nそれから幾日か。屋敷で休んだユリスは、ノアと工房へ通えるまでになった。巻き胴の前で、ドーランが図面を広げている。');
 }});
 function joinEd(){
  const pos=E.position(s,s.party.at(-1));
  const cell=[[0,1],[-1,0],[1,0],[0,-1]].map(([dx,dy])=>({x:pos.x+dx,y:pos.y+dy})).find(p=>E.pass(s,p.x,p.y)&&!s.party.some(m=>m.x===p.x&&m.y===p.y));
  if(!cell){info('向かいの席','机のまわりが狭い。少し広い側から声をかけてみよう。');return}
  s.party.push(partyMember('ed','エド','ヴィクトルの遠縁の子',cell.x,cell.y));prepareState();
  advance('grinder','翌朝の食卓','昨日の少年が向かいの席でパンを割っている。門の音にまだ肩を上げるけれど、自分から「工房を見てみたい」と言った。ユリスは彼の歩幅に合わせて扉へ向かった。');
 }
 function certify(key,title,body){
  s.chapter[key]=true;
  if(s.chapter.bellows&&s.chapter.plot)advance('report',title,body);
  else{E.say(s,title);save();info(title,body+'\n'+(key==='plot'?'工房のふいごも見に行こう。':'丘で待つ農夫の図面も見に行こう。'))}
 }
 function scene(key){
  const c=s.chapter,stage=c.step;
  if(meeting.scene(key))return;
  if(key==='marker'&&stage==='marker')return action('氷の道標','溝へ落ちた右足はまだ濡れている。ユリスは氷を削るのをやめた。晴れたら、雪より高いところに赤い布を結んでもらおう。','引き返す前に斜面を見回す',()=>advance('slope','ノアが足を止めた','「斜面の下。今、動いた」\nノアの鼻先に、雪から黒い枝のようなものがのぞいている。'));
  if(key==='slope'&&stage==='slope')return action('雪の下の指','風が途切れる。枝に見えたものが曲がり、もう一度、伸びた。人の指だ。オスカーが灌木を握って先に下り、雪を払う。','オスカーと少年を引き上げる',()=>{
   s.opened.push(places.slope.id);
   advance('fire','暖かいところまで','青い目の少年が「ヴィクトルを……呼んで」とつぶやいた。オスカーが抱き上げ、ユリスは上から支える。手袋をつかまれたまま、屋敷の窓の灯りへ歩き出した。');
  });
  if(key==='fire'&&stage==='fire')return action('暖炉の前','帳簿をどけて長椅子を空ける。少年は濡れた外套の下で布包みを押さえた。留め金に手をかけると、小さな手がそれを遮った。','手を引いて、少年が包みを出すのを待つ',()=>{
   s.party=s.party.filter(p=>p.id!=='oscar');
   advance('trust','閉じた扉の内側で','少年は自分で包みを取って毛布に収まった。オスカーは老臣を呼びに出る。ほかの人を外に待たせると、少年はユリスにだけ、エドリック・アルヴェイン、王国の王子だと打ち明けた。');
  });
  if(key==='victor'&&stage==='trust')return action('封蝋とスープ','ヴィクトルは差し出された母の手紙を読み、元の折り目で畳んだ。少年を守ってほしいと記されている。屋敷の者には、自分の遠縁の子として預かりたい、と老臣は言った。','少年の望む呼び名を聞く',()=>advance('soup','エドって呼んで','少年が選んだのは「エド」という短い呼び名だった。ヴィクトルは女中にもそう紹介した。食卓に玉ねぎと芋のスープが届く。'));
  if(key==='table'&&stage==='soup')return action('がたつく小卓','器が受け皿に当たった。「自分で持てるよ」とエドが言う。よく見ると、小卓の脚が一本、わずかに床から浮いていた。','浮いた脚に畳んだ布を挟む',meeting.start);
  if(key==='doran'&&stage==='plans')return action('回想　巻き胴の図面','ドーランが大きな柄を回す間、両手はそれだけに取られる。ユリスは図面から柄を消した。リネアが「ほかの道具にも付けるなら、ねじは外から触れる方がいい」と鉛筆を借りる。','回す部分だけを図面に残す',()=>advance('govern','道具箱ほどの動力機','ユリスとノアが仕組みを描き、リネアが傷のある板を見分け、ドーランが軸の金具を仕上げた。何日もかけて、霊晶の力で巻き胴を回す小さな動力機が形になった。'));
  if(key==='drive'&&stage==='govern'){
   const trial=()=>Adv.show('工房の試運転','荷をつなぐと軸が遅くなり、次の瞬間、荷が跳ねた。ドーランが手動の止め具を掛ける。ノアが二つのつまみを示す。供給弁を開くほど、遅れを取り戻そうとして余分な力が入ってしまう。',[
    ['一度に大きく力を足す',()=>info('跳ねる荷','軽くなった瞬間に回りすぎた。止め具で荷を支えてやり直せる。')],
    ['歯車で二つのつまみを逆向きにつなぐ',()=>advance('hoist','二つの小さな歯車','リネアが片方を開くと、もう片方が絞られた。重い荷でも揺れずに上がり、操作棒を戻すと止まる。ユリスはこの小さな箱に「動力機」と名を付けた。')],
    ...closeChoice()]);
   return action('二つのつまみの試作機','リネアが軸をつなぎ、ドーランが止め具を見る。空で回すとうまくいった。','試しの荷をつなぐ',trial);
  }
  if(key==='hoist'&&stage==='hoist')return action('鉱山の巻き場','巻き胴の端に、小さな動力機が収まった。人が下がり、鉱石の荷台が動かせる。','操作棒を倒し、荷を上げて止める',()=>advance('morning','鉱石が上がった日','荷台が静かに止まる。鉱夫が綱から手を離し、空いた手で留め具を確かめる。\n回想はここまで。目を開けると、昨日峠へ着ていった外套が寝台のそばにあった。'));
  if(key==='table'&&stage==='morning')return action('向かいの席','エドが窓から巻き場を見ている。見に行くかと尋ねると、彼は毛布に手を伸ばすのをやめて椅子から立った。','エドと一緒に工房へ',joinEd);
  if(key==='grinder'&&stage==='grinder')return action('巻き場から工房へ','作業台に動力機が一台。リネアが接続用の輪を見せる。エドは突起とくぼみを見比べて、かみ合う向きを見つけた。','輪を合わせて砥石の軸をつなぐ',()=>advance('shards','砥石が回る工房','刃を研ぐ時間が短くなり、ドーランは後回しにしていた修理に取りかかった。けれど石の光は弱くなる。エドが尋ねた。「使い終わった石は、どうなるの？」'));
  if(key==='shards'&&stage==='shards')return action('親方の石箱','欠けた箱の中で、ノアが灰色の石の前に止まる。まだ力は残っている。ただ中の筋が食い違い、うまく力を取り出せない。','灰色の欠片を試験台に運ぶ',()=>advance('before','同じ重り、同じ石','どれだけ変わったか分かるように、リネアが試験台の重りへ印を付けた。'));
  if(key==='bench'&&stage==='before')return action('精製前の試験','灰色の石をはめた。リネアが重りの位置を帳面に書き、エドが作業台をのぞき込む。','弁を開いて重りを見る',()=>advance('furnace','途中で止まる羽根車','重りはわずかに浮いて止まった。ノアは、炉で温めながら石の中の流れを整えようと言った。'));
  if(key==='furnace'&&stage==='furnace')return action('捨て石から霊晶へ','工房にある炉をそのまま使う。リネアが加熱部に調整機構を留め、ユリスが灰色の欠片を入れた。','ノアの合図で霊流の向きをそろえる',()=>advance('after','炉の中の細い光','ばらばらだった光の筋が一本につながった。石を冷まし、最初と同じ試験台へ戻ろう。'));
  if(key==='bench'&&stage==='after')return action('精製後の試験','同じ石を受け座へ戻した。リネアが最初の印を指す。','同じ重りをもう一度上げる',()=>advance('sorting','親方が取っておいた石','今度は重りが印を越え、するすると上がった。ドーランは、古い選鉱場の裏には同じような石が何年分もあると教えてくれた。\n数日後。リネアたちの動力機付き荷車が捨て石谷から戻り、工房に選別の箱が並んだ。'));
  if(key==='linea'&&stage==='sorting')return Adv.show('石が灯す朝','同じ炉を通しても、すべての石が同じ力を出すわけではない。ノアはよく重りを上げる石と、穏やかに光り続ける石を示した。フィンが札を持って待っている。',[
   ['どちらも巻き場へ送る',()=>info('リネアの試験帳','細く光る石では、荷を吊ると重りが止まる。灯りなら長く役に立つ。箱を分けてみよう。')],
   ['力の強い石は動力用、穏やかな石は灯り用',()=>advance('works','札の付いた二つの箱','フィンが札を掛け、エドが動力用の石の数を記録した。工房ではふいごの試験、丘では農夫の水路の相談が待っている。どちらからでもいい。')],...closeChoice()]);
  if(key==='bellows'&&stage==='works'&&!c.bellows)return action('鍛冶場のふいご','試作機を炉につなぐ。ドーランは鉄を打つ場所へ、リネアは温度を書き取る場所へ移った。','ふいごを動かし、火の様子を記録する',()=>certify('bellows','金床に戻った親方','ふいごが風を送り、親方の両手が槌と火ばさみに戻った。修理を待っていた農具が、もう一つ金床に載った。'));
  if(['farmer','plot'].includes(key)&&stage==='works'&&!c.plot)return action('丘の上の畑','農夫は雪の上に水路の図を広げた。川から丘までは高さがある。村じゅうに管を引く前に、小さな区画で試したい。','農夫と試験区画を図面に記す',()=>certify('plot','春に試す一本の管','川辺から小さな畝まで、指で一本の線を引いた。水はまだ流れていない。雪が解けたら、ここで管とポンプを試す。'));
  if(key==='victor'&&stage==='report')return action('領主の屋敷　仕事の帳面','巻き場は動き、鍛冶場では農具が早く直る。丘の揚水は春を待つ試験計画。エドの記録とリネアの試験帳が、ヴィクトルの前に並んだ。','動き始めた仕事を帳面に残す',()=>{
   c.step='end';E.say(s,'原作編「ノルヴィクの再生」を終えた。');save();
   info('ノルヴィクの再生','荷車が工房の前を通る。以前は鉱石を巻き上げるだけで暮れた一日に、今は綱を調べ、足場を直す時間がある。\nけれど、次の注文には金具と木材が足りない。ヴィクトルは帳面に新しい欄を作った。今度の課題は、物を運ぶ道と、売る相手だ。\nこの領地を歩き続けられます。「原作の物語」から自由冒険にも戻れます。');
  });
  const later=['works','report','end'].includes(stage);
  const views={
   mineMouth:'坑口の柱に、古い灯りを掛けた跡がある。奥から水の落ちる音が一つ返ってきた。',marker:'氷の下に道標の文字が残っている。晴れた日に赤い布を結ぶ場所だ。',fire:'居間に薪のはぜる音がする。',table:['marker','slope','fire','trust'].includes(stage)?'小卓を押すと、短い脚が少し浮く。':'卓の短い脚に布が挟まり、器は静かに収まっている。',
   victor:'老臣は帳面を閉じてこちらを見た。「何かあれば、いつでもお呼びください」',doran:'ドーランは作りかけの金具を光にかざし、やすりを入れる場所を決めた。',linea:'リネアは道具を並べ直し、次に試すことを帳面に書き込んでいる。',
   drive:'二つの調整つまみの間に、小さな歯車が収まる場所がある。',hoist:later?'鉱石を上げている間に、鉱夫は傷みかけた綱を取り替えている。':'巻き胴と綱の奥に、荷を支える手動の止め具がある。',grinder:'軸の端は、別の道具に付け替えられる形をしている。',
   shards:'ドーランは使いにくい石も捨てずに箱に取っておいた。',furnace:'炭の熱が、工房の壁際まで届く。',bench:'同じ重りで試せば、石の違いが分かる。',bellows:c.bellows?'ふいごが送り出す風の音に、親方の槌音が重なった。':'革と木で作ったふいごが炉の脇にある。',
   plot:c.plot?'小さな区画に杭が二本。水を通す試験は雪解けを待つ。':'雪の下には、春に種を蒔きたい畝がある。',farmer:c.plot?'「雪が解けたら、まずこの一区画だ」農夫は折り畳んだ図面を大切にしまった。':'「丘の上まで水が届けば、種を蒔ける畑が増えるんだがね」',
   wagon:later?'動力機付きの荷車に捨て石谷の屑石が積まれた。戻ったらもう一往復するという。':'工房前に、木の車輪と荷台が置かれている。'
  };
  info(places[key].name,views[key]||goal().hint);
 }
 const fieldTalk=talk,fieldInspect=inspect,fieldRender=render,fieldInteraction=interaction;
 interaction=function(x,y){
  const p=s.chapter&&goal().site;
  if(p&&p.x===x&&p.y===y&&['talk','look'].includes(mode)&&E.distance(s,p)<=1&&FirstMeeting.steps[s.chapter.step]){scene(p.keyName);return}
  fieldInteraction(x,y);
 };
 const fieldJournal=$('journal').onclick,fieldMap=$('map').onclick,fieldFormation=$('formation').onclick;
 talk=function(n){if(n.chapter)scene(n.keyName);else fieldTalk(n)};
 inspect=function(o){if(o.chapter)scene(o.keyName);else fieldInspect(o)};
 $('novel').onclick=resumePrompt;
 $('journal').onclick=()=>s.chapter?journal():fieldJournal();
 $('map').onclick=()=>s.chapter?map():fieldMap();
 $('formation').onclick=()=>s.chapter?info('同行者',s.party.map(p=>p.name+'　'+p.role).join('\n')):fieldFormation();
 render=function(){
  fieldRender();
  if(!s.chapter)return;
  const {title,site,hint}=goal();
  $('clock').textContent=title;
  $('quest').textContent=site?hint+'　'+site.name+'（'+direction(site)+'）':hint;
  for(const [i,p] of s.party.entries()){
   const detail=$('party').children[i]?.lastChild;if(detail)detail.textContent=p.role;
  }
  if(s.chapter.restingInMine){
   const snow=s.chapter.step==='freshSnow';
   const people=snow?[['finn',34,10],['novel-doran',32,10]]:[['novel-doran',23,61]];
   if(snow){
    const x=(M.west+35-cam.x)*T,y=(9-cam.y)*T;
    g.fillStyle='#81989d';for(const [dx,dy] of [[1,8],[6,9],[3,4],[9,5]])g.fillRect(x+dx,y+dy,2,2);
   }
   if(s.chapter.step==='chosen')people.push(['bearer',22,62],['bearer',23,63]);
   for(const [id,u,row] of people){
    g.save();g.translate((M.west+u-cam.x)*T,(row-cam.y)*T);Painter.sprite(g,id==='novel-doran'?'#ab704c':'#807b69','person',id);g.restore();
   }
  }
  if(!site||!canSee(site.x,site.y))return;
  const x=(site.x-cam.x)*T,y=(site.y-cam.y)*T;
  g.fillStyle='#403234';g.fillRect(x+4,y,8,4);g.fillStyle='#ffda70';g.fillRect(x+5,y,6,2);g.fillRect(x+7,y+2,2,2);
 };
 return {enter,leave,journal,render};
})();
if(s.beginNovel)Chronicle.enter();else render();
