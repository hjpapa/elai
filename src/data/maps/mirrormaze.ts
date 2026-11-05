import type { MapDef } from '../schema';
import { Painter } from './paint';
const p = new Painter(17,13,'.').border('#');
p.hline(2,14,4,'#').set(4,4,'.').set(12,4,'.');
p.hline(2,14,8,'#').set(8,8,'.');
export const mirrormaze: MapDef = {
 id:'mirrormaze',name:'거울 미로',chapter:'ch8',theme:'castle',fog:true,rows:p.rows(),legend:{'.':'castle','#':'castlewall'},
 spawn:{x:2,y:10},checkpoint:{map:'mirrormaze',at:{x:2,y:10}},
 objects:[
  {id:'to-castle',type:'portal',at:{x:1,y:10},to:{map:'castle',at:{x:15,y:2}},label:'윤리의 성'},
  {id:'sign-balance',type:'sign',at:{x:3,y:10},text:'빠진 자료를 고쳐 보호막이 약해졌어요.\n강타를 막고 골렘을 정화해요.'},
  {id:'mirror-a',type:'prop',at:{x:4,y:6},sprite:'prop-mirror',frame:0,solid:true},
  {id:'mirror-b',type:'prop',at:{x:12,y:2},sprite:'prop-mirror',frame:1,solid:true},
  {id:'banner',type:'prop',at:{x:11,y:6},sprite:'prop-banner',solid:true},
  {id:'chest-mirror',type:'chest',at:{x:3,y:6},reward:{xp:15,coins:35,items:[{id:'jelly',qty:2}]}},
  {id:'chief',type:'npc',at:{x:8,y:2},npc:'biasGolem',missions:['ch8-boss-m1','ch8-boss-quiz','ch8-boss-m2'],when:{notFlag:'golem-fixed'}},
  {id:'chief-fixed',type:'npc',at:{x:8,y:2},npc:'biasGolem',sprite:'boss-bias-golem',frame:3,missions:['ch8-boss-m1','ch8-boss-quiz','ch8-boss-m2'],when:{flag:'golem-fixed'},talk:['빠진 친구도 함께 살펴볼게요.\n이제 마을에서 로비를 만나 봐요.']},
  {id:'to-village',type:'portal',at:{x:9,y:2},to:{map:'village',at:{x:12,y:14}},label:'코딩 마을',when:{flag:'ch8-clear'}},
 ],
};
