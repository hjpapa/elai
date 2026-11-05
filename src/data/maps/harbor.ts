import type { MapDef } from '../schema';
import { Painter } from './paint';
const p=new Painter(20,16,'.').border('~');
p.rect(3,3,5,5,'#').rect(13,8,15,9,'#');
export const harbor: MapDef={
  id:'harbor',name:'데이터 항구',chapter:'ch4',theme:'harbor',rows:p.rows(),
  legend:{'.':'dock','#':'crate','~':'water'},spawn:{x:2,y:13},checkpoint:{map:'harbor',at:{x:2,y:13}},
  objects:[
    {id:'keeper',type:'npc',at:{x:8,y:8},npc:'harborKeeper',missions:['ch4-p1-m1','ch4-p1-m2','ch4-p2-m1','ch4-p2-m2','ch4-p3-m1'],talk:['서로 다른 기록도 함께 모아 봐요.\n정리하면 새로운 규칙이 보여요.']},
    {id:'jelly-a',type:'mob',at:{x:10,y:5},mob:'fogJelly',wander:1},
    {id:'jelly-b',type:'mob',at:{x:13,y:12},mob:'fogJelly',wander:1},
    {id:'chest-harbor',type:'chest',at:{x:2,y:4},reward:{xp:12,coins:20,items:[{id:'apple',qty:2}]}},
    {id:'lighthouse-prop',type:'prop',at:{x:16,y:3},sprite:'prop-lighthouse',frame:1,solid:true},
    {id:'buoy',type:'prop',at:{x:5,y:11},sprite:'prop-buoy',frame:1,solid:true},
    {id:'sign-entry',type:'sign',at:{x:3,y:13},text:'항구지기 모아에게 먼저 가요.\n데이터 렌즈로 물결을 살펴봐요.'},
    {id:'sign-door',type:'sign',at:{x:17,y:2},text:'등불로 세 수를 모두 나타내면\n등대 안쪽 문이 열려요.'},
    {id:'to-village',type:'portal',at:{x:1,y:13},to:{map:'village',at:{x:17,y:19}},label:'코딩 마을'},
    {id:'to-lighthouse',type:'portal',at:{x:18,y:2},to:{map:'lighthouse',at:{x:2,y:10}},label:'이진수 등대',open:{mission:'ch4-p3-m1'},lockedText:'모아와 등불 신호를 완성하면\n등대 문이 열려요.',sprite:'prop-gate'},
  ],
};
