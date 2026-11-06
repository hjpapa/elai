import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, root, pose, polygon, rounded, saveHires, loadGrid } from './c12-common.mjs';

// C12-8. 오른쪽 위의 파란 말풍선과 세 개의 대화 점을 이어 그려요.
function talk(f){
 const p=pose(f),b=p.bob,g=new Grid(32,48);
 // 별 안테나의 x12..21과 겹치지 않는 원래 우상 영역 x22..31이에요.
 g.line(24,10+b,24,13+b,'A').line(25,10+b,25,13+b,'d').set(24,12+b,'j');
 polygon(g,[[24,3+b],[29,3+b],[31,5+b],[31,8+b],[29,10+b],[26,10+b],[24,12+b],[24,10+b],[22,8+b],[22,5+b]],'b','N');
 g.line(24,4+b,29,4+b,'q').rect(23,5+b,8,4,'q').line(24,5+b,29,5+b,'?');
 // 각 점은 2×2, 사이에는 1px 간격을 둬 세 점이 이어 붙지 않아요.
 for(const x of[23,26,29])g.rect(x,6+b,2,2,'N').set(x,6+b,'B');
 g.line(24,9+b,28,9+b,'o').set(25,10+b,'b').set(24,11+b,'o');
 return g;
}
function talkIcon(){
 const g=new Grid(32,32);
 polygon(g,[[5,4],[26,4],[29,7],[29,21],[26,24],[14,24],[7,29],[7,24],[5,24],[2,21],[2,7]],'B','O');
 polygon(g,[[8,23],[13,22],[12,24],[8,27]],'b','B');
 rounded(g,4,6,24,16,'q','b');rounded(g,6,8,20,12,'W','q');
 g.line(7,7,24,7,'?').line(4,9,4,18,'o');
 g.line(7,22,25,22,'n').line(27,10,27,19,'o');
 for(const x of[8,15,22]){
  rounded(g,x,13,3,4,'N','N');g.set(x,13,'B').set(x+1,13,'B');
 }
 return g;
}
const module=saveHires('robi-part-talk',Array.from({length:10},(_,f)=>talk(f)));
const icon=saveHires('icon-part-talk',[talkIcon()]);
const up=g=>{const z=new Grid(g.w*2,g.h*2);z.rows=g.rows.flatMap(r=>{const row=r.flatMap(c=>[c,c]);return[[...row],[...row]];});return z;};
const merge=(...gs)=>{const g=new Grid(32,48);for(const a of gs)g.stamp(a.rows.map(r=>r.join('')));return g;};
const reverse=g=>{const r=new Grid(g.w,g.h);r.rows=g.rows.map(row=>[...row].reverse());return r;};
const rows=[loadGrid('robi-part-talk',false).map(up),module.frames];
const robi=loadGrid('char-robi'),current=['robi-part-wheel','robi-part-memory','robi-part-sensor','robi-part-lens','robi-part-learnchip','robi-part-predictor'].map(k=>loadGrid(k));
rows.push(robi.map((g,f)=>merge(g,...current.map(a=>a[f]),module.frames[f])));rows.push(rows.at(-1).map(reverse));
const ethics=loadGrid('robi-part-ethics',false).map(up);
rows.push(robi.map((g,f)=>merge(g,...current.map(a=>a[f]),module.frames[f],ethics[f])));rows.push(rows.at(-1).map(reverse));
const palette=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors,width=1288,rowH=112,png=new PNG({width,height:rows.length*rowH+112});
for(let i=0;i<png.data.length;i+=4)png.data.set([38,44,59,255],i);
function draw(g,ox,oy,scale=2){for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.get(x,y);if(c==='.')continue;const rgb=[1,3,5].map(i=>parseInt(palette[c].slice(i,i+2),16));for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++)png.data.set([...rgb,255],(((oy+y*scale+dy)*width)+ox+x*scale+dx)*4);}}
rows.forEach((frames,r)=>frames.forEach((g,f)=>draw(g,8+f*128,r*rowH+8)));
const iy=rows.length*rowH;for(let y=iy;y<png.height;y++)for(let x=160;x<320;x++)png.data.set([255,244,210,255],(y*width+x)*4);
draw(loadGrid('icon-part-talk',false)[0],8,iy+16,4);draw(icon.frames[0],88,iy+16);draw(loadGrid('icon-part-talk',false)[0],168,iy+16,4);draw(icon.frames[0],248,iy+16);
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c12-8-characters.png',PNG.sync.write(png));
console.log('C12-8 대화 모듈·아이콘 2키11프레임 및 혼합 밀도 합성판 완료');
