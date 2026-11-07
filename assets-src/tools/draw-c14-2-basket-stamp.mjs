// C14-2: 분류기의 엮은 바구니와 둥근 배달 도장. 글자·로고·돈 표시는 없어요.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, saveHires, root } from './c12-common.mjs';
function basket(full){
 const g=new Grid(32,32);
 polygon(g,[[3,13],[29,13],[25,27],[7,27]],'X','E');
 g.poly([[4,15],[10,16],[11,25],[8,25]],'T');g.poly([[26,15],[28,14],[24,26],[22,26]],'U');
 for(const y of[20,24])g.line(6,y,26,y,'t');
 for(const x of[10,17,24])g.line(x,18,x-1,25,'e');
 g.line(8,26,24,26,'T');
 const rim=new Grid(32,32).ellipse(16,12,14,5,'E').ellipse(16,11,13,4,'T').ellipse(16,11,11,3,'U');
 rim.line(5,11,9,8,'t').line(6,15,25,15,'Z');g.stamp(rim.rows);
 if(full){
  // 빨간 하트 상자와 둥근 공이 살짝 보일 만큼만 담겨 있어요.
  polygon(g,[[7,8],[12,5],[17,8],[12,11]],'p','s');
  polygon(g,[[7,8],[12,11],[12,16],[7,13]],'r','s');
  polygon(g,[[12,11],[17,8],[17,14],[12,16]],'R','s');
  g.poly([[8,10],[9,10],[10,12],[11,11],[11,14],[10,15],[8,12]],'W');
  g.ellipse(22,10,5,5,'+').ellipse(21,9,4,4,'Y').ellipse(20,7,2,2,'y').set(19,6,'W');
  g.line(18,8,20,11,'t').line(20,11,24,13,'t');
  // 앞 테두리는 내용물보다 앞에 있어 빈 바구니와 같은 형태를 유지해요.
  for(let y=13;y<32;y++)for(let x=0;x<32;x++){const c=rim.get(x,y);if(c!=='.'&&c!=='U')g.set(x,y,c);}
 }
 return g;
}
const baskets=[basket(false),basket(true)];saveHires('prop-sort-basket',baskets);
const stamp=new Grid(32,32);
// 붉은 잉크 고리와 크림색 종이. 금속 테두리나 금빛 표시는 쓰지 않아요.
stamp.ellipse(15.5,15.5,13.5,13.5,'s').ellipse(15.5,15.5,12.5,12.5,'R').ellipse(15.5,15.5,10.5,10.5,'W');
stamp.line(7,7,11,4,'r').line(4,11,4,14,'r');
// 도장 가운데의 상자: 입체적인 세 면을 흰 접힘선으로 나누어요.
stamp.poly([[8,12],[15,8],[23,12],[23,20],[16,24],[8,20]],'R');
stamp.line(8,12,16,16,'W').line(16,16,23,12,'W').line(16,16,16,23,'W');
stamp.line(12,10,19,14,'W').line(19,15,19,19,'W');
saveHires('icon-stamp',[stamp]);

const colors=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const rgb=c=>[1,3,5].map(i=>parseInt(colors[c].slice(i,i+2),16));
const sw=760,sh=330,sheet=new PNG({width:sw,height:sh}),dark=[38,44,59],cream=[255,244,210];
for(let y=0;y<sh;y++)for(let x=0;x<sw;x++)sheet.data.set([...(x<380?dark:cream),255],(y*sw+x)*4);
function paint(g,ox,oy,size,unearned=false){
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const c=g.get(Math.floor(x*g.w/size),Math.floor(y*g.h/size));if(c==='.')continue;
  let color=rgb(c);if(unearned){const gray=(color[0]*.2126+color[1]*.7152+color[2]*.0722)*.5,bg=ox+x<380?dark:cream;color=bg.map(b=>Math.round(gray*.45+b*.55));}
  sheet.data.set([...color,255],((oy+y)*sw+ox+x)*4);
 }
}
for(const ox of[0,380]){
 paint(baskets[0],ox+12,12,96);paint(baskets[1],ox+124,12,96);paint(baskets[0],ox+250,50,48);paint(baskets[1],ox+310,50,48);
 paint(baskets[0],ox+256,112,32);paint(baskets[1],ox+312,112,32);
 paint(stamp,ox+16,185,40,true);paint(stamp,ox+80,185,40);paint(stamp,ox+144,167,96);paint(stamp,ox+276,185,40,true);paint(stamp,ox+276,247,40);
}
function stripOf(frames){const g=frames[0],png=new PNG({width:g.w*frames.length,height:g.h});png.data.fill(0);frames.forEach((fr,f)=>fr.rows.forEach((row,y)=>row.forEach((c,x)=>{if(c!=='.')png.data.set([...rgb(c),255],(y*png.width+f*g.w+x)*4);})));return png;}
mkdirSync(root+'assets-preview/',{recursive:true});writeFileSync(root+'assets-preview/c14-2-basket-stamp.png',PNG.sync.write(sheet));
writeFileSync(root+'assets-preview/c14-2-basket-strip.png',PNG.sync.write(stripOf(baskets)));writeFileSync(root+'assets-preview/c14-2-stamp.png',PNG.sync.write(stripOf([stamp])));
console.log('C14-2 바구니2프레임 + 도장1프레임 생성. 위: 바구니96/48/32px. 아래: 받기전40/받은40/받은96px, 양 배경.');
