import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, root, pose, polygon, rounded, eye, saveHires, loadGrid } from './c12-common.mjs';

// C12-1. C11 얼굴과 포즈의 순수 그리기 함수만 이어 써요. C11 원본을 다시 쓰지 않아요.
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

function rangerHat(g,p){
 const b=p.bob;
 polygon(g,[[5,11+b],[10,8+b],[13,4+b],[17,2+b],[20,4+b],[23,9+b],[28,12+b],[27,14+b],[7,14+b]],'I','F');
 g.poly([[11,8+b],[14,4+b],[17,3+b],[19,5+b],[18,8+b],[15,10+b],[9,11+b]],'J');
 g.line(14,5+b,16,4+b,'M').set(13,6+b,'L');
 g.poly([[21,7+b],[23,10+b],[26,12+b],[22,13+b],[19,11+b]],'G');
 g.line(8,11+b,24,11+b,'X').line(8,12+b,25,12+b,'U');
 g.line(7,13+b,26,13+b,'I').set(9,12+b,'T');
 g.line(21,9+b,24,5+b,'G').line(23,6+b,25,4+b,'L').set(25,3+b,'M');
 if(p.back)g.rect(13,11+b,4,2,'E').set(14,11+b,'T');
 else g.set(21,11+b,'Y').set(21,12+b,'+');
 return g;
}
function chefHat(g,p){
 const b=p.bob;
 polygon(g,[[9,12+b],[7,10+b],[5,7+b],[6,4+b],[9,3+b],[12,4+b],[14,2+b],[19,2+b],[22,4+b],[25,3+b],[28,5+b],[28,8+b],[25,11+b],[24,13+b]],'W','f');
 g.poly([[7,5+b],[9,4+b],[12,5+b],[15,3+b],[19,3+b],[22,6+b],[21,8+b],[10,8+b],[7,7+b]],'?');
 g.poly([[24,5+b],[27,5+b],[27,8+b],[24,10+b],[22,10+b],[23,7+b]],'j');
 g.line(12,5+b,12,8+b,'j').line(20,5+b,20,8+b,'j');
 polygon(g,[[9,10+b],[25,10+b],[24,14+b],[11,14+b]],'W','i');
 g.line(11,11+b,22,11+b,'?').line(12,13+b,23,13+b,'j');
 if(p.back)g.line(16,11+b,16,13+b,'i');
 return g;
}
function human(key,f){
 const p=pose(f),b=p.bob,g=new Grid(32,48),chef=key==='char-chef';
 const c=chef?{skin:'k',skinLight:'&',skinShade:'K',hair:'D',hairLight:'E',hairHigh:'U',hairDark:'Q',edge:'Q',mouth:'H',cloth:'T',lit:'Z',shade:'U'}:{skin:'H',skinLight:'#',skinShade:'!',hair:'D',hairLight:'E',hairHigh:'U',hairDark:'Q',edge:'Q',mouth:'Q',cloth:'I',lit:'J',shade:'F'};
 for(const [x,s,near]of[[10+p.stride,p.stride,false],[19-p.stride,-p.stride,true]]){
  const top=37+Math.max(0,s);g.rect(x,top,5,43-top,chef?'U':'G').line(x,top,x,41,chef?'X':'I');
  polygon(g,[[x,41],[x+4,41],[x+5,42],[x+5,43],[x-1,43],[x-1,42]],near?'E':'U','Q');g.line(x,42,x+3,42,near?'X':'T');
 }
 // C11과 같은 손 접점과 걸음. 피부색만 각 인물에 맞춰요.
 const hy=30+b+p.swing,other=32+b-p.swing;
 polygon(g,[[7,26+b],[10,26+b],[11,31+b],[8,34+b],[5,33+b],[5,29+b]],c.cloth,c.shade);
 polygon(g,[[24,25+b],[27,27+b],[29,32+b],[27,35+b],[24,33+b],[23,28+b]],c.cloth,c.shade);
 g.line(7,28+b,7,31+b,c.lit).line(26,28+b,27,31+b,c.lit);
 rounded(g,p.back?5:24,hy,4,4,c.skin,c.skinShade);g.set(p.back?6:25,hy+1,c.skinLight);
 rounded(g,p.back?24:6,other,4,3,c.skin,c.skinShade);
 polygon(g,[[11,24+b],[20,24+b],[25,27+b],[25,37+b],[22,39+b],[10,39+b],[8,36+b],[9,27+b]],c.cloth,c.shade);
 g.poly([[10,26+b],[14,25+b],[14,36+b],[11,37+b],[10,34+b]],c.lit);
 g.poly([[22,27+b],[24,28+b],[24,36+b],[21,38+b],[21,32+b]],c.shade);
 if(chef){
  if(p.back){
   g.line(12,25+b,21,34+b,'W').line(21,25+b,12,34+b,'W');
   g.line(10,33+b,23,33+b,'W').line(11,34+b,22,34+b,'j');
   g.line(16,34+b,14,38+b,'W').line(17,34+b,20,37+b,'W');
  }else{
   polygon(g,[[14,24+b],[20,25+b],[21,29+b],[23,39+b],[11,39+b],[12,29+b]],'W','i');
   g.line(14,27+b,13,36+b,'?').line(21,31+b,22,38+b,'j');
   rounded(g,14,33+b,6,4,'t','*').line(15,33+b,18,33+b,'Z');
   g.set(17,27+b,'r').set(18,27+b,'R');
  }
 }else{
  // 숲지기의 초록 망토와 갈색 끈. 밝은 왼쪽 면과 서늘한 오른쪽 면을 나눠요.
  polygon(g,[[10,25+b],[19,24+b],[24,28+b],[27,39+b],[23,40+b],[18,38+b],[12,40+b],[6,38+b],[7,30+b]],'G','F');
  g.poly([[10,26+b],[14,25+b],[17,28+b],[14,35+b],[10,38+b],[8,37+b],[9,30+b]],'I');
  g.line(10,28+b,11,33+b,'J').line(8,36+b,10,35+b,'L');
  g.poly([[22,28+b],[24,30+b],[26,38+b],[23,39+b],[21,37+b]],'F');
  if(p.back){g.line(16,29+b,18,36+b,'I').set(17,27+b,'J');}
  else{g.line(14,25+b,23,35+b,'U').line(15,25+b,23,34+b,'X');g.set(21,32+b,'Y').set(22,33+b,'+');}
  // 망토 밖 손을 마지막에 보여 걸음마다 서로 다른 팔 동작을 유지해요.
  rounded(g,p.back?5:24,hy,4,4,c.skin,c.skinShade);g.set(p.back?6:25,hy+1,c.skinLight);
  rounded(g,p.back?24:6,other,4,3,c.skin,c.skinShade);
 }
 skinHead(g,p,c);
 if(chef)chefHat(g,p);else rangerHat(g,p);
 return g;
}
function equipment(key,f){
 const p=pose(f),b=p.bob,g=new Grid(32,48);
 if(key==='equip-hat-ranger')return rangerHat(g,p);
 if(key==='equip-hat-leaf'){
  polygon(g,[[6,11+b],[9,8+b],[13,7+b],[16,4+b],[21,3+b],[23,5+b],[24,9+b],[28,12+b],[25,14+b],[10,14+b]],'J','F');
  g.poly([[9,10+b],[13,8+b],[17,5+b],[21,4+b],[20,8+b],[17,10+b],[10,12+b]],'L');
  g.line(15,7+b,19,5+b,'M').set(13,8+b,'M');
  g.poly([[22,6+b],[23,9+b],[27,12+b],[24,13+b],[20,11+b]],'I');
  g.line(9,12+b,22,6+b,'G').line(14,10+b,14,8+b,'I').line(19,8+b,21,10+b,'G');
  g.line(7,13+b,25,13+b,'G');g.line(21,4+b,23,2+b,'U').set(23,2+b,'X');
  if(p.back)g.line(11,12+b,17,12+b,'I');
  return g;
 }
 const x=p.back?4:27,hy=30+b+p.swing,dy=b+p.swing;
 g.line(x,18+dy,x,40+dy,'Q').line(x+1,18+dy,x+1,40+dy,'U');
 g.line(x,20+dy,x,38+dy,'X').line(x+1,23+dy,x+1,27+dy,'T');
 if(key==='equip-tool-hammer'){
  const left=p.back?0:24;
  polygon(g,[[left+2,15+dy],[left+5,15+dy],[left+7,17+dy],[left+7,21+dy],[left+5,23+dy],[left+1,22+dy],[left,20+dy],[left,17+dy]],'i','d');
  g.poly([[left+2,16+dy],[left+5,16+dy],[left+7,17+dy],[left+5,18+dy],[left+1,18+dy],[left+1,17+dy]],'j');
  g.line(left+2,16+dy,left+4,16+dy,'?');
  g.poly([[left+5,18+dy],[left+6,18+dy],[left+6,21+dy],[left+4,22+dy],[left+4,19+dy]],'f');
  g.rect(x,22+dy,2,2,'+').set(x,22+dy,'Y');
 }else if(key==='equip-tool-brush'){
  polygon(g,[[x-1,21+dy],[x-1,16+dy],[x+2,12+dy],[x+3,13+dy],[x+3,18+dy],[x+2,21+dy]],'C','G');
  g.line(x,17+dy,x+2,14+dy,'q').line(x,18+dy,x,20+dy,'c').line(x+2,17+dy,x+2,19+dy,'o');
  g.rect(x-1,21+dy,4,3,'+').line(x-1,21+dy,x+1,21+dy,'Y').set(x-1,22+dy,'y');
 }else throw new Error('지원하지 않는 장비 '+key);
 // 같은 피부·같은 좌표로 몸의 손을 다시 올려 자루를 쥐어요.
 rounded(g,p.back?5:24,hy,4,4,'K','$');g.set(p.back?6:25,hy+1,'%');
 return g;
}
const assets=[];
for(const key of ['char-chef','char-ranger'])assets.push(saveHires(key,Array.from({length:10},(_,f)=>human(key,f))));
for(const key of ['equip-hat-leaf','equip-hat-ranger','equip-tool-hammer','equip-tool-brush'])assets.push(saveHires(key,Array.from({length:10},(_,f)=>equipment(key,f))));

// 자체 검토판: NPC 옛/새 4줄 + 새 몸 장비4조합의 정상/반전 8줄.
const palette=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const rowH=112,width=1288,rows=[];
for(const key of ['char-chef','char-ranger']){rows.push({frames:loadGrid(key,false),scale:4});rows.push({frames:assets.find(a=>a.key===key).frames,scale:2});}
const body=loadGrid('char-player');
for(const hat of ['equip-hat-leaf','equip-hat-ranger'])for(const tool of ['equip-tool-hammer','equip-tool-brush']){
 const hats=assets.find(a=>a.key===hat).frames,tools=assets.find(a=>a.key===tool).frames;
 const frames=body.map((b,i)=>{const g=new Grid(32,48);for(const x of [b,hats[i],tools[i]])g.stamp(x.rows.map(r=>r.join('')));return g;});
 rows.push({frames,scale:2});rows.push({frames:frames.map(a=>{const g=new Grid(32,48);g.rows=a.rows.map(r=>[...r].reverse());return g;}),scale:2});
}
const png=new PNG({width,height:rows.length*rowH+16});for(let i=0;i<png.data.length;i+=4)png.data.set([41,48,68,255],i);
rows.forEach(({frames,scale},r)=>frames.forEach((g,f)=>{for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.get(x,y);if(c==='.')continue;const hex=palette[c],rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++)png.data.set([...rgb,255],(((r*rowH+8+y*scale+dy)*width)+(f*128+8+x*scale+dx))*4);}}));
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c12-1-characters.png',PNG.sync.write(png));
console.log('C12-1 캐릭터2·장비4, 6키60프레임과 정상/반전 합성판 생성 완료');
