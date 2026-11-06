import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, root, pose, polygon, rounded, eye, saveHires, loadGrid } from './c12-common.mjs';

// C12-7. 보라색 별 모자·별 지도와 중앙의 별 안테나를 이어 그려요.
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
function astronomer(f){
 const p=pose(f),b=p.bob,g=new Grid(32,48);
 const c={skin:'K',skinLight:'%',skinShade:'$',hair:'U',hairLight:'X',hairHigh:'T',hairDark:'E',edge:'Q',mouth:'H'};
 for(const[x,s,near]of[[10+p.stride,p.stride,false],[19-p.stride,-p.stride,true]]){
  const top=37+Math.max(0,s);g.rect(x,top,5,43-top,'N').line(x,top,x,41,'/');
  polygon(g,[[x,41],[x+4,41],[x+5,42],[x+5,43],[x-1,43],[x-1,42]],near?'N':'d','O');g.line(x,42,x+3,42,near?'/':'f');
 }
 const hy=30+b+p.swing,other=32+b-p.swing;
 polygon(g,[[7,26+b],[10,26+b],[11,31+b],[8,34+b],[5,33+b],[5,29+b]],'V','D');
 polygon(g,[[24,25+b],[27,27+b],[29,32+b],[27,35+b],[24,33+b],[23,28+b]],'V','D');
 g.line(7,28+b,7,31+b,'v').line(26,28+b,27,31+b,'V');
 rounded(g,p.back?5:24,hy,4,4,c.skin,c.skinShade);g.set(p.back?6:25,hy+1,c.skinLight);
 rounded(g,p.back?24:6,other,4,3,c.skin,c.skinShade);
 polygon(g,[[11,24+b],[20,24+b],[25,27+b],[25,37+b],[22,39+b],[10,39+b],[8,36+b],[9,27+b]],'V','D');
 g.poly([[10,26+b],[14,25+b],[14,35+b],[11,37+b],[10,34+b]],'v');
 g.poly([[22,27+b],[24,28+b],[24,36+b],[21,38+b],[21,32+b]],'N');g.line(11,38+b,22,38+b,'D');
 if(p.back){
  // 옛 등판의 별 세 개와 대각선 별자리를 같은 자리에서 더 정교하게 이어요.
  g.line(13,28+b,21,33+b,'v').line(21,33+b,16,36+b,'v');
  g.line(14,29+b,20,33+b,'a').set(14,29+b,'Y').set(21,33+b,'Y').set(16,36+b,'y');
  g.set(14,28+b,'y').set(13,29+b,'y').set(22,33+b,'+').set(15,36+b,'+');
  g.line(10,27+b,10,35+b,'v').line(21,27+b,22,30+b,'N');
  g.line(4,hy,4,hy+7,'S').line(5,hy+1,5,hy+6,'j');
 }else{
  g.line(11,26+b,11,36+b,'Y').line(12,27+b,12,36+b,'+').set(11,27+b,'y');
  g.poly([[15,25+b],[21,25+b],[19,29+b],[17,30+b]],'v').line(16,26+b,18,28+b,'W');
  g.set(18,29+b,'Y').set(18,28+b,'y').set(17,29+b,'+');
  g.line(13,37+b,21,37+b,'+');
  // 밝은 지도에서 남색 별자리와 금빛 표지가 보여요. 손을 따라 흔들려요.
  rounded(g,24,hy-2,7,11,'i','S');g.rect(25,hy-1,4,8,'a').line(25,hy-1,28,hy-1,'j');
  g.line(26,hy+1,28,hy+3,'N').line(28,hy+3,26,hy+5,'B');
  g.set(26,hy+1,'N').set(28,hy+3,'N').set(26,hy+5,'Y').set(27,hy+6,'+');
  g.rect(24,hy+4,2,3,c.skin).set(24,hy+4,c.skinLight);
 }
 skinHead(g,p,c);
 if(!p.back){g.line(16,16+b,17,16+b,'U').line(22,16+b,23,16+b,'U').set(20,21+b,'$');}
 // 넓고 부드러운 보라 모자. 앞의 별 핀과 뒤의 모자 띠로 방향을 구분해요.
 polygon(g,[[6,10+b],[7,7+b],[11,4+b],[19,3+b],[25,5+b],[28,9+b],[26,12+b],[9,13+b]],'V','D');
 g.poly([[8,8+b],[12,5+b],[18,4+b],[22,5+b],[20,7+b],[14,9+b],[8,10+b]],'v');
 g.line(12,5+b,16,4+b,'p').line(9,8+b,10,7+b,'p');
 g.poly([[23,6+b],[26,8+b],[27,10+b],[24,12+b],[20,11+b]],'N');
 g.line(9,12+b,24,12+b,'D').line(10,13+b,24,13+b,'N');
 if(p.back){g.line(12,11+b,21,11+b,'V').set(17,12+b,'v');}
 else{g.line(23,7+b,23,11+b,'Y').line(21,9+b,25,9+b,'Y').set(23,8+b,'y').set(23,9+b,'W').set(24,10+b,'+');}
 return g;
}
function predictor(f){
 const p=pose(f),b=p.bob,g=new Grid(32,48);
 // 양옆 talk/ethics 사이 x12..21만 쓰고, 최대 bob에서도 꼭짓점 위 1px를 남겨요.
 g.line(16,10+b,16,13+b,'A').line(17,10+b,17,13+b,'d').set(16,12+b,'j');
 polygon(g,[[16,3+b],[18,6+b],[21,6+b],[19,8+b],[20,11+b],[16,9+b],[13,11+b],[14,8+b],[12,6+b],[15,6+b]],'Y','+');
 g.poly([[16,4+b],[16,7+b],[14,7+b],[15,6+b]],'y').set(16,5+b,'W');
 g.line(16,7+b,17,8+b,'y').set(16,7+b,'?').set(18,9+b,'Y').set(19,10+b,'+');
 return g;
}
function predictorIcon(){
 const g=new Grid(32,32);
 g.rect(15,15,3,8,'d').line(15,16,15,21,'a');
 rounded(g,5,21,22,7,'N','O');g.line(7,22,24,22,'/').line(7,23,7,25,'B');
 g.rect(9,24,3,2,'b').set(9,24,'q').rect(14,24,3,2,'B').set(14,24,'b');
 g.line(22,23,22,25,'Y').set(22,23,'y').line(24,24,24,25,'+');
 polygon(g,[[16,3],[19,9],[26,10],[21,14],[23,20],[16,17],[9,20],[11,14],[6,10],[13,9]],'Y','+');
 g.poly([[16,5],[16,11],[11,13],[8,11],[14,10]],'y');
 g.poly([[18,13],[23,11],[20,14],[21,18],[17,16]],'+');
 g.line(15,7,14,10,'W').set(15,11,'?').line(13,14,16,12,'y');
 g.outline('O');return g;
}
const character=saveHires('char-astronomer',Array.from({length:10},(_,f)=>astronomer(f)));
const module=saveHires('robi-part-predictor',Array.from({length:10},(_,f)=>predictor(f)));
const icon=saveHires('icon-part-predictor',[predictorIcon()]);
const up=g=>{const z=new Grid(g.w*2,g.h*2);z.rows=g.rows.flatMap(r=>{const row=r.flatMap(c=>[c,c]);return[[...row],[...row]];});return z;};
const merge=(...gs)=>{const g=new Grid(32,48);for(const a of gs)g.stamp(a.rows.map(r=>r.join('')));return g;};
const reverse=g=>{const r=new Grid(g.w,g.h);r.rows=g.rows.map(row=>[...row].reverse());return r;};
const rows=[loadGrid('char-astronomer',false).map(up),character.frames,character.frames.map(reverse)];
const robi=loadGrid('char-robi'),current=['robi-part-wheel','robi-part-memory','robi-part-sensor','robi-part-lens','robi-part-learnchip'].map(k=>loadGrid(k));
rows.push(robi.map((g,f)=>merge(g,...current.map(a=>a[f]),module.frames[f])));rows.push(rows.at(-1).map(reverse));
const rest=['robi-part-talk','robi-part-ethics'].map(k=>loadGrid(k,false).map(up));
rows.push(robi.map((g,f)=>merge(g,...current.map(a=>a[f]),module.frames[f],...rest.map(a=>a[f]))));rows.push(rows.at(-1).map(reverse));
const palette=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors,width=1288,rowH=112,png=new PNG({width,height:rows.length*rowH+112});
for(let i=0;i<png.data.length;i+=4)png.data.set([38,44,59,255],i);
function draw(g,ox,oy,scale=2){for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.get(x,y);if(c==='.')continue;const rgb=[1,3,5].map(i=>parseInt(palette[c].slice(i,i+2),16));for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++)png.data.set([...rgb,255],(((oy+y*scale+dy)*width)+ox+x*scale+dx)*4);}}
rows.forEach((frames,r)=>frames.forEach((g,f)=>draw(g,8+f*128,r*rowH+8)));
const iy=rows.length*rowH;for(let y=iy;y<png.height;y++)for(let x=160;x<320;x++)png.data.set([255,244,210,255],(y*width+x)*4);
draw(loadGrid('icon-part-predictor',false)[0],8,iy+16,4);draw(icon.frames[0],88,iy+16);draw(loadGrid('icon-part-predictor',false)[0],168,iy+16,4);draw(icon.frames[0],248,iy+16);
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c12-7-characters.png',PNG.sync.write(png));
console.log('C12-7 천문가·별 안테나·아이콘 3키21프레임 및 혼합 밀도 합성판 완료');
