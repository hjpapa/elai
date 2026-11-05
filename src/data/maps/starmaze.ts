import type { MapDef } from '../schema';
import { Painter } from './paint';
const p=new Painter(17,13,'.').border('#');
p.hline(1,13,4,'#').set(3,4,'.');
p.hline(3,15,8,'#').set(13,8,'.');
p.vline(7,1,3,'#').set(7,2,'.');
export const starmaze: MapDef={
 id:'starmaze',name:'별자리 미궁',chapter:'ch6',theme:'observatory',fog:true,rows:p.rows(),legend:{'.':'observatory','#':'observatorywall'},spawn:{x:2,y:10},checkpoint:{map:'starmaze',at:{x:2,y:10}},
 objects:[
  {id:'to-observatory',type:'portal',at:{x:1,y:10},to:{map:'observatory',at:{x:15,y:2}},label:'길잡이 천문대'},
  {id:'sign-search',type:'sign',at:{x:3,y:10},text:'막힌 곳을 돌아 길을 찾아봐요.\n대장과 가장 짧은 길도 비교해요.'},
  {id:'fox-maze',type:'mob',at:{x:10,y:6},mob:'cometFox',wander:1},
  {id:'chest-starmaze',type:'chest',at:{x:3,y:6},reward:{xp:15,coins:30,items:[{id:'jelly',qty:2}]}},
  {id:'star-a',type:'prop',at:{x:6,y:6},sprite:'prop-starlamp',frame:1,solid:true},
  {id:'chief',type:'npc',at:{x:13,y:2},npc:'starFox',missions:['ch6-boss-maze','ch6-boss-m1','ch6-boss-quiz','ch6-boss-m2'],when:{notFlag:'star-fixed'}},
  {id:'chief-fixed',type:'npc',at:{x:13,y:2},npc:'starFox',sprite:'boss-star-fox',frame:3,missions:['ch6-boss-maze','ch6-boss-m1','ch6-boss-quiz','ch6-boss-m2'],when:{flag:'star-fixed'},talk:['별빛이 돌아왔어요.\n앞으로도 기록을 함께 살펴봐요.']},
  {id:'to-village',type:'portal',at:{x:14,y:2},to:{map:'village',at:{x:12,y:14}},label:'코딩 마을',when:{flag:'ch6-clear'}},
 ],
};
