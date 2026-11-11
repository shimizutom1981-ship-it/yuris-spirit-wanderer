// Optional stories share the normal conversation, object and journal interfaces.
const SideStories=(()=>{
 'use strict';
 const cupTitle='燕の両手碗',printTitle='宛名のない絵はがき';
 const directions='リーネ村から東へ。白樺の街道の南側で燕の道しるべを見つけ、そこから真南の岩山に入る。';
 const bank='ノルヴィクの宿の南側を東へ回り、南の水際で三本線の舟板を探す。';
 const back=()=>[['閉じる',close]];
 const shutterOpen=()=>s.opened.includes('kiln-shutter');
 function cupHint(){
  const q=s.errands;
  if(q.cup==='home')return '完了。リーネ村の陶工マユの仕事台で、両手碗が筆洗いになった。';
  if(q.cup==='carried')return '両手碗を預かっている。リーネ村の食堂と弓師の家の間にいる陶工マユに届けよう。';
  if(shutterOpen())return '格子が開いた。南の折れ曲がった通路をたどり、窯出し場の低い棚を調べよう。';
  if(q.tile||q.swallowUp||q.fishDown)return '乾燥室の絵タイルを手掛かりに、風道の左右にある風戸を動かそう。';
  return directions+' 窯出し場に古い両手碗があるという。';
 }
 function printHint(){
  switch(s.errands.print){
   case 'letter':return bank+' 絵はがきを見せてみよう。';
   case 'reply-boat':case 'reply-glove':return 'ソウから返事の下絵を預かった。宿の西の軒先で、版画屋ニナに渡そう。';
   case 'boat':return '完了。軒先に、岸へ帰る渡し舟の絵はがきが並んだ。';
   case 'glove':return '完了。軒先に、手袋を振る二人の絵はがきが並んだ。';
   default:return 'ノルヴィクの宿の西で、版画屋ニナが宛名のない絵はがきを持っている。';
  }
 }
 function journal(){
  const q=s.errands;
  const cupKnown=q.cupAsked||q.cup||q.tile||shutterOpen()||q.swallowUp||q.fishDown;
  Adv.show('寄り道の手帳',printTitle+'\n'+printHint()+'\n\n'+cupTitle+'\n'+(cupKnown?cupHint():'リーネ村の食堂の東にいる陶工マユが、古い窯のことを気にしている。'),[['手帳に戻る',()=>$('journal').click()],...back()]);
 }
 function dialogue(id){
  const q=s.errands;
  if(id==='potter')return {
   intro:q.cup==='home'?'「ほら、筆を洗うのにちょうどいい。父が付けた取っ手も、私が付けた方も、ちゃんと手に収まる」':q.cup==='carried'?'「その青い釉薬……底を見せてくれる？」':q.cupAsked?'「松明は窯口の箱にあるよ。低い棚の奥に残っているといいんだけど」':'「取っ手が二つ、ちぐはぐな碗を知らない？　昔、父とひとつずつ付けたの」',
   job:'マユ。村の食器を焼いている。仕事台の筆洗いが割れてね。今度は、昔作ったあの碗を置きたくなったの。',
   info:directions,topics:{登り窯:'火はとうに消えたけれど、二つの風戸と灰よけの格子がまだつながっているよ。窯番の機霊にも気をつけて。'}
  };
  if(id==='printer')return {
   intro:q.print==='boat'?'「舟を小さく彫ったら、向こう岸が遠くに見えるね。父さん、毎日そこを漕いでいたんだ」':q.print==='glove'?'「手袋を二つ刷るのに、赤い絵の具ひとさじで足りたよ。父さんの分は少し大きくした」':q.print?.startsWith('reply-')?'「紙の端が折ってある。父さんは昔からそうするの。返事をくれたのね」':q.print==='letter'?'「三本線の舟、見覚えのある人が水辺にいると思う」':'「初めて売れた版画、父さんにも一枚渡したくて。舟を降りてから昼間どこにいるのか、私、知らないの」',
   job:'ニナ。町の景色を版木に彫っているの。立ったままでも刷れる小さな店だよ。',
   info:'宿の裏をぐるっと回ると、南側は水辺。昔の舟着き場があるよ。',topics:{絵はがき:'子どものころの渡し舟を彫った。へさきの三本線は、父が私の背丈を刻んだあと。'}
  };
  if(id==='ferryman')return {
   intro:q.print?.startsWith('reply-')?'「下絵はニナへ。わしが描くと、鳥まで櫂の形になっちまう」':['boat','glove'].includes(q.print)?'「宿まで歩いて、新しい絵を一枚買ってきた。代金を置いたら、娘に笑われたよ」':'「この舟板だけは薪にできんでな。まあ、隣に座りなさい」',
   job:'ソウだ。渡し舟を降りた今は、古い網を直している。',info:'ここが昔の舟着き場さ。宿の西に娘が小さな版画屋を出した。',topics:{絵はがき:'ニナの絵か。あの子の彫る水面には、ちゃんと流れがある。'}
  };
 }
 function choices(n){
  const q=s.errands;
  if(n.id==='potter'){
   if(q.cup==='carried')return [['両手碗を渡す',()=>{
    q.cup='home';s.gold+=14;
    Adv.note(cupTitle,cupHint());
    Adv.tell(n,'仕事台の碗','マユは二本の筆を碗で洗った。青い水の中で、大小二つの取っ手の影が揺れる。\n「今の私の手なら、大きい方も使えるよ」\n窯出しの手間賃に金貨14枚を受け取った。');
   }]];
   if(q.cup==='home')return [];
   return [['両手碗の話を聞く',()=>{q.cupAsked=true;Adv.note(cupTitle,cupHint());Adv.tell(n,'窯出し',cupHint())}]];
  }
  if(n.id==='printer'){
   if(!q.print)return [['絵はがきを預かる',()=>{q.print='letter';Adv.note(printTitle,printHint());Adv.tell(n,'届け物','薄い紙には、へさきに三本線のある渡し舟。隅に小さく「一枚目は父さんに」と刷ってある。\n'+printHint())}]];
   if(q.print.startsWith('reply-'))return [['返事の下絵を渡す',()=>{
    q.print=q.print==='reply-boat'?'boat':'glove';s.food+=3;
    Adv.note(printTitle,printHint());
    Adv.tell(n,'二枚目の版画','ニナは紙を版木に伏せ、指で線をなぞった。\n'+(q.print==='boat'?'「舟のこっち側に私がいる。岸で待ってた時、父さんにはこう見えたんだ」':'「あ、赤い手袋。片方を私、片方を父さんが振ってた。二人とも覚えてたんだね」')+'\n新しい絵が軒先に掛かった。ニナが焼きたてのパンを三つ包んでくれた。');
   }]];
  }
  if(n.id==='ferryman'&&q.print==='letter')return [['絵はがきを見せる',()=>{
   const reply=motif=>{q.print='reply-'+motif;Adv.note(printTitle,printHint());Adv.tell(n,'返事の下絵','ソウは網針を鉛筆に持ち替え、選んだ景色を描いた。紙の端を折り、「これで宛名は要らん」と差し出した。\n'+printHint())};
   Adv.show(n.name,'ソウは舟の三本線を指でなぞった。\n「大きくなったな。わしが舟から見ていた景色も、あの子に彫ってもらいたい。どっちが絵になるかね？」',[['岸へ帰る舟',()=>reply('boat')],['手袋を振る親子',()=>reply('glove')],['少し考える',close]],true);
  }]];
  return [];
 }
 function inspect(o){
  if(!o.side)return false;
  const q=s.errands;
  switch(o.side){
   case 'bench':
    Adv.show(o.name,q.cup==='home'?'青い碗に筆が二本。持ち手の高さがちぐはぐなせいで、片方に掛けた筆は先が水に浸かり、もう片方はちょうど乾かせる。':'欠けた筆洗いから水がしみ出している。マユは下に小皿を置いた。',back());break;
   case 'prints':
    Adv.show(o.name,q.print==='boat'?'新刷りの一枚。小さな舟の向こう、岸の子どもが両手を口に当てて呼んでいる。':q.print==='glove'?'新刷りの一枚。川のこちらと向こうで、同じ赤の手袋がひとつずつ揺れている。':'軒下に干した版画はまだ一種類。へさきに三本の線がある舟を、岸から見た絵だ。',back());break;
   case 'tile':{
    const clue='見習いの指で「燕は空へ、魚は泥へ」。燕の板を立て、魚の板を寝かせた絵の下に、開いた格子が彫ってある。';
    q.tile=true;Adv.note('窯番の絵タイル',clue);Adv.show(o.name,clue,back());break;
   }
   case 'swallow':case 'fish':{
    if(shutterOpen()){Adv.show(o.name,'風戸は留め金に収まり、南の格子は開いている。',back());break}
    const bird=o.side==='swallow',upright=bird?!!q.swallowUp:!q.fishDown;
    Adv.show(o.name,'煉瓦の風道に手のひらほどの板がある。今は'+(upright?'立っている。':'寝ている。'),[[upright?'板を寝かせる':'板を立てる',()=>{
     if(bird)q.swallowUp=!upright;else q.fishDown=upright;
     if(q.swallowUp&&q.fishDown){s.opened.push('kiln-shutter');Adv.note(cupTitle,cupHint());Adv.show(o.name,'二つの風道が低く鳴り、南で灰よけの格子が持ち上がった。窯出し場へ進める。',back())}
     else Adv.show(o.name,'板が止まった。もう一方の風道から、かすかに灰の匂いがする。',back());
    }],...back()]);break;
   }
   case 'shutter':Adv.show(o.name,'灰よけの格子が下りている。左右の風道から鎖が伸びている。入口寄りの乾燥室に、風戸の絵タイルがあった。',back());break;
   case 'shelf':
    if(q.cup){Adv.show(o.name,'棚の埃に、二つの取っ手の跡が残っている。',back());break}
    Adv.show(o.name,'焼き物の列に、小さな青い碗がある。片方の取っ手はまっすぐで、もう片方には小さな指の跡。底には「リーネ　マユ」と刻んである。',[['両手碗を包む',()=>{q.cup='carried';Adv.note(cupTitle,cupHint());Adv.show(o.name,'柔らかな藁で碗を包んだ。\n'+cupHint(),back())}],...back()]);break;
  }
  return true;
 }
 return {dialogue,choices,inspect,journal};
})();
