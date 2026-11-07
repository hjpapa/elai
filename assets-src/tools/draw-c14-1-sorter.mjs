// C14-1: 뒤 투입구에서 벨트를 거쳐 두 바구니로 나누는 청록 택배 분류기.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, rounded, saveHires, root } from './c12-common.mjs';
function basket(g,cx){
 polygon(g,[[cx-11,75],[cx+11,75],[cx+8,89],[cx-8,89]],'X','E');
 g.poly([[cx-10,77],[cx-3,78],[cx-3,87],[cx-7,87]],'T');
 g.poly([[cx+6,77],[cx+10,76],[cx+7,88],[cx+5,88]],'U');
 for(const y of[80,84])g.line(cx-8,y,cx+8,y,'t');
 for(const x of[cx-5,cx+1,cx+6])g.line(x,78,x-1,87,'e');
 g.line(cx-6,88,cx+6,88,'T');
 g.ellipse(cx,75,12,5,'E').ellipse(cx,74,11,4,'T').ellipse(cx,74,9,3,'U');
 g.line(cx-9,74,cx-5,71,'t').line(cx-8,77,cx+7,77,'Z');
}
function sorter(f){
 const g=new Grid(64,96);
 // 넓은 청록 받침은 두 옆면과 바닥 모서리를 갖고, y92에 닿아요.
 polygon(g,[[5,63],[32,77],[32,92],[5,78]],'C','F');
 polygon(g,[[32,77],[59,63],[59,78],[32,92]],'n','m');
 polygon(g,[[5,63],[32,49],[59,63],[32,77]],'o','F');
 g.poly([[7,63],[32,51],[54,63],[32,74]],'C');g.line(7,65,29,76,'q').line(33,89,56,77,'o');
 g.line(8,77,29,88,'o');
 // 벨트 뒤의 단단한 지지대. 아래쪽으로 갈수록 살짝 넓어져요.
 polygon(g,[[21,24],[43,24],[46,57],[37,67],[27,67],[18,57]],'C','F');
 g.poly([[21,26],[24,26],[22,55],[28,63],[28,66],[20,57]],'q');
 g.poly([[41,26],[43,27],[45,56],[36,64],[35,65],[40,55]],'n');
 const belt=new Grid(64,96).poly([[25,25],[39,25],[41,55],[35,62],[29,62],[23,55]],'S');
 for(let y=0;y<96;y++)for(let x=0;x<64;x++)if(belt.get(x,y)!=='.'){
  // f1은 아래로 2px, 즉 한 논리 픽셀 이동한 같은 줄무늬예요.
  const row=(y-25-f*2+80)%8;g.set(x,y,row<2?'A':row===2?'f':'d');
 }
 g.line(24,28,22,54,'i').line(40,28,42,54,'S');
 // 벨트 위의 작은 하트 상자. 글자·주소·돈 기호를 넣지 않아요.
 polygon(g,[[27,36],[34,33],[39,37],[32,41]],'p','s');
 polygon(g,[[27,36],[32,41],[32,48],[27,43]],'r','s');
 polygon(g,[[32,41],[39,37],[39,44],[32,48]],'R','s');
 g.poly([[28,38],[29,38],[30,40],[31,39],[31,43],[30,44],[28,41]],'W');
 g.line(30,35,35,38,'x');
 // 내려온 물건은 이 두 갈래의 금속 미끄럼틀을 통해 바구니로 가요.
 polygon(g,[[29,57],[35,62],[20,74],[10,71]],'S','d');
 g.poly([[29,60],[32,62],[19,71],[14,70]],'i');g.line(27,60,12,70,'a').line(21,72,33,63,'f');
 polygon(g,[[30,62],[36,57],[55,70],[47,74]],'f','d');
 g.poly([[35,60],[51,70],[47,72],[32,63]],'A');g.line(37,60,53,70,'i');
 // 가운데의 노란 갈림문과 둥근 축은 기계의 선택 지점이에요.
 g.ellipse(32,62,5,4,'d').ellipse(32,61,4,3,'Y').line(30,60,32,59,'y');
 polygon(g,[[30,58],[35,53],[38,55],[33,61]],'Y','U');g.line(32,58,35,55,'W');
 g.ellipse(32,62,2,2,'U').set(31,61,'t');
 // 가지의 밝은 화살표는 색을 몰라도 좌우 이동 방향이 보여요.
 g.poly([[20,65],[16,68],[19,69],[13,70],[15,65],[16,67]],'W');
 g.poly([[44,65],[48,68],[45,69],[51,70],[49,65],[48,67]],'j');
 basket(g,15);basket(g,49);
 // 뒤쪽 투입구의 지붕과 낮은 대비의 어두운 입구.
 polygon(g,[[17,11],[31,3],[47,11],[47,25],[42,30],[22,30],[17,25]],'C','F');
 g.poly([[18,11],[31,4],[45,11],[32,18]],'q').line(20,11,31,6,'W');
 g.poly([[42,15],[46,12],[46,24],[41,28],[41,18]],'n');
 polygon(g,[[23,19],[40,19],[42,26],[21,26]],'N','m');
 g.poly([[25,20],[38,20],[39,24],[23,24]],'d');g.line(23,26,40,26,'a');
 // 기존 광원은 발 y92에서80% 높이이므로 y15.2에 해당해요.
 rounded(g,25,12,15,6,'q','n');g.line(28,13,36,13,'W');
 g.line(32,14,32,17,'n').line(30,16,32,18,'n').line(32,18,34,16,'n');
 // 전구 두 개만 서로 바뀌며 투입구·상자·문·바구니는 고정돼요.
 for(const[x,on]of[[20,f===0],[44,f===1]]){
  g.ellipse(x,16,3,3,'F').ellipse(x,16,2,2,on?'q':'n').set(x-1,15,on?'W':'o');
 }
 return g;
}
const frames=[sorter(0),sorter(1)];saveHires('prop-sorter',frames);
const colors=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const rgb=c=>[1,3,5].map(i=>parseInt(colors[c].slice(i,i+2),16));
const sw=820,sh=332,sheet=new PNG({width:sw,height:sh});
for(let i=0;i<sheet.data.length;i+=4)sheet.data.set([38,44,59,255],i);
for(let y=0;y<sh;y++)for(let x=410;x<sw;x++)sheet.data.set([255,244,210,255],(y*sw+x)*4);
for(const ox of[10,420])frames.forEach((g,f)=>g.rows.forEach((row,y)=>row.forEach((c,x)=>{if(c==='.')return;for(let dy=0;dy<3;dy++)for(let dx=0;dx<3;dx++)sheet.data.set([...rgb(c),255],((18+y*3+dy)*sw+ox+(f*g.w+x)*3+dx)*4);})));
const strip=new PNG({width:128,height:96});strip.data.fill(0);
frames.forEach((g,f)=>g.rows.forEach((row,y)=>row.forEach((c,x)=>{if(c!=='.')strip.data.set([...rgb(c),255],(y*128+f*64+x)*4);})));
mkdirSync(root+'assets-preview/',{recursive:true});writeFileSync(root+'assets-preview/c14-1-sorter.png',PNG.sync.write(sheet));writeFileSync(root+'assets-preview/c14-1-sorter-strip.png',PNG.sync.write(strip));
console.log('C14-1 택배 분류기 1키 / 2프레임 생성');
