import type { MapDef } from '../schema';
/** 벽을 따라 걸으면 보스 방에 닿는 안개 미로예요. */
export const desertmaze: MapDef = {
  id:'desertmaze',name:'모래 폭풍 미로',chapter:'ch3',theme:'desert',fog:true,
  rows:['###########','#...#.....#','###.#.###.#','#...#.#...#','#.###.#..##','#.....#...#','#########.#','#.........#','###########'],
  legend:{'.':'sand','#':'sandstone'},spawn:{x:1,y:1},checkpoint:{map:'desertmaze',at:{x:1,y:1}},
  objects:[
    {id:'to-desert',type:'portal',at:{x:1,y:1},to:{map:'desert',at:{x:17,y:2}},label:'갈림길 사막'},
    {id:'sign-start',type:'sign',at:{x:2,y:1},text:'오른쪽 벽을 따라 길을 살펴봐요.\n나루가 알려 준 규칙을 떠올려요.'},
    {id:'lizard-maze',type:'mob',at:{x:3,y:5},mob:'mirageLizard',wander:1},
    {id:'chest-maze',type:'chest',at:{x:8,y:4},reward:{xp:10,coins:20,items:[{id:'jelly',qty:2}]}},
    {id:'chief',type:'npc',at:{x:2,y:7},npc:'lizardChief',missions:['ch3-boss-m1','ch3-boss-m2','ch3-boss-m3','ch3-boss-m4'],talk: ['모래가 아까 지나온 길을 덮었어요.', '길을 다 외우려니 머리가 어지러워요.', '햇빛과 그림자가 제 길동무예요.'], when:{notFlag:'lizard-fixed'}},
    {id:'chief-fixed',type:'npc',at:{x:2,y:7},npc:'lizardChief',sprite:'boss-lizard-chief',frame:3,missions:['ch3-boss-m1','ch3-boss-m2','ch3-boss-m3','ch3-boss-m4'],when:{flag:'lizard-fixed'},talk:['길을 함께 찾아 줘서 고마워요.\n마을에 신호등이 켜졌어요.', '오늘은 새 갈림길이 생겼네요.\n제 규칙으로도 갈 수 있을까요?']},
    {id:'to-village',type:'portal',at:{x:3,y:7},to:{map:'village',at:{x:12,y:14}},label:'코딩 마을',when:{flag:'ch3-clear'}},
  ],
};
