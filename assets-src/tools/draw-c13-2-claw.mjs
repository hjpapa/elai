import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, root, polygon, rounded, saveHires } from './c12-common.mjs';

// C13-2. 줄은 위 중앙에서 연결하고, 집은 인형의 얼굴이 들어갈 가운데를 비워요.
function claw(closed){
 const g=new Grid(32,32);
 // 중앙 줄의 폭과 윗부분은 두 프레임에서 정확히 같아요.
 g.rect(14,0,4,8,'d').line(15,0,15,7,'j').line(16,0,16,7,'i');
 // 두 굽은 손가락. 닫혀도 가운데 x13..18 / y18 이후는 투명해요.
 const left=closed
  ?[[10,11],[13,14],[10,18],[9,21],[10,23],[12,24],[12,27],[9,27],[6,24],[5,20],[6,16]]
  :[[10,11],[13,14],[9,17],[6,21],[6,23],[9,24],[9,27],[5,27],[2,24],[2,20],[6,14]];
 polygon(g,left,'i','d');polygon(g,left.map(([x,y])=>[31-x,y]),'f','d');
 if(closed){
  g.line(9,14,7,18,'j').line(7,19,7,21,'a').line(8,23,10,25,'j').set(11,26,'i');
  g.line(21,14,24,18,'i').line(24,19,24,21,'a').line(23,23,21,25,'i').set(20,26,'f');
 }else{
  g.line(8,14,4,20,'j').line(3,21,3,23,'a').line(4,24,6,25,'j').line(6,26,8,26,'i');
  g.line(23,14,27,20,'i').line(28,21,28,23,'a').line(27,24,25,25,'i').line(25,26,23,26,'f');
 }
 // 후방의 짧은 세 번째 지지대는 인형이 놓이는 y18보다 위에서 끝나요.
 polygon(g,[[14,12],[17,12],[17,16],[16,17],[15,17],[14,16]],'f','d');g.line(15,14,15,16,'i');
 // 둥근 금속 머리와 따뜻한 황동 띠, 양쪽 회전축이에요.
 rounded(g,9,7,14,9,'i','d');
 g.poly([[11,8],[19,8],[21,10],[19,11],[10,11]],'j').line(12,8,18,8,'?');
 g.poly([[21,11],[21,13],[19,14],[12,14],[11,13],[19,13]],'f');
 g.rect(12,11,8,3,'Y').line(13,11,18,11,'y').line(13,13,18,13,'+');
 g.rect(9,11,3,4,'d').set(10,12,'a').set(10,13,'f');
 g.rect(20,11,3,4,'d').set(21,12,'i').set(21,13,'f');
 return g;
}
const result=saveHires('prop-claw',[claw(false),claw(true)]);
// 위: 벌림/오므림 확대, 아래: 실제40/48/60px 및 현재 임시 인형을 CSS 위치로 합성해요.
const colors=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const width=768,height=640,out=new PNG({width,height});
for(let y=0;y<height;y++)for(let x=0;x<width;x++)out.data.set([...(y<232?(x<384?[38,44,59]:[255,244,210]):[215,205,236]),255],(y*width+x)*4);
function raw(g){const png=new PNG({width:g.w,height:g.h});for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.get(x,y);if(c==='.')continue;const rgb=[1,3,5].map(i=>parseInt(colors[c].slice(i,i+2),16));png.data.set([...rgb,255],(y*g.w+x)*4);}return png;}
const clawPNGs=result.frames.map(raw);
function blit(source,ox,oy,w,h=w){for(let y=0;y<h;y++)for(let x=0;x<w;x++){const sx=Math.min(source.width-1,Math.floor(x*source.width/w)),sy=Math.min(source.height-1,Math.floor(y*source.height/h));const a=(sy*source.width+sx)*4;if(!source.data[a+3])continue;const dest=((oy+y)*width+ox+x)*4;out.data.set(source.data.subarray(a,a+4),dest);}}
for(let bg=0;bg<2;bg++)for(let f=0;f<2;f++)blit(clawPNGs[f],16+bg*384+f*184,20,160);
const dollKeys=['prop-doll-robi','prop-doll-slime','prop-doll-bat'];
function held(x,y,w,doll){const dw=Math.round(w*.84),dx=Math.round((w-dw)/2),dy=Math.round(w*.5);blit(doll,x+dx,y+dy,dw);blit(clawPNGs[1],x,y,w);}
for(const [i,w]of[40,48,60].entries()){
 const x=16+i*256,doll=PNG.sync.read(readFileSync(root+'assets-src/reference/c13-placeholders/'+dollKeys[i]+'.png'));
 blit(clawPNGs[0],x,260,w);blit(clawPNGs[1],x+w+12,260,w);held(x+(w+12)*2,260,w,doll);
 held(x+48,410,128,doll);
}
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c13-2-claw.png',PNG.sync.write(out));
console.log('C13-2 prop-claw: 32×32×2, 벌림/오므림 및40/48/60px·임시인형 합성 검토판 완료');
