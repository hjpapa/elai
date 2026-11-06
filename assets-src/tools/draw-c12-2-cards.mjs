// C12-2: 전투 카드14종과 행동 예고6종. 카드 테두리/여백은 한 묶음으로 맞춰요.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, rounded, saveHires, loadGrid, root } from './c12-common.mjs';
const drawn=[];
const cards=['up','down','left','right','forward','turnLeft','turnRight','collect','attack','guard','heal','wait','repeat','if'];
const intents=['attack','guard','charge','smash','heal','idle'];
const border={attack:['R','r'],heal:['I','J'],collect:['+','Y'],repeat:['U','X'],if:['V','v'],wait:['S','i']};
function frame(kind){const [dark,light]=border[kind]??['N','B'];const g=new Grid(32,32);rounded(g,2,2,28,28,dark,'O');rounded(g,4,4,24,24,light,dark);rounded(g,6,6,20,20,'W',light);g.line(7,3,23,3,light).line(3,7,3,23,light).line(8,5,22,5,'?');return g;}
function merge(g,from){for(let y=0;y<32;y++)for(let x=0;x<32;x++){const c=from.get(x,y);if(c!=='.')g.set(x,y,c);}return g;}
function arrow(g,dir,forward=false){
 const p=forward?[[16,7],[24,15],[19,15],[19,21],[13,21],[13,15],[8,15]]:[[16,7],[24,15],[19,15],[19,25],[13,25],[13,15],[8,15]];
 const rotate=([x,y])=>dir==='down'?[32-x,32-y]:dir==='left'?[y,32-x]:dir==='right'?[32-y,x]:[x,y];
 polygon(g,p.map(rotate),'B','N');
 const source=g.rows.map(r=>[...r]);for(let y=0;y<32;y++)for(let x=0;x<32;x++)if(source[y][x]==='B'&&(source[y-1]?.[x]==='N'||source[y]?.[x-1]==='N'))g.set(x,y,'b');
 if(dir==='up')g.line(15,15,15,forward?19:23,':');
 if(dir==='down')g.line(15,9,15,17,':');
 if(dir==='left')g.line(15,15,22,15,':');
 if(dir==='right')g.line(10,15,18,15,':');
 if(forward)g.rect(11,23,11,3,'N').rect(12,23,9,1,'b');
}
function turn(g,right){
 const pts=[[7,12],[14,6],[14,10],[19,10],[24,14],[24,24],[19,24],[19,16],[14,15],[14,19]];
 polygon(g,pts.map(([x,y])=>right?[31-x,y]:[x,y]),'B','N');
 if(right){g.line(10,12,15,12,'b').line(9,15,9,22,':').line(19,10,20,11,'b');}
 else {g.line(15,11,19,11,'b').line(20,16,20,22,':').line(10,12,12,10,'b');}
}
function heart(g,small=false){
 const pts=small?[[7,12],[8,9],[12,7],[16,10],[20,7],[24,9],[25,12],[24,17],[16,25],[8,17]]:[[5,12],[6,8],[11,5],[16,9],[21,5],[26,8],[27,12],[26,17],[16,27],[6,17]];
 polygon(g,pts,'J','F');
 polygon(g,small?[[8,11],[11,9],[13,9],[16,12],[19,10],[21,10],[22,12],[21,16],[16,21],[10,17]]:[[7,10],[11,7],[13,8],[16,12],[21,8],[24,10],[23,15],[16,23],[9,17]],'L','J');
 g.line(small?10:9,small?11:10,small?12:12,small?10:8,'l');g.line(small?10:9,small?12:11,small?11:10,small?11:10,'?');
 g.line(small?22:24,small?16:16,small?17:18,small?22:24,'I');
}
function shield(g,large=false){
 const pts=large?[[7,5],[24,5],[27,9],[25,20],[21,25],[16,28],[10,25],[6,20],[4,9]]:[[9,7],[22,7],[25,10],[23,20],[16,25],[9,20],[7,10]];
 polygon(g,pts,'B','N');
 polygon(g,large?[[7,8],[15,8],[15,24],[11,22],[8,18],[6,10]]:[[10,10],[15,10],[15,21],[11,18],[9,11]],'b','B');
 g.line(large?8:10,large?7:9,large?22:21,large?7:9,'q');
 g.rect(15,large?9:11,3,large?13:10,'W').line(16,large?10:12,16,large?21:20,'?');
 g.line(large?23:21,large?12:12,large?22:20,large?19:18,'n');
}
function star(g,cx,cy,r,fill,edge){const pts=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.48:r;pts.push([Math.round(cx+Math.cos(a)*rr),Math.round(cy+Math.sin(a)*rr)]);}polygon(g,pts,fill,edge);}
function collect(g){
 polygon(g,[[10,23],[7,20],[6,17],[7,15],[9,15],[11,18],[11,11],[12,9],[14,9],[15,10],[15,7],[17,7],[18,9],[18,11],[19,9],[21,9],[22,11],[22,13],[23,11],[25,12],[25,18],[23,23],[20,25],[14,25]],'$','!');
 polygon(g,[[12,13],[14,12],[16,13],[19,12],[22,14],[23,19],[20,23],[15,23],[12,20]],'%','#');
 g.line(12,11,12,17,'%').line(16,9,16,15,'%').line(20,11,20,16,'%');
 g.line(16,18,20,18,'$').line(17,20,21,20,'#');g.line(9,17,11,20,'%');
}
function repair(g){
 polygon(g,[[8,23],[17,13],[20,16],[11,26],[8,26]],'X','Q');g.line(10,23,17,16,'Z').line(12,23,18,17,'U');
 polygon(g,[[16,13],[18,11],[22,15],[20,17]],'i','d');g.line(17,13,20,15,'j');
 star(g,21,10,6,'Y','+');g.line(20,9,21,7,'W').line(20,10,22,10,'y').line(21,9,21,12,'y');
}
function hourglass(g){
 polygon(g,[[9,8],[23,8],[22,12],[18,17],[22,21],[23,24],[9,24],[10,21],[14,17],[10,12]],'q','S');
 polygon(g,[[11,10],[21,10],[19,13],[16,15],[13,13]],'Y','+');g.line(12,10,20,10,'y');
 polygon(g,[[11,22],[16,18],[21,22],[21,23],[11,23]],'Y','+');g.line(15,20,16,19,'y');
 g.rect(8,6,16,3,'S').line(9,6,22,6,'j').rect(8,24,16,3,'S').line(9,24,22,24,'i');g.rect(15,16,2,2,'Y');
}
function repeat(g){
 const p=new Grid(32,32);p.ellipse(17,15,9,9,'Q').ellipse(17,15,8,8,'X').ellipse(17,15,5,5,'Q').ellipse(17,15,4,4,'.');
 // 화살표 한쪽 끝과 빈 가운데를 남겨 회전 방향이 읽히게 해요.
 p.rect(7,17,9,11,'.');polygon(p,[[5,16],[15,16],[10,24]],'X','Q');p.rect(8,12,4,6,'X');
 p.line(14,8,19,8,'Z').line(21,10,23,13,'t').line(24,17,22,20,'U').line(7,17,10,20,'Z');
 merge(g,p);
}
function question(g){
 const p=new Grid(32,32);const rows=['.VVV.','VV.VV','...VV','..VV.','..V..','.....','..V..'];
 for(let y=0;y<rows.length;y++)for(let x=0;x<rows[y].length;x++)if(rows[y][x]==='V')p.rect(11+x*2,5+y*2,2,2,'V');
 p.outline('D');p.line(14,5,18,5,'v').line(11,8,11,9,'v');merge(g,p);
 // 물음표 아래의 갈림길은 두 출구가 같은 굵기예요.
 g.rect(15,21,3,3,'D').line(15,22,10,24,'D').line(17,22,22,24,'D');
 polygon(g,[[7,25],[9,20],[12,24]],'V','D');polygon(g,[[25,25],[20,24],[23,20]],'V','D');g.set(9,23,'v').set(23,23,'v');
}
for(const kind of cards){const g=frame(kind);if(['up','down','left','right'].includes(kind))arrow(g,kind);else if(kind==='forward')arrow(g,'up',true);else if(kind==='turnLeft'||kind==='turnRight')turn(g,kind==='turnRight');else if(kind==='collect')collect(g);else if(kind==='attack')repair(g);else if(kind==='guard')shield(g);else if(kind==='heal')heart(g,true);else if(kind==='wait')hourglass(g);else if(kind==='repeat')repeat(g);else if(kind==='if')question(g);drawn.push(saveHires('icon-card-'+kind,[g]));}
function fist(g){
 rounded(g,9,5,17,17,'r','R');rounded(g,5,12,8,11,'r','R');
 polygon(g,[[9,20],[25,20],[24,27],[11,27]],'R','s');g.line(12,24,23,24,'u');
 g.line(11,7,23,7,'p').line(8,14,8,19,'p');
 for(const x of [13,18,23])g.line(x,6,x,13,'R');
 g.line(12,15,22,15,'u').line(14,18,21,18,'p');
}
function charge(g){
 polygon(g,[[18,4],[7,17],[14,17],[11,28],[26,12],[19,12],[22,4]],'Y','+');
 polygon(g,[[18,6],[10,15],[16,15],[15,19],[22,14],[17,14]],'y','Y');g.line(17,7,13,12,'W');
 g.line(5,7,7,9,'r').line(25,24,27,26,'r');
}
function impact(g){
 star(g,16,17,12,'r','s');polygon(g,[[15,8],[17,15],[23,14],[19,19],[22,24],[16,21],[11,23],[13,18],[8,15],[14,15]],'x','r');
 star(g,16,17,5,'Y','r');g.line(15,15,15,17,'y');
 g.line(5,5,8,8,'Y').line(25,5,23,8,'Y');
}
function zz(g,x,y,w,h,c){polygon(g,[[x,y],[x+w-1,y],[x+w-1,y+2],[x+3,y+h-3],[x+w-1,y+h-3],[x+w-1,y+h-1],[x,y+h-1],[x,y+h-3],[x+w-4,y+2],[x,y+2]],c,'S');g.line(x+1,y,x+w-2,y,'j');}
for(const kind of intents){const g=new Grid(32,32);if(kind==='attack')fist(g);else if(kind==='guard')shield(g,true);else if(kind==='charge')charge(g);else if(kind==='smash')impact(g);else if(kind==='heal'){heart(g);g.line(25,4,25,8,'c').line(23,6,27,6,'c');}else if(kind==='idle'){zz(g,4,18,11,10,'i');zz(g,15,10,8,8,'i');zz(g,24,4,5,6,'a');}g.outline('O');for(let i=0;i<32;i++){g.set(i,0,'.').set(i,1,'.').set(i,30,'.').set(i,31,'.').set(0,i,'.').set(1,i,'.').set(30,i,'.').set(31,i,'.');}drawn.push(saveHires('icon-intent-'+kind,[g]));}

// 옛4배/새2배를 두 가지 UI 배경에서 같은 크기로 확인해요.
const colors=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
function blit(out,g,ox,oy,scale,sample=1){for(let y=0;y<g.h;y+=sample)for(let x=0;x<g.w;x+=sample){const c=g.get(x,y);if(c==='.')continue;const rgb=[1,3,5].map(i=>parseInt(colors[c].slice(i,i+2),16));for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++)out.data.set([...rgb,255],((oy+y/sample*scale+dy)*out.width+ox+x/sample*scale+dx)*4);}}
const out=new PNG({width:640,height:960});for(let y=0;y<960;y++)for(let x=0;x<640;x++)out.data.set([...(y<480?[38,44,59]:[255,244,210]),255],(y*640+x)*4);
for(let b=0;b<2;b++)drawn.forEach(({key,frames},i)=>{const x=(i%4)*160+8,y=Math.floor(i/4)*96+16+b*480;blit(out,loadGrid(key,false)[0],x,y,4);blit(out,frames[0],x+76,y,2);});
mkdirSync(root+'assets-preview/',{recursive:true});writeFileSync(root+'assets-preview/c12-2-cards.png',PNG.sync.write(out));
// 실제16px로 줄였을 때의 최근접 표본을 다시4배로 보여줘요.
const small=new PNG({width:640,height:640});for(let y=0;y<640;y++)for(let x=0;x<640;x++)small.data.set([...(y<320?[38,44,59]:[255,244,210]),255],(y*640+x)*4);
for(let b=0;b<2;b++)drawn.forEach(({frames},i)=>blit(small,frames[0],(i%5)*128+32,Math.floor(i/5)*80+8+b*320,4,2));writeFileSync(root+'assets-preview/c12-2-cards-small.png',PNG.sync.write(small));
console.log('C12-2 카드14종·예고6종: '+drawn.length+'키 2배 원본 생성');
