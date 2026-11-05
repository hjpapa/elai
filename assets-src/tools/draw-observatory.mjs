// C8 천문대 원본 9종. 기존 32색으로 별 도구와 여우를 그려요.
import {readFileSync} from 'node:fs';
import {Grid,save} from './pixel.mjs';
const source=key=>readFileSync(new URL('../'+key+'.txt',import.meta.url),'utf8').trimEnd().split(/\r?\n\r?\n/).map(f=>f.split(/\r?\n/));
const bob=f=>[0,-1,0,-1,0][f%5];
const tile=new Grid(32,16);
for(let y=0;y<16;y++){
  const w=4*(y<8?y+1:16-y),left=(32-w)/2;
  for(let x=left;x<left+w;x++)tile.set(x,y,'N');
}
tile.line(10,8,16,5,'B').line(16,5,22,9,'B').line(10,8,17,11,'B');
for(const [x,y]of[[10,8],[16,5],[22,9],[17,11]])tile.set(x,y,'a');
tile.set(16,5,'y');save('tile-observatory',[tile]);
const wall=new Grid(32,24);
for(let x=0;x<32;x++){
  const top=8+Math.floor(Math.min(x,31-x)/2);
  for(let y=top+1;y<=top+8;y++)wall.set(x,y,x<16?'V':'N');
  wall.set(x,top+2,'Y');
  if(x%8===3)wall.line(x,top+4,x,top+6,'v');
}
wall.stamp(tile.rows.map(r=>r.join('')));save('block-observatory',[wall]);
const scope=new Grid(32,32);
scope.ellipse(16,30,12,1,'S').line(16,18,7,29,'O').line(16,18,25,29,'O').line(16,18,16,29,'O');
scope.line(16,19,8,28,'A').line(17,19,24,28,'a').line(16,20,16,28,'Y');
scope.poly([[5,12],[22,3],[29,10],[12,20]],'O').poly([[7,13],[22,5],[27,10],[12,18]],'Y');
scope.line(8,13,23,6,'y').poly([[20,4],[23,2],[30,9],[27,12]],'O').poly([[22,5],[23,4],[28,9],[27,10]],'b').line(23,5,27,9,'W');
scope.poly([[4,13],[7,15],[6,18],[2,16]],'O').line(3,15,5,16,'A');
scope.ellipse(16,18,3,3,'O').ellipse(16,18,2,2,'V').set(16,17,'v');save('prop-telescope',[scope]);
save('prop-starlamp',[0,1].map(f=>{
  const g=new Grid(16,32);g.ellipse(8,30,6,1,'S').rect(3,27,10,3,'O').rect(4,27,8,2,'A');
  g.rect(7,14,3,14,'O').line(8,15,8,26,'Y').rect(5,14,7,2,'Y');
  g.poly([[8,2],[10,6],[14,7],[11,10],[12,14],[8,12],[4,14],[5,10],[2,7],[6,6]],'O');
  g.poly([[8,4],[9,7],[12,8],[10,9],[10,12],[8,10],[6,12],[6,9],[4,8],[7,7]],f?'y':'Y');
  g.set(8,7,'W').set(8,8,'W');if(f)g.set(1,4,'y').set(14,3,'W').set(1,12,'W');return g;
}));
save('char-astronomer',source('char/char-player').map((rows,f)=>{
  const g=new Grid(16,24),b=bob(f);g.stamp(rows.map(r=>r.replaceAll('B','V').replaceAll('b','v').replaceAll('N','N')));
  g.rect(4,4+b,9,2,'O').rect(5,3+b,7,2,'V').rect(6,2+b,5,1,'v').set(10,3+b,'Y');
  if(f<5){g.line(6,12+b,6,17+b,'Y').rect(12,14+b,3,5,'O').rect(12,14+b,2,4,'a').set(13,15+b,'N').set(12,17+b,'Y');}
  else{g.rect(5,12+b,7,6,'V').line(6,13+b,10,15+b,'v').set(6,13+b,'Y').set(10,15+b,'Y').set(7,17+b,'y');}return g;
}));
function fox(size,f){
  const g=new Grid(size,size),k=size/24,q=n=>Math.round(n*k),b=f===1?-1:0;
  const body=f===3?'C':size===48?'V':'T',light=f===3?'c':size===48?'v':'t';
  const p=points=>points.map(([x,y])=>[q(x),q(y)+b]);
  g.ellipse(q(12),size-2,q(9),1,'S');
  // 큰 꼬리의 밝은 끝과 두 귀가 여우의 실루엣을 만들어요.
  g.poly(p([[14,18],[18,18],[21,14],[22,8],[18,10],[17,14],[13,14]]),'O');
  g.poly(p([[15,17],[18,17],[20,14],[21,10],[18,12],[18,15],[15,15]]),body);
  g.poly(p([[18,12],[21,10],[20,14],[19,14]]),f===3?'c':'W');
  g.ellipse(q(10),q(17)+b,q(7),q(4),'O').ellipse(q(10),q(16)+b,q(6),q(3),body);
  g.rect(q(5),q(18)+b,q(3),q(3),'O').rect(q(13),q(18)+b,q(3),q(3),'O');
  g.line(q(6),q(20)+b,q(7),q(20)+b,'W').line(q(14),q(20)+b,q(15),q(20)+b,'W');
  g.poly(p([[3,10],[3,3],[7,6],[13,6],[17,3],[17,11],[14,15],[7,15]]),'O');
  g.poly(p([[4,10],[4,5],[7,8],[13,8],[16,5],[16,11],[13,14],[7,14]]),body);
  g.line(q(5),q(7)+b,q(6),q(9)+b,light).line(q(14),q(9)+b,q(15),q(7)+b,light);
  g.poly(p([[5,11],[9,12],[11,12],[15,11],[13,14],[10,16],[7,14]]),f===3?'c':'W');
  if(f===2){g.line(q(6),q(10)+b,q(8),q(11)+b,'O').line(q(14),q(10)+b,q(12),q(11)+b,'O');}
  else if(f===3){g.line(q(6),q(11)+b,q(7),q(10)+b,'O').line(q(12),q(10)+b,q(13),q(11)+b,'O');}
  else{g.rect(q(7),q(10)+b,q(1),q(2),'O').rect(q(12),q(10)+b,q(1),q(2),'O');}
  g.line(q(9),q(13)+b,q(10),q(13)+b,'O');
  if(size===48){g.line(10,34+b,27,36+b,'Y').set(13,33+b,'W').set(25,35+b,'W').set(20,8+b,'Y');}
  else g.set(17,16+b,'Y');return g;
}
save('mob-meteor-fox',Array.from({length:4},(_,f)=>fox(24,f)));
save('boss-star-fox',Array.from({length:4},(_,f)=>fox(48,f)));
save('robi-part-predictor',Array.from({length:10},(_,f)=>{
  const g=new Grid(16,24),b=bob(f);g.rect(7,2+b,3,3,'Y').line(6,3+b,10,3+b,'Y').set(8,1+b,'y').set(8,3+b,'W').set(8,5+b,'A');return g;
}));
const icon=new Grid(16,16);icon.rect(3,9,10,5,'O').rect(4,10,8,3,'N').set(5,11,'b').set(7,11,'b').line(10,10,10,12,'Y');
icon.line(8,5,8,9,'A').poly([[8,1],[9,4],[12,4],[10,6],[11,8],[8,7],[5,8],[6,6],[4,4],[7,4]],'Y').set(8,4,'W');save('icon-part-predictor',[icon]);
console.log('C8 천문대 그림 9종을 만들었어요.');
