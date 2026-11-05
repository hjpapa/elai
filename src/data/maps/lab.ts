import type { MapDef } from '../schema';
import { Painter } from './paint';
const p=new Painter(18,14,'.').border('#');
p.rect(5,3,7,4,'#').rect(11,9,12,10,'#');
export const lab: MapDef={
 id:'lab',name:'인식의 연구소',chapter:'ch5',theme:'lab',rows:p.rows(),legend:{'.':'lab','#':'labwall'},spawn:{x:2,y:11},checkpoint:{map:'lab',at:{x:2,y:11}},
 objects:[
  {id:'researcher',type:'npc',at:{x:8,y:8},npc:'researcher',missions:['ch5-p1-m1','ch5-p1-m2','ch5-p2-m1','ch5-p2-m2','ch5-p3-m1'],talk:['표본은 살펴볼 예시를 말해요.\n여러 종류를 고르게 모아 봐요.']},
  {id:'slime-a',type:'mob',at:{x:13,y:5},mob:'shapeSlime',wander:1},
  {id:'slime-b',type:'mob',at:{x:14,y:10},mob:'shapeSlime',wander:1},
  {id:'chest-lab',type:'chest',at:{x:2,y:3},reward:{xp:12,coins:25,items:[{id:'apple',qty:2}]}},
  {id:'scope',type:'prop',at:{x:9,y:7},sprite:'prop-microscope',solid:true},
  {id:'jar',type:'prop',at:{x:4,y:5},sprite:'prop-jar',frame:1,solid:true},
  {id:'sign-start',type:'sign',at:{x:3,y:11},text:'연구원 여울과 모델을 학습해요.\n새 표본으로 시험도 해 봐요.'},
  {id:'sign-door',type:'sign',at:{x:15,y:2},text:'학습 칩과 내 모델을 얻으면\n안쪽 표본실 문이 열려요.'},
  {id:'to-village',type:'portal',at:{x:1,y:11},to:{map:'village',at:{x:15,y:19}},label:'코딩 마을'},
  {id:'to-labdeep',type:'portal',at:{x:16,y:2},to:{map:'labdeep',at:{x:2,y:8}},label:'변신 표본실',open:{mission:'ch5-p3-m1'},lockedText:'여울과 모델을 학습하고 시험하면\n안쪽 문이 열려요.',sprite:'prop-gate'},
 ],
};
