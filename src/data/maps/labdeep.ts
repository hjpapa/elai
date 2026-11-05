import type { MapDef } from '../schema';
import { Painter } from './paint';
const p=new Painter(19,11,'.').border('#');
p.vline(6,1,9,'#').set(6,8,'.').vline(12,1,9,'#').set(12,3,'.');
export const labdeep: MapDef={
 id:'labdeep',name:'변신 표본실',chapter:'ch5',theme:'lab',fog:true,rows:p.rows(),legend:{'.':'lab','#':'labwall'},spawn:{x:2,y:8},checkpoint:{map:'labdeep',at:{x:2,y:8}},
 objects:[
  {id:'to-lab',type:'portal',at:{x:1,y:8},to:{map:'lab',at:{x:15,y:2}},label:'인식의 연구소'},
  {id:'sign-features',type:'sign',at:{x:3,y:8},text:'숫자 특징이 달라도 같은 종류일까요?\n처음 보는 표본을 모델로 살펴봐요.'},
  {id:'slime-test',type:'mob',at:{x:9,y:6},mob:'shapeSlime',wander:1},
  {id:'jar-one',type:'prop',at:{x:3,y:3},sprite:'prop-jar',solid:true},
  {id:'jar-two',type:'prop',at:{x:9,y:2},sprite:'prop-jar',frame:1,solid:true},
  {id:'chest-labdeep',type:'chest',at:{x:15,y:8},reward:{xp:12,coins:25,items:[{id:'jelly',qty:2}]}},
  {id:'chief',type:'npc',at:{x:16,y:2},npc:'shiftKing',missions:['ch5-boss-m1','ch5-boss-quiz','ch5-boss-m2'],when:{notFlag:'shift-fixed'}},
  {id:'chief-fixed',type:'npc',at:{x:16,y:2},npc:'shiftKing',sprite:'boss-shift-king',frame:3,missions:['ch5-boss-m1','ch5-boss-quiz','ch5-boss-m2'],when:{flag:'shift-fixed'},talk:['처음 보는 표본도 살펴봤군요.\n마을에 새 연구 도구가 생겼어요.']},
  {id:'to-village',type:'portal',at:{x:17,y:2},to:{map:'village',at:{x:12,y:14}},label:'코딩 마을',when:{flag:'ch5-clear'}},
 ],
};
