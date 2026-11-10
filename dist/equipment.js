(function(root){'use strict';
const items={
 dagger:{name:'旅人の短剣',slot:'weapon',atk:6,range:1,weight:1,price:12,icon:'sword',desc:'取り回しのよい短剣。隣の敵を攻撃。'},
 sword:{name:'鉄の長剣',slot:'weapon',atk:9,range:1,weight:3,price:28,icon:'sword',desc:'盾と組み合わせられる、手堅い近接武器。'},
 spear:{name:'鋼の槍',slot:'weapon',atk:8,range:2,weight:3,price:34,icon:'spear',desc:'2マス先へ突く。壁越しの攻撃はできない。'},
 axe:{name:'鉱夫の戦斧',slot:'weapon',atk:13,range:1,weight:5,price:44,icon:'axe',twohand:true,desc:'高威力の両手武器。盾は同時に使えない。'},
 bow:{name:'狩人の弓',slot:'weapon',atk:7,range:5,weight:2,price:24,icon:'bow',ammo:true,twohand:true,desc:'射程5。1射につき矢を1本消費。壁や木が射線を遮る。'},
 longbow:{name:'梓の長弓',slot:'weapon',atk:11,range:7,weight:3,price:52,icon:'bow',ammo:true,twohand:true,desc:'射程7の両手弓。遠くの敵を狙える。矢を消費。'},
 staff:{name:'樫の杖',slot:'weapon',atk:3,range:1,power:2,weight:2,price:18,icon:'staff',desc:'霊術の威力と回復量を2高める。'},
 crystalstaff:{name:'霊晶の杖',slot:'weapon',atk:5,range:1,power:6,weight:2,price:58,icon:'staff',desc:'霊術の威力と回復量を6高める。'},
 cloth:{name:'旅の服',slot:'armor',def:1,weight:1,price:8,icon:'armor',desc:'軽い旅装。防御+1。'},
 leather:{name:'革の鎧',slot:'armor',def:3,weight:3,price:20,icon:'armor',desc:'弓手にも扱いやすい鎧。防御+3。'},
 chainmail:{name:'鎖かたびら',slot:'armor',def:5,weight:6,price:40,icon:'armor',desc:'金属の輪で刃を受ける。防御+5。'},
 plate:{name:'鋼の胸当て',slot:'armor',def:7,weight:9,price:66,icon:'armor',desc:'重く、頑丈な防具。防御+7。'},
 robe:{name:'封印術師の衣',slot:'armor',def:2,mp:4,weight:1,price:32,icon:'armor',desc:'防御+2、最大MP+4。'},
 shield:{name:'木の盾',slot:'shield',def:2,weight:2,price:14,icon:'shield',desc:'片手武器と併用。防御+2。'},
 ironshield:{name:'鉄の盾',slot:'shield',def:4,weight:4,price:34,icon:'shield',desc:'片手武器と併用。防御+4。'},
 moon_ring:{name:'月光の指輪',slot:'accessory',mp:6,weight:0,price:40,icon:'ring',desc:'最大MP+6。宿や野営で回復する。'},
 silver_ring:{name:'銀の指輪',slot:'accessory',def:2,weight:0,price:30,icon:'ring',desc:'身を守る小さな封印。防御+2。'},
 ward_charm:{name:'守りの護符',slot:'accessory',def:3,weight:0,price:46,icon:'charm',desc:'防御+3。'},
 spirit_charm:{name:'共鳴の首飾り',slot:'accessory',power:4,weight:0,price:48,icon:'charm',desc:'霊術の威力と回復量+4。'},
 herb_charm:{name:'若葉の腕輪',slot:'accessory',healing:8,weight:0,price:26,icon:'ring',desc:'装備者が使う薬草の回復量+8。'}
};
const slots={weapon:'武器',armor:'防具',shield:'盾',accessory:'アクセサリー'};
function ensure(s){for(const p of s.party){if(p.gear)continue;const ed=p.id==='ed',celes=p.id==='celes';p.gear={weapon:ed?'sword':celes?'staff':'dagger',armor:ed?'leather':celes?'robe':'cloth',shield:ed?'shield':null,accessory:null};p.pack={};for(const id of Object.values(p.gear).filter(Boolean))p.pack[id]=(p.pack[id]||0)+1;p.baseMP=p.id==='yuris'?12:celes?16:ed?0:10;p.baseAtk=p.id==='yuris'?2:ed?3:1;p.maxmp=stats(p).maxmp;p.mp=Math.min(p.mp||0,p.maxmp);p.tactic='manual'} }
function stats(p){const gear=Object.values(p.gear||{}).map(id=>items[id]).filter(Boolean),w=items[p.gear?.weapon];return {atk:(p.baseAtk??2)+(w?.atk||0),def:gear.reduce((n,i)=>n+(i.def||0),0),power:gear.reduce((n,i)=>n+(i.power||0),0),maxmp:(p.baseMP??12)+gear.reduce((n,i)=>n+(i.mp||0),0),range:w?.range||1,healing:gear.reduce((n,i)=>n+(i.healing||0),0),weight:Object.entries(p.pack||{}).reduce((n,[id,q])=>n+(items[id]?.weight||0)*q,0),capacity:p.id==='ed'?32:24};}
function equip(p,id){const i=items[id];if(!i||!(p.pack[id]>0))return false;if(i.slot==='shield'&&items[p.gear.weapon]?.twohand)return false;p.gear[i.slot]=p.gear[i.slot]===id?null:id;if(i.twohand)p.gear.shield=null;p.maxmp=stats(p).maxmp;p.mp=Math.min(p.mp,p.maxmp);return true}
function add(s,id,qty=1,person){ensure(s);let p=person||s.party.find(p=>stats(p).weight+(items[id]?.weight||0)*qty<=stats(p).capacity);if(!p||!items[id]||stats(p).weight+(items[id].weight||0)*qty>stats(p).capacity)return false;p.pack[id]=(p.pack[id]||0)+qty;return true}
function give(from,to,id){if(!(from.pack[id]>0)||Object.values(from.gear).includes(id)||stats(to).weight+(items[id]?.weight||0)>stats(to).capacity)return false;from.pack[id]--;to.pack[id]=(to.pack[id]||0)+1;return true}
function takeOff(p,id){for(const k of Object.keys(p.gear))if(p.gear[k]===id)p.gear[k]=null;p.mp=Math.min(p.mp,stats(p).maxmp)}
const spells={bolt:{name:'霊光',mp:3,range:5,kind:'enemy',desc:'光の矢。単体に14＋術力。'},heal:{name:'癒し',mp:4,range:5,kind:'ally',desc:'仲間一人を20＋術力回復。倒れた仲間も立ち上がる。'},sleep:{name:'まどろみ',mp:4,range:4,kind:'enemy',desc:'敵一体を3回の敵行動の間眠らせる。攻撃すると目を覚ます。'},fire:{name:'炎の輪',mp:7,range:4,kind:'enemy',desc:'対象と周囲1マスの敵に12＋術力。味方を巻き込まない。'},light:{name:'灯火',mp:2,kind:'self',desc:'夜の視界を広げる。60行動持続。'},ward:{name:'守護',mp:5,kind:'self',desc:'味方全員の被害を3軽減。次の敵3巡まで。'}};
root.Gear={items,slots,ensure,stats,equip,add,give,takeOff,spells};if(typeof module!=='undefined')module.exports=root.Gear;
})(typeof window==='undefined'?globalThis:window);
