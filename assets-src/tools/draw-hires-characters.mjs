import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { ASSETS } from '../../src/game/assets.ts';
import { Grid } from './pixel.mjs';

// C11: 32×48에서 직접 그린 새 원본. 옛 16×24 원본은 읽거나 덮어쓰지 않아요.
// 몸/모자/지팡이가 같은 포즈와 손 접점을 사용해요. 바닥 그림자는 넣지 않아요.
const root = fileURLToPath(new URL('../../', import.meta.url));
function pose(f) {
  const step=f%5;
  return {back:f>=5,step,bob:[0,-2,0,-2,0][step],stride:[0,-2,0,2,0][step],swing:[0,-2,2,2,-2][step]};
}
function polygon(g,points,fill,edge) {
  g.poly(points,edge);
  const inner=new Grid(g.w,g.h).poly(points,fill);
  for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++)if(inner.get(x,y)!=='.'&&[[0,-1],[0,1],[-1,0],[1,0]].every(([dx,dy])=>inner.get(x+dx,y+dy)!=='.'))g.set(x,y,fill);
  return g;
}
function rounded(g,x,y,w,h,fill,edge) {return polygon(g,[[x+2,y],[x+w-3,y],[x+w-1,y+2],[x+w-1,y+h-3],[x+w-3,y+h-1],[x+2,y+h-1],[x,y+h-3],[x,y+2]],fill,edge);}
function eye(g,x,y,c='O'){g.rect(x,y,2,3,c).set(x,y,'?');}
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
function person(key,f){
 const p=pose(f),b=p.bob,g=new Grid(32,48);
 const elder=key==='char-elder';
 const c=elder?{skin:'h',skinLight:'$',skinShade:'#',hair:'a',hairLight:'j',hairHigh:'?',hairDark:'f',edge:'d',mouth:'!',cloth:'V',lit:'v',shade:'D'}:{skin:'K',skinLight:'%',skinShade:'$',hair:'U',hairLight:'X',hairHigh:'T',hairDark:'E',edge:'Q',mouth:'H',cloth:'B',lit:':',shade:'N'};
 // 발 기준 y44. 다리 길이와 번갈아 나오는 발끝으로 네 걸음을 구별해요.
 for(const [x,s,near] of [[10+p.stride,p.stride,false],[19-p.stride,-p.stride,true]]){
  const top=37+Math.max(0,s),base=near?'m':'N';
  g.rect(x,top,5,43-top,base).line(x,top,x,41,near?'/':'S');
  polygon(g,[[x,41],[x+4,41],[x+5,42],[x+5,43],[x-1,43],[x-1,42]],near?'E':'U','Q');
  g.line(x,42,x+3,42,near?'X':'T');
 }
 // 소매와 손: 앞쪽 x25/26, 뒤쪽 x6/7 손이 도구 손잡이를 덮어요.
 const hy=30+b+p.swing,other=32+b-p.swing;
 polygon(g,[[7,26+b],[10,26+b],[11,31+b],[8,34+b],[5,33+b],[5,29+b]],c.cloth,c.shade);
 polygon(g,[[24,25+b],[27,27+b],[29,32+b],[27,35+b],[24,33+b],[23,28+b]],c.cloth,c.shade);
 g.line(7,28+b,7,31+b,c.lit).line(26,28+b,27,31+b,c.lit);
 rounded(g,p.back?5:24,hy,4,4,c.skin,c.skinShade);g.set(p.back?6:25,hy+1,c.skinLight);
 rounded(g,p.back?24:6,other,4,3,c.skin,c.skinShade);
 polygon(g,[[11,24+b],[20,24+b],[25,27+b],[25,37+b],[22,39+b],[10,39+b],[8,36+b],[9,27+b]],c.cloth,c.shade);
 g.poly([[10,26+b],[14,25+b],[14,36+b],[11,37+b],[10,34+b]],c.lit);
 g.poly([[22,27+b],[24,28+b],[24,36+b],[21,38+b],[21,32+b]],c.shade);
 g.line(11,38+b,22,38+b,c.shade);
 if(elder){
  polygon(g,[[9,32+b],[22,32+b],[26,40],[8,40]],'V','D');
  g.poly([[10,33+b],[13,34+b],[12,39],[10,39]],'v');
  g.line(22,35+b,24,39,'D');
  // 옛 모습과 같은 따뜻한 목도리와 나무 지팡이예요.
  g.poly([[11,23+b],[22,24+b],[22,27+b],[13,28+b],[10,26+b]],'t');
  g.line(11,24+b,21,25+b,'Z').rect(12,27+b,3,7,'Y').line(12,28+b,12,32+b,'y');
  g.line(28,22+b,28,43,'Q').line(27,23+b,27,42,'X').line(26,21+b,28,21+b,'U').set(27,20+b,'T');
  g.set(27,31+b,'h');
 }else if(p.back){
  // 여행 가방은 원본의 갈색과 금빛 잠금장치를 이어 가요.
  rounded(g,11,25+b,12,12,'X','E');
  g.rect(12,26+b,2,8,'T').line(14,26+b,20,26+b,'Z');
  rounded(g,14,31+b,7,5,'U','E').set(17,31+b,'Y').set(17,32+b,'y');
  g.line(10,25+b,10,35+b,'T');
 }else{
  g.poly([[15,24+b],[19,25+b],[18,36+b],[15,35+b]],'W');
  g.line(15,26+b,15,32+b,'?');
  g.line(21,25+b,21,37+b,'X').line(22,26+b,22,35+b,'T').set(21,30+b,'Y');
  g.line(10,33+b,12,33+b,'N');
 }
 skinHead(g,p,c);
 if(elder&&!p.back){g.line(15,14+b,18,14+b,'j').line(21,14+b,24,14+b,'a');g.line(17,24+b,21,24+b,'a');g.set(17,23+b,'j');}
 return g;
}
function robot(f){
 const p=pose(f),b=p.bob,g=new Grid(32,48);
 for(const [x,s] of [[10+p.stride,p.stride],[19-p.stride,-p.stride]]){
  rounded(g,x,38+Math.max(0,s),6,6-Math.max(0,s),'f','d');g.line(x+1,41,x+4,41,'a');g.line(x+1,42,x+4,42,'S');
 }
 rounded(g,8,28+b,18,11,'i','d');
 g.poly([[10,29+b],[17,29+b],[18,32+b],[14,33+b],[10,32+b]],'j');
 g.line(11,29+b,15,29+b,'?');g.poly([[22,31+b],[25,31+b],[24,36+b],[21,37+b]],'f');
 g.line(11,37+b,21,38+b,'f');
 rounded(g,3,29+b+p.swing,5,7,'i','d');g.line(4,30+b+p.swing,4,33+b+p.swing,'j');
 rounded(g,26,29+b-p.swing,5,7,'f','d');g.line(27,30+b-p.swing,27,33+b-p.swing,'a');
 // 옛 얼굴 범위를 유지하고 둥근 금속 면을 네 단계와 가는 선으로 그려요.
 rounded(g,4,10+b,25,18,'i','d');
 g.poly([[8,11+b],[22,11+b],[26,13+b],[20,13+b],[15,12+b],[9,13+b],[6,16+b],[5,15+b],[6,13+b]],'j');
 g.line(9,11+b,12,11+b,'?').set(7,13+b,'?');
 g.poly([[26,15+b],[28,15+b],[28,23+b],[25,26+b],[22,26+b],[25,23+b]],'f');
 g.line(7,26+b,22,26+b,'f');
 if(p.back){
  rounded(g,9,15+b,16,9,'f','S');
  g.line(10,16+b,22,16+b,'i');
  g.line(14,18+b,21,18+b,'S').line(14,21+b,21,21+b,'S');
  g.set(26,15+b,'C').set(26,16+b,'c');
  rounded(g,14,32+b,7,4,'f','S');g.line(15,32+b,19,32+b,'i');
 }else{
  rounded(g,8,15+b,17,9,'m','d');g.line(10,16+b,22,16+b,'N');
  eye(g,15,17+b,'c');eye(g,21,17+b,'c');
  g.line(17,22+b,20,22+b,'C').set(16,21+b,'C').set(21,21+b,'C');
  g.rect(9,17+b,1,3,'/');
  rounded(g,14,32+b,7,4,'B','/');g.line(15,32+b,18,32+b,'b').set(15,33+b,'q');
 }
 // 안테나와 기존 추가 부품의 위치는 옛 16×24 그림의 비율을 유지해요.
 g.line(16,5+b,16,10+b,'f').line(17,5+b,17,10+b,'i');
 rounded(g,14,2+b,5,4,'Y','+');g.set(15,2+b,'y').set(15,3+b,'W');
 return g;
}
function lantern(f){
 const p=pose(f),b=p.bob,g=new Grid(32,48);
 // 젠은 기존 분홍색 종이 등불이에요. 몸이 뜨고 좌우 장식이 번갈아 흔들려요.
 polygon(g,[[13,7+b],[18,7+b],[23,11+b],[26,17+b],[26,23+b],[23,28+b],[18,31+b],[12,30+b],[7,26+b],[4,20+b],[6,14+b],[9,10+b]],'&','s');
 g.poly([[13,9+b],[18,9+b],[21,12+b],[19,15+b],[17,23+b],[12,27+b],[8,23+b],[7,18+b],[9,13+b]],'W');
 g.poly([[12,11+b],[16,10+b],[18,12+b],[15,14+b],[12,21+b],[9,21+b],[9,16+b]],'?');
 g.poly([[23,13+b],[25,17+b],[25,23+b],[21,28+b],[18,29+b],[20,24+b],[21,17+b]],'z');
 g.line(8,13+b,7,19+b,'p').line(7,21+b,10,26+b,'p');g.line(22,14+b,24,22+b,'p');
 polygon(g,[[10,8+b],[14,4+b],[18,4+b],[22,8+b],[24,10+b],[7,10+b]],'P','s');
 g.line(11,8+b,17,6+b,'p').set(15,4+b,'y');
 rounded(g,12,30+b,9,4,'P','s');g.line(13,30+b,18,30+b,'p');
 g.rect(15,34+b,3,4,'Y').line(15,34+b,15,36+b,'y');
 g.line(16,38+b,13+p.stride,41+b,'P').line(17,38+b,21-p.stride,41+b,'p');g.set(13+p.stride,42+b,'p');g.set(21-p.stride,42+b,'Y');
 const sway=p.swing;
 g.line(5,20+b,1,24+b-sway,'P').line(4,21+b,1,25+b-sway,'p');
 g.line(26,19+b,30,18+b+sway,'P').line(27,20+b,30,19+b+sway,'p');
 if(p.back){g.line(11,13+b,10,25+b,'p').line(20,14+b,20,26+b,'P');g.line(12,28+b,17,29+b,'P');}
 else{eye(g,15,18+b,'D');eye(g,21,18+b,'D');g.line(17,24+b,20,24+b,'P').set(16,23+b,'P').set(21,23+b,'P');g.line(11,23+b,13,23+b,'p').set(24,22+b,'p');}
 return g;
}
function equipment(key,f){
 const p=pose(f),b=p.bob,g=new Grid(32,48);
 if(key==='equip-hat-cap'){
  polygon(g,[[10,3+b],[19,3+b],[24,6+b],[26,10+b],[26,12+b],[7,12+b],[6,9+b],[7,6+b]],'r','s');
  g.poly([[10,4+b],[16,4+b],[20,6+b],[19,9+b],[10,10+b],[8,9+b],[8,7+b]],'x');
  g.line(10,5+b,14,4+b,'z').set(9,6+b,'p');
  g.poly([[21,6+b],[24,7+b],[25,10+b],[23,11+b],[20,11+b]],'u');
  g.line(8,11+b,25,11+b,'s');
  if(p.back){rounded(g,13,10+b,7,3,'X','s');g.line(14,10+b,18,10+b,'Z');}
  else{polygon(g,[[19,11+b],[27,11+b],[30,13+b],[28,14+b],[20,14+b],[17,13+b]],'u','s');g.line(21,12+b,27,12+b,'r');}
  return g;
 }
 if(key==='equip-tool-stick'){
  const x=p.back?4:27,hy=30+b+p.swing;
  g.line(x,18+b+p.swing,x,40+b+p.swing,'Q').line(x+1,18+b+p.swing,x+1,40+b+p.swing,'U');
  g.line(x,20+b+p.swing,x,38+b+p.swing,'X').line(x+1,22+b+p.swing,x+1,27+b+p.swing,'T');
  g.line(x-1,17+b+p.swing,x+1,19+b+p.swing,'U').set(x-2,17+b+p.swing,'Q').set(x-1,16+b+p.swing,'T');
  g.line(x+1,18+b+p.swing,x+2,16+b+p.swing,'E').set(x+2,15+b+p.swing,'X');
  // 캐릭터와 같은 손을 얹어 자루를 쥔 모양을 만들어요.
  rounded(g,p.back?5:24,hy,4,4,'K','$');g.set(p.back?6:25,hy+1,'%');
  return g;
 }
 if(key==='robi-part-wheel'){
  rounded(g,10,39,14,4,'f','d');g.line(11,39,22,39,'i');
  for(const x of [8,21]){
   rounded(g,x,38,6,6,'S','d');g.rect(x+1,39,4,4,'U');g.rect(x+2,39,2,4,'Y');
   const turn=p.step%2;g.set(x+2,39+turn,'y').set(x+3,42-turn,'+');g.line(x+1,43,x+4,43,'d');
  }
  return g;
 }
 throw new Error('Unknown equipment '+key);
}
function dummy(f){
 const g=new Grid(32,32),b=f===1?-1:0;
 // 옛 나무 모자와 금빛 띠, 붉은 목도리를 유지한 친근한 연습 상대예요.
 g.line(15,21,15,27,'Q').rect(16,21,3,7,'X').line(14,27,20,27,'U');
 g.line(5,18+b,27,18+b,'E').line(5,19+b,27,19+b,'X');
 polygon(g,[[10,17+b],[23,17+b],[25,20+b],[22,24+b],[11,24+b],[8,20+b]],f===3?'I':'U',f===3?'G':'E');
 g.poly([[11,18+b],[15,18+b],[15,22+b],[12,23+b]],f===3?'J':'X');
 rounded(g,8,7+b,18,12,f===3?'c':'T',f===3?'G':'E');
 g.poly([[10,8+b],[20,8+b],[22,10+b],[16,10+b],[11,12+b],[9,11+b]],f===3?'q':'t');
 g.line(23,11+b,24,15+b,f===3?'I':'X').line(12,17+b,21,17+b,f===3?'I':'X');
 if(f===2){g.line(13,11+b,15,12+b,'E').line(21,11+b,19,12+b,'E');g.line(16,15+b,19,15+b,'E');}
 else if(f===3){g.line(12,12+b,14,10+b,'G').line(14,10+b,16,12+b,'G');g.line(19,12+b,21,10+b,'G').line(21,10+b,23,12+b,'G');g.line(16,15+b,19,15+b,'G').set(15,14+b,'G').set(20,14+b,'G');}
 else{eye(g,13,10+b,'E');eye(g,20,10+b,'E');g.line(16,15+b,19,15+b,'U');}
 rounded(g,11,1+b,12,6,'X','U');g.line(12,2+b,19,2+b,'Z').line(12,3+b,14,3+b,'T');
 polygon(g,[[8,6+b],[23,6+b],[27,8+b],[26,9+b],[6,9+b],[6,8+b]],'Y','+');g.line(9,7+b,23,7+b,'y');
 g.line(11,20+b,22,20+b,f===3?'C':'R').line(14,21+b,14,23+b,f===3?'q':'r');
 return g;
}
function saveHires(key,frames){
 const spec=ASSETS.find(a=>a.key===key);if(!spec||frames.length!==spec.frames||frames.some(g=>g.w!==spec.w*2||g.h!==spec.h*2))throw new Error('2배 규격 불일치: '+key);
 const dir=root+'assets-src/hires/'+spec.kind;mkdirSync(dir,{recursive:true});writeFileSync(dir+'/'+key+'.txt',frames.map(g=>g.text()).join('\n\n')+'\n');
 return {key,frames};
}
const art=[];
for(const key of ['char-player','char-elder'])art.push(saveHires(key,Array.from({length:10},(_,f)=>person(key,f))));
art.push(saveHires('char-robi',Array.from({length:10},(_,f)=>robot(f))));
art.push(saveHires('char-zen',Array.from({length:10},(_,f)=>lantern(f))));
for(const key of ['equip-hat-cap','equip-tool-stick','robi-part-wheel'])art.push(saveHires(key,Array.from({length:10},(_,f)=>equipment(key,f))));
art.push(saveHires('mob-dummy',Array.from({length:4},(_,f)=>dummy(f))));
// 검토판은 옛 원본을 확대해서 비교하고 새 몸+장비의 모든 앞뒤 프레임을 함께 보여요.
const palette=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const width=1344,rowHeight=120,png=new PNG({width,height:rowHeight*12});
for(let i=0;i<png.data.length;i+=4)png.data.set([41,48,68,255],i);
function draw(g,ox,oy,s=2){for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.get(x,y);if(c==='.')continue;const hex=palette[c];if(!hex)throw new Error('없는색 '+c);const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));for(let dy=0;dy<s;dy++)for(let dx=0;dx<s;dx++)png.data.set([...rgb,255],((oy+y*s+dy)*width+ox+x*s+dx)*4);}}
function old(key){const spec=ASSETS.find(a=>a.key===key),text=readFileSync(root+'assets-src/'+spec.kind+'/'+key+'.txt','utf8').trimEnd().split(/\r?\n\r?\n/);return text.map(t=>{const g=new Grid(spec.w,spec.h);g.rows=t.split(/\r?\n/).map(r=>[...r]);return g;});}
function merged(...gs){const g=new Grid(gs[0].w,gs[0].h);for(const a of gs)g.stamp(a.rows.map(r=>r.join('')));return g;}
let row=0;
for(const key of ['char-player','char-robi','char-elder','char-zen']){
 old(key).forEach((g,i)=>draw(g,8+i*128,row*rowHeight+8,4));row++;
 art.find(a=>a.key===key).frames.forEach((g,i)=>draw(g,8+i*128,row*rowHeight+8));row++;
}
for(let f=0;f<10;f++)draw(merged(person('char-player',f),equipment('equip-hat-cap',f),equipment('equip-tool-stick',f)),8+f*128,row*rowHeight+8);row++;
for(let f=0;f<10;f++)draw(merged(robot(f),equipment('robi-part-wheel',f)),8+f*128,row*rowHeight+8);row++;
old('mob-dummy').forEach((g,i)=>draw(g,8+i*128,row*rowHeight+8,4));row++;
art.find(a=>a.key==='mob-dummy').frames.forEach((g,i)=>draw(g,8+i*128,row*rowHeight+8));
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c11-characters.png',PNG.sync.write(png));
console.log('C11 캐릭터4·겹침3·몹1 = 8키74프레임, 2배 원본과 합성 검토판을 만들었어요.');
