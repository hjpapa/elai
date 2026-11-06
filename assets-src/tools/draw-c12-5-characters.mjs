import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, root, pose, polygon, rounded, eye, saveHires, loadGrid } from './c12-common.mjs';

// C12-5. 항구지기의 회색 모자·주황 구명조끼·기록장과 파란 데이터 렌즈예요.
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
function harbor(f){
 const p=pose(f),b=p.bob,g=new Grid(32,48);
 const c={skin:'K',skinLight:'%',skinShade:'$',hair:'U',hairLight:'X',hairHigh:'T',hairDark:'E',edge:'Q',mouth:'H'};
 for(const[x,s,near]of[[10+p.stride,p.stride,false],[19-p.stride,-p.stride,true]]){
  const top=37+Math.max(0,s);g.rect(x,top,5,43-top,'N').line(x,top,x,41,':');
  polygon(g,[[x,41],[x+4,41],[x+5,42],[x+5,43],[x-1,43],[x-1,42]],near?'d':'S','O');g.line(x,42,x+3,42,near?'f':'i');
 }
 const hy=30+b+p.swing,other=32+b-p.swing;
 polygon(g,[[7,26+b],[10,26+b],[11,31+b],[8,34+b],[5,33+b],[5,29+b]],'B','N');
 polygon(g,[[24,25+b],[27,27+b],[29,32+b],[27,35+b],[24,33+b],[23,28+b]],'B','N');
 g.line(7,28+b,7,31+b,'b').line(26,28+b,27,31+b,':');
 rounded(g,p.back?5:24,hy,4,4,c.skin,c.skinShade);g.set(p.back?6:25,hy+1,c.skinLight);
 rounded(g,p.back?24:6,other,4,3,c.skin,c.skinShade);
 polygon(g,[[11,24+b],[20,24+b],[25,27+b],[25,37+b],[22,39+b],[10,39+b],[8,36+b],[9,27+b]],'B','N');
 g.poly([[10,26+b],[14,25+b],[14,35+b],[11,37+b],[10,34+b]],'b').line(10,28+b,10,32+b,'q');
 g.poly([[22,27+b],[24,28+b],[24,36+b],[21,38+b],[21,32+b]],':');g.line(11,38+b,22,38+b,'N');
 if(p.back){
  polygon(g,[[11,25+b],[20,25+b],[24,28+b],[24,36+b],[21,38+b],[10,38+b],[9,35+b],[9,28+b]],'r','R');
  g.poly([[11,27+b],[15,26+b],[15,35+b],[11,36+b]],'x');
  g.poly([[21,28+b],[23,29+b],[23,35+b],[20,37+b],[19,34+b]],'u');
  g.line(10,31+b,22,31+b,'Y').line(11,30+b,22,30+b,'y');
  g.line(16,27+b,16,37+b,'R').line(11,36+b,21,36+b,'R');
  g.line(4,hy+1,4,hy+6,'E').line(5,hy+2,5,hy+5,'W');
 }else{
  polygon(g,[[10,25+b],[14,25+b],[15,28+b],[15,37+b],[10,37+b],[9,34+b],[9,28+b]],'r','R');
  g.line(11,27+b,11,35+b,'x').line(10,30+b,14,30+b,'y').line(10,31+b,14,31+b,'Y');
  polygon(g,[[19,25+b],[23,26+b],[25,29+b],[24,37+b],[19,37+b],[18,28+b]],'r','R');
  g.line(20,27+b,20,35+b,'x').line(19,30+b,23,30+b,'y').line(19,31+b,23,31+b,'Y');
  g.line(15,34+b,18,34+b,'d').rect(16,33+b,2,3,'i').set(16,33+b,'j');
  // 손의 흔들림에 맞춘 흰 기록장과 파란 기록 줄이에요.
  rounded(g,24,hy-1,7,10,'X','E');g.rect(25,hy,4,7,'W').line(25,hy,28,hy,'?');
  g.line(26,hy+2,28,hy+2,'B').line(26,hy+4,27,hy+4,'B').set(28,hy+5,'C');
  g.rect(24,hy+4,2,3,c.skin).set(24,hy+4,c.skinLight);
 }
 skinHead(g,p,c);
 if(!p.back){g.line(16,16+b,17,16+b,'U').line(22,16+b,23,16+b,'U').set(19,21+b,'$');}
 // 회색 작업모에 청회색 띠와 짧은 오른쪽 차양을 더해요.
 polygon(g,[[7,11+b],[7,6+b],[10,3+b],[20,3+b],[25,6+b],[26,11+b]],'i','d');
 g.poly([[9,6+b],[12,4+b],[19,4+b],[21,6+b],[18,8+b],[8,8+b]],'a');
 g.line(12,4+b,18,4+b,'j').line(9,6+b,9,8+b,'j');
 g.poly([[22,6+b],[24,7+b],[25,10+b],[20,10+b],[20,8+b]],'f');
 g.line(7,10+b,25,10+b,'S').line(8,11+b,25,11+b,'d');
 if(p.back){g.line(14,8+b,14,10+b,'f').rect(13,10+b,4,2,'S').line(14,10+b,15,10+b,'i');}
 else{g.rect(21,9+b,3,2,'S').set(21,9+b,'a');}
 polygon(g,[[8,12+b],[24,12+b],[29,13+b],[28,15+b],[23,15+b],[18,14+b],[8,14+b]],'S','d');
 g.line(9,12+b,22,12+b,'i').line(21,13+b,27,13+b,'A').set(26,14+b,'f');
 return g;
}
function lens(f){
 const p=pose(f),b=p.bob,g=new Grid(32,48);
 if(p.back){
  // 뒤에서는 기존 x10..17, y14..19 안에 접힌 데이터 렌즈가 보여요.
  polygon(g,[[11,14+b],[16,14+b],[17,15+b],[17,18+b],[16,19+b],[11,19+b],[10,18+b],[10,15+b]],'N','d');
  g.line(11,15+b,15,15+b,'B').rect(12,16+b,4,2,'b').line(12,16+b,14,16+b,'q');
  g.set(16,17+b,':').set(11,18+b,'n');
 }else{
  // 눈과 입이 있는 화면은 완전히 투명해요. 광학 테두리는 화면 바깥만 둘러요.
  polygon(g,[[10,14+b],[23,14+b],[26,16+b],[27,19+b],[26,22+b],[23,25+b],[10,25+b],[8,23+b],[8,16+b]],'B','N');
  g.line(11,14+b,22,14+b,'o').line(11,15+b,22,15+b,'b');
  g.line(8,17+b,8,22+b,'n').line(10,24+b,22,24+b,':');
  g.line(25,16+b,26,18+b,'b').line(26,19+b,25,22+b,'n').set(25,17+b,'q').set(24,23+b,'i');
  // 화면 보호 영역에 딱 맞춘 구멍. 불투명 테두리도 이 안에는 두지 않아요.
  g.rect(9,16+b,15,7,'.');
 }
 return g;
}
function lensIcon(){
 const g=new Grid(32,32);
 polygon(g,[[20,18],[23,20],[29,26],[29,28],[27,29],[25,28],[19,22]],'i','O');
 g.line(22,21,27,26,'j').line(22,23,26,27,'f').set(27,28,'d');
 g.ellipse(13,13,10,10,'O').ellipse(13,13,9,9,'N').ellipse(13,13,8,8,'B');
 g.ellipse(13,13,6,6,'b').ellipse(11,11,4,4,'q');
 g.line(8,10,10,8,'?').set(8,11,'?');g.line(16,18,18,16,'n').set(19,13,':');
 g.line(7,6,11,4,'o').set(5,8,'o');return g;
}
function scanCard(){
 // C12-2 카드의 공통 2px 여백과 3중 테두리를 그대로 맞춰요.
 const g=new Grid(32,32);rounded(g,2,2,28,28,'N','O');rounded(g,4,4,24,24,'B','N');rounded(g,6,6,20,20,'W','B');
 g.line(7,3,23,3,'B').line(3,7,3,23,'B').line(8,5,22,5,'?');
 polygon(g,[[8,8],[17,8],[20,11],[20,24],[8,24]],'j','S');
 g.rect(9,9,8,14,'?').poly([[17,9],[17,12],[19,12]],'a');
 g.line(11,12,15,12,'i').line(11,15,15,15,'i').line(11,18,14,18,'i').line(11,21,14,21,'i');
 polygon(g,[[21,20],[23,20],[26,24],[25,26],[23,25],[20,22]],'i','N');g.line(22,22,24,24,'j');
 g.ellipse(20,17,6,6,'N').ellipse(20,17,5,5,'B').ellipse(20,17,4,4,'b');
 g.ellipse(19,16,2,2,'q').line(18,15,19,14,'?').set(18,16,'?').line(21,20,23,18,'n');
 return g;
}
const character=saveHires('char-harbor',Array.from({length:10},(_,f)=>harbor(f)));
const module=saveHires('robi-part-lens',Array.from({length:10},(_,f)=>lens(f)));
const icon=saveHires('icon-part-lens',[lensIcon()]);
const card=saveHires('icon-card-scan',[scanCard()]);
const up=g=>{const z=new Grid(g.w*2,g.h*2);z.rows=g.rows.flatMap(r=>{const row=r.flatMap(c=>[c,c]);return[[...row],[...row]];});return z;};
const merge=(...gs)=>{const g=new Grid(32,48);for(const a of gs)g.stamp(a.rows.map(r=>r.join('')));return g;};
const reverse=g=>{const r=new Grid(g.w,g.h);r.rows=g.rows.map(row=>[...row].reverse());return r;};
const rows=[loadGrid('char-harbor',false).map(up),character.frames,character.frames.map(reverse)];
const robi=loadGrid('char-robi'),current=['robi-part-wheel','robi-part-memory','robi-part-sensor'].map(k=>loadGrid(k));
rows.push(robi.map((g,f)=>merge(g,...current.map(a=>a[f]),module.frames[f])));rows.push(rows.at(-1).map(reverse));
const rest=['robi-part-learnchip','robi-part-predictor','robi-part-talk','robi-part-ethics'].map(k=>loadGrid(k,false).map(up));
rows.push(robi.map((g,f)=>merge(g,...current.map(a=>a[f]),module.frames[f],...rest.map(a=>a[f]))));rows.push(rows.at(-1).map(reverse));
const palette=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors,width=1288,rowH=112,png=new PNG({width,height:rows.length*rowH+112});
for(let i=0;i<png.data.length;i+=4)png.data.set([38,44,59,255],i);
function draw(g,ox,oy,scale=2){for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.get(x,y);if(c==='.')continue;const rgb=[1,3,5].map(i=>parseInt(palette[c].slice(i,i+2),16));for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++)png.data.set([...rgb,255],(((oy+y*scale+dy)*width)+ox+x*scale+dx)*4);}}
rows.forEach((frames,r)=>frames.forEach((g,f)=>draw(g,8+f*128,r*rowH+8)));
const iy=rows.length*rowH;for(let y=iy;y<png.height;y++)for(let x=320;x<640;x++)png.data.set([255,244,210,255],(y*width+x)*4);
for(const [i,key]of['icon-part-lens','icon-card-scan'].entries()){draw(loadGrid(key,false)[0],8+i*160,iy+16,4);draw(loadGrid(key)[0],88+i*160,iy+16);draw(loadGrid(key,false)[0],328+i*160,iy+16,4);draw(loadGrid(key)[0],408+i*160,iy+16);}
for(const[i,key]of['icon-card-up','icon-card-guard','icon-card-repeat'].entries())draw(loadGrid(key)[0],664+i*80,iy+16);
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c12-5-characters.png',PNG.sync.write(png));
console.log('C12-5 항구지기·렌즈·스캔 카드 4키22프레임 및 혼합 밀도 합성판 완료');
