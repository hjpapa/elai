import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, root, pose, polygon, rounded, eye, saveHires, loadGrid } from './c12-common.mjs';

// C12-6. 흰 실험복과 청록 기록판·푸른 보안경, 보라색 학습 칩을 이어 그려요.
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
function researcher(f){
 const p=pose(f),b=p.bob,g=new Grid(32,48);
 const c={skin:'K',skinLight:'%',skinShade:'$',hair:'U',hairLight:'X',hairHigh:'T',hairDark:'E',edge:'Q',mouth:'H'};
 for(const[x,s,near]of[[10+p.stride,p.stride,false],[19-p.stride,-p.stride,true]]){
  const top=37+Math.max(0,s);g.rect(x,top,5,43-top,'d').line(x,top,x,41,'f');
  polygon(g,[[x,41],[x+4,41],[x+5,42],[x+5,43],[x-1,43],[x-1,42]],near?'S':'f','O');g.line(x,42,x+3,42,near?'i':'a');
 }
 const hy=30+b+p.swing,other=32+b-p.swing;
 polygon(g,[[7,26+b],[10,26+b],[11,31+b],[8,34+b],[5,33+b],[5,29+b]],'W','S');
 polygon(g,[[24,25+b],[27,27+b],[29,32+b],[27,35+b],[24,33+b],[23,28+b]],'a','S');
 g.line(7,28+b,7,31+b,'?').line(26,28+b,27,31+b,'j');
 rounded(g,p.back?5:24,hy,4,4,c.skin,c.skinShade);g.set(p.back?6:25,hy+1,c.skinLight);
 rounded(g,p.back?24:6,other,4,3,c.skin,c.skinShade);
 polygon(g,[[11,24+b],[20,24+b],[25,27+b],[25,37+b],[22,39+b],[10,39+b],[8,36+b],[9,27+b]],'W','S');
 g.poly([[10,26+b],[14,25+b],[14,35+b],[11,37+b],[10,34+b]],'?');
 g.poly([[22,27+b],[24,28+b],[24,36+b],[21,38+b],[21,32+b]],'i');g.line(11,38+b,22,38+b,'a');
 if(p.back){
  g.line(16,26+b,16,37+b,'a').line(12,32+b,22,32+b,'a');
  g.line(12,33+b,21,33+b,'j').set(17,32+b,'i');
  g.line(10,28+b,10,35+b,'j').line(22,29+b,22,35+b,'a');
  // 뒤에서도 오른손 기록판의 옆면이 가볍게 보여요.
  g.line(4,hy+1,4,hy+6,'E').line(5,hy+2,5,hy+5,'W');
 }else{
  g.poly([[15,25+b],[20,25+b],[19,36+b],[16,37+b]],'C').line(16,28+b,16,35+b,'q');
  polygon(g,[[11,25+b],[15,25+b],[17,30+b],[14,28+b],[13,31+b],[10,28+b]],'j','a');
  polygon(g,[[20,25+b],[23,27+b],[20,31+b],[19,28+b],[18,30+b]],'W','i');
  g.line(16,31+b,16,37+b,'C').set(18,32+b,'i').set(18,35+b,'i');
  g.line(10,33+b,13,33+b,'i').line(11,34+b,13,34+b,'a').set(12,31+b,'B').set(13,32+b,'C');
  // 관찰 기록판은 밝은 종이에 청록 줄을 두고 손의 흔들림을 따라가요.
  rounded(g,24,hy-1,7,10,'X','E');g.rect(25,hy,4,7,'W').line(25,hy,28,hy,'?');
  g.rect(26,hy,2,1,'i').line(26,hy+2,28,hy+2,'C').line(26,hy+4,28,hy+4,'C').set(26,hy+5,'L');
  g.rect(24,hy+4,2,3,c.skin).set(24,hy+4,c.skinLight);
 }
 skinHead(g,p,c);
 // 관자놀이의 작은 회색 머리와 넓은 보안경으로 다른 인물과 구별해요.
 if(p.back){
  g.poly([[8,13+b],[10,15+b],[10,20+b],[8,18+b]],'f').line(9,15+b,9,17+b,'i');
  g.line(8,16+b,24,16+b,'N').line(10,15+b,21,15+b,'/');
  g.rect(15,15+b,4,3,'d').line(16,15+b,17,15+b,'f');
 }else{
  g.line(8,13+b,9,16+b,'i').set(9,13+b,'a');
  g.line(10,17+b,13,17+b,'N');
  for(const x of[13,21]){
   rounded(g,x,15+b,7,7,c.skin,'N');
   g.line(x+2,16+b,x+4,16+b,'b').line(x+1,17+b,x+1,19+b,'o').set(x+2,16+b,'q');
  }
  g.line(19,17+b,21,17+b,'N').set(20,18+b,'B');
  eye(g,16,17+b);eye(g,22,17+b);
  g.set(18,19+b,'b').set(25,19+b,'b').line(19,22+b,21,22+b,'H');
 }
 return g;
}
function learnchip(f){
 const p=pose(f),b=p.bob,g=new Grid(32,48),x=p.back?2:22;
 // 메모리 칩 반대편의 기존 8×10 옆구리 영역에만 자리 잡아요.
 polygon(g,[[x+1,28+b],[x+6,28+b],[x+7,29+b],[x+7,36+b],[x+6,37+b],[x+1,37+b],[x,36+b],[x,29+b]],'V','d');
 g.line(x+2,29+b,x+5,29+b,'v').line(x+1,30+b,x+1,34+b,'v');
 g.rect(x+3,31+b,3,3,'v').set(x+3,31+b,'p').set(x+4,32+b,'W');
 g.line(x+6,30+b,x+6,34+b,'D').set(x+2,35+b,'V');
 g.set(x+4,36+b,'Y').set(x+5,36+b,'+').set(x+4,35+b,'y');
 // 작은 접점의 높이를 앞뒤에 맞춰 바퀴·메모리 칩과 간격을 지켜요.
 g.set(p.back?x+7:x,30+b,'Y').set(p.back?x+7:x,34+b,'+');
 return g;
}
function learnchipIcon(){
 const g=new Grid(32,32);
 for(const p of[9,15,21]){
  g.rect(p,3,3,4,'+').line(p,3,p+1,3,'y').line(p,4,p,6,'Y');
  g.rect(p,25,3,4,'+').line(p,26,p,28,'Y');
  g.rect(3,p,4,3,'+').line(3,p,6,p,'Y').set(3,p,'y');
  g.rect(25,p,4,3,'+').line(25,p,28,p,'Y');
 }
 rounded(g,6,6,20,20,'V','O');
 g.line(8,7,22,7,'v').line(7,8,7,22,'v');
 g.poly([[23,9],[24,10],[24,22],[22,24],[10,24],[12,22],[22,22]],'D');
 g.ellipse(16,16,7,7,'v').ellipse(14,13,4,3,'p');
 // 옛 학습 표시의 지붕 모양과 금색 점을 더 또렷한 세 갈래 회로로 그려요.
 g.line(11,16,16,11,'W').line(16,11,21,16,'W').line(16,12,16,18,'W');
 g.set(12,15,'?').set(16,11,'?').set(20,15,'?');
 g.rect(15,20,3,3,'Y').set(15,20,'y').set(17,22,'+');
 g.outline('O');return g;
}
const character=saveHires('char-researcher',Array.from({length:10},(_,f)=>researcher(f)));
const module=saveHires('robi-part-learnchip',Array.from({length:10},(_,f)=>learnchip(f)));
const icon=saveHires('icon-part-learnchip',[learnchipIcon()]);
const up=g=>{const z=new Grid(g.w*2,g.h*2);z.rows=g.rows.flatMap(r=>{const row=r.flatMap(c=>[c,c]);return[[...row],[...row]];});return z;};
const merge=(...gs)=>{const g=new Grid(32,48);for(const a of gs)g.stamp(a.rows.map(r=>r.join('')));return g;};
const reverse=g=>{const r=new Grid(g.w,g.h);r.rows=g.rows.map(row=>[...row].reverse());return r;};
const rows=[loadGrid('char-researcher',false).map(up),character.frames,character.frames.map(reverse)];
const robi=loadGrid('char-robi'),current=['robi-part-wheel','robi-part-memory','robi-part-sensor','robi-part-lens'].map(k=>loadGrid(k));
rows.push(robi.map((g,f)=>merge(g,...current.map(a=>a[f]),module.frames[f])));rows.push(rows.at(-1).map(reverse));
const rest=['robi-part-predictor','robi-part-talk','robi-part-ethics'].map(k=>loadGrid(k,false).map(up));
rows.push(robi.map((g,f)=>merge(g,...current.map(a=>a[f]),module.frames[f],...rest.map(a=>a[f]))));rows.push(rows.at(-1).map(reverse));
const palette=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors,width=1288,rowH=112,png=new PNG({width,height:rows.length*rowH+112});
for(let i=0;i<png.data.length;i+=4)png.data.set([38,44,59,255],i);
function draw(g,ox,oy,scale=2){for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.get(x,y);if(c==='.')continue;const rgb=[1,3,5].map(i=>parseInt(palette[c].slice(i,i+2),16));for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++)png.data.set([...rgb,255],(((oy+y*scale+dy)*width)+ox+x*scale+dx)*4);}}
rows.forEach((frames,r)=>frames.forEach((g,f)=>draw(g,8+f*128,r*rowH+8)));
const iy=rows.length*rowH;for(let y=iy;y<png.height;y++)for(let x=160;x<320;x++)png.data.set([255,244,210,255],(y*width+x)*4);
draw(loadGrid('icon-part-learnchip',false)[0],8,iy+16,4);draw(icon.frames[0],88,iy+16);draw(loadGrid('icon-part-learnchip',false)[0],168,iy+16,4);draw(icon.frames[0],248,iy+16);
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c12-6-characters.png',PNG.sync.write(png));
console.log('C12-6 연구자·학습 칩·아이콘 3키21프레임 및 혼합 밀도 합성판 완료');
