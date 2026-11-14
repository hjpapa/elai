import { Grid, polygon, saveHires } from './c12-common.mjs';

function oval(g,cx,cy,rx,ry,fill,edge){
 const mask=new Grid(g.w,g.h).ellipse(cx,cy,rx,ry,'W');
 for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++)if(mask.get(x,y)!=='.')
  g.set(x,y,[[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy])=>mask.get(x+dx,y+dy)==='.')?edge:fill);
 return g;
}
function button(g,x,y,thread){
 polygon(g,[[x+1,y],[x+2,y],[x+3,y+1],[x+3,y+2],[x+2,y+3],[x+1,y+3],[x,y+2],[x,y+1]],'O','O');
 g.set(x+1,y+1,thread).set(x+2,y+2,thread);
}
function bugDoll(){
 const g=new Grid(32,32);
 // 사각 천 조각 대신 두 둥근 마디 자체에 진한 실로 무늬를 넣어요.
 // 2px 획을 유지하고, 숫자 바깥에 분홍 천 여백을 남겨요.
 oval(g,6,22,6,6,'p','D');
 g.line(4,17,7,17,'W').line(3,26,8,26,'P');
 g.stamp(['.OOOO.','OOOOOO','OO..OO','OO..OO','OO..OO','OO..OO','OOOOOO','.OOOO.'],3,18);
 oval(g,14,21,6,7,'p','D');
 g.line(12,15,15,15,'W').line(12,27,16,27,'P');
 g.stamp(['..OO..','OOOO..','..OO..','..OO..','..OO..','..OO..','OOOOOO','OOOOOO'],11,18);
 // 솜을 넣은 더듬이 끝에도 단단한 금속 반사 대신 작은 천의 밝은 면만 둬요.
 g.line(20,11,18,6,'D').line(25,10,27,5,'D');
 oval(g,18,5,2,2,'Y','D');oval(g,27,3,2,2,'Y','D');
 g.set(17,4,'y').set(26,2,'y');
 oval(g,23,17,7,9,'p','D');
 g.poly([[18,13],[20,10],[24,9],[27,11],[25,13],[21,13],[18,16]],'W');
 g.poly([[28,14],[29,17],[28,22],[25,25],[22,25],[25,22],[27,18]],'P');
 button(g,18,15,'p');button(g,25,15,'p');
 g.line(21,21,23,23,'D').line(23,23,26,21,'D');
 g.set(18,20,'P').set(28,20,'P');
 // 머리의 바느질만 유지해 몸 무늬와 겹치지 않게 해요.
 g.line(27,10,28,12,'P').line(26,11,28,11,'P');
 return g;
}

saveHires('prop-doll-bug',[bugDoll()]);

