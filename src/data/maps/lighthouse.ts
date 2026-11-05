import type { MapDef } from '../schema';
/** 이진수 등불로 문을 연 뒤, 안개 속 세 층의 기록실을 올라가요. */
export const lighthouse: MapDef={
  id:'lighthouse',name:'이진수 등대',chapter:'ch4',theme:'harbor',fog:true,
  rows:['#############','#...........#','#...........#','##########.##','#...........#','#...........#','##.##########','#...........#','#...........#','##########.##','#...........#','#...........#','#############'],
  legend:{'.':'dock','#':'crate'},spawn:{x:2,y:10},checkpoint:{map:'lighthouse',at:{x:2,y:10}},
  objects:[
    {id:'to-harbor',type:'portal',at:{x:1,y:10},to:{map:'harbor',at:{x:17,y:2}},label:'데이터 항구'},
    {id:'sign-floor',type:'sign',at:{x:3,y:10},text:'등불 신호로 문을 열었어요.\n기록실을 지나 대장을 찾아가요.'},
    {id:'jelly-floor',type:'mob',at:{x:7,y:8},mob:'fogJelly',wander:1},
    {id:'chest-lighthouse',type:'chest',at:{x:10,y:5},reward:{xp:12,coins:20,items:[{id:'jelly',qty:2}]}},
    {id:'chief',type:'npc',at:{x:6,y:1},npc:'ledgerOcto',missions:['ch4-boss-m1','ch4-boss-m2','ch4-boss-m3','ch4-boss-m4'],when:{notFlag:'ledger-fixed'}},
    {id:'chief-fixed',type:'npc',at:{x:6,y:1},npc:'ledgerOcto',sprite:'boss-ledger-octo',frame:3,missions:['ch4-boss-m1','ch4-boss-m2','ch4-boss-m3','ch4-boss-m4'],when:{flag:'ledger-fixed'},talk:['기록이 다시 가지런해졌어요.\n함께 항구를 살펴봐요.']},
    {id:'to-village',type:'portal',at:{x:8,y:1},to:{map:'village',at:{x:12,y:14}},label:'코딩 마을',when:{flag:'ch4-clear'}},
  ],
};
