import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, root, saveHires, loadGrid } from './c12-common.mjs';

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
 // 0과 1은 별개의 천 조각에 수놓아서 작은 크기에서도 읽혀요.
 g.rect(4,20,4,6,'W').rect(5,21,2,4,'v');
 g.line(11,21,13,19,'D').line(13,19,13,24,'D').line(11,24,15,24,'D');
 // 옆머리와 가운데 마디의 짧은 바느질 두 군데만 남겨 얼굴이 복잡해지지 않게 해요.
 g.line(27,10,28,12,'P').line(26,11,28,11,'P');
 g.line(17,23,17,25,'R').line(16,24,18,24,'R');
 return g;
}
function batDoll(){
 const g=new Grid(32,32);
 // 펼친 날개와 길쭉한 귀가 슬라임 인형과 다른 박쥐의 실루엣이에요.
 for(const right of [false,true]){
  const x=n=>right?31-n:n;
  polygon(g,[[12,15],[7,11],[2,9],[3,19],[6,17],[8,22],[11,20],[14,19]].map(([u,v])=>[x(u),v]),'C','F');
  g.poly([[4,12],[7,13],[11,16],[10,18],[7,16],[4,15]].map(([u,v])=>[x(u),v]),right?'c':'q');
  g.poly([[4,17],[6,17],[8,20],[10,19],[11,20],[7,21]].map(([u,v])=>[x(u),v]),'I');
  // 날개살은 실로 박은 짧은 이음선으로 바꿔요.
  g.line(x(5),14,x(7),15,'I').line(x(9),17,x(10),18,'I');
  g.set(x(6),13,'c').set(x(10),16,'c');
 }
 polygon(g,[[10,14],[10,5],[12,4],[15,12]],'c','F');
 polygon(g,[[18,13],[21,3],[23,4],[22,14]],'c','F');
 g.line(12,7,13,11,'q').line(21,6,20,11,'q');
 oval(g,16,19,7,8,'c','F');
 g.poly([[11,15],[13,12],[17,11],[20,13],[18,15],[14,15],[11,18]],'q');
 g.poly([[21,15],[22,19],[21,24],[18,27],[15,26],[19,23],[20,19]],'C');
 oval(g,16,24,4,2,'q','c');
 button(g,11,14,'c');button(g,18,14,'c');
 g.line(14,20,16,22,'F').line(16,22,18,20,'F');
 g.set(11,19,'p').set(21,19,'p');
 // 배의 천 조각에 십자 바느질을 한 곳만 두어요.
 g.line(16,23,16,25,'C').line(15,24,17,24,'C');
 return g;
}
const drawn=[saveHires('prop-doll-bug',[bugDoll()]),saveHires('prop-doll-bat',[batDoll()])];
const cushion=loadGrid('prop-cushion')[0],palette=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const rgb=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
const out=new PNG({width:864,height:432});
for(let y=0;y<out.height;y++)for(let x=0;x<out.width;x++)out.data.set([...rgb(x<352?'#262c3b':x<704?'#fff4d2':'#b5a0dc'),255],(y*out.width+x)*4);
function paste(g,ox,oy,scale){
 const w=Math.round(g.w*scale),h=Math.round(g.h*scale);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=g.get(Math.floor(x/scale),Math.floor(y/scale));if(c!=='.')out.data.set([...rgb(palette[c]),255],((oy+y)*out.width+ox+x)*4);}
}
for(let i=0;i<2;i++){
 const y=24+i*208,g=drawn[i].frames[0],reference=loadGrid(i===0?'mob-bug-worm':'mob-echo-bat')[3];
 paste(reference,16,y,3);paste(g,208,y,4);
 paste(g,384,y+48,1);paste(g,456,y+40,1.5);
 paste(cushion,560,y,4);paste(g,560,y,4);
 paste(cushion,760,y+40,1.5);paste(g,760,y+40,1.5);
}
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c13-3-bug-bat.png',PNG.sync.write(out));
console.log('C13-3 벌레·박쥐 천 인형 2키 2프레임 작성 완료');
