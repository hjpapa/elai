import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, root, polygon, saveHires } from './c12-common.mjs';
import { label } from '../../scripts/build-assets.mjs';

// C14-2. 두 상자는 같은 면과 외곽이며 색/큰 스티커만 달라요. 공은 둥근 실루엣이에요.
function box(kind){
 const g=new Grid(32,32),heart=kind==='heart';
 const front=heart?'R':'B',side=heart?'s':'N',top=heart?'r':'b',lit=heart?'x':'q',crease=heart?'u':'n';
 polygon(g,[[3,8],[10,4],[29,8],[22,12]],top,'O');
 polygon(g,[[3,8],[22,12],[22,29],[3,25]],front,'O');
 polygon(g,[[22,12],[29,8],[29,25],[22,29]],side,'O');
 // 왼쪽 위의 짧은 빛과 종이 접힌 선. 표식 뒤 큰 면은 차분하게 남겨요.
 g.line(5,9,20,12,lit).line(4,11,4,23,heart?'r':'b');
 g.line(24,13,27,11,crease).line(27,13,27,23,crease);
 g.line(5,25,20,28,crease).line(7,7,11,5,lit);
 // 위쪽 종이 테이프도 두 상자에서 똑같은 위치와 크기를 써요.
 g.poly([[12,6],[15,6],[9,10],[7,10]],'Z').line(13,6,9,9,'&');
 if(heart){
  polygon(g,[[6,16],[7,14],[10,14],[13,17],[16,14],[18,14],[20,16],[20,19],[17,23],[13,26],[8,22],[6,19]],'w','s');
  g.poly([[8,16],[10,16],[13,19],[16,16],[18,16],[18,19],[15,22],[13,24],[9,20]],'?');
  g.line(16,23,13,25,'j');
 }else{
  polygon(g,[[13,13],[15,17],[20,17],[17,21],[18,26],[13,23],[8,26],[9,21],[5,17],[11,17]],'y','N');
  g.poly([[13,15],[13,20],[8,19],[7,18],[12,18]],'y');
  g.poly([[14,21],[17,19],[16,21],[17,24],[13,22],[10,24],[11,21]],'Y');
  g.line(12,17,12,19,'W').set(13,16,'y');
 }
 // 두 상자의 바깥 둘레는 색까지 같은 어두운 1px 선으로 마감해요.
 for(let y=0;y<32;y++)for(let x=0;x<32;x++)if(g.get(x,y)!=='.'&&[[0,-1],[0,1],[-1,0],[1,0]].some(([dx,dy])=>g.get(x+dx,y+dy)==='.'))g.set(x,y,'O');
 return g;
}
function ball(){
 const g=new Grid(32,32),mask=new Grid(32,32).ellipse(16,16,12,12,'Y');
 for(let y=0;y<32;y++)for(let x=0;x<32;x++)if(mask.get(x,y)!=='.'){
  const edge=[[0,-1],[0,1],[-1,0],[1,0]].some(([dx,dy])=>mask.get(x+dx,y+dy)==='.');
  let c=edge?'O':x+y>38?'+':'Y';
  if(!edge&&((x-12)/7)**2+((y-11)/6)**2<1)c='y';
  if(!edge&&((x-11)/4)**2+((y-10)/2.5)**2<1)c='W';
  g.set(x,y,c);
 }
 g.line(9,9,12,8,'?');return g;
}
const art=[saveHires('icon-sort-heart',[box('heart')]),saveHires('icon-sort-star',[box('star')]),saveHires('icon-sort-ball',[ball()])];
const palette=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const luminance=rgb=>Math.round(rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722);
function raw(g,gray=false){const p=new PNG({width:g.w,height:g.h});for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.get(x,y);if(c==='.')continue;let rgb=[1,3,5].map(i=>parseInt(palette[c].slice(i,i+2),16));if(gray)rgb=Array(3).fill(luminance(rgb));p.data.set([...rgb,255],(y*g.w+x)*4);}return p;}
const pngs=art.map(a=>[raw(a.frames[0]),raw(a.frames[0],true)]);
function blit(src,dst,ox,oy,w){for(let y=0;y<w;y++)for(let x=0;x<w;x++){const sx=Math.floor(x*src.width/w),sy=Math.floor(y*src.height/w),i=(sy*src.width+sx)*4;if(!src.data[i+3])continue;dst.data.set(src.data.subarray(i,i+4),((oy+y)*dst.width+ox+x)*4);}}
function fill(p,fn){for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++)p.data.set([...fn(x,y),255],(y*p.width+x)*4);}
// 확대 비교: 원색 어두움/밝음, 회색조 어두움/밝음. 순서는 하트·별·공이에요.
const large=new PNG({width:960,height:704});fill(large,(_,y)=>Math.floor(y/176)%2?[255,244,210]:[38,44,59]);
for(let r=0;r<4;r++){label(large,['COLOR DARK','COLOR LIGHT','GRAY DARK','GRAY LIGHT'][r],16,r*176+8,r%2?[41,48,68]:[255,244,210],1);for(let i=0;i<3;i++)blit(pngs[i][r>=2?1:0],large,96+i*320,r*176+28,128);}
// 실제 크기 비교: 40/48/60px × 원색/회색조 × 벨트 줄무늬/밝은 칸이에요.
const sizes=new PNG({width:960,height:420});fill(sizes,(x,y)=>{const panel=Math.floor(x/240),gray=panel>=2,light=panel%2;let rgb=light?[199,214,220]:(Math.floor(y/10)%2?[68,89,104]:[86,101,122]);if(gray)rgb=Array(3).fill(luminance(rgb));return rgb;});
for(let panel=0;panel<4;panel++){
 const x=panel*240,color=panel%2?[41,48,68]:[255,244,210];label(sizes,['COLOR DARK','COLOR LIGHT','GRAY DARK','GRAY LIGHT'][panel],x+12,8,color,1);
 for(const[r,w]of[40,48,60].entries()){
  label(sizes,w+'PX',x+12,38+r*128,color,1);
  for(let i=0;i<3;i++)blit(pngs[i][panel>=2?1:0],sizes,x+16+i*72+Math.floor((60-w)/2),58+r*128,w);
 }
}
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c14-2-items.png',PNG.sync.write(large));writeFileSync(root+'assets-preview/c14-2-items-sizes.png',PNG.sync.write(sizes));
console.log('C14-2 하트 상자/별 상자/공 32×32 각1프레임, 원색·회색조·40/48/60px 비교판 완료');
