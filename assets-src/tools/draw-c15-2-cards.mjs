import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, rounded, root, saveHires, loadGrid } from './c12-common.mjs';

// C15-2. 기존 카드와 같은 2px 여백/세 겹 틀, 실제 28px에서 읽히는 굵은 기호예요.
function frame(dark, light) {
  const g = new Grid(32,32);
  rounded(g,2,2,28,28,dark,'O');
  rounded(g,4,4,24,24,light,dark);
  rounded(g,6,6,20,20,'W',light);
  g.line(7,3,23,3,light).line(3,7,3,23,light).line(8,5,22,5,'?');
  return g;
}
function lightOn() {
  const g = frame('+','Y');
  // 밝은 카드 위에서도 전구를 알아볼 수 있게 짙은 유리 윤곽과 소켓을 남겨요.
  polygon(g,[[13,8],[18,8],[21,11],[22,14],[21,17],[18,20],[18,22],[12,22],[12,20],[9,17],[8,14],[9,11]],'Y','Q');
  g.poly([[12,10],[17,10],[19,12],[19,15],[17,18],[12,18],[10,15],[10,12]],'y');
  g.line(11,12,11,15,'W').line(12,10,15,10,'?');
  g.line(19,16,17,19,'+').line(12,19,17,19,'+');
  // 두 갈래 필라멘트가 가운데로 모여서 유리 전구 모양을 분명하게 해요.
  g.line(12,15,15,18,'U').line(18,15,15,18,'U').line(15,18,15,20,'U');
  rounded(g,11,21,9,5,'f','d');
  g.line(12,22,18,22,'i').line(12,24,18,24,'d').line(14,26,16,26,'Q');
  // 반짝임은 빛 테두리와 뾰족한 모양으로 보여요. 글자·숫자·돈 표시는 없어요.
  polygon(g,[[24,7],[25,10],[27,11],[25,12],[24,15],[23,12],[21,11],[23,10]],'Y','+');
  g.set(24,10,'W').set(24,11,'y');
  g.line(7,19,7,23,'+').line(5,21,9,21,'+').set(7,21,'y');
  return g;
}
function nextRow() {
  const g = frame('N','B');
  // 오른쪽 위의 줄 끝에서 아래로 내려온 뒤 왼쪽 끝으로 꺾이는 한 화살표예요.
  const arrow = new Grid(32,32);
  polygon(arrow,[[20,7],[25,7],[25,20],[22,23],[14,23],[14,26],[7,20],[14,14],[14,18],[20,18]],'B','N');
  const base = arrow.rows.map(row=>[...row]);
  for(let y=0;y<32;y++)for(let x=0;x<32;x++) {
    let c=base[y][x];
    if(c==='B' && (base[y-1]?.[x]==='N'||base[y]?.[x-1]==='N')) c='b';
    if(c!=='.')g.set(x,y,c);
  }
  g.line(22,9,22,17,':').line(15,20,21,20,':').line(11,20,13,18,'b');
  return g;
}
const drawn = [saveHires('icon-card-lightOn',[lightOn()]), saveHires('icon-card-nextRow',[nextRow()])];
const palette = JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const rgb = hex => [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const width=960,height=420,png=new PNG({width,height});
for(let y=0;y<height;y++)for(let x=0;x<width;x++) {
  const panel=Math.floor(x/320),local=x%320;
  const color=panel===0?'#262c3b':panel===1?'#fff4d2':local<160?'#f2c94c':'#3f6fc2';
  png.data.set([...rgb(color),255],(y*width+x)*4);
}
function paste(g,ox,oy,size) {
  for(let y=0;y<size;y++)for(let x=0;x<size;x++) {
    const c=g.get(Math.floor(x*g.w/size),Math.floor(y*g.h/size));
    if(c!=='.')png.data.set([...rgb(palette[c]),255],((oy+y)*width+ox+x)*4);
  }
}
for(let p=0;p<3;p++) {
  const ox=p*320;
  drawn.forEach(({frames},i)=>paste(frames[0],ox+16+i*160,16,128));
  // 기존 앞으로·왼쪽돌기와 새 두 카드의 틀과 선을 나란히 비교해요.
  const group=[loadGrid('icon-card-forward')[0],loadGrid('icon-card-turnLeft')[0],...drawn.map(d=>d.frames[0])];
  group.forEach((g,i)=>paste(g,ox+12+i*76,178,64));
  // 같은 모양을 28/40/60px로 보여 실제 명령 카드 크기에서 확인해요.
  for(let i=0;i<2;i++) {
    let x=ox+i*160+8;
    for(const size of [28,40,60]) {paste(drawn[i].frames[0],x,360-size,size);x+=size+6;}
  }
}
mkdirSync(root+'assets-preview',{recursive:true});
writeFileSync(root+'assets-preview/c15-cards-draft.png',PNG.sync.write(png));
console.log('C15-2 켜기·다음 줄 카드 2키: 32×32, 28/40/60px와 기존 카드 비교판 완료');
