// C9 공방 그림 6종. 외부 생성기 없이 텍스트 격자로 보관해요.
import {Grid,save} from './pixel.mjs';
const easel=new Grid(24,32);
easel.ellipse(12,30,10,1,'S').line(10,4,5,29,'O').line(14,4,20,29,'O').line(12,4,12,28,'O');
easel.line(10,6,6,29,'T').line(14,6,19,29,'e');
easel.rect(3,5,18,21,'O').rect(4,6,16,19,'T').rect(5,7,14,17,'W');
easel.rect(6,8,12,9,'b').ellipse(15,11,2,2,'y').poly([[6,18],[10,13],[15,18]],'C').poly([[10,18],[15,14],[18,18]],'G').rect(6,18,12,5,'c');
easel.line(2,25,21,25,'O').line(3,26,20,26,'T').rect(10,3,4,3,'E').line(10,3,13,3,'t');save('prop-easel',[easel]);
const shelf=new Grid(32,40);
shelf.ellipse(16,38,14,1,'S').rect(2,3,28,34,'O').rect(3,4,26,31,'E').rect(3,4,3,32,'T').rect(27,4,2,32,'e');
shelf.rect(1,2,30,3,'O').line(2,3,29,3,'T');
for(const y of [14,25,35])shelf.rect(4,y,24,2,'T').line(4,y,27,y,'t');
for(const [x,y,w,h,c]of [[7,6,3,8,'B'],[11,7,4,7,'V'],[16,5,3,9,'r'],[20,8,5,6,'G'],[7,18,5,7,'C'],[13,17,3,8,'P'],[17,19,3,6,'Y'],[21,17,4,8,'B'],[7,28,3,7,'V'],[11,28,5,7,'r'],[17,29,3,6,'G'],[21,28,4,7,'N']]){
  shelf.rect(x,y,w,h,c).line(x,y+1,x+w-1,y+1,'W').line(x,y,x,y+h-1,c==='Y'?'y':'a');
}
shelf.rect(3,36,4,2,'E').rect(25,36,4,2,'E');save('prop-bookshelf',[shelf]);
function parrot(size,f){
  const g=new Grid(size,size),k=size/24,q=n=>Math.round(n*k),b=f===1?-1:0;
  const body=f===3?'C':size===48?'V':'r',light=f===3?'c':size===48?'v':'p';
  const p=points=>points.map(([x,y])=>[q(x),q(y)+b]);
  g.ellipse(q(12),size-2,q(8),1,'S');
  g.poly(p([[8,14],[3,20],[4,22],[9,19],[11,15]]),'O').poly(p([[8,16],[4,20],[4,21],[8,18]]),f===3?'c':'B');
  g.poly(p([[10,16],[8,22],[11,21],[13,16]]),'O').poly(p([[11,17],[9,21],[10,20],[12,17]]),f===3?'c':'Y');
  g.ellipse(q(11),q(14)+b,q(6),q(7),'O').ellipse(q(11),q(14)+b,q(5),q(6),body);
  g.line(q(7),q(17)+b,q(4),q(20)+b,f===3?'c':'B');
  g.ellipse(q(13),q(8)+b,q(6),q(6),'O').ellipse(q(13),q(8)+b,q(5),q(5),body).ellipse(q(14),q(9)+b,q(3),q(3),light);
  g.poly(p([[10,3],[10,1],[13,3],[15,1],[15,4]]),'O').line(q(11),q(2)+b,q(12),q(4)+b,f===3?'c':'Y').set(q(14),q(3)+b,'Y');
  g.poly(p([[17,7],[21,9],[19,12],[17,11]]),'O').poly(p([[18,8],[20,9],[18,11]]),'Y').set(q(18),q(8)+b,'y');
  if(f===3)g.line(q(13),q(8)+b,q(14),q(7)+b,'O').line(q(14),q(7)+b,q(15),q(8)+b,'O');
  else if(f===2)g.line(q(13),q(7)+b,q(15),q(8)+b,'O');
  else g.rect(q(14),q(7)+b,q(1),q(2),'O');
  const wing=f===1?[[8,11],[2,12],[4,17],[10,18]]:[[8,11],[5,13],[6,18],[10,18]];
  g.poly(p(wing),'O').line(q(f===1?3:6),q(13)+b,q(8),q(17)+b,f===3?'c':'B').line(q(f===1?4:7),q(13)+b,q(9),q(17)+b,'b');
  g.line(q(12),q(19),q(12),q(21),'Y').line(q(15),q(19),q(15),q(21),'Y').line(q(11),q(21),q(13),q(21),'Y').line(q(14),q(21),q(16),q(21),'Y');
  if(size===48){g.poly([[18,26+b],[23,29+b],[23,35+b],[18,32+b]],'W').poly([[24,29+b],[29,26+b],[29,32+b],[24,35+b]],'a').line(23,29+b,23,35+b,'Y');}
  return g;
}
save('mob-babble-parrot',Array.from({length:4},(_,f)=>parrot(24,f)));
save('boss-babble-king',Array.from({length:4},(_,f)=>parrot(48,f)));
save('robi-part-talk',Array.from({length:10},(_,f)=>{
  const g=new Grid(16,24),b=[0,-1,0,-1,0][f%5];
  g.rect(11,1+b,5,4,'N').rect(12,2+b,3,2,'b').set(12,2+b,'W').set(12,5+b,'b').set(12,6+b,'A');return g;
}));
const talk=new Grid(16,16);
talk.rect(1,2,14,10,'O').rect(2,3,12,8,'b').rect(3,4,10,6,'W').poly([[3,10],[3,14],[8,10]],'O').poly([[4,10],[4,12],[7,10]],'b');
for(const x of [5,8,11])talk.set(x,7,'B');save('icon-part-talk',[talk]);
console.log('C9 공방 그림 6종을 만들었어요.');
