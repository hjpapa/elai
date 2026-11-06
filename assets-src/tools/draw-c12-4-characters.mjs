import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, root, pose, polygon, rounded, eye, saveHires, loadGrid } from './c12-common.mjs';

// C12-4. 나루의 사막 모자·청록 스카프·지도 주머니를 이어 그려요.
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
function guide(f){
 const p=pose(f),b=p.bob,g=new Grid(32,48);
 const c={skin:'K',skinLight:'%',skinShade:'$',hair:'U',hairLight:'X',hairHigh:'T',hairDark:'E',edge:'Q',mouth:'H'};
 for(const [x,s,near]of[[10+p.stride,p.stride,false],[19-p.stride,-p.stride,true]]){
  const top=37+Math.max(0,s);g.rect(x,top,5,43-top,'U').line(x,top,x,41,'X');
  polygon(g,[[x,41],[x+4,41],[x+5,42],[x+5,43],[x-1,43],[x-1,42]],near?'E':'U','Q');g.line(x,42,x+3,42,near?'X':'T');
 }
 const hy=30+b+p.swing,other=32+b-p.swing;
 polygon(g,[[7,26+b],[10,26+b],[11,31+b],[8,34+b],[5,33+b],[5,29+b]],'T','U');
 polygon(g,[[24,25+b],[27,27+b],[29,32+b],[27,35+b],[24,33+b],[23,28+b]],'T','U');
 g.line(7,28+b,7,31+b,'Z').line(26,28+b,27,31+b,'X');
 rounded(g,p.back?5:24,hy,4,4,c.skin,c.skinShade);g.set(p.back?6:25,hy+1,c.skinLight);
 rounded(g,p.back?24:6,other,4,3,c.skin,c.skinShade);
 polygon(g,[[11,24+b],[20,24+b],[25,27+b],[25,37+b],[22,39+b],[10,39+b],[8,36+b],[9,27+b]],'T','U');
 g.poly([[10,26+b],[14,25+b],[14,35+b],[11,37+b],[10,34+b]],'t').line(10,28+b,10,32+b,'Z');
 g.poly([[22,27+b],[24,28+b],[24,36+b],[21,38+b],[21,32+b]],'X');g.line(11,38+b,22,38+b,'U');
 g.line(10,36+b,23,36+b,'E').line(11,36+b,18,36+b,'X');
 if(p.back){
  // 옛 원본 등에 있던 지도집. 흰 종이와 청록색 길이 보여요.
  g.line(11,25+b,11,34+b,'E').line(23,26+b,23,36+b,'U');
  rounded(g,12,28+b,11,9,'X','E');g.line(14,28+b,20,28+b,'T');
  polygon(g,[[14,29+b],[19,29+b],[21,31+b],[21,35+b],[14,35+b]],'W','+');
  g.line(15,30+b,18,30+b,'?').line(16,31+b,16,32+b,'C').line(16,32+b,19,32+b,'C').line(19,32+b,19,34+b,'C');
  g.set(19,30+b,'Y').set(15,34+b,'L');
 }else{
  // 접힌 지도는 앞 주머니에서도 읽히고, 어깨 끈은 뒤쪽까지 이어져요.
  g.line(21,25+b,21,32+b,'E').line(22,26+b,22,32+b,'X');
  rounded(g,19,31+b,7,7,'E','U').line(20,32+b,24,32+b,'X');
  g.rect(21,31+b,3,3,'W').set(21,31+b,'?').set(23,33+b,'C').set(22,35+b,'Y');
  g.line(12,29+b,15,29+b,'X').set(13,31+b,'+').set(15,34+b,'+');
 }
 skinHead(g,p,c);
 if(!p.back){
  // 조금 낮은 눈과 부드러운 눈썹·턱선으로 어린 탐험가와 나이를 구분해요.
  g.rect(16,17+b,2,3,c.skinLight).rect(22,17+b,2,3,c.skinLight);
  g.line(16,16+b,17,16+b,'U').line(22,16+b,23,16+b,'U');
  eye(g,16,18+b);eye(g,22,18+b);
  g.set(20,21+b,'$').set(21,21+b,'%').line(19,22+b,21,22+b,c.skin);
  g.line(19,23+b,21,23+b,'H').set(22,22+b,'$').set(18,24+b,'$');
 }
 // 목 뒤를 두른 스카프가 앞 매듭과 옆 끝자락으로 이어져요.
 polygon(g,[[10,24+b],[17,25+b],[22,24+b],[24,26+b],[20,29+b],[13,28+b],[10,26+b]],'C','G');
 g.line(12,25+b,16,26+b,'q').line(16,26+b,20,26+b,'o');
 if(p.back){g.line(12,27+b,19,28+b,'I');}
 else{polygon(g,[[22,26+b],[25,27+b],[24,33+b],[21,31+b]],'C','G');g.line(23,28+b,23,30+b,'c').set(24,27+b,'q');}
 // 넓고 납작한 햇빛 가리개와 금빛 띠. 뒤에서도 동일한 둘레를 유지해요.
 polygon(g,[[7,11+b],[8,5+b],[11,3+b],[21,3+b],[25,5+b],[26,11+b]],'t','U');
 g.poly([[9,6+b],[12,4+b],[20,4+b],[21,6+b],[18,8+b],[9,8+b]],'Z');
 g.line(12,4+b,18,4+b,'&').line(9,6+b,9,8+b,'W');
 g.poly([[22,5+b],[24,6+b],[25,10+b],[21,10+b],[21,7+b]],'T');
 g.line(8,10+b,25,10+b,'+').line(9,9+b,24,9+b,'Y').line(10,9+b,18,9+b,'y');
 if(p.back){g.line(16,8+b,16,10+b,'U').set(17,9+b,'T');}
 else{g.rect(21,8+b,3,3,'+').set(22,9+b,'Y');}
 polygon(g,[[4,11+b],[25,11+b],[29,13+b],[28,14+b],[6,14+b],[3,13+b]],'T','U');
 g.line(5,12+b,20,12+b,'t').line(7,12+b,15,12+b,'Z').line(8,14+b,25,14+b,'E');
 return g;
}
function sensor(f){
 const p=pose(f),b=p.bob,g=new Grid(32,48),x=p.back?24:2;
 // 옛 1배 부품의 6×10 영역을 지켜 머리 바깥쪽에 얇은 케이스를 둬요.
 polygon(g,[[x+1,16+b],[x+4,16+b],[x+5,17+b],[x+5,24+b],[x+4,25+b],[x+1,25+b],[x,24+b],[x,17+b]],'A','d');
 g.line(x+1,17+b,x+3,17+b,'j').line(x+1,18+b,x+1,23+b,'i');
 g.rect(x+2,18+b,2,5,'m').line(x+2,18+b,x+2,21+b,'o').set(x+2,18+b,'q');
 g.set(x+3,19+b,'B').set(x+3,20+b,'b').set(x+2,23+b,'?').set(x+3,23+b,'b');
 g.line(x+4,18+b,x+4,23+b,'S');g.set(x+1,24+b,'f');
 return g;
}
function sensorIcon(){
 const g=new Grid(32,32);
 // 측면 신호 표시·윗면 표시등과 둥근 푸른 감지창을 유지해요.
 g.line(3,10,3,21,'B').line(4,8,4,23,'o').set(3,10,'b');
 g.line(28,10,28,21,'B').line(27,8,27,23,'o').set(27,8,'b');
 rounded(g,13,3,6,4,'C','G').line(15,3,16,3,'q');
 rounded(g,6,6,20,20,'A','O');
 g.line(8,7,22,7,'j').line(7,8,7,22,'i');
 g.poly([[24,8],[24,23],[22,24],[9,24],[10,22],[22,22],[22,10]],'f');
 g.ellipse(16,16,7,7,'d').ellipse(16,16,6,6,'m');
 g.ellipse(16,16,5,5,'B').ellipse(15,15,4,4,'b');
 g.poly([[13,12],[16,11],[18,12],[15,13],[13,16],[12,15]],'q');
 g.line(13,13,14,12,'?').set(13,14,'?').line(17,20,20,17,'n').set(19,19,'o');
 for(const[x,y]of[[8,9],[22,9],[8,22],[22,22]])g.set(x,y,'S');
 g.outline('O');return g;
}
const character=saveHires('char-guide',Array.from({length:10},(_,f)=>guide(f)));
const module=saveHires('robi-part-sensor',Array.from({length:10},(_,f)=>sensor(f)));
const icon=saveHires('icon-part-sensor',[sensorIcon()]);
const up=g=>{const z=new Grid(g.w*2,g.h*2);z.rows=g.rows.flatMap(r=>{const row=r.flatMap(c=>[c,c]);return[[...row],[...row]];});return z;};
const merge=(...gs)=>{const g=new Grid(32,48);for(const a of gs)g.stamp(a.rows.map(r=>r.join('')));return g;};
const reverse=g=>{const r=new Grid(g.w,g.h);r.rows=g.rows.map(row=>[...row].reverse());return r;};
const rows=[loadGrid('char-guide',false).map(up),character.frames,character.frames.map(reverse)];
const robi=loadGrid('char-robi'),wheel=loadGrid('robi-part-wheel'),memory=loadGrid('robi-part-memory');
rows.push(robi.map((g,f)=>merge(g,wheel[f],memory[f],module.frames[f])));rows.push(rows.at(-1).map(reverse));
const rest=['robi-part-lens','robi-part-learnchip','robi-part-predictor','robi-part-talk','robi-part-ethics'].map(k=>loadGrid(k,false).map(up));
rows.push(robi.map((g,f)=>merge(g,wheel[f],memory[f],module.frames[f],...rest.map(a=>a[f]))));rows.push(rows.at(-1).map(reverse));
const palette=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors,width=1288,rowH=112,png=new PNG({width,height:rows.length*rowH+112});
for(let i=0;i<png.data.length;i+=4)png.data.set([38,44,59,255],i);
function draw(g,ox,oy,scale=2){for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.get(x,y);if(c==='.')continue;const rgb=[1,3,5].map(i=>parseInt(palette[c].slice(i,i+2),16));for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++)png.data.set([...rgb,255],(((oy+y*scale+dy)*width)+ox+x*scale+dx)*4);}}
rows.forEach((frames,r)=>frames.forEach((g,f)=>draw(g,8+f*128,r*rowH+8)));
const iy=rows.length*rowH;for(let y=iy;y<png.height;y++)for(let x=160;x<320;x++)png.data.set([255,244,210,255],(y*width+x)*4);
draw(loadGrid('icon-part-sensor',false)[0],8,iy+16,4);draw(icon.frames[0],88,iy+16);draw(loadGrid('icon-part-sensor',false)[0],168,iy+16,4);draw(icon.frames[0],248,iy+16);
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c12-4-characters.png',PNG.sync.write(png));
console.log('C12-4 안내자·센서·아이콘 3키21프레임 및 혼합 밀도 합성판 완료');
