// C15-2: 같은 유리·소켓을 쓰는 꺼진/켜진 전구. 숫자는 UI가 따로 붙여요.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, rounded, root, saveHires } from './c12-common.mjs';
import { label } from '../../scripts/build-assets.mjs';

const glassMask=new Grid(32,32).ellipse(15.5,11.5,9.5,8.5,'S');
glassMask.poly([[8,15],[23,15],[20,21],[19,24],[12,24],[11,21]],'S');
function bulb(on){
 const g=new Grid(32,32);
 if(on){
  // 몸체 바깥 짧은 빛줄기만 추가해요. 위·아래 여백과 전구 위치는 그대로예요.
  g.line(2,11,3,11,'Y').line(28,11,29,11,'Y');
  g.line(5,3,6,4,'y').line(25,3,26,4,'y');
  g.line(4,19,5,18,'Y').line(26,18,27,19,'Y');
 }
 for(let y=0;y<32;y++)for(let x=0;x<32;x++)if(glassMask.get(x,y)!=='.'){
  const edge=[[0,-1],[0,1],[-1,0],[1,0]].some(([dx,dy])=>glassMask.get(x+dx,y+dy)==='.');
  let c=on?'y':'S';
  if(x+y>32)c=on?'Y':'d';
  if(edge)c=on?'+':'O';
  g.set(x,y,c);
 }
 // 좌상단의 넓은 유리 반사. 꺼진 상태도 회청색 유리로 읽히되 흰빛은 쓰지 않아요.
 g.poly([[10,7],[13,5],[17,5],[17,7],[13,8],[11,11],[9,11],[9,9]],on?'W':'A');
 g.line(10,8,12,6,on?'?':'i').line(10,9,10,10,on?'?':'i');
 g.line(22,12,22,15,on?'Y':'/');
 // 두 가는 지지대와 작은 필라멘트. 숫자나 얼굴처럼 보이는 표식은 없어요.
 g.line(13,17,14,22,on?'+':'m').line(18,17,17,22,on?'+':'m');
 g.line(12,14,14,17,on?'W':'d').line(14,17,17,17,on?'W':'d').line(17,17,19,14,on?'W':'d');
 // 나사 소켓과 접점은 두 상태에서 색까지 같아 위치 변화가 없어요.
 g.rect(12,23,8,1,'O');
 rounded(g,11,23,10,6,'f','O');
 g.line(12,24,18,24,'i').line(12,26,18,26,'A').line(19,24,19,27,'S');
 g.line(13,25,18,25,'d').line(13,27,18,27,'d');
 polygon(g,[[13,28],[18,28],[17,29],[14,29]],'d','O');
 return g;
}
const art=[saveHires('icon-bulb-off',[bulb(false)]),saveHires('icon-bulb-on',[bulb(true)])];
const palette=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const rgb=c=>[1,3,5].map(i=>parseInt(palette[c].slice(i,i+2),16));
const gray=c=>{const n=Math.round(c[0]*.2126+c[1]*.7152+c[2]*.0722);return[n,n,n];};
const sheet=new PNG({width:1200,height:650});
for(let y=0;y<650;y++)for(let x=0;x<1200;x++){
 const p=Math.floor(x/300),base=p%2?[255,244,210]:[27,31,42];
 sheet.data.set([...(p>=2?gray(base):base),255],(y*1200+x)*4);
}
function paste(g,ox,oy,size,mono){for(let y=0;y<size;y++)for(let x=0;x<size;x++){const c=g.get(Math.floor(x*32/size),Math.floor(y*32/size));if(c!=='.'){const color=rgb(c);sheet.data.set([...(mono?gray(color):color),255],((oy+y)*1200+ox+x)*4);}}}
for(let p=0;p<4;p++){
 const x=p*300,ink=p%2?[41,48,68]:[255,244,210];
 label(sheet,['BOARD OFF / ON','CREAM OFF / ON','GRAY BOARD','GRAY CREAM'][p],x+14,10,ink,1);
 art.forEach((a,i)=>paste(a.frames[0],x+16+144*i,34,128,p>=2));
 for(const[row,size]of[28,40,48,60].entries()){
  const y=202+104*row;
  label(sheet,size+'PX',x+14,y-16,ink,1);
  art.forEach((a,i)=>paste(a.frames[0],x+48+144*i+(60-size)/2,y,size,p>=2));
 }
}
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c15-bulbs-draft.png',PNG.sync.write(sheet));
console.log('C15-2 전구 꺼짐/켜짐 32x32 각1프레임 및 원색·회색조 28/40/48/60px 검토판 작성');
