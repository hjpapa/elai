// C4 원본 작성 도구. 기존 그림은 건드리지 않고 동굴 9종만 만들어요.
import { readFileSync } from 'node:fs';
import { Grid, save } from './pixel.mjs';

function caveTile() {
  const g = new Grid(32, 16);
  for (let y=0;y<16;y++) {
    const w=4*(y<8?y+1:16-y), left=(32-w)/2;
    for(let x=left;x<left+w;x++) g.set(x,y,'S');
  }
  for(const [x,y] of [[10,6],[21,9],[15,11]]) g.line(x,y,x+2,y,'A');
  g.set(17,5,'b').set(18,6,'C').set(7,8,'N').set(24,7,'N');
  return g;
}
save('tile-cave',[caveTile()]);
const wall=new Grid(32,24);
for(let x=0;x<32;x++) {
  const y=8+Math.floor(Math.min(x,31-x)/2);
  wall.line(x,y,x,y+8,x<16?'N':'O');
  if(x%7===2) wall.line(x,y+2,x,y+5,x<16?'S':'N');
}
wall.stamp(caveTile().rows.map(r=>r.join('')));
save('block-cave',[wall]);

function crystal(f) {
 const g=new Grid(16,24);
 g.ellipse(8,22,6,1,'S');
 g.poly([[3,20],[1,12],[4,9],[7,13],[7,21]],'O');
 g.poly([[3,18],[2,12],[4,11],[6,14],[6,20]],'C');
 g.poly([[6,20],[6,6],[9,2],[12,7],[11,20]],'O');
 g.poly([[7,18],[7,6],[9,4],[10,7],[10,20]],'b');
 g.line(8,7,8,17,f?'W':'c').line(10,8,10,18,'B');
 g.poly([[10,21],[11,13],[14,10],[14,19]],'O');
 g.poly([[11,20],[12,14],[13,13],[13,18]],'C');
 if(f) g.line(3,4,3,8,'W').line(1,6,5,6,'W');
 return g;
}
save('prop-crystal',[crystal(0),crystal(1)]);
const stal=new Grid(16,24);
stal.ellipse(8,22,6,1,'S').poly([[2,21],[3,16],[4,15],[5,8],[7,3],[9,7],[10,15],[12,16],[14,21]],'O');
stal.poly([[3,20],[5,16],[6,9],[7,5],[8,9],[9,18],[12,20]],'A').line(6,11,6,17,'a').line(9,17,11,20,'S');
save('prop-stalagmite',[stal]);

const people=readFileSync(new URL('../char/char-player.txt',import.meta.url),'utf8').trimEnd().split(/\r?\n\r?\n/);
save('char-explorer',people.map((text,f)=>{
 const b=[0,-1,0,-1,0][f%5],g=new Grid(16,24);
 g.stamp(text.split(/\r?\n/).map(r=>r.replaceAll('B','C').replaceAll('b','c').replaceAll('N','G')));
 // 램프가 달린 황금빛 헬멧. 뒤에서는 램프 대신 고정 띠가 보여요.
 g.stamp(['...OOOOOO...','..OYYYYYYO..','.OYYyyyyYYO.','.OYYYYYYYYO.','OOOOOOOOOOOO'],2,1+b);
 if(f<5) g.rect(9,3+b,3,3,'O').set(10,4+b,'W').set(11,4+b,'y');
 else g.line(5,5+b,10,5+b,'T').rect(6,12+b,5,6,'O').rect(7,13+b,3,4,'Y').set(8,15+b,'y');
 return g;
}));

function bat(size,f) {
 const g=new Grid(size,size), big=size===48, scale=big?2:1;
 const q=(n)=>Math.round(n*scale), bob=f===1?-1:0;
 const pts=ps=>ps.map(([x,y])=>[q(x),q(y)+bob]);
 const body=f===3?'C':'V', light=f===3?'c':'v';
 g.ellipse(q(12),size-2,q(6),1,'S');
 // 얕게 굽은 날개, 둥근 몸통, 큰 눈. 대장은 별 모양 목장식을 달아요.
 for(const flip of [false,true]) {
  const points=[[9,11],[5,7+(f===1?2:0)],[1,7+(f===1?2:0)],[2,16],[5,14],[7,17],[10,15]];
  const mapped=points.map(([x,y])=>[flip?24-x:x,y]);
  g.poly(pts(mapped),'O');
  g.poly(pts([[8,12],[5,9+(f===1?2:0)],[3,9+(f===1?2:0)],[4,13],[7,15],[9,14]].map(([x,y])=>[flip?24-x:x,y])),body);
 }
 g.ellipse(q(12),q(14)+bob,q(5),q(7),'O').ellipse(q(12),q(14)+bob,q(4),q(6),body);
 g.poly(pts([[8,10],[8,4],[10,5],[11,10]]),'O').poly(pts([[13,10],[15,4],[17,4],[16,11]]),'O');
 g.line(q(9),q(6)+bob,q(9),q(9)+bob,light).line(q(15),q(6)+bob,q(15),q(9)+bob,light);
 g.ellipse(q(11),q(16)+bob,q(2),q(3),light);
 if(f===2) {
  g.line(q(9),q(12)+bob,q(10),q(13)+bob,'O').line(q(15),q(12)+bob,q(14),q(13)+bob,'O');
 } else if(f===3) {
  for(const x of [9,14]) g.line(q(x),q(12)+bob,q(x+1),q(11)+bob,'O');
 } else {
  for(const x of [9,14]) g.rect(q(x),q(11)+bob,q(2),q(3),'O').set(q(x),q(11)+bob,'W');
 }
 g.line(q(11),q(17)+bob,q(13),q(17)+bob,'O');
 if(big) { g.poly(pts([[12,18],[13,20],[15,20],[13,21],[12,23],[11,21],[9,20],[11,20]]),'Y');g.set(q(12),q(20)+bob,'W'); }
 return g;
}
save('mob-echo-bat',Array.from({length:4},(_,f)=>bat(24,f)));
save('boss-bat-king',Array.from({length:4},(_,f)=>bat(48,f)));

save('robi-part-memory',Array.from({length:10},(_,f)=>{
 const g=new Grid(16,24),b=[0,-1,0,-1,0][f%5];
 if(f>=5){g.rect(5,14+b,7,5,'O').rect(6,15+b,5,3,'G').rect(7,15+b,2,2,'C').set(9,16+b,'c');for(const x of [6,8,10])g.set(x,14+b,'Y').set(x,18+b,'Y');}
 else {g.rect(3,14+b,2,5,'O').line(3,15+b,3,17+b,'C').set(4,15+b,'Y').set(4,17+b,'Y');}
 return g;
}));
const chip=new Grid(16,16);
for(const p of [4,7,10]) chip.rect(p,1,2,2,'Y').rect(p,13,2,2,'Y').rect(1,p,2,2,'Y').rect(13,p,2,2,'Y');
chip.rect(3,3,10,10,'O').rect(4,4,8,8,'G').rect(5,5,6,6,'C').rect(6,6,3,3,'c').set(10,10,'Y');
save('icon-part-memory',[chip]);
console.log('C4 동굴 그림 9종을 만들었어요.');
