import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { Grid } from './pixel.mjs';
import { ASSETS } from '../../src/game/assets.ts';

// C11: 2배 원본만 써요. 옛 격자와 팔레트는 바꾸지 않아요.
const root = fileURLToPath(new URL('../../', import.meta.url));
const palette = JSON.parse(readFileSync(root + 'assets-src/palette.json', 'utf8')).colors;
const written = [];
const color = c => [1, 3, 5].map(i => Number.parseInt(c.slice(i, i + 2), 16));
function saveHires(key, frames) {
  const spec = ASSETS.find(a => a.key === key);
  if (!spec || frames.length !== spec.frames || frames.some(g => g.w !== spec.w * 2 || g.h !== spec.h * 2)) throw new Error('2배 규격 오류: ' + key);
  if (spec.kind === 'icon' || spec.kind === 'ui') for (const g of frames) {
    const before = g.rows.map(row => [...row]);
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
      if (before[y][x] !== '.' && [[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy]) => (before[y+dy]?.[x+dx] ?? '.') === '.')) g.set(x,y,'O');
    }
  }
  for (const g of frames) for (const row of g.rows) for (const c of row) if (c !== '.' && !palette[c]) throw new Error('팔레트 글자 오류: ' + c);
  const dir = root + 'assets-src/hires/' + spec.kind;
  mkdirSync(dir, { recursive: true });
  writeFileSync(dir + '/' + key + '.txt', frames.map(g => g.text()).join('\n\n') + '\n');
  written.push({ key, spec, frames });
}
function rounded(g, x, y, w, h, r, c) {
  for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) {
    const dx = Math.max(x + r - xx, xx - (x + w - 1 - r), 0);
    const dy = Math.max(y + r - yy, yy - (y + h - 1 - r), 0);
    if (dx * dx + dy * dy <= r * r + 1) g.set(xx, yy, c);
  }
  return g;
}
const span = y => { const w = 4 * (y < 16 ? y + 1 : 32 - y); return [(64 - w) / 2, w]; };
function maskTile(g, base) {
  for (let y = 0; y < 32; y++) {
    const [left, w] = span(y);
    for (let x = 0; x < 64; x++) {
      if (x < left || x >= left + w) g.set(x, y, '.');
      else if (x < left + 2 || x >= left + w - 2 || y < 2 || y >= 30) g.set(x, y, base);
    }
  }
  return g;
}
function grass(flower = false) {
  const g = new Grid(64, 32).rect(0, 0, 64, 32, 'J');
  // 풀은 점을 흩뿌리지 않고 낮고 긴 잎 덩어리로 묶어요.
  g.ellipse(25, 11, 6, 1, 'L').ellipse(43, 20, 5, 1, 'L');
  for (const [x,y] of [[19,10],[36,8],[45,17],[28,23],[13,17]]) {
    g.line(x-2,y,x,y-2,'g').line(x,y-2,x+2,y,'g');
    g.line(x+1,y,x+3,y-2,'L').line(x+3,y-2,x+4,y-1,'M');
  }
  if (flower) for (const [x,y,c] of [[24,9,'p'],[43,14,'y'],[28,22,'W']]) {
    g.line(x,y+1,x-1,y+4,'I').line(x-1,y+3,x-3,y+2,'g');
    g.rect(x-3,y-1,2,2,c).rect(x+2,y-1,2,2,c).rect(x-1,y-3,3,2,c).rect(x-1,y+1,3,2,c);
    g.rect(x-1,y-1,3,2,'Y').set(x-1,y-1,'W');
  }
  return maskTile(g,'J');
}
function path() {
  const g = new Grid(64,32).rect(0,0,64,32,'T');
  g.ellipse(25,11,9,2,'t').ellipse(36,18,11,2,'X').ellipse(31,17,10,2,'T');
  g.line(18,13,26,12,'t').line(42,22,47,20,'e');
  for (const [x,y,w] of [[14,17,3],[37,10,4],[31,25,3],[49,16,3]]) {
    g.rect(x,y,w,2,'X').rect(x,y,w-1,1,'t');
  }
  return maskTile(g,'T');
}
function water(f) {
  const g=new Grid(64,32).rect(0,0,64,32,'B');
  g.ellipse(26,10,17,4,'o').ellipse(40,21,17,4,'n');
  g.ellipse(31,16,16,5,'B');
  const dx=f?3:0;
  for (const [x,y,w] of [[22,8,10],[9,16,12],[37,16,13],[25,24,10]]) {
    const shift = y<17 ? dx : -dx;
    g.line(x+shift,y,x+w+shift,y,'o');
    g.line(x+shift+2,y-1,x+w+shift-2,y-1,'b');
    g.line(x+shift+4,y-2,x+w+shift-3,y-2,'q');
    g.set(x+w+shift+1,y-1,'o');
  }
  return maskTile(g,'B');
}
function bridge() {
  const g = new Grid(64,32);
  for(let y=0;y<32;y++)for(let x=0;x<64;x++){
    const u = y + Math.floor(x / 2);
    const plank=Math.floor(u/8);
    let c=plank%3===0?'T':'X';
    if(u%8===0)c='U';else if(u%8===1)c='t';else if(u%8===7)c='e';
    g.set(x,y,c);
  }
  g.line(17,11,27,6,'Z').line(23,20,38,12,'T').line(35,25,49,18,'t');
  g.line(14,18,21,14,'e').line(40,20,44,18,'U');
  // 작은 고정못은 2px 덩어리로 나뭇결과 구분해요.
  for(const[x,y]of[[12,16],[24,10],[40,22],[51,16]])g.rect(x,y,2,2,'d').set(x,y,'i');
  return maskTile(g,'X');
}
function stone() {
  const g=new Grid(64,32).rect(0,0,64,32,'i');
  const stones=[
    [[17,9],[29,3],[40,8],[28,14]],
    [[5,16],[17,10],[28,15],[16,21]],
    [[29,15],[41,9],[55,16],[43,22]],
    [[17,22],[29,16],[42,23],[31,29]]
  ];
  for(const p of stones){
    g.poly(p,'f');
    const cx=p.reduce((a,v)=>a+v[0],0)/4,cy=p.reduce((a,v)=>a+v[1],0)/4;
    g.poly(p.map(([x,y])=>[Math.round(x+(cx-x)*.12),Math.round(y+(cy-y)*.15)]),'i');
    g.line(p[0][0]+1,p[0][1],p[1][0],p[1][1]+1,'j');
  }
  g.line(33,5,36,7,'a').line(45,15,49,17,'a');
  return maskTile(g,'i');
}
saveHires('tile-grass',[grass()]);
saveHires('tile-flower',[grass(true)]);
saveHires('tile-path',[path()]);
saveHires('tile-water',[water(0),water(1)]);
saveHires('tile-bridge',[bridge()]);
saveHires('tile-stone',[stone()]);

function speech(fill) {
  const g=new Grid(32,32);
  rounded(g,4,3,24,22,5,'O');
  g.poly([[10,22],[10,29],[18,24]],'O');
  rounded(g,5,4,22,20,4,fill);
  g.poly([[11,22],[11,26],[15,23]],fill);
  g.line(9,5,22,5,fill==='Y'?'y':'W');
  return g;
}
const questNew=speech('Y');
questNew.rect(14,8,4,9,'O').rect(15,9,2,6,'-').rect(14,19,4,3,'O');
saveHires('icon-quest-new',[questNew]);
const questDoing=speech('b');
for(const x of[10,15,20])questDoing.rect(x,13,3,3,'N').set(x,13,'O');
saveHires('icon-quest-doing',[questDoing]);
const arrow=new Grid(32,32);
arrow.poly([[3,11],[17,11],[17,5],[29,16],[17,27],[17,21],[3,21]],'O');
arrow.poly([[4,12],[18,12],[18,7],[27,16],[18,25],[18,20],[4,20]],'Y');
arrow.line(5,13,19,13,'y').line(19,9,25,15,'y').line(5,19,18,19,'+');
saveHires('icon-guide-arrow',[arrow]);
const step=new Grid(32,32);
step.ellipse(16,18,7,4,'O').ellipse(16,18,6,3,'Y').line(12,17,18,16,'y');
saveHires('icon-path-step',[step]);
const talk=speech('&');
for(const x of[10,15,20])talk.rect(x,13,3,3,'O');
saveHires('icon-talk',[talk]);

saveHires('fx-target',[29,23,17,11].map((r,f)=>{
  const g=new Grid(64,32),cx=31,cy=15,ry=Math.floor(r/2);
  const diamond=(rx,ry,c)=>g.poly([[cx,cy-ry],[cx+rx,cy],[cx,cy+ry],[cx-rx,cy]],c);
  diamond(r,ry,'O');diamond(r-2,ry-1,'Y');diamond(Math.max(1,r-5),Math.max(1,ry-3),'.');
  g.line(cx-r+3,cy-1,cx,cy-ry+1,'y').line(cx,cy-ry+1,cx+r-3,cy-1,'W');
  return g;
}));

function corner(g,x,y,sx,sy,disabled=false) {
  const c=disabled?'f':'+',lit=disabled?'a':'y';
  g.line(x,y,x+5*sx,y,c).line(x,y,x,y+5*sy,c);
  g.set(x+1*sx,y+1*sy,lit).set(x+3*sx,y+1*sy,disabled?'i':'Y');
}
function frame(key,f=0){
  const g=new Grid(48,48);
  const disabled=key==='ui-button'&&f===2;
  const pressed=key==='ui-button'&&f===1;
  const selected=key==='ui-slot'&&f===1;
  const top=pressed?3:1,bottom=46;
  const border=selected?'Y':disabled?'d':'O';
  rounded(g,1,top,46,bottom-top+1,5,border);
  rounded(g,2,top+1,44,bottom-top-1,4,disabled?'f':'+');
  rounded(g,3,top+2,42,bottom-top-3,3,disabled?'a':'&');
  // 16px 모서리와 가운데 단색을 분리해 늘림 경계에 무늬를 두지 않아요.
  g.line(7,top+3,40,top+3,disabled?'i':'?');
  g.line(6,bottom-3,41,bottom-3,disabled?'f':'*');
  if(!pressed&&key==='ui-button')g.line(5,bottom-1,42,bottom-1,disabled?'d':'-');
  corner(g,7,top+6,1,1,disabled);corner(g,40,top+6,-1,1,disabled);
  corner(g,7,bottom-6,1,-1,disabled);corner(g,40,bottom-6,-1,-1,disabled);
  if(key==='ui-bubble'){
    // 말풍선은 본문에 집중하게 아래 장식 두 곳을 덜어요.
    g.rect(7,bottom-11,6,6,'&').rect(35,bottom-11,6,6,'&');
  }
  if(selected){
    g.line(4,top+4,4,bottom-4,'y').line(43,top+4,43,bottom-4,'y');
    g.set(6,top+5,'?').set(41,top+5,'?');
  }
  return g;
}
saveHires('ui-panel',[frame('ui-panel')]);
saveHires('ui-button',[0,1,2].map(f=>frame('ui-button',f)));
saveHires('ui-bubble',[frame('ui-bubble')]);
saveHires('ui-slot',[0,1].map(f=>frame('ui-slot',f)));
const bar=new Grid(48,16);
rounded(bar,1,1,46,14,4,'O');rounded(bar,2,2,44,12,3,'+');rounded(bar,3,3,42,10,2,'&');
bar.line(6,4,41,4,'?').line(6,12,41,12,'*');
bar.rect(6,6,2,4,'Y').set(6,6,'y').rect(40,6,2,4,'+').set(40,6,'Y');
saveHires('ui-bar',[bar]);
saveHires('ui-stick',[0,1].map(f=>{
  const g=new Grid(64,64);
  if(f===0){
    g.ellipse(31.5,31.5,29,29,'O').ellipse(31.5,31.5,28,28,'+').ellipse(31.5,31.5,26,26,'&').ellipse(31.5,31.5,22,22,'O').ellipse(31.5,31.5,21,21,'.');
    g.line(20,8,30,5,'?');
    g.poly([[31,9],[27,14],[35,14]],'+');
    g.poly([[31,54],[27,49],[35,49]],'+');
    g.poly([[9,31],[14,27],[14,35]],'+');
    g.poly([[54,31],[49,27],[49,35]],'+');
  }else{
    g.ellipse(31.5,31.5,19,19,'O').ellipse(31.5,31.5,18,18,'+').ellipse(31.5,30.5,16,16,'&');
    g.ellipse(28,26,10,7,'?').line(22,43,40,43,'*').line(25,46,37,46,'+');
    g.ellipse(31.5,31.5,7,7,'*').ellipse(31.5,30.5,6,6,'&');
    g.line(28,27,33,26,'?');
  }
  return g;
}));

// 바닥 연결, 안내 대비, 9칸 나눔을 검토하는 원본 기반 판이에요.
const previewDir=root+'assets-preview/';mkdirSync(previewDir,{recursive:true});
function pngFrom(g){
  const p=new PNG({width:g.w,height:g.h});
  for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.get(x,y);if(c!=='.')p.data.set([...color(palette[c]),255],(y*p.width+x)*4);}
  return p;
}
function canvas(w,h,bg='O'){const p=new PNG({width:w,height:h});for(let n=0;n<p.data.length;n+=4)p.data.set([...color(palette[bg]),255],n);return p;}
function blit(out,g,ox,oy,scale=1){
  const p=g instanceof PNG?g:pngFrom(g);
  for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++){
    const i=(y*p.width+x)*4;if(!p.data[i+3])continue;
    for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++){
      const tx=ox+x*scale+dx,ty=oy+y*scale+dy;if(tx<0||ty<0||tx>=out.width||ty>=out.height)continue;
      out.data.set(p.data.subarray(i,i+4),(ty*out.width+tx)*4);
    }
  }
}
// 전체 키는 세 칼럼으로 나누어 읽기 편하게 해요.
const contact=canvas(1260,1170,'S');
written.forEach((e,i)=>{
 if(i===11){e.frames.forEach((g,f)=>blit(contact,g,16+f*140,1050,2));return;}
 const column=i<6?0:i<12?1:2, row=column===0?i:column===1?i-6:i-12;
 const x=16+column*420,y=16+row*168;
 e.frames.forEach((g,f)=>blit(contact,g,x+f*(g.w*2+6),y,2));
});
writeFileSync(previewDir+'c11-tiles-ui.png',PNG.sync.write(contact));
const mosaic=canvas(940,480,'O');
for(let ty=0;ty<5;ty++)for(let tx=0;tx<7;tx++){
  const g=tx===3?path():ty===4?water(0):tx===5?grass(true):grass();
  blit(mosaic,g,350+(tx-ty)*64,24+(tx+ty)*32,2);
}
writeFileSync(previewDir+'c11-tile-seams.png',PNG.sync.write(mosaic));
const contrast=canvas(1100,650);
['tile-grass','tile-path','tile-water','tile-stone'].forEach((key,row)=>{
 const bg=written.find(e=>e.key===key).frames[0];
 ['icon-quest-new','icon-quest-doing','icon-guide-arrow','icon-path-step','icon-talk'].forEach((key,col)=>{
   const x=20+col*215,y=20+row*150;
   blit(contrast,bg,x,y,2);blit(contrast,written.find(e=>e.key===key).frames[0],x+32,y-2,2);
 });
});
writeFileSync(previewDir+'c11-icon-contrast.png',PNG.sync.write(contrast));
function nine(g,w,h){
 const out=new Grid(w,h),c=16;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const sx=x<c?x:x>=w-c?g.w-(w-x):c+Math.floor((x-c)/(w-2*c)*(g.w-2*c));
  const sy=y<c?y:y>=h-c?g.h-(h-y):c+Math.floor((y-c)/(h-2*c)*(g.h-2*c));
  out.set(x,y,g.get(sx,sy));
 }return out;
}
const nineSheet=canvas(750,420,'S');
for(const [n,key]of['ui-panel','ui-button','ui-bubble','ui-slot'].entries())blit(nineSheet,nine(written.find(e=>e.key===key).frames[0],170,160),10+n*185,12,1);
for(const [n,f]of[0,1,2].entries())blit(nineSheet,nine(written.find(e=>e.key==='ui-button').frames[f],210,64),12+n*240,210,1);
for(const [n,f]of[0,1].entries())blit(nineSheet,nine(written.find(e=>e.key==='ui-slot').frames[f],120,108),12+n*144,292,1);
writeFileSync(previewDir+'c11-nine-slice.png',PNG.sync.write(nineSheet));
console.log('C11 타일·안내·UI '+written.length+'키 '+written.reduce((a,e)=>a+e.frames.length,0)+'프레임 작성 완료');
