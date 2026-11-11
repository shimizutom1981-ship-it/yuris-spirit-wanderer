/* Original 16 x 16 pixel tiles; no external or extracted game art. */
(function(root){
'use strict';
function rect(g,c,x,y,w,h){g.fillStyle=c;g.fillRect(x,y,w,h)}
function dots(g,c,points){for(const p of points)rect(g,c,p[0],p[1],p[2]||1,p[3]||1)}
function shade(hex,f){if(!/^#[\da-f]{6}$/i.test(hex))hex='#65999b';return '#'+hex.slice(1).match(/../g).map(v=>Math.max(0,Math.min(255,Math.round(parseInt(v,16)*f))).toString(16).padStart(2,'0')).join('')}
function tile(g,t,x=0,y=0,chapter){
 if(t==='ancientFloor'){
  rect(g,'#425454',0,0,16,16);rect(g,'#526667',0,1,16,14);
  if(y>=58){const dim=['outside','latch','contact','bearers','chosen'].includes(chapter?.step);if((x+y)%3===0&&(!dim||y===62)){rect(g,'#668987',0,9,16,2);rect(g,'#b9e0d0',4,9,9,1)}}
  else dots(g,'#93aaa0',[[1,3,6],[11,13,3]]);
  return;
 }
 if(t==='snow'||t==='snowTrack'||t==='winterField'){
  const lane=t==='snowTrack',field=t==='winterField',n=(3*x+5*y)%11;
  rect(g,field?'#bab4a1':lane?'#bac2bd':'#d8e6e7',0,0,16,16);
  if(field){for(let i=1;i<16;i+=5){rect(g,'#8b806e',0,i,16,2);rect(g,'#d7d9ce',0,i-1,11,1)}}
  else{rect(g,lane?'#9eaba8':'#bdcfd6',n,5,4,1);rect(g,lane?'#e0e0cf':'#f2f5eb',2,11,7,1);if(lane){rect(g,'#879897',3+n%3,3,2,3);rect(g,'#93a19c',9,10,2,3)}}
  if(chapter&&['works','report','end'].includes(chapter.step)&&(x+3*y)%4===0){
   rect(g,field?'#8b795c':'#a9ae93',1,12,7,2);rect(g,'#82916d',3,11,2,2);
  }
  return;
 }
if(t==='kiln'){rect(g,'#654739',0,0,16,16);for(let row=0;row<2;row++){rect(g,'#3b302d',0,7+row*8,16,1);rect(g,'#44352f',(x+y+row)%2*8,row*8,1,7)}dots(g,'#93684e',[[2,1,4],[10,9,3]]);return}if(t==='rock'){rect(g,'#2b2f33',0,0,16,16);rect(g,'#4a4f50',1,2,7,6);rect(g,'#5d6260',2,2,5,2);rect(g,'#41464a',9,5,6,7);rect(g,'#555a58',10,5,4,2);rect(g,'#3a3f42',2,10,6,5);rect(g,'#4c5152',3,10,4,1);return}if(t==='cave'){rect(g,'#3b3830',0,0,16,16);dots(g,'#4a463b',[[2,3,3],[9,7,4],[4,12,3],[12,13,2]]);dots(g,'#2c2a24',[[6,5,2],[13,2],[1,9,2],[10,11]]);return}if(['flowers','field','orchard','sand','bridge','mountain','marsh'].includes(t)){extraTile(g,t,x,y);return}const seed=Math.abs((x*73+y*131)^((x+y)*17));
 if(t==='grass'||t==='tree'){
 rect(g,'#4e7037',0,0,16,16);for(let n=0;n<8;n++){let xx=(seed+n*7)%16,yy=(seed*3+n*11)%16;rect(g,n%2?'#5d7c3e':'#3d602f',xx,yy,2,1);if(n%3===0)rect(g,'#6d8947',xx+1,yy-1,1,1)}
 if(t==='tree'){rect(g,'#304829',3,11,12,4);rect(g,'#453923',7,8,3,7);rect(g,'#775532',8,10,1,4);rect(g,'#1b3928',3,4,11,8);rect(g,'#254a2b',1,6,13,5);rect(g,'#2b512d',4,1,8,11);rect(g,'#386135',2,4,11,5);rect(g,'#446f38',5,2,6,6);dots(g,'#628749',[[5,2,4],[3,5,2],[9,4,2],[6,7,3],[11,8]]);dots(g,'#20432a',[[2,10,3],[11,11,2],[5,12,5],[10,2],[7,9,2]])}return;
 }
 if(t==='water'){rect(g,'#244a69',0,0,16,16);dots(g,'#315e7a',[[0,(seed%5)+2,5],[7,10,6],[3,14,6],[10,3,6]]);dots(g,'#568997',[[1,seed%5+2,3],[9,10,3],[11,3,2]]);dots(g,'#1d405e',[[2,7,5],[10,14,5],[0,12,3]]);return}
 if(t==='road'){rect(g,'#a18b5a',0,0,16,16);dots(g,'#baa16b',[[1,3,3],[9,8,4],[4,12,2],[14,2,2],[0,15,4]]);dots(g,'#87754c',[[4,6],[11,13,2],[6,1],[1,10],[14,10]]);return}
 if(t==='floor'){rect(g,'#7d593b',0,0,16,16);for(let yy=0;yy<16;yy+=4){rect(g,'#4e3c2b',0,yy+3,16,1);rect(g,'#9a714a',0,yy,16,1);let xx=((yy/4+x)%2)*8;rect(g,'#4c3828',xx,yy,1,3);rect(g,'#aa8155',xx+2,yy+1,4,1)}return}
 if(t==='wall'){rect(g,'#3c4243',0,0,16,16);rect(g,'#b7b6a1',0,0,16,4);rect(g,'#d2cfb5',0,0,16,1);rect(g,'#8b9287',1,2,6,2);rect(g,'#93988b',9,2,6,2);rect(g,'#6f7774',0,5,16,9);for(let yy=5;yy<14;yy+=4){let offset=(yy===9)?4:0;rect(g,'#919a8e',0,yy,16,1);rect(g,'#454f4d',0,yy+3,16,1);for(let xx=offset;xx<16;xx+=8)rect(g,'#454f4d',xx,yy,1,4)}rect(g,'#252f30',0,14,16,2);return}
 if(t==='door'){tile(g,'wall',x,y);rect(g,'#31352e',3,3,11,13);rect(g,'#b09257',3,2,10,1);rect(g,'#735335',4,4,8,11);rect(g,'#9d7644',4,4,1,11);rect(g,'#4c3929',7,4,1,11);rect(g,'#4c3929',11,4,1,11);rect(g,'#353c39',4,6,8,1);rect(g,'#353c39',4,12,8,1);rect(g,'#d6b56f',10,9,1,2);return}
 // Stone paving.
 rect(g,'#575f59',0,0,16,16);for(let yy=0;yy<16;yy+=8)for(let xx=0;xx<16;xx+=8){rect(g,(seed+xx+yy)%3?'#7c8171':'#888977',xx,yy,7,7);rect(g,'#a0a28b',xx,yy,7,1);rect(g,'#464f4b',xx,yy+6,7,1);rect(g,'#6a7265',xx+2,yy+3,2,1)}
}
function sprite(g,color='#65999b',kind='person',id='',turn=0,hp,chapter){
 rect(g,'#17251e',4,14,9,2);
 if(id==='yuris'&&chapter?.restingInMine){
  const r=(c,x,y,w,h)=>rect(g,c,x,y,w,h),floor=chapter.step==='below',carried=['chosen','freshSnow'].includes(chapter.step);
  if(!floor){r(carried?'#936f45':'#91aaa9',0,4,16,9);r(carried?'#d3c4a1':'#e1eeea',1,5,14,6);r('#66726e',2,13,2,1);r('#66726e',12,13,2,1)}
  r('#66503e',1,5,4,5);r('#dfbf96',2,6,3,3);r('#47818b',5,7,9,4);r('#7fa7a2',5,7,5,1);r('#314d57',12,8,3,3);return;
 }
 if(id==='finn'){
  const r=(c,x,y,w,h)=>rect(g,c,x,y,w,h);r('#604334',6,4,5,3);r('#e1bb94',6,6,4,3);r('#9f7055',4,9,8,4);r('#584e47',5,13,2,2);r('#584e47',9,13,2,2);return;
 }
 if(id==='noa'){
  const r=(c,x,y,w,h)=>rect(g,c,x,y,w,h),shift=turn%2;
  r('#4a626b',1,7,3,2);r('#7f999a',3,8,8,4);r('#afbcaf',4,7,6,2);
  r('#455c61',4,11,2,3-shift);r('#455c61',8,11,2,2+shift);r('#758782',6,11,1,2+shift);r('#637a76',10,10,2,3-shift);
  r('#8da4a1',9,5,5,5);r('#b3c7bc',12,7,3,2);r('#364b50',12,6,1,1);r('#a7e8d9',10,9,2,2);r('#d8f2db',10,9,1,1);return;
 }

 if(kind==='wolf'){
 rect(g,'#303c3b',2,6,12,6);rect(g,'#757e75',3,5,9,6);rect(g,'#a1a58e',6,5,5,2);rect(g,'#757e75',10,3,5,6);rect(g,'#313e3b',10,1,2,4);rect(g,'#313e3b',14,2,1,3);rect(g,'#c0bda1',12,5,4,3);rect(g,'#151f22',14,5,1,1);rect(g,'#151f22',15,7,1,1);rect(g,'#435149',3,10,2,5);rect(g,'#435149',10,10,2,4);rect(g,'#949c87',3,10,1,3);rect(g,'#68776a',0,6,4,2);return;
 }
 if(kind==='golem'){
 rect(g,'#313c41',3,5,11,9);rect(g,'#6e8580',4,4,8,9);rect(g,'#a4b1a0',5,3,6,3);rect(g,'#465a5a',5,1,6,4);rect(g,'#87aaa3',6,1,4,1);rect(g,'#dfb860',6,3,1,1);rect(g,'#dfb860',9,3,1,1);rect(g,'#b0c1aa',6,6,5,1);rect(g,'#9dd4b7',7,7,2,3);rect(g,'#5d726f',1,6,3,6);rect(g,'#5d726f',12,6,3,6);rect(g,'#7f9690',1,6,2,2);rect(g,'#7f9690',13,6,2,2);rect(g,'#465b59',4,12,3,3);rect(g,'#465b59',9,12,3,3);return;
 }
 if(id==='novel-doran')color='#ab704c';
 const dark=shade(color,.6),light=shade(color,1.3);if(id==='celes')rect(g,'#d4caca',4,1,9,10);if(id==='ed')rect(g,'#9a8e79',11,7,4,7);
 rect(g,'#252e29',5,12,3,4);rect(g,'#252e29',9,12,3,4);rect(g,'#473d2e',4,15,4,1);rect(g,'#473d2e',9,15,4,1);
 rect(g,dark,4,7,9,6);rect(g,color,5,7,7,6);rect(g,light,5,7,2,4);rect(g,dark,3,8,2,5);rect(g,dark,12,8,2,5);rect(g,'#b9936f',3,12,2,2);rect(g,'#b9936f',12,12,2,2);rect(g,'#463b2d',5,12,7,1);rect(g,'#d4b55d',8,12,1,1);
 rect(g,'#6b4b32',5,1,7,5);rect(g,'#ad7850',6,1,5,1);rect(g,'#d3b18a',6,3,5,4);rect(g,'#e7c69c',6,3,3,2);rect(g,'#292e29',7,4,1,1);rect(g,'#292e29',10,4,1,1);rect(g,'#80573e',8,6,2,1);rect(g,'#3f392b',5,2,1,4);rect(g,'#3f392b',11,2,1,4);
 if(id==='yuris'&&['mineGate','tracks','draft','pool','answer','ledge','sleeve'].includes(chapter?.step)){
  rect(g,'#715537',12,9,3,2);rect(g,'#d19a51',11,11,5,4);rect(g,'#fff0ac',12,11,3,3);rect(g,'#715537',11,15,5,1);
 }
 if(id==='oscar'&&chapter?.step==='fire'){
  rect(g,'#524b54',1,7,7,5);rect(g,'#ddd1af',2,7,3,3);rect(g,'#59483f',1,6,4,2);rect(g,'#aba8a4',4,10,5,2);
 }
}
function object(g,t,s={}){
 const r=(c,x,y,w,h)=>rect(g,c,x,y,w,h);r('#283c2a',3,14,11,1);
 if(t==='kilnShutter'){r('#442e2c',0,1,16,14);for(let x=2;x<16;x+=4){r('#ba8561',x,2,2,12);r('#855b46',x+1,3,1,11)}r('#d19b6e',0,4,16,2);r('#88563d',0,11,16,2);return}
 if(t==='cupShelf'||t==='potterBench'){r('#775239',1,10,14,3);r('#b98457',0,9,16,2);r('#674934',2,12,2,3);r('#674934',12,12,2,3);if(t==='cupShelf'?!s.errands?.cup:s.errands?.cup==='home'){r('#6098a0',3,5,10,3);r('#90c9c4',1,4,3,3);r('#90c9c4',12,4,3,3);r('#a9d8ce',3,4,10,1);r('#57808c',5,8,6,1)}return}
 if(t==='printRack'){r('#68462f',2,3,2,12);r('#68462f',12,3,2,12);r('#ac8053',1,3,14,2);r('#ddcda5',3,5,10,7);r('#658786',4,9,8,2);if(s.errands?.print==='glove'){r('#b45e56',7,6,3,3)}else{r('#926e4c',5,8,6,1)}return}

 const winter=s.chapter;
 if(t==='mineMouth'){r('#6d6f69',0,5,16,9);r('#272d32',3,5,10,9);r('#7d6045',1,3,2,12);r('#896b4d',13,3,2,12);r('#ab8b65',0,2,16,3);r('#d8e1da',0,1,16,2);return}
 if(t==='smallPrints'){for(const [x,y] of [[2,11],[7,9],[9,5],[13,3]]){r('#252a2a',x,y,2,3);r('#9e8264',x,y+3,2,1)}return}
 if(t==='drift'){dots(g,'#999184',[[1,10,3],[6,9,4],[11,8,3]]);dots(g,'#60574a',[[4,12,2],[9,5,3]]);return}
 if(t==='puddle'){r('#253f4b',1,8,13,4);r('#719696',4,9,6,1);r('#8aa7a5',10,7,2,1);return}
 if(t==='litSeam'){r('#5c7476',2,2,12,11);r('#7c9692',3,3,10,3);r('#a3c4b4',10,4,2,8);return}
 if(t==='ropePillar'){r('#534b43',4,1,8,14);r('#7b7062',4,1,3,13);if(['ledge','sleeve'].includes(winter?.step)){r('#c8a776',3,7,10,2);r('#ad875c',12,8,2,7)}return}
 if(t==='finnLedge'){r('#151d22',0,7,16,8);r('#80746a',2,9,12,4);r('#a39986',2,9,11,1);if(['ledge','sleeve'].includes(winter?.step))sprite(g,'#997058','person','finn');return}
 if(t==='tetheredBeast'){if(winter?.step!=='chosen'){r('#97a9a2',0,10,4,1);r('#97a9a2',0,12,5,1);r('#587674',3,11,3,1)}sprite(g,'#839b92','person','noa',0);return}
 if(t==='winterSign'){r('#735b44',7,5,3,10);r('#8e8066',2,3,12,5);r('#e5ece6',1,2,12,2);return}
 if(t==='snowHand'){r('#b4c9d0',1,10,14,4);r('#605455',6,7,5,4);r('#493f42',6,4,1,5);r('#685754',8,3,1,6);r('#dddeda',2,11,10,2);return}
 if(t==='soupTable'){if(['soup','morning'].includes(winter?.step)){r('#634e43',9,0,5,4);r('#dbc8a8',10,3,4,3);r('#9d9c8d',9,6,6,3)}r('#764e39',1,7,14,4);r('#946748',2,11,2,4);r('#946748',12,11,2,4);r('#9cbbb1',5,6,6,2);r('#e4ab67',5,5,6,1);return}
 if(t==='driveCase'){r('#59473b',1,10,14,4);r('#ad8555',2,7,12,5);r('#d4b686',3,6,10,2);r('#647b79',4,3,3,4);r('#91a8a0',9,4,3,3);return}
 if(t==='hoist'){r('#77553f',2,3,2,12);r('#77553f',12,3,2,12);r('#aa8456',1,2,14,2);r('#c8aa70',6,4,4,4);r('#51423e',8,6,1,6);let h=['morning','grinder','shards','before','furnace','after','sorting','works','report','end'].includes(winter?.step)?s.turn%3:0;r('#675d52',5,11-h,7,3);return}
 if(t==='grinder'){r('#684b3b',2,11,12,3);r('#a9b0ac',4,4,8,8);r('#cbd1c8',5,3,6,1);r('#758584',6,6,4,4);r('#634e3d',7,7,2,2);return}
 if(t==='testWeight'){r('#9b7955',2,12,12,2);r('#827a6d',3,3,2,10);r('#b89d76',3,2,9,2);r('#5c5f5e',10,4,1,5);r('#737976',8,8,5,3);return}
 if(t==='bellows'){r('#694739',2,10,11,3);r(winter?.bellows?'#ce8e52':'#ac7959',4,6,7,4);r('#ddb37a',2,5,9,2);r('#797b70',11,8,4,2);if(winter?.bellows)r('#efb659',14,6,2,3);return}
 if(t==='haulCart'){r('#4d4542',2,11,3,3);r('#4d4542',11,11,3,3);r('#9f724a',1,8,14,4);r('#bc925c',1,7,14,2);if(winter&&['sorting','works','report','end'].includes(winter.step)){r('#728a91',4,5,8,2);r('#a2b7b4',6,4,4,2);r('#8ac4ba',11,10,2,1)}return}
 if(t==='fieldPlan'){r('#846649',3,8,2,7);r('#d5c19b',2,4,12,6);r('#6d948e',4,6,5,1);if(winter?.plot){r('#8d6745',11,10,1,5);r('#99734f',14,9,1,4)}return}
 if(t==='boat'){r('#1d3a52',0,13,16,3);r('#3b2a1c',0,8,16,6);r('#8a633a',1,8,14,5);r('#c09a5e',0,8,16,1);r('#5d4128',3,10,10,2);r('#3b2a1c',1,13,14,1);r('#a58a5a',12,3,1,6);r('#cdb98a',11,2,3,2);return}
 if(t==='stones'){r('#6f7a74',2,4,3,10);r('#a9b3a4',2,4,2,8);r('#6f7a74',11,4,3,10);r('#a9b3a4',11,4,2,8);r('#7d8a82',6,2,4,3);r('#b9c3b0',6,2,3,1);r(s.rings&&Object.keys(s.rings).length?'#9fe3c8':'#56706a',6,8,4,4);r('#e2f5e2',7,9,2,2);return}
 if(t==='rubble'){r('#3a3f42',1,6,14,9);r('#6a6f6b',2,7,5,4);r('#858a82',3,7,3,1);r('#5b605e',8,5,6,5);r('#7c817a',9,5,3,1);r('#4d5254',4,11,7,3);r('#70756f',5,11,3,1);return}
 if(t==='chasm'){r('#0b0d12',0,2,16,12);r('#1b2029',0,2,16,2);r('#1b2029',0,12,16,2);r('#2c323a',2,1,4,1);r('#2c323a',9,14,5,1);return}
 if(t==='torch'){r('#6b4a2c',7,6,2,9);r('#8f6a3d',7,6,1,8);r('#c9682e',6,2,4,5);r('#f0b452',7,1,2,4);r('#fbe7a2',7,3,1,2);return}
 if(t==='bread'){r('#7a5226',3,8,10,5);r('#c08a48',3,7,10,4);r('#e0b46c',4,7,8,1);r('#8f6230',5,9,1,2);r('#8f6230',8,9,1,2);r('#8f6230',11,9,1,2);return}
 if(t==='rod'){r('#8a6a3c',3,13,10,1);r('#b08c50',4,3,1,10);r('#b08c50',5,2,6,1);r('#dfe6e0',11,3,1,7);r('#c0563a',10,10,3,2);return}
 if(t==='pick'){r('#7a5a36',7,3,2,12);r('#a07a48',7,3,1,11);r('#9aa3a0',2,3,12,2);r('#c8d0c8',2,3,11,1);r('#6d7674',2,5,2,2);r('#6d7674',12,5,2,2);return}
 if(t==='rope'){r('#8f7444',3,5,10,8);r('#c2a468',4,5,8,1);r('#6a5430',5,7,6,4);r('#c2a468',4,9,8,1);r('#a88b52',11,11,3,3);return}
 if(t==='bell'){r('#60452f',1,1,2,14);r('#60452f',13,1,2,14);r('#b5985b',1,1,14,2);r('#d3b96d',5,4,6,7);r('#ebd795',6,4,2,5);r('#9d7d42',3,11,10,2);r('#d6c38f',7,13,2,2);return}
 if(t==='wheel'){r('#644e34',1,1,14,14);r('#bb995f',2,2,12,12);r('#4a3f2c',4,4,8,8);r('#c8ab73',7,1,2,14);r('#c8ab73',1,7,14,2);r('#453c2f',7,7,2,2);return}
 if(t==='lever'){r('#848c7d',3,11,10,4);r('#b4b6a0',4,10,8,2);r('#655440',7,4,2,8);r('#d3aa63',6,2,4,3);return}
 if(t==='cart'){r('#363b32',1,12,3,3);r('#363b32',12,12,3,3);r('#785c3e',1,4,14,8);r('#ac8957',1,3,14,2);r('#443a2c',3,5,10,4);r('#65695b',4,6,4,3);r('#9a9b82',9,5,3,3);return}
 if(t==='bow'){r('#c19d5b',9,2,2,12);r('#c19d5b',6,1,3,2);r('#c19d5b',6,13,3,2);r('#ece1ba',5,2,1,12);return}
 if(t==='sword'||t==='spear'||t==='staff'||t==='axe'){r('#d5cba8',8,1,2,11);r('#705038',8,10,2,5);r('#ba9e61',5,10,8,2);if(t==='axe')r('#a7b3a8',4,2,8,5);return}
 if(t==='armor'||t==='shield'){r('#596a68',4,3,8,10);r('#a7b6a7',5,3,6,2);r('#84968b',3,5,10,5);return}
 if(t==='ring'||t==='charm'){r('#c5a65e',4,4,8,8);r('#36554d',6,6,4,4);r('#b8ded1',6,3,4,3);return}

 if(t==='sign'){r('#4a3424',7,7,2,8);r('#483728',2,2,12,8);r('#ae8950',3,2,10,6);r('#d0ad6c',3,2,10,1);r('#765734',4,4,7,1);r('#765734',4,6,5,1);return}
 if(t==='chest'){r('#3a3026',2,6,12,8);r('#986938',3,5,10,8);r('#bc8c4d',3,4,10,3);r('#6c492c',3,9,10,1);r('#4b4b3b',4,5,2,8);r('#4b4b3b',11,5,2,8);r('#c1aa68',4,5,1,7);r('#c1aa68',11,5,1,7);r('#d5bd69',8,8,2,3);return}
 if(t==='barrel'){r('#453c28',4,3,8,12);r('#946f3b',3,4,10,9);r('#b08d4f',5,4,2,9);r('#674c2d',9,3,2,11);r('#494d41',3,5,10,2);r('#494d41',3,11,10,2);r('#b59a65',5,2,6,1);return}
 if(t==='well'){r('#444d4c',2,8,12,6);r('#a0a18a',3,7,10,6);r('#c1bda0',2,6,12,3);r('#455c62',4,6,8,2);r('#1a394a',5,6,6,2);r('#747e71',4,10,1,3);r('#747e71',10,9,1,4);r('#5b4028',2,1,2,8);r('#5b4028',12,1,2,8);r('#936b3b',2,1,12,2);r('#b39a61',8,3,1,5);return}
 if(t==='lamp'){r('#5f5843',7,5,2,10);r('#aaa777',5,14,6,1);r('#3e4436',4,3,8,6);r(s.lamp||s.flags?.lamp?'#ffdc76':'#667969',5,4,6,4);r('#d5b76c',6,2,4,1);r('#b4a770',4,3,1,5);r('#b4a770',11,3,1,5);return}
 if(t==='herb'){r('#324b2c',7,7,2,8);r('#81a34e',4,6,4,3);r('#adc36b',5,6,2,1);r('#6f963f',8,3,4,4);r('#abc56c',9,3,2,1);r('#608b39',9,10,4,2);r('#c8b6c3',4,3,2,2);r('#e1c9c2',5,2,1,2);return}
 if(t==='gate'){r('#929b8a',1,1,3,14);r('#cad0b4',1,1,2,13);r('#929b8a',12,1,3,14);r('#cad0b4',12,1,2,13);r('#8b9687',3,1,10,2);if(!(s.gate||s.flags?.gate)){for(let x=4;x<13;x+=3)r('#657b74',x,3,1,12);r('#a8b09b',3,6,10,1);r('#a8b09b',3,11,10,1)}return}
 if(t==='crystal'){r('#316d74',6,5,5,9);r('#76c6b2',5,6,3,5);r('#b1ead1',7,2,2,9);r('#5cb5ae',9,5,2,7);r('#d2f3d9',7,3,1,4);r('#4d918c',4,11,8,3);return}
 if(t==='altar'){r('#566e68',2,10,12,5);r('#99ad97',3,8,10,4);r('#d0c6a0',2,7,12,2);r('#647e71',5,4,6,4);r('#ace2ba',7,1,2,6);r('#e3efd1',7,2,1,3);r('#bac49d',4,11,2,2);r('#bac49d',10,11,2,2);return}
 if(t==='camp'){r('#4d3928',3,12,10,2);r('#916038',4,10,2,5);r('#916038',10,10,2,5);r('#aa522f',5,6,6,6);r('#d98035',6,3,3,8);r('#f0c15a',7,7,3,5);r('#f6e1a0',8,9,1,2);r('#817f68',2,13,2,2);r('#817f68',12,13,2,2);return}
 if(t==='bed'){r('#563c2a',2,1,12,14);r('#ad8450',2,1,1,14);r('#ad8450',13,1,1,14);r('#9da29b',4,2,8,3);r('#ddd6bb',4,2,7,2);r('#4c7381',4,6,8,8);r('#7095a0',4,6,2,7);r('#a7b8aa',4,7,8,1);r('#ab8450',2,14,12,1);return}
 if(t==='table'){r('#483625',2,4,12,10);r('#67482d',3,10,2,5);r('#67482d',11,10,2,5);r('#9e7747',1,3,14,8);r('#c09b60',1,3,14,1);r('#6e5032',1,10,14,1);r('#b08a53',3,5,9,1);r('#bfbca2',6,5,4,3);r('#e1d9b9',7,5,2,1);return}
 if(t==='chair'){r('#61452d',4,2,8,12);r('#b28a4d',4,2,1,6);r('#b28a4d',11,2,1,6);r('#ab8046',4,2,8,2);r('#4d3827',6,4,4,4);r('#b28a4d',4,8,8,3);r('#573e29',4,12,2,3);r('#573e29',10,12,2,3);return}
 if(t==='book'){r('#433b2d',3,5,11,8);r('#e2d5ac',3,4,10,8);r('#afc0a7',3,4,4,7);r('#bd8155',7,4,1,8);r('#9b8963',9,6,3,1);r('#9b8963',9,8,2,1);return}
 r('#ad9467',4,5,8,8);r('#dfc792',5,5,6,1);
}
function extraTile(g,t,x,y){
 if(t==='marsh'){tile(g,'grass',x,y);rect(g,'#476a5b',1,7,12,5);dots(g,'#789584',[[2,8,4],[9,10,3]]);dots(g,'#9da567',[[4,4,1,7],[12,2,1,8],[13,5,2]]);return}
 if(t==='bridge'){tile(g,'water',x,y);rect(g,'#473e2e',0,0,16,16);for(let i=0;i<16;i+=4){rect(g,'#96784d',i,0,3,16);rect(g,'#c0a16a',i,0,1,16)}return}
 if(t==='sand'){rect(g,'#c3b87c',0,0,16,16);dots(g,'#a59865',[[1,3],[8,11,2],[13,5],[4,14]]);return}
 if(t==='mountain'){tile(g,'grass',x,y);rect(g,'#38413b',0,8,16,8);rect(g,'#666b60',2,5,12,9);rect(g,'#858777',4,2,7,10);rect(g,'#b4b19a',7,0,3,4);rect(g,'#535d52',11,6,4,9);return}
 tile(g,'grass',x,y);
 if(t==='flowers'){dots(g,'#ceb46c',[[2,3,2,2],[10,11,2,2],[13,4]]);dots(g,'#e2c6bd',[[6,8,2,2],[3,13]]);return}
 if(t==='field'){rect(g,'#695338',0,0,16,16);for(let i=1;i<16;i+=5){rect(g,'#a59651',i,0,1,16);dots(g,'#c7b769',[[i,2,3,2],[i,8,3,2],[i,13,3,2]])}return}
 if(t==='orchard'){tile(g,'tree',x,y);dots(g,'#bc6d42',[[4,5,2,2],[10,7,2,2],[7,2,2,2]])}
}
function roof(g,b,s={}){const w=b.w*16,h=(b.h-1)*16;rect(g,'#263029',1,4,w,h-4);for(let y=0;y<h-3;y+=4){rect(g,shade(b.roof,1-y/h*.35),0,y,w,4);rect(g,shade(b.roof,.62),0,y+3,w,1);for(let x=(y%8===0?0:5);x<w;x+=10)rect(g,shade(b.roof,.74),x,y,1,3)}rect(g,'#c1ae7c',0,0,w,2);rect(g,'#4d382e',0,h-3,w,3);rect(g,'#d3b981',0,h-3,w,1);const doorX=(b.door[0]-b.x)*16;tileAtDoor(g,doorX,h);if(s.openedDoors?.[b.door.join(',')])rect(g,'#1b282b',doorX+3,h+3,10,13);rect(g,'#5a5c51',w-22,4,10,14);rect(g,'#aaa58c',w-22,4,10,3);rect(g,'#373f38',w-20,5,6,1)}
function tileAtDoor(g,x,y){rect(g,'#252c27',x,y,16,16);rect(g,'#b29a65',x+2,y+1,12,2);rect(g,'#715435',x+3,y+3,10,13);rect(g,'#a48550',x+4,y+3,1,12);rect(g,'#d2b86d',x+11,y+9,1,2)}
function held(g,t,shield){if(t==='bow'){rect(g,'#d3b874',13,5,2,7);rect(g,'#e3ddba',12,6,1,6);rect(g,'#90723e',12,4,2,1);rect(g,'#90723e',12,12,2,1)}else if(t==='staff'){rect(g,'#9d824d',13,3,1,12);rect(g,'#9bd8be',12,2,3,3)}else if(t==='spear'){rect(g,'#a59061',13,4,1,12);rect(g,'#d6ded2',12,1,3,4)}else{rect(g,'#c8d1c4',13,7,1,7);rect(g,'#a39665',12,12,3,1)}if(shield){rect(g,'#957849',1,8,4,6);rect(g,'#cab57a',1,8,4,1);rect(g,'#d5c6a0',2,9,1,4)}}
root.Painter={tile,sprite,object,roof,held};if(typeof module!=='undefined')module.exports=root.Painter;
})(typeof window!=='undefined'?window:globalThis);
