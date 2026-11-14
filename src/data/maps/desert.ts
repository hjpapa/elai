import type { MapDef } from '../schema';
import { Painter } from './paint';
const p = new Painter(20, 16, '.').border('#');
p.rect(3,3,5,5,'#').rect(13,8,15,9,'#');
// 서쪽 모래 언덕 두 곳은 완만하게 넘고, 뒤쪽 바위 고원은 동쪽 계단으로만 올라요.
const hp = new Painter(20, 16, '0');
hp.rect(3, 7, 5, 9, '1').set(4, 8, '2');
hp.rect(8, 11, 10, 13, '1').set(9, 12, '2');
hp.rect(13, 2, 14, 4, '4');
hp.set(15, 4, '3').set(16, 4, '2').set(17, 4, '1');
export const desert: MapDef = {
  id: 'desert', name: '갈림길 사막', chapter: 'ch3', theme: 'desert',
  rows: p.rows(), heights: hp.rows(), legend: { '.': 'sand', '#': 'sandstone' }, spawn: {x:2,y:13},
  checkpoint:{map:'desert',at:{x:2,y:13}},
  objects: [
    {id:'chest-dune',type:'chest',at:{x:13,y:3},reward:{coins:8,items:[{id:'jelly',qty:1}]}},
    {id:'sign-dune',type:'sign',at:{x:14,y:2},text:'계단을 따라 올라왔어요.\n모래 언덕이 한눈에 보여요.'},
    {id:'guide',type:'npc',at:{x:8,y:8},npc:'guide',missions:['ch3-p1-m1','ch3-p2-m1','ch3-p2-m2','ch3-p2-m3','ch3-p3-m1'],talk:['센서는 주변을 알아내는 장치예요.\n상황에 맞는 규칙을 만들어 봐요.']},
    {id:'lizard-a',type:'mob',at:{x:10,y:5},mob:'mirageLizard',wander:1},
    {id:'lizard-b',type:'mob',at:{x:13,y:12},mob:'mirageLizard',wander:1},
    {id:'chest-desert',type:'chest',at:{x:2,y:4},reward:{xp:10,coins:20,items:[{id:'apple',qty:2}]}},
    {id:'cactus-a',type:'prop',at:{x:5,y:11},sprite:'prop-cactus',solid:true},
    {id:'cactus-b',type:'prop',at:{x:17,y:6},sprite:'prop-cactus',solid:true},
    {id:'signal',type:'prop',at:{x:9,y:8},sprite:'prop-signal',frame:1,solid:true},
    {id:'sign-entry',type:'sign',at:{x:3,y:13},text:'길잡이 나루와 조건을 배워요.\n상황에 맞게 움직일 수 있어요.'},
    {id:'sign-maze',type:'sign',at:{x:17,y:2},text:'질문 나무를 완성하면\n모래 미로가 열려요.'},
    {id:'to-village',type:'portal',at:{x:1,y:13},to:{map:'village',at:{x:19,y:19}},label:'코딩 마을'},
    {id:'to-desertmaze',type:'portal',at:{x:18,y:2},to:{map:'desertmaze',at:{x:1,y:1}},label:'모래 폭풍 미로',open:{mission:'ch3-p3-m1'},lockedText:'질문으로 동물 카드를 나누면\n미로에 들어갈 수 있어요.',sprite:'prop-gate'},
  ],
};
