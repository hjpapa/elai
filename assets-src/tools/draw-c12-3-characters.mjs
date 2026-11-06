import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, root, pose, polygon, rounded, eye, saveHires, loadGrid } from './c12-common.mjs';

// C12-3. 기존 탐험가의 청록 옷·황금 헬멧과 로비 칩 자리를 유지해요.
function skinHead(g,p,c) {
  const y=6+p.bob;
  polygon(g,[[9,y],[19,y],[24,y+3],[26,y+7],[26,y+13],[23,y+17],[18,y+19],[12,y+18],[8,y+15],[6,y+10],[7,y+4]],c.hair,c.edge);
  // 머리카락의 넓은 면에만 빛을 두고 가장자리 전체를 밝히지 않아요.
  g.poly([[9,y+2],[17,y+1],[21,y+3],[17,y+4],[10,y+5],[8,y+8],[8,y+4]],c.hairLight);
  g.line(10,y+2,15,y+2,c.hairHigh).line(8,y+6,8,y+8,c.hairLight);
  if(p.back){
    g.poly([[9,y+7],[16,y+5],[23,y+7],[24,y+13],[20,y+17],[13,y+16],[9,y+12]],c.hair);
    g.poly([[20,y+8],[24,y+7],[25,y+11],[23,y+15],[21,y+16]],c.hairDark);
    g.line(11,y+15,16,y+16,c.hairDark);
    g.rect(25,y+10,2,4,c.skinShade).set(25,y+11,c.skin).set(26,y+11,c.skinLight);
    g.set(23,y+17,c.skinShade).set(22,y+18,c.skin);
    return;
  }
  polygon(g,[[11,y+9],[16,y+8],[20,y+7],[23,y+8],[25,y+7],[26,y+10],[26,y+13],[23,y+17],[18,y+18],[13,y+16],[11,y+13]],c.skin,c.skinShade);
  g.poly([[12,y+10],[16,y+9],[20,y+9],[23,y+10],[23,y+12],[14,y+13],[12,y+12]],c.skinLight);
  g.line(24,y+11,25,y+13,c.skinShade).set(23,y+16,c.skinShade);
  // 비대칭 앞머리와 작은 귀로 오른쪽 아래를 보는 방향을 나타내요.
  g.poly([[9,y+7],[14,y+6],[17,y+7],[15,y+10],[13,y+11],[12,y+9],[10,y+11]],c.hair);
  g.rect(9,y+11,2,4,c.skinShade).set(10,y+12,c.skinLight);
  eye(g,16,y+11);eye(g,22,y+11);
  g.set(24,y+14,c.skinLight).line(19,y+16,21,y+16,c.mouth);
  g.set(14,y+14,c.skinShade);
}
function explorer(f){
 const p=pose(f),b=p.bob,g=new Grid(32,48);
 const c={skin:'K',skinLight:'%',skinShade:'$',hair:'U',hairLight:'X',hairHigh:'T',hairDark:'E',edge:'Q',mouth:'H'};
 for(const [x,s,near]of[[10+p.stride,p.stride,false],[19-p.stride,-p.stride,true]]){
  const top=37+Math.max(0,s);g.rect(x,top,5,43-top,'G').line(x,top,x,41,'I');
  polygon(g,[[x,41],[x+4,41],[x+5,42],[x+5,43],[x-1,43],[x-1,42]],near?'E':'U','Q');g.line(x,42,x+3,42,near?'X':'T');
 }
 const hy=30+b+p.swing,other=32+b-p.swing;
 polygon(g,[[7,26+b],[10,26+b],[11,31+b],[8,34+b],[5,33+b],[5,29+b]],'C','G');
 polygon(g,[[24,25+b],[27,27+b],[29,32+b],[27,35+b],[24,33+b],[23,28+b]],'C','G');
 g.line(7,28+b,7,31+b,'c').line(26,28+b,27,31+b,'o');
 rounded(g,p.back?5:24,hy,4,4,c.skin,c.skinShade);g.set(p.back?6:25,hy+1,c.skinLight);
 rounded(g,p.back?24:6,other,4,3,c.skin,c.skinShade);
 polygon(g,[[11,24+b],[20,24+b],[25,27+b],[25,37+b],[22,39+b],[10,39+b],[8,36+b],[9,27+b]],'C','G');
 g.poly([[10,26+b],[14,25+b],[14,35+b],[11,37+b],[10,34+b]],'o').line(10,28+b,10,32+b,'c');
 g.poly([[22,27+b],[24,28+b],[24,36+b],[21,38+b],[21,32+b]],'I');g.line(11,38+b,22,38+b,'G');
 if(p.back){
  // 옛 등판의 금빛 탐험 배낭. 상단의 반사와 잠금장치만 더해요.
  rounded(g,11,25+b,13,13,'Y','U');
  g.line(13,26+b,20,26+b,'y').rect(12,27+b,2,7,'t');
  g.poly([[21,27+b],[23,28+b],[23,35+b],[20,37+b],[19,34+b]],'+');
  rounded(g,15,31+b,6,5,'+','U').line(16,31+b,19,31+b,'T');g.rect(17,31+b,2,2,'y');
  g.line(10,25+b,10,35+b,'X');
 }else{
  g.poly([[15,24+b],[19,25+b],[18,36+b],[15,35+b]],'W').line(15,26+b,15,32+b,'?');
  g.line(21,25+b,21,37+b,'X').line(22,26+b,22,35+b,'T').set(21,30+b,'Y');
  g.line(10,33+b,12,33+b,'G');
 }
 skinHead(g,p,c);
 // 둥근 안전모. 램프는 앞, 고정 띠는 뒤에서 보여 방향을 구별해요.
 polygon(g,[[7,14+b],[5,11+b],[6,7+b],[9,4+b],[14,2+b],[19,2+b],[24,4+b],[27,8+b],[28,12+b],[26,14+b]],'Y','U');
 g.poly([[7,9+b],[9,6+b],[14,3+b],[18,3+b],[20,5+b],[18,8+b],[11,9+b]],'y');
 g.line(11,5+b,14,4+b,'W').line(8,9+b,8,11+b,'t');
 g.poly([[22,5+b],[25,7+b],[27,11+b],[25,13+b],[21,11+b]],'+');
 g.line(17,5+b,17,10+b,'t');
 polygon(g,[[5,12+b],[26,12+b],[29,14+b],[27,15+b],[5,15+b],[3,14+b]],'Y','U');g.line(6,13+b,16,13+b,'y');
 if(p.back){g.line(9,12+b,24,12+b,'U');rounded(g,14,11+b,6,3,'+','U');g.line(15,11+b,18,11+b,'T');}
 else{rounded(g,20,7+b,7,8,'S','d');rounded(g,21,8+b,5,6,'Y','+');g.rect(22,9+b,3,3,'W').rect(22,9+b,2,2,'?').set(24,12+b,'y');}
 return g;
}
function memory(f){
 const p=pose(f),b=p.bob,g=new Grid(32,48);
 if(p.back){
  rounded(g,10,28+b,14,10,'I','d');
  g.line(12,29+b,21,29+b,'C').line(11,30+b,11,34+b,'G');
  rounded(g,14,31+b,7,5,'C','G');g.rect(15,32+b,3,2,'c').set(15,32+b,'q').set(19,34+b,'o');
  g.line(12,32+b,13,32+b,'J').line(21,33+b,22,33+b,'J');
  for(const x of[12,16,20]){g.line(x,28+b,x+1,28+b,'Y').line(x,37+b,x+1,37+b,'+');g.set(x,28+b,'y');}
 }else{
  polygon(g,[[7,28+b],[8,28+b],[9,29+b],[9,36+b],[8,37+b],[7,37+b],[6,36+b],[6,29+b]],'C','d');
  g.line(7,30+b,7,35+b,'o').set(7,30+b,'c');
  g.set(9,30+b,'Y').set(9,34+b,'Y').set(8,31+b,'G').set(8,35+b,'G');
 }
 return g;
}
function memoryIcon(){
 const g=new Grid(32,32);
 for(const p of[9,15,21]){
  g.rect(p,3,3,4,'+').line(p,3,p+1,3,'y').line(p,4,p,6,'Y');
  g.rect(p,25,3,4,'+').line(p,26,p,28,'Y');
  g.rect(3,p,4,3,'+').line(3,p,6,p,'Y').set(3,p,'y');
  g.rect(25,p,4,3,'+').line(25,p,28,p,'Y');
 }
 rounded(g,6,6,20,20,'G','O');
 g.line(8,7,22,7,'I').line(7,8,7,22,'I');
 rounded(g,9,9,14,14,'C','G');
 g.line(11,10,20,10,'o').line(10,11,10,19,'o');
 rounded(g,12,12,8,8,'c','I').line(14,12,17,12,'q').line(13,13,13,16,'q');
 g.line(21,12,21,17,'G').line(12,21,17,21,'G');g.rect(20,20,2,2,'Y').set(20,20,'y');
 g.outline('O');return g;
}
const character=saveHires('char-explorer',Array.from({length:10},(_,f)=>explorer(f)));
const chip=saveHires('robi-part-memory',Array.from({length:10},(_,f)=>memory(f)));
const icon=saveHires('icon-part-memory',[memoryIcon()]);
// 앞뒤·좌우 반전 검토. 아래에는 아직1배인 나머지 부품도 논리 크기로 합성해요.
const up=g=>{const z=new Grid(g.w*2,g.h*2);z.rows=g.rows.flatMap(r=>{const row=r.flatMap(c=>[c,c]);return[[...row],[...row]];});return z;};
const merge=(...gs)=>{const g=new Grid(32,48);for(const a of gs)g.stamp(a.rows.map(r=>r.join('')));return g;};
const reverse=g=>{const r=new Grid(g.w,g.h);r.rows=g.rows.map(row=>[...row].reverse());return r;};
const rows=[loadGrid('char-explorer',false).map(up),character.frames,character.frames.map(reverse)];
const robi=loadGrid('char-robi'),wheel=loadGrid('robi-part-wheel');
rows.push(robi.map((g,f)=>merge(g,wheel[f],chip.frames[f])));rows.push(rows.at(-1).map(reverse));
const rest=['robi-part-sensor','robi-part-lens','robi-part-learnchip','robi-part-predictor','robi-part-talk','robi-part-ethics'].map(k=>loadGrid(k,false).map(up));
rows.push(robi.map((g,f)=>merge(g,wheel[f],chip.frames[f],...rest.map(a=>a[f]))));rows.push(rows.at(-1).map(reverse));
const palette=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors,width=1288,rowH=112,png=new PNG({width,height:rows.length*rowH+112});
for(let i=0;i<png.data.length;i+=4)png.data.set([38,44,59,255],i);
function draw(g,ox,oy,scale=2){for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.get(x,y);if(c==='.')continue;const rgb=[1,3,5].map(i=>parseInt(palette[c].slice(i,i+2),16));for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++)png.data.set([...rgb,255],(((oy+y*scale+dy)*width)+ox+x*scale+dx)*4);}}
rows.forEach((frames,r)=>frames.forEach((g,f)=>draw(g,8+f*128,r*rowH+8)));
const iy=rows.length*rowH;for(let y=iy;y<png.height;y++)for(let x=160;x<320;x++)png.data.set([255,244,210,255],(y*width+x)*4);
draw(loadGrid('icon-part-memory',false)[0],8,iy+16,4);draw(icon.frames[0],88,iy+16);draw(loadGrid('icon-part-memory',false)[0],168,iy+16,4);draw(icon.frames[0],248,iy+16);
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c12-3-characters.png',PNG.sync.write(png));
console.log('C12-3 탐험가·메모리칩·아이콘 3키21프레임 및 혼합 밀도 합성판 완료');
