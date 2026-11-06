import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, root, polygon, rounded, saveHires, loadGrid } from './c12-common.mjs';

// C12-2 아이템: 32px 격자에서 다시 그린 원본. 공용64색과 2px 여백을 지켜요.
const icon=()=>new Grid(32,32);
function finish(g){g.outline('O');for(let y=0;y<32;y++)for(let x=0;x<32;x++)if((x<2||x>29||y<2||y>29)&&g.get(x,y)!=='.')throw new Error('아이콘 2px 여백을 벗어났어요.');return g;}
function branchHandle(g){
 g.poly([[7,25],[10,28],[23,8],[21,5],[18,8]],'U').line(9,25,20,8,'X').line(10,24,20,9,'T');
 g.line(19,8,19,4,'E').line(20,7,20,4,'X').line(20,4,25,4,'T').set(24,5,'U');
 g.line(9,24,10,23,'Z');
}
function boot(g,x,y,color,lit,shade){
 polygon(g,[[x,y],[x+7,y],[x+7,y+11],[x+11,y+13],[x+11,y+17],[x,y+17]],color,shade);
 g.line(x+1,y+1,x+6,y+1,lit).rect(x+1,y+3,2,8,lit);
 g.poly([[x+6,y+2],[x+6,y+11],[x+9,y+13],[x+10,y+15],[x+6,y+15]],shade);
 g.line(x+1,y+16,x+10,y+16,'E').line(x+2,y+12,x+6,y+12,lit);
 g.rect(x+3,y+7,3,2,'+').set(x+3,y+7,'Y');
}
const drawers={
 cap(g){
  g.ellipse(14,15,10,8,'r').poly([[7,12],[10,8],[15,7],[19,9],[18,12],[12,13]],'x');
  g.line(9,11,12,9,'z').line(8,13,8,16,'p');
  g.poly([[21,11],[23,14],[23,19],[20,21],[17,19],[19,15]],'u');
  g.line(16,8,17,18,'R');
  g.poly([[5,20],[21,19],[28,23],[27,25],[19,26],[5,23]],'s');
  g.poly([[7,20],[20,20],[26,23],[20,24],[8,22]],'u').line(12,21,21,21,'r');
  g.rect(21,16,2,2,'Y').set(21,16,'y');
 },
 leafhat(g){
  g.ellipse(15,24,11,3,'G').line(5,24,13,22,'J');
  g.poly([[6,21],[6,15],[11,9],[20,5],[25,4],[25,11],[21,20],[15,24]],'J');
  g.poly([[8,17],[12,11],[20,7],[23,6],[21,12],[14,19],[8,21]],'L');
  g.line(12,12,19,8,'M');
  g.poly([[23,9],[24,11],[20,20],[16,23],[13,22],[18,17]],'I');
  g.line(7,23,22,8,'G').line(12,18,11,14,'I').line(17,14,21,14,'G');
  g.line(23,6,26,3,'U').set(26,3,'X');
 },
 rangerhat(g){
  g.poly([[8,22],[11,9],[15,11],[21,6],[23,20]],'I');
  g.poly([[10,20],[12,12],[16,13],[20,9],[19,17],[15,20]],'J');
  g.line(17,12,20,9,'M').set(12,14,'L');
  g.poly([[21,9],[22,13],[23,20],[18,21],[19,17]],'G');
  g.ellipse(15,24,12,3,'G').line(5,23,12,22,'J').line(6,24,11,24,'L');
  g.line(9,20,23,20,'X').line(9,21,23,21,'U').rect(19,20,3,2,'+').set(20,20,'Y');
  g.poly([[22,15],[23,9],[26,4],[28,3],[27,8],[25,12]],'t').line(23,14,27,5,'U');
  g.line(25,8,27,5,'Z');
 },
 stick(g){branchHandle(g);},
 hammer(g){
  g.poly([[6,25],[9,28],[22,12],[19,10]],'U').line(8,25,20,12,'T').line(8,24,12,19,'Z');
  g.poly([[12,8],[17,3],[27,9],[28,14],[23,20],[18,16]],'f');
  g.poly([[13,8],[17,4],[26,10],[22,14]],'a').line(16,6,18,5,'?');
  g.poly([[13,9],[21,15],[23,19],[18,15]],'i');
  g.poly([[23,14],[27,10],[27,14],[23,18]],'S');
  g.line(15,9,20,12,'j').line(24,11,26,10,'i');
  g.line(17,16,19,18,'+').set(17,16,'Y');
 },
 brush(g){
  g.poly([[5,26],[8,28],[21,14],[18,12]],'U').line(7,25,18,14,'T').line(7,24,11,20,'Z');
  g.poly([[16,12],[20,7],[28,3],[28,12],[23,18],[20,19]],'G');
  g.poly([[17,12],[21,8],[27,5],[26,11],[21,16]],'C');
  g.poly([[20,11],[23,7],[26,6],[22,12],[19,15]],'c');
  g.line(21,10,25,7,'q').line(24,13,27,9,'o');
  g.poly([[16,14],[20,17],[22,18],[19,21],[14,17]],'+').line(16,15,20,18,'Y').set(16,15,'y');
 },
 vest(g){
  g.poly([[8,6],[12,4],[14,10],[17,10],[20,4],[24,6],[23,14],[25,27],[18,27],[16,23],[14,27],[6,27],[8,14]],'B');
  g.poly([[9,7],[11,6],[12,10],[10,15],[9,24],[7,25],[9,13]],':');g.line(9,8,10,7,'b');
  g.poly([[21,6],[23,7],[22,14],[24,26],[20,26],[20,17]],'N');
  g.line(15,11,15,22,'W').line(16,11,16,21,'j');g.set(16,17,'Y');
  g.rect(9,21,4,4,'N').line(9,21,12,21,':');g.rect(19,21,4,4,'/').line(19,21,22,21,'b');
  g.line(7,26,13,26,'/').line(19,26,23,26,'/');
 },
 cloak(g){
  g.ellipse(16,10,7,7,'I').ellipse(16,11,3,4,'F');
  g.poly([[10,13],[22,13],[27,26],[23,28],[16,26],[9,28],[4,26]],'I');
  g.poly([[10,14],[14,14],[12,20],[8,26],[5,25]],'J').line(10,16,8,22,'L');
  g.poly([[22,15],[26,25],[23,27],[20,25],[18,18]],'G');
  g.line(16,16,16,24,'G').line(13,23,11,26,'G');
  g.line(11,6,14,4,'J').line(10,8,10,11,'L');
  g.line(12,14,20,14,'G').rect(15,14,3,2,'Y').set(15,14,'y');
 },
 boots(g){boot(g,4,5,'U','X','E');boot(g,16,10,'E','U','Q');g.line(17,13,17,18,'X');g.line(21,24,25,24,'T');},
 windboots(g){
  boot(g,5,5,'B','b','/');boot(g,16,10,'/','C','N');
  g.poly([[5,18],[3,16],[4,20],[9,23],[9,21]],'W').line(4,18,8,21,'q');
  g.line(3,23,6,25,'b').line(18,12,21,12,'q').line(20,24,25,24,'b');
 },
 glasses(g){
  g.line(3,9,6,13,'D').line(26,12,28,8,'D');
  rounded(g,4,10,10,11,'V','D');rounded(g,18,10,10,11,'V','D');
  rounded(g,6,12,6,7,'o','V');rounded(g,20,12,6,7,'o','V');
  g.line(6,12,10,12,'q').line(6,13,6,15,'q').set(7,13,'?');
  g.line(20,12,24,12,'q').line(20,13,20,15,'q').set(21,13,'?');
  g.line(8,17,11,14,'b').line(22,17,25,14,'b');
  g.line(13,14,18,14,'V').line(14,13,17,13,'v');g.line(5,10,11,10,'v').line(19,10,25,10,'v');
  g.line(24,21,26,23,'V').set(26,23,'v');
 },
 flowmap(g){
  g.poly([[6,4],[24,4],[26,24],[22,28],[5,26]],'t');
  g.poly([[7,5],[23,5],[24,23],[21,26],[7,25]],'W').line(8,6,21,6,'?');
  g.line(6,7,6,24,'Z').line(24,8,25,23,'X');
  g.poly([[21,24],[25,24],[22,28]],'X').line(22,25,24,25,'Z');
  rounded(g,13,8,6,4,'B','/').line(14,8,17,8,'b');
  g.line(16,12,16,16,'E').line(10,16,22,16,'E');g.line(10,16,10,20,'E').line(22,16,22,20,'E');
  g.line(9,19,10,20,'E').line(10,20,11,19,'E').line(21,19,22,20,'E').line(22,20,23,19,'E');
  g.rect(7,21,6,4,'I').line(8,21,11,21,'L');g.rect(20,21,4,4,'R').line(21,21,23,21,'r');
 },
 apple(g){
  g.ellipse(12,18,7,10,'r').ellipse(20,18,7,10,'r');
  g.poly([[20,10],[25,13],[27,19],[24,25],[20,27],[17,27],[21,22],[22,16]],'u');
  g.line(24,22,22,25,'R').line(10,12,8,15,'p').rect(7,16,2,4,'p').line(10,12,12,12,'W');
  g.line(16,11,18,4,'E').line(17,9,19,4,'X');
  g.poly([[19,7],[22,3],[27,3],[25,6],[21,8]],'I').line(21,6,25,4,'L').set(23,4,'M');
  g.set(15,10,'R').set(17,10,'R');
 },
 jelly(g){
  g.ellipse(16,25,11,3,'+');
  g.poly([[5,24],[7,13],[10,9],[22,9],[25,13],[27,24],[23,27],[9,27]],'Y');
  g.poly([[23,13],[25,14],[26,23],[23,26],[20,26],[22,22]],'T');
  g.ellipse(16,11,7,3,'y').line(11,10,15,9,'W');
  g.rect(9,15,2,6,'W').rect(11,14,2,3,'y').line(10,23,15,24,'y');
  g.line(7,25,13,26,'y').line(22,25,25,24,'+');
 },
 forestkey(g){
  g.poly([[14,14],[17,13],[27,24],[25,27]],'Y').line(17,15,25,24,'y');
  g.poly([[22,22],[25,20],[28,23],[27,26],[24,25]],'+').line(24,21,27,24,'Y');
  g.poly([[20,25],[22,23],[25,26],[23,28]],'Y').set(22,25,'y');
  g.ellipse(11,10,7,7,'+').ellipse(10,9,6,6,'Y').ellipse(11,10,3,3,'.');
  g.line(7,5,10,4,'W').line(5,8,5,11,'y');
  g.poly([[4,7],[4,4],[7,3],[10,4],[8,8],[5,9]],'I').line(5,5,7,4,'M').line(5,8,8,5,'L');
 },
 vine(g){
  g.line(8,28,17,19,'G').line(9,28,18,19,'J').line(17,19,13,13,'G').line(18,18,14,13,'I').line(13,13,22,4,'I').line(14,13,23,4,'J');
  g.poly([[9,22],[5,18],[6,12],[12,12],[14,17],[12,21]],'J').line(7,14,9,13,'M').line(8,15,11,20,'I');
  g.poly([[18,12],[21,8],[28,8],[26,13],[21,15]],'I').line(20,12,25,10,'L').set(24,10,'M');
  g.poly([[17,23],[20,19],[25,20],[25,24],[21,27]],'J').line(19,23,22,21,'L').line(21,25,23,22,'G');
 },
};
function wheel(g){
 g.ellipse(16,16,11,11,'d').ellipse(15,15,10,10,'S');
 g.poly([[6,12],[9,7],[13,5],[17,5],[14,7],[10,9],[8,13]],'f').line(9,8,12,6,'i');
 g.ellipse(16,16,7,7,'+').ellipse(15,15,6,6,'Y');
 g.line(16,10,16,13,'y').line(10,16,13,16,'y').line(19,16,22,16,'T').line(16,19,16,22,'T');
 g.ellipse(16,16,3,3,'d').ellipse(16,16,1,1,'O').set(15,15,'i');
 g.line(12,10,14,9,'W').line(6,16,6,19,'f').line(20,25,23,23,'O');
 g.line(24,12,26,14,'O').line(11,25,13,26,'O');
 return g;
}
const assets=[];
for(const [name,draw]of Object.entries(drawers)){const g=icon();draw(g);assets.push(saveHires('icon-item-'+name,[finish(g)]));}
assets.push(saveHires('icon-part-wheel',[finish(wheel(icon()))]));

// 각 칸: 위는 짙은 창, 아래는 크림 배경. 각각 왼쪽 옛 ×4 / 오른쪽 새 ×2.
const palette=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const columns=5,cellW=160,cellH=160,width=columns*cellW,height=Math.ceil(assets.length/columns)*cellH,png=new PNG({width,height});
for(let y=0;y<height;y++)for(let x=0;x<width;x++){const cream=y%cellH>=80;png.data.set(cream?[255,244,210,255]:[38,44,59,255],(y*width+x)*4);}
function draw(g,ox,oy,scale){for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.get(x,y);if(c==='.')continue;const rgb=[1,3,5].map(i=>parseInt(palette[c].slice(i,i+2),16));for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++)png.data.set([...rgb,255],(((oy+y*scale+dy)*width)+ox+x*scale+dx)*4);}}
assets.forEach(({key,frames},i)=>{const x=(i%columns)*cellW,y=Math.floor(i/columns)*cellH,old=loadGrid(key,false)[0];for(const offset of[8,88]){draw(old,x+6,y+offset,4);draw(frames[0],x+86,y+offset,2);}});
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c12-2-items-backgrounds.png',PNG.sync.write(png));
console.log('C12-2 아이템16·바퀴1, 17키17프레임 및 두 배경 비교판 완료');
console.log(assets.map(a=>a.key).join('\n'));
