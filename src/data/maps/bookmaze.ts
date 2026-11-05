import type { MapDef } from '../schema';
import { Painter } from './paint';
const p=new Painter(17,13,'.').border('#');p.hline(2,14,4,'#').set(4,4,'.').set(12,4,'.');p.hline(2,14,8,'#').set(8,8,'.');
export const bookmaze: MapDef={
 id:'bookmaze',name:'공방 자료실',chapter:'ch7',theme:'workshop',fog:true,rows:p.rows(),legend:{'.':'wood','#':'wall'},spawn:{x:2,y:10},checkpoint:{map:'bookmaze',at:{x:2,y:10}},
 objects:[
  {id:'to-workshop',type:'portal',at:{x:1,y:10},to:{map:'workshop',at:{x:15,y:2}},label:'프롬프트 공방'},
  {id:'sign-source',type:'sign',at:{x:3,y:10},text:'앵무새의 말을 바로 믿지 않아요.\n자료를 열어 읽고 비교해요.'},
  {id:'parrot-maze',type:'mob',at:{x:10,y:6},mob:'babbleParrot',wander:1},
  {id:'books-a',type:'prop',at:{x:4,y:6},sprite:'prop-bookshelf',solid:true},
  {id:'books-b',type:'prop',at:{x:12,y:2},sprite:'prop-bookshelf',solid:true},
  {id:'chest-bookmaze',type:'chest',at:{x:3,y:6},reward:{xp:15,coins:30,items:[{id:'jelly',qty:2}]}},
  {id:'chief',type:'npc',at:{x:8,y:2},npc:'babbleKing',missions:['ch7-boss-m1','ch7-boss-m2','ch7-boss-m3'],when:{notFlag:'parrot-fixed'}},
  {id:'chief-fixed',type:'npc',at:{x:8,y:2},npc:'babbleKing',sprite:'boss-babble-king',frame:3,missions:['ch7-boss-m1','ch7-boss-m2','ch7-boss-m3'],when:{flag:'parrot-fixed'},talk:['말하기 전에 자료를 확인할게요.\n도움을 받은 것도 밝힐게요.']},
  {id:'to-village',type:'portal',at:{x:9,y:2},to:{map:'village',at:{x:12,y:14}},label:'코딩 마을',when:{flag:'ch7-clear'}},
 ],
};
