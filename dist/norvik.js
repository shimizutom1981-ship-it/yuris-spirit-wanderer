// The winter valley is a chapter map. The intervening ridge separates it from the free adventure.
(function(root){
 'use strict';
 const west=232,width=40,height=37;
 const building=(id,name,x,y,w,h,doorX,roof)=>({id,name,x:west+x,y,w,h,door:[west+doorX,y+h-1],roof,chapter:true});
 const buildings=[
  building('winter-house','領主の屋敷',13,13,9,8,17,'#848ea2'),
  building('winter-shop','ドーランの工房',24,14,9,7,27,'#935f4c')
 ];
 function terrain(x,y){
  const u=x-west;
  if(u<3||u>36||y<4||y>32)return 'mountain';
  for(const b of buildings){
   if(x<b.x||x>=b.x+b.w||y<b.y||y>=b.y+b.h)continue;
   if(x===b.door[0]&&y===b.door[1])return 'door';
   return x===b.x||x===b.x+b.w-1||y===b.y||y===b.y+b.h-1?'wall':'floor';
  }
  if(y>=25&&y<=29&&u>=9&&u<=16)return 'winterField';
  if((u===10||u===11)&&y>10&&y<24||y===10&&u<=15||y===22&&u>=8&&u<=33||[17,27].includes(u)&&y>=20&&y<=22||u===34&&y>=9&&y<=22)return 'snowTrack';
  if(u>=24&&y<=11&&y>=8)return 'stone';
  if(y===30&&u<25)return u===11?'bridge':'water';
  if((y<8&&u>14||u<7&&y>15||u>29&&y>25)&&(u+2*y)%5<2)return 'tree';
  return 'snow';
 }
 function location(x,y){
  if(buildings.some(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h))return x<west+23?'領主の屋敷':'ドーランの工房';
  if(y<=12)return x<west+22?'ノルヴィクの峠道':'鉱山の巻き場';
  if(y>=25)return '丘の畑と水路';
  return '冬のノルヴィク';
 }
 const sites=[
  ['marker','氷の道標',9,10,'winterSign'],['slope','雪に埋もれた斜面',13,10,'snowHand'],
  ['fire','居間の暖炉',15,15,'hearth'],['table','スープの小卓',16,18,'soupTable'],
  ['drive','二つのつまみの試作機',27,18,'driveCase'],['hoist','鉱山の巻き上げ機',29,10,'hoist'],['grinder','工房の砥石',26,17,'grinder'],
  ['shards','欠けた蓋の石箱',30,18,'chest'],['furnace','精製器の炉',30,15,'hearth'],
  ['bench','重りの試験台',28,18,'testWeight'],['bellows','試作のふいご',25,15,'bellows'],
  ['plot','丘の水路図',13,26,'fieldPlan'],['wagon','工房前の荷車',29,22,'haulCart']
 ];
 const objects=sites.map(([key,name,u,y,type])=>({id:'novel-'+key,keyName:key,name,x:west+u,y,type,chapter:true}));
 const folk=[
  ['victor','老臣ヴィクトル',19,16,'#747985'],['doran','親方ドーラン',26,16,'#ab704c'],
  ['linea','職人見習いリネア',29,16,'#937658'],['farmer','丘の農夫',12,27,'#859268']
 ];
 const npcs=folk.map(([key,name,u,y,color])=>({id:'novel-'+key,keyName:key,name,x:west+u,y,color,chapter:true}));
 root.NorvikMap={west,width,height,terrain,location,buildings,npcs,objects};
 if(typeof module!=='undefined')module.exports=root.NorvikMap;
})(typeof window==='undefined'?globalThis:window);
