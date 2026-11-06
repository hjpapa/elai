import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, root, pose, polygon, rounded, eye, saveHires, loadGrid } from './c12-common.mjs';

// C12-9. 성 지킴이의 금빛 머리띠·민트 마음 배지·보라 옷과 윤리 코어예요.
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
function keeperHeart(g,x,y){
 polygon(g,[[x,y+1],[x+1,y],[x+3,y],[x+4,y+2],[x+5,y],[x+7,y],[x+8,y+1],[x+8,y+3],[x+4,y+7],[x,y+3]],'c','G');
 g.line(x+2,y+1,x+3,y+1,'q').set(x+1,y+2,'?').set(x+6,y+1,'q');
 g.line(x+5,y+4,x+4,y+5,'C');
}
function keeper(f){
 const p=pose(f),b=p.bob,g=new Grid(32,48);
 const c={skin:'K',skinLight:'%',skinShade:'$',hair:'U',hairLight:'X',hairHigh:'T',hairDark:'E',edge:'Q',mouth:'H'};
 for(const[x,s,near]of[[10+p.stride,p.stride,false],[19-p.stride,-p.stride,true]]){
  const top=37+Math.max(0,s);g.rect(x,top,5,43-top,'D').line(x,top,x,41,'V');
  polygon(g,[[x,41],[x+4,41],[x+5,42],[x+5,43],[x-1,43],[x-1,42]],near?'Q':'D','O');g.line(x,42,x+3,42,near?'U':'X');
 }
 const hy=30+b+p.swing,other=32+b-p.swing;
 polygon(g,[[7,26+b],[10,26+b],[11,31+b],[8,34+b],[5,33+b],[5,29+b]],'V','D');
 polygon(g,[[24,25+b],[27,27+b],[29,32+b],[27,35+b],[24,33+b],[23,28+b]],'V','D');
 g.line(7,28+b,7,31+b,'v').line(26,28+b,27,31+b,'V');
 rounded(g,p.back?5:24,hy,4,4,c.skin,c.skinShade);g.set(p.back?6:25,hy+1,c.skinLight);
 rounded(g,p.back?24:6,other,4,3,c.skin,c.skinShade);
 polygon(g,[[11,24+b],[20,24+b],[25,27+b],[25,37+b],[22,39+b],[10,39+b],[8,36+b],[9,27+b]],'V','D');
 g.poly([[10,26+b],[14,25+b],[14,35+b],[11,37+b],[10,34+b]],'v');
 g.poly([[22,27+b],[24,28+b],[24,36+b],[21,38+b],[21,32+b]],'D');g.line(11,38+b,22,38+b,'D');
 g.line(10,26+b,10,37+b,'Y').line(11,27+b,11,37+b,'+').set(10,27+b,'y');
 if(p.back){
  keeperHeart(g,13,27+b);
  g.line(15,36+b,22,36+b,'v').line(12,37+b,22,37+b,'+');
  g.line(4,hy,4,hy+7,'E').line(5,hy+1,5,hy+6,'W');
 }else{
  g.poly([[13,24+b],[19,25+b],[22,25+b],[20,27+b],[15,27+b]],'v');g.line(14,25+b,18,26+b,'p');
  keeperHeart(g,13,27+b);
  g.line(14,36+b,21,36+b,'+').set(18,36+b,'Y');
  // 기존의 흰 기록장에 청록 기록을 유지하고 손의 보행에 맞춰요.
  rounded(g,24,hy-2,7,11,'X','E');g.rect(25,hy-1,4,8,'W').line(25,hy-1,28,hy-1,'?');
  g.line(26,hy+1,28,hy+1,'C').line(26,hy+3,28,hy+3,'C').set(26,hy+5,'c');
  g.rect(24,hy+4,2,3,c.skin).set(24,hy+4,c.skinLight);
 }
 skinHead(g,p,c);
 if(!p.back){
  g.line(16,16+b,17,16+b,'U').line(22,16+b,23,16+b,'U');
  g.set(20,21+b,'$').line(19,22+b,21,22+b,'H');
 }
 // 머리카락 위의 금색 띠와 민트 보석 두 개. 앞뒤로 금색 둘레를 이어줘요.
 g.line(8,12+b,24,12+b,'+').line(9,11+b,23,11+b,'Y').line(10,11+b,18,11+b,'y');
 g.line(24,12+b,25,14+b,'U').line(9,12+b,10,13+b,'+');
 for(const x of[13,21]){
  polygon(g,[[x,9+b],[x+1,8+b],[x+2,9+b],[x+2,11+b],[x+1,12+b],[x,11+b]],'c','G');
  g.set(x+1,9+b,'q').set(x+1,10+b,'c').set(x+1,11+b,'C');
 }
 if(p.back){g.set(17,12+b,'Y').set(18,12+b,'+');}
 return g;
}
function ethics(f){
 const p=pose(f),b=p.bob,g=new Grid(32,48);
 // 기존 좌상 영역 x2..11. 별 안테나 x12..21과 센서 y16 이후를 비워요.
 g.line(8,10+b,8,13+b,'A').line(9,10+b,9,13+b,'d').set(8,12+b,'j');
 polygon(g,[[3,3+b],[10,3+b],[11,4+b],[11,8+b],[9,11+b],[6,13+b],[3,10+b],[2,8+b],[2,4+b]],'C','G');
 g.line(4,4+b,9,4+b,'c').line(3,5+b,3,7+b,'o');
 g.poly([[10,5+b],[10,8+b],[8,11+b],[6,12+b],[7,9+b]],'I');
 // 한 픽셀 골을 둔 두 둥근 꼭대기가 작은 배지에서도 하트로 읽혀요.
 g.line(4,5+b,5,5+b,'W').line(7,5+b,8,5+b,'W');
 g.line(3,6+b,9,6+b,'W').line(4,7+b,8,7+b,'W').line(5,8+b,7,8+b,'W');
 g.set(6,9+b,'c').set(4,5+b,'?').set(8,5+b,'q');
 return g;
}
function ethicsIcon(){
 const g=new Grid(32,32);
 polygon(g,[[5,5],[16,2],[27,5],[27,17],[24,22],[16,29],[8,23],[4,17],[4,7]],'C','O');
 g.poly([[6,7],[15,4],[15,25],[9,21],[6,16]],'o');
 g.poly([[23,7],[25,7],[25,16],[22,21],[17,26],[16,23],[20,18]],'I');
 g.line(7,7,14,5,'c').line(6,8,6,15,'q').line(17,4,24,6,'c');
 polygon(g,[[8,10],[10,8],[13,8],[16,11],[19,8],[22,8],[24,10],[24,14],[21,18],[16,23],[11,18],[8,14]],'W','G');
 g.poly([[10,11],[11,9],[13,9],[16,13],[19,10],[21,10],[22,12],[20,15],[16,19],[12,15]],'?');
 g.line(21,16,16,21,'c').line(16,21,12,17,'q');
 return g;
}
const character=saveHires('char-keeper',Array.from({length:10},(_,f)=>keeper(f)));
const module=saveHires('robi-part-ethics',Array.from({length:10},(_,f)=>ethics(f)));
const icon=saveHires('icon-part-ethics',[ethicsIcon()]);
const up=g=>{const z=new Grid(g.w*2,g.h*2);z.rows=g.rows.flatMap(r=>{const row=r.flatMap(c=>[c,c]);return[[...row],[...row]];});return z;};
const merge=(...gs)=>{const g=new Grid(32,48);for(const a of gs)g.stamp(a.rows.map(r=>r.join('')));return g;};
const reverse=g=>{const r=new Grid(g.w,g.h);r.rows=g.rows.map(row=>[...row].reverse());return r;};
const rows=[loadGrid('char-keeper',false).map(up),character.frames,character.frames.map(reverse)];
const robi=loadGrid('char-robi'),current=['robi-part-wheel','robi-part-memory','robi-part-sensor','robi-part-lens','robi-part-learnchip','robi-part-predictor','robi-part-talk'].map(k=>loadGrid(k));
rows.push(robi.map((g,f)=>merge(g,...current.map(a=>a[f]),module.frames[f])));rows.push(rows.at(-1).map(reverse));
rows.push(module.frames);rows.push(module.frames.map(reverse));
const palette=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors,width=1288,rowH=112,png=new PNG({width,height:rows.length*rowH+112});
for(let i=0;i<png.data.length;i+=4)png.data.set([38,44,59,255],i);
function draw(g,ox,oy,scale=2){for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.get(x,y);if(c==='.')continue;const rgb=[1,3,5].map(i=>parseInt(palette[c].slice(i,i+2),16));for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++)png.data.set([...rgb,255],(((oy+y*scale+dy)*width)+ox+x*scale+dx)*4);}}
rows.forEach((frames,r)=>frames.forEach((g,f)=>draw(g,8+f*128,r*rowH+8)));
const iy=rows.length*rowH;for(let y=iy;y<png.height;y++)for(let x=160;x<320;x++)png.data.set([255,244,210,255],(y*width+x)*4);
draw(loadGrid('icon-part-ethics',false)[0],8,iy+16,4);draw(icon.frames[0],88,iy+16);draw(loadGrid('icon-part-ethics',false)[0],168,iy+16,4);draw(icon.frames[0],248,iy+16);
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c12-9-characters.png',PNG.sync.write(png));
console.log('C12-9 성 지킴이·윤리 코어·아이콘 3키21프레임 및 전체8부품 합성판 완료');
