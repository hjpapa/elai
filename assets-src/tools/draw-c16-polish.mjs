import {Grid,polygon,pose,saveHires} from './c12-common.mjs';

function ethics(f){
 const p=pose(f),g=new Grid(32,48);
 // 가슴 앞면 배지는 두 옆 부품 사이에 놓아요. 뒤에서는 오른쪽 고정 탭 4px만 보여요.
 if(p.back)g.rect(23,27+p.bob,2,2,'G').line(23,27+p.bob,24,27+p.bob,'C');
 else g.stamp(['.GGG.GGG.','GcccGcccG','GcWWWWccG','GcWWWWcIG','.GcWWcIG.','..GcWIG..','...GIG...','....G....'],12,29+p.bob);
 return g;
}
function talk(f){
 const b=pose(f).bob,g=new Grid(32,48);
 // 별 안테나의 왼쪽, 머리 옆 위. 지지대 없이 작은 꼬리로 머리 쪽을 가리켜요.
 polygon(g,[[2,6+b],[8,6+b],[10,8+b],[10,11+b],[8,13+b],[8,14+b],[6,13+b],[2,13+b],[0,11+b],[0,8+b]],'b','N');
 g.line(2,7+b,8,7+b,'?').rect(1,8+b,8,3,'q');
 for(const x of [1,4,7])g.rect(x,9+b,2,2,'N');
 g.line(2,12+b,7,12+b,'o').set(7,13+b,'b');
 return g;
}
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
 // 정화 벌레의 분홍 머리와 보라 꼬리, 세 마디를 포근한 천 덩어리로 이어가요.
 oval(g,7,23,5,4,'v','D');
 g.poly([[3,22],[5,20],[8,20],[10,22],[8,23],[4,24]],'p');
 oval(g,14,22,6,5,'p','D');
 g.poly([[10,20],[12,18],[16,18],[18,20],[15,21],[11,21]],'W');
 g.poly([[17,22],[19,23],[17,26],[13,26],[12,25],[16,24]],'P');
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
 // 두 무늬만 남기고 2px 획의 진한 숫자로 바꿔요. 논리 16px에서도 획이 한 픽셀로 남아요.
 // 남색 천 조각 위 크림색 숫자: 어두운 배경에서도 숫자가 사라지지 않아요.
 polygon(g,[[4,18],[9,18],[10,19],[10,26],[9,27],[4,27],[3,26],[3,19]],'O','D');
 polygon(g,[[11,18],[16,18],[17,19],[17,26],[16,27],[11,27],[10,26],[10,19]],'O','D');
 g.stamp(['WWWWWW','WWWWWW','WWOOWW','WWOOWW','WWOOWW','WWOOWW','WWWWWW','WWWWWW'],4,19);
 g.stamp(['..WW..','.WWW..','..WW..','..WW..','..WW..','..WW..','WWWWWW','WWWWWW'],11,19);
 // 얼굴과 더듬이는 그대로 두고 숫자 옆의 잔바느질은 줄여요.
 g.line(27,10,28,12,'P').line(26,11,28,11,'P');
 return g;
}

saveHires('robi-part-ethics',Array.from({length:10},(_,f)=>ethics(f)));
saveHires('robi-part-talk',Array.from({length:10},(_,f)=>talk(f)));
saveHires('prop-doll-bug',[bugDoll()]);
