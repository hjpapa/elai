import type { MapDef } from '../schema';
import { Painter } from './paint';
const p=new Painter(18,16,'.').border('#');p.rect(5,3,7,4,'#').rect(11,10,12,11,'#');
// 오른쪽 전시 단은 끝을 꺾고, 아래쪽 나무 계단으로 올라요.
const hp=new Painter(18,16,'0');
hp.rect(11,7,15,8,'2').rect(14,9,15,9,'2').set(15,10,'1');
export const workshop: MapDef={
 id:'workshop',name:'프롬프트 공방',chapter:'ch7',theme:'workshop',rows:p.rows(),legend:{'.':'wood','#':'wall'},spawn:{x:2,y:13},checkpoint:{map:'workshop',at:{x:2,y:13}},
 heights:hp.rows(),
 objects:[
  {id:'chest-exhibition',type:'chest',at:{x:11,y:7},reward:{coins:8,items:[{id:'jelly',qty:1}]}},
  {id:'sign-exhibition',type:'sign',at:{x:13,y:7},text:'원하는 색과 모양을 적어요.\n나온 작품을 보고 고쳐 봐요.'},
  {id:'zen',type:'npc',at:{x:8,y:8},npc:'zen',missions:['ch7-p1-m1','ch7-p2-m1','ch7-p2-m2','ch7-p2-m3','ch7-p3-m1'],talk:['주문서는 부탁하는 글이에요.\n원하는 조건을 또렷하게 알려요.','이름·주소·전화번호·학교·얼굴 사진은\nAI에게 보내지 않아요.']},
  {id:'parrot-a',type:'mob',at:{x:13,y:5},mob:'babbleParrot',wander:1},
  {id:'parrot-b',type:'mob',at:{x:14,y:12},mob:'babbleParrot',wander:1},
  {id:'chest-workshop',type:'chest',at:{x:2,y:4},reward:{xp:15,coins:30,items:[{id:'apple',qty:2}]}},
  {id:'easel',type:'prop',at:{x:9,y:7},sprite:'prop-easel',solid:true},
  {id:'books',type:'prop',at:{x:4,y:5},sprite:'prop-bookshelf',solid:true},
  {id:'sign-start',type:'sign',at:{x:3,y:13},text:'젠과 글·그림 주문서를 만들어요.\n실제 AI 대신 작은 모형으로 배워요.'},
  {id:'sign-door',type:'sign',at:{x:15,y:2},text:'그림 주문서를 완성하면\n공방 자료실 문이 열려요.'},
  {id:'to-village',type:'portal',at:{x:1,y:13},to:{map:'village',at:{x:11,y:19}},label:'코딩 마을'},
  {id:'to-bookmaze',type:'portal',at:{x:16,y:2},to:{map:'bookmaze',at:{x:2,y:10}},label:'공방 자료실',open:{mission:'ch7-p3-m1'},lockedText:'그림 주문서를 고쳐 완성하면\n자료실 문이 열려요.',sprite:'prop-gate'},
 ],
};
