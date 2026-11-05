// C10 성 그림 9종. 완성 로비의 마지막 부품도 같은 16×24 격자를 따라요.
import {readFileSync} from 'node:fs';
import {Grid,save} from './pixel.mjs';
const source=key=>readFileSync(new URL('../'+key+'.txt',import.meta.url),'utf8').trimEnd().split(/\r?\n\r?\n/).map(f=>f.split(/\r?\n/));
const tile=new Grid(32,16);
for(let y=0;y<16;y++){
  const w=4*(y<8?y+1:16-y),left=(32-w)/2;
  for(let x=left;x<left+w;x++)tile.set(x,y,x<left+2||x>=left+w-2||y<2||y>13?'a':((x+2*y)%16<2?'A':'a'));
}
tile.line(13,7,17,9,'W').set(18,8,'W');save('tile-castle',[tile]);
const wall=new Grid(32,24);
for(let x=0;x<32;x++){
  const top=8+Math.floor(Math.min(x,31-x)/2);
  for(let y=top+1;y<=top+8;y++)wall.set(x,y,x<16?'A':'S');
  wall.set(x,top+3,x<16?'v':'V');if(x%8===0)wall.line(x,top+4,x,top+7,'O');
}
wall.stamp(tile.rows.map(r=>r.join('')));save('block-castle',[wall]);
save('prop-mirror',[0,1].map(f=>{
  const g=new Grid(32,48);g.ellipse(16,46,13,1,'S').rect(10,38,3,5,'Y').rect(20,38,3,5,'Y').rect(6,42,20,4,'O').rect(7,42,18,2,'Y');
  g.ellipse(16,16,12,13,'O').rect(4,16,25,24,'O').ellipse(16,16,11,12,'Y').rect(5,16,23,23,'Y');
  g.ellipse(16,16,9,10,'N').rect(7,16,19,21,'N').ellipse(16,17,8,9,f?'b':'B').rect(8,17,17,19,f?'b':'B');
  g.line(8,37,24,37,'y').line(7,12,9,8,'y').line(6,18,6,35,'y');
  if(f){
    g.rect(11,19,11,9,'A').rect(12,20,9,7,'a').rect(13,22,7,4,'N').set(14,23,'c').set(18,23,'c');
    g.rect(13,29,7,6,'a').rect(14,30,5,4,'C').line(16,16,16,19,'Y').set(16,16,'W');
    g.line(10,12,15,7,'W').line(20,31,23,28,'W').set(24,13,'W');
  }else{
    g.ellipse(16,25,5,8,'N').ellipse(16,20,4,4,'V').rect(13,27,7,6,'V').set(14,20,'b').set(18,20,'b');
    g.line(9,12,13,8,'b').line(20,33,24,29,'b');
  }
  g.rect(14,2,5,3,'O').set(16,1,'Y').line(15,3,17,3,'y');return g;
}));
const banner=new Grid(24,32);
banner.ellipse(12,30,9,1,'S').rect(3,4,3,26,'O').line(4,5,4,29,'Y').line(3,4,22,4,'O').line(4,3,21,3,'Y');
banner.poly([[6,5],[21,5],[21,23],[14,27],[6,23]],'O').poly([[7,6],[20,6],[20,22],[14,25],[7,22]],'V');
banner.line(8,7,19,7,'v').poly([[9,16],[13,17],[13,21],[9,20]],'W').poly([[14,17],[18,16],[18,20],[14,21]],'a');
banner.poly([[11,10],[13,10],[14,12],[15,10],[17,10],[17,13],[14,16],[11,13]],'c');save('prop-banner',[banner]);
save('char-keeper',source('char/char-player').map((rows,f)=>{
  const g=new Grid(16,24),b=[0,-1,0,-1,0][f%5];g.stamp(rows.map(r=>r.replaceAll('B','V').replaceAll('b','v').replaceAll('N','D')));
  g.line(5,5+b,11,5+b,'Y').set(7,4+b,'c').set(9,4+b,'c');
  if(f<5){g.line(5,12+b,5,18+b,'Y').set(7,13+b,'c').set(9,13+b,'c').set(8,14+b,'c').rect(12,14+b,3,5,'E').rect(12,15+b,2,3,'W').set(13,16+b,'C');}
  else{g.rect(5,12+b,7,6,'V').line(5,12+b,5,17+b,'Y').set(7,13+b,'c').set(9,13+b,'c').set(8,14+b,'c');}return g;
}));
save('mob-fake-shadow',Array.from({length:4},(_,f)=>{
  const g=new Grid(24,24),b=f===1?-1:0,body=f===3?'C':'V',light=f===3?'c':'v';
  g.ellipse(12,22,8,1,'S').ellipse(12,11+b,7,8,'O').rect(5,11+b,15,8,'O');
  g.ellipse(12,11+b,6,7,body).rect(6,11+b,13,7,body);
  g.poly([[6,17+b],[6,20+b],[9,18+b],[12,21+b],[15,18+b],[18,20+b],[18,17+b]],body);
  g.line(7,7+b,10,5+b,light).line(3,14+b,6,12+b,body).line(18,12+b,21,14+b,body);
  if(f===2){g.line(8,9+b,10,10+b,'O').line(16,9+b,14,10+b,'O');}
  else if(f===3){g.line(8,10+b,9,9+b,'O').line(14,9+b,15,10+b,'O').line(11,14+b,13,14+b,'O');}
  else{g.rect(9,9+b,2,3,'W').rect(14,9+b,2,3,'W').set(10,11+b,'N').set(15,11+b,'N').line(11,14+b,13,14+b,'N');}
  return g;
}));
save('boss-bias-golem',Array.from({length:4},(_,f)=>{
  const g=new Grid(48,48),b=f===1?-1:0,body=f===3?'C':'A',light=f===3?'c':'a';
  g.ellipse(24,46,19,1,'S');
  g.rect(12,36,10,9,'O').rect(27,36,10,9,'O').rect(13,37,8,7,body).rect(28,37,8,7,body).line(14,43,20,43,light).line(29,43,35,43,light);
  g.rect(8,18+b,32,20,'O').rect(9,19+b,30,18,body).rect(11,20+b,26,3,light);
  g.ellipse(9,23+b,6,6,'O').ellipse(39,23+b,6,6,'O').rect(4,23+b,10,13,'O').rect(35,23+b,10,13,'O');
  g.ellipse(9,23+b,5,5,body).ellipse(39,23+b,5,5,body).rect(5,24+b,8,10,body).rect(36,24+b,8,10,body).line(5,25+b,5,31+b,light).line(36,25+b,36,31+b,light);
  g.rect(12,6+b,24,17,'O').rect(13,7+b,22,15,body).rect(15,5+b,18,3,'O').line(16,6+b,32,6+b,light).line(14,8+b,14,18+b,light);
  g.line(17,9+b,20,9+b,'S').line(29,9+b,32,9+b,'S');
  if(f===2){g.line(17,12+b,21,14+b,'O').line(31,12+b,27,14+b,'O');}
  else if(f===3){g.line(17,14+b,19,12+b,'O').line(19,12+b,21,14+b,'O').line(27,14+b,29,12+b,'O').line(29,12+b,31,14+b,'O');}
  else{g.rect(18,12+b,3,4,'N').rect(28,12+b,3,4,'N').set(18,12+b,'b').set(28,12+b,'b');}
  g.line(21,19+b,27,19+b,'O');if(f===3)g.set(20,18+b,'O').set(28,18+b,'O');
  g.rect(16,25+b,17,10,'O').rect(17,26+b,15,8,'N');
  g.rect(19,29+b,3,3,f===3?'c':'Y').rect(23,f===3?29+b:27+b,3,f===3?3:5,f===3?'c':'Y').rect(27,f===3?29+b:30+b,3,f===3?3:2,f===3?'c':'Y');
  g.line(17,35+b,31,35+b,'Y');return g;
}));
save('robi-part-ethics',Array.from({length:10},(_,f)=>{
  const g=new Grid(16,24),b=[0,-1,0,-1,0][f%5];g.rect(1,1+b,5,4,'G').rect(2,2+b,3,3,'c').set(1,4+b,'G').set(5,4+b,'G').set(2,5+b,'G').set(4,5+b,'G').set(3,6+b,'G').set(2,2+b,'W').set(4,2+b,'W').set(3,3+b,'W').set(4,6+b,'A');return g;
}));
const ethics=new Grid(16,16);ethics.poly([[2,2],[8,1],[13,2],[13,8],[11,11],[8,14],[4,11],[2,8]],'O').poly([[3,3],[8,2],[12,3],[12,8],[10,10],[8,12],[5,10],[3,8]],'C');
ethics.poly([[5,4],[7,4],[8,6],[9,4],[11,4],[11,7],[8,10],[5,7]],'W').set(5,4,'c');save('icon-part-ethics',[ethics]);
console.log('C10 성 그림 9종을 만들었어요.');
