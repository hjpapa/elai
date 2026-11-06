// C12-2: 밝은 불투명 픽셀의 크기·간격으로 번쩍임과 사라짐을 표현해요.
import {Grid,polygon,saveHires,root} from './c12-common.mjs';
import {ASSETS} from '../../src/game/assets.ts';
import {parsePalette,loadAsset,comparisonSheet} from '../../scripts/build-assets.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
import {PNG} from 'pngjs';
function star(g,x,y,r,c='y'){
 if(r<2){g.set(x,y,c);return;}
 g.poly([[x,y-r],[x+1,y-1],[x+r,y],[x+1,y+1],[x,y+r],[x-1,y+1],[x-r,y],[x-1,y-1]],c);
 g.line(x,y-Math.max(1,r-2),x,y+Math.max(1,r-2),'?').line(x-Math.max(1,r-2),y,x+Math.max(1,r-2),y,'W');g.set(x,y,'w');
}
function heart(g,x,y,size,fill='L'){
 polygon(g,[[x-size,y-1],[x-size,y-3],[x-size+2,y-5],[x-2,y-5],[x,y-3],[x+2,y-5],[x+size-2,y-5],[x+size,y-3],[x+size,y-1],[x,y+size]],fill,'I');
 g.line(x-size+2,y-3,x-3,y-3,'c').set(x-size+2,y-2,'?');g.line(x+size-2,y,x+1,y+size-2,'J');
}
function effect(key,f){
 const spec=ASSETS.find(a=>a.key===key),g=new Grid(spec.w*2,spec.h*2);
 if(key==='fx-hit'){
  if(f<2){const r=f===0?10:13;g.poly([[16,16-r],[18,12],[16+r,16],[21,18],[16,16+r],[13,21],[16-r,16],[11,13]],f?'y':'&');star(g,16,16,f?7:5,'?');g.line(12,12,14,14,'w');}
  else for(const [x,y] of [[6,7],[25,7],[7,25],[25,24]])star(g,x,y,2,'y');
 }else if(key==='fx-guard'){
  const points=[[11,12],[24,7],[37,12],[35,29],[30,36],[24,40],[18,36],[13,29]];
  if(f<2){polygon(g,points,f?'q':'o','/');polygon(g,[[14,14],[24,10],[34,14],[32,28],[28,33],[24,36],[20,33],[16,28]],f?'?':'b','C');g.poly([[15,15],[24,12],[24,34],[21,32],[18,27]],f?'w':'q');g.rect(22,17,4,13,'?').rect(18,21,12,4,'?');g.line(12,13,24,8,'?');if(f===1){star(g,7,12,3,'b');star(g,41,27,3,'y');}}
  else{for(let i=0;i<points.length;i++){const [x,y]=points[i],next=points[(i+1)%points.length];g.line(x,y,Math.round((x+next[0])/2),Math.round((y+next[1])/2),'q');}star(g,9,8,2,'b');star(g,38,35,2,'W');}
 }else if(key==='fx-heal'){
  const y=22-f*5;heart(g,16,y,f===3?4:6,f===3?'c':'L');star(g,f%2?26:5,24-f*5,f===3?1:3,'y');if(f===1||f===2){g.set(10,28-f,'c').set(21,26-f,'L').set(11,24-f,'q');}if(f===3){for(let yy=0;yy<32;yy++)for(let x=0;x<32;x++)if((x+yy)%3===0)g.set(x,yy,'.');}
 }else if(key==='fx-purify'){
  const radius=[9,14,19,23,26,28][f],count=f===5?6:8;
  for(let i=0;i<count;i++){const a=i*Math.PI*2/count+f*.11;star(g,Math.round(32+Math.cos(a)*radius),Math.round(32+Math.sin(a)*radius),[3,4,5,4,2,1][f],i%2?'c':'y');}
  if(f<3)star(g,32,32,7-f*2,'W');
  if(f>=2&&f<=4){heart(g,32,28-(f-2)*4,f===4?3:5,'p');}
  if(f===2||f===3)for(let i=0;i<8;i++){const a=(i+.5)*Math.PI/4;g.set(32+Math.cos(a)*(radius+3),32+Math.sin(a)*(radius+3),'q');}
 }else if(key==='fx-levelup'){
  const top=[37,28,19,10,7,5][f];
  if(f<4){for(const x of [19,25,31,32,38,44]){g.line(x,top+Math.abs(x-32)/2,x,54-f%2,x===31||x===32?'?':x<32?'y':'Y');if(f>1&&x!==31)g.line(x+1,top+5,x+1,49,'&');}
   g.line(10,54,24,59,'Y').line(24,59,46,58,'y').line(46,58,55,52,'Y');
  }else{for(const x of [20,26,32,38,44])for(let y=top+(x%3);y<50-f*3;y+=f===4?5:9)g.line(x,y,x,y+1,x%4?'y':'?');}
  if(f<5){const cy=44-f*7;polygon(g,[[32,cy-9],[43,cy+2],[36,cy+2],[36,cy+12],[28,cy+12],[28,cy+2],[21,cy+2]],'y','+');g.line(32,cy-6,25,cy+1,'?').rect(29,cy+1,3,9,'&');}
  star(g,f%2?11:52,42-f*6,f===5?1:4,'W');if(f>1&&f<5)star(g,f%2?49:13,30-f*3,2,'c');
 }else if(key==='fx-sparkle'){
  star(g,7,7,[2,4,6,1][f],f===3?'y':'W');if(f===2)g.set(3,3,'Y').set(11,11,'Y');
 }
 return g;
}
const keys=['fx-hit','fx-guard','fx-heal','fx-purify','fx-levelup','fx-sparkle'];
for(const key of keys){const spec=ASSETS.find(a=>a.key===key);const fs=Array.from({length:spec.frames},(_,f)=>effect(key,f));saveHires(key,fs);const counts=fs.map(g=>g.rows.flat().filter(c=>c!=='.').length);if(counts.at(-1)>=Math.max(...counts.slice(0,-1)))throw new Error('마지막 프레임이 사라지지 않아요: '+key);console.log(key,counts);}
const palette=parsePalette(JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')));const assets=await Promise.all(keys.map(key=>loadAsset(ASSETS.find(a=>a.key===key),palette.symbols)));writeFileSync(root+'assets-preview/c12-2-fx.png',PNG.sync.write(comparisonSheet(assets,palette,keys)));
