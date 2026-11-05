import type { MapDef } from '../schema';
import { Painter } from './paint';
const p = new Painter(18,16,'.').border('#');
p.rect(5,3,7,4,'#').rect(11,10,12,11,'#');
export const castle: MapDef = {
 id:'castle', name:'윤리의 성', chapter:'ch8', theme:'castle', rows:p.rows(), legend:{'.':'castle','#':'castlewall'},
 spawn:{x:2,y:13}, checkpoint:{map:'castle',at:{x:2,y:13}},
 objects:[
  {id:'keeper',type:'npc',at:{x:8,y:8},npc:'keeper',missions:['ch8-p1-m1','ch8-p2-m1','ch8-p2-m2','ch8-p3-m1'],talk:['실제 자료에는 빠진 친구가 없나요?\n함께 살펴보고 잘못된 곳을 고쳐요.','AI는 사람의 성장을 도와요.\n마지막 결정은 사람이 책임져요.']},
  {id:'shadow-a',type:'mob',at:{x:13,y:5},mob:'fakeShadow',wander:1},
  {id:'shadow-b',type:'mob',at:{x:14,y:12},mob:'fakeShadow',wander:1},
  {id:'chest-castle',type:'chest',at:{x:2,y:4},reward:{xp:15,coins:35,items:[{id:'apple',qty:2}]}},
  {id:'mirror',type:'prop',at:{x:9,y:7},sprite:'prop-mirror',frame:0,solid:true},
  {id:'banner',type:'prop',at:{x:4,y:5},sprite:'prop-banner',solid:true},
  {id:'sign-start',type:'sign',at:{x:3,y:13},text:'성지기 이음과 자료를 살펴봐요.\n개인정보와 다른 사람을 존중해요.'},
  {id:'sign-door',type:'sign',at:{x:15,y:2},text:'거울 속 자료를 확인하면\n거울 미로 문이 열려요.'},
  {id:'to-village',type:'portal',at:{x:1,y:13},to:{map:'village',at:{x:9,y:20}},label:'코딩 마을'},
  {id:'to-mirrormaze',type:'portal',at:{x:16,y:2},to:{map:'mirrormaze',at:{x:2,y:10}},label:'거울 미로',open:{mission:'ch8-p3-m1'},lockedText:'그림과 글의 근거를 확인하면\n거울 미로 문이 열려요.',sprite:'prop-gate'},
 ],
};
