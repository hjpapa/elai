import type { MapDef } from '../schema';
import { Painter } from './paint';
const p=new Painter(18,16,'.').border('#');
p.rect(5,3,7,4,'#').rect(11,10,12,11,'#');
// 망원경 위쪽의 둥근 관측 단. NPC 둘레를 비워 두고 오른쪽의 꺾인 계단으로 올라요.
const hp = new Painter(18, 16, '0');
hp.rect(9, 3, 11, 4, '3').set(10, 2, '3').set(10, 5, '3');
hp.set(10, 6, '2').set(11, 6, '1');
export const observatory: MapDef={
 id:'observatory',name:'길잡이 천문대',chapter:'ch6',theme:'observatory',rows:p.rows(),heights:hp.rows(),legend:{'.':'observatory','#':'observatorywall'},spawn:{x:2,y:13},checkpoint:{map:'observatory',at:{x:2,y:13}},
 objects:[
  {id:'chest-observation',type:'chest',at:{x:9,y:3},reward:{coins:8,items:[{id:'jelly',qty:1}]}},
  {id:'sign-observation',type:'sign',at:{x:10,y:2},text:'둥근 단에서 별을 살펴봐요.\n어제와 무엇이 달라졌나요?'},
  {id:'astronomer',type:'npc',at:{x:8,y:8},npc:'astronomer',missions:['ch6-p1-m1','ch6-p2-m1','ch6-p3-m1'],talk:['기록은 앞일을 가늠하는 단서예요.\n실제와 다르면 다시 살펴봐요.']},
  {id:'fox-a',type:'mob',at:{x:13,y:5},mob:'cometFox',wander:1},
  {id:'fox-b',type:'mob',at:{x:14,y:12},mob:'cometFox',wander:1},
  {id:'chest-observatory',type:'chest',at:{x:2,y:4},reward:{xp:15,coins:30,items:[{id:'apple',qty:2}]}},
  {id:'telescope',type:'prop',at:{x:9,y:7},sprite:'prop-telescope',solid:true},
  {id:'lamp',type:'prop',at:{x:4,y:5},sprite:'prop-starlamp',frame:1,solid:true},
  {id:'sign-start',type:'sign',at:{x:3,y:13},text:'별지기 온유와 기록을 비교해요.\n예측 모듈을 얻고 미궁으로 가요.'},
  {id:'sign-door',type:'sign',at:{x:15,y:2},text:'적은 기록과 많은 기록을 비교하면\n별자리 미궁 문이 열려요.'},
  {id:'to-village',type:'portal',at:{x:1,y:13},to:{map:'village',at:{x:13,y:19}},label:'코딩 마을'},
  {id:'to-starmaze',type:'portal',at:{x:16,y:2},to:{map:'starmaze',at:{x:2,y:10}},label:'별자리 미궁',open:{mission:'ch6-p3-m1'},lockedText:'두 예측 결과를 비교하면\n미궁 문이 열려요.',sprite:'prop-gate'},
 ],
};
