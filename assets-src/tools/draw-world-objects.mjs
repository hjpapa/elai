// 소품·친구 몹의 편집 가능한 텍스트 원본을 다시 그려요.
import { Grid, save } from './pixel.mjs';

const shadow = g => g.ellipse(g.w / 2, g.h - 2, Math.max(3, g.w * 0.28), 1, 'S');
const finish = g => { g.outline(); shadow(g); return g; };
const leaf = (g,x,y,c='L') => g.poly([[x,y],[x+3,y-1],[x+2,y+2],[x,y+2]],c);
const spark = (g,x,y,c='y') => g.line(x-1,y,x+1,y,c).line(x,y-1,x,y+1,c);
const drawTree = pine => {
  const g = new Grid(32,48);
  g.poly([[12,30],[20,30],[20,42],[24,44],[17,45],[12,44],[9,44],[13,40]],'E');
  g.rect(14,29,3,14,'T').line(18,34,18,41,'e');
  if(pine) {
    g.poly([[16,3],[24,17],[20,17],[28,29],[23,29],[29,36],[16,38],[3,35],[9,28],[5,28],[12,17],[8,18]],'G');
    g.poly([[16,4],[19,14],[14,13],[22,24],[17,23],[24,32],[12,33],[7,32],[13,24],[9,24],[15,13],[12,14]],'g');
    g.line(15,8,13,13,'L').line(12,22,10,25,'L').line(10,31,8,33,'L');
  } else {
    g.ellipse(16,22,13,14,'G').ellipse(10,18,7,9,'g').ellipse(20,15,8,10,'g').ellipse(23,26,6,7,'g');
    g.ellipse(12,11,6,6,'L').ellipse(6,21,3,5,'L').ellipse(21,11,3,3,'L');
    g.line(8,14,11,13,'l').line(14,7,16,7,'l');
    leaf(g,22,25,'L'); leaf(g,11,29,'L');
    g.rect(19,20,2,2,'r').set(19,19,'y').rect(7,25,2,2,'r');
  }
  return finish(g);
};
save('prop-tree',[drawTree(false)]); save('prop-pine',[drawTree(true)]);

{
  const g=new Grid(32,24);
  g.ellipse(15,15,12,6,'G').ellipse(7,13,5,6,'g').ellipse(15,10,6,7,'g').ellipse(23,14,6,6,'g');
  g.ellipse(12,7,4,3,'L').ellipse(5,11,2,3,'L').ellipse(21,11,3,2,'L');
  leaf(g,16,14); leaf(g,9,17); g.set(23,16,'p').set(24,15,'W').set(25,16,'p');
  save('prop-bush',[finish(g)]);
}
{
  const g=new Grid(32,24);
  g.poly([[4,16],[8,7],[19,5],[27,11],[29,19],[22,21],[9,21]],'S');
  g.poly([[5,15],[9,8],[18,6],[23,11],[17,14],[11,16]],'a');
  g.poly([[12,16],[19,13],[23,11],[27,13],[27,18],[21,20],[12,20]],'A');
  g.line(9,9,15,8,'W').line(21,14,23,17,'S').line(17,17,17,19,'S');
  leaf(g,7,17,'g'); save('prop-rock',[finish(g)]);
}
{
  const g=new Grid(16,24);
  g.rect(7,11,3,10,'e').rect(7,12,1,9,'T');
  g.poly([[2,4],[12,4],[14,7],[12,11],[2,11]],'T');
  g.line(3,5,11,5,'t').line(3,10,11,10,'e');
  g.line(5,7,10,7,'E').set(9,6,'E').set(9,8,'E').set(3,6,'E');
  save('prop-sign',[finish(g)]);
}
save('prop-chest',[0,1].map(f=>{
  const g=new Grid(16,16);
  g.rect(2,8,12,5,'e').rect(3,9,9,3,'T').rect(2,8,2,5,'Y').rect(11,8,2,5,'Y').line(3,12,12,12,'E');
  if(f===0) {
    g.poly([[2,7],[3,4],[12,4],[13,7]],'T').line(4,4,11,4,'t').line(2,7,13,7,'E');
    g.rect(3,5,2,3,'Y').rect(10,5,2,3,'Y').rect(7,7,2,3,'y').set(7,8,'E');
  } else {
    g.poly([[2,2],[12,2],[13,5],[12,6],[3,6]],'E').line(3,2,11,2,'t').line(3,5,11,5,'Y');
    g.rect(3,7,9,1,'O').set(5,7,'Y').set(8,6,'y').set(10,7,'y');
  }
  return finish(g);
}));

const doorFrame = (g,gate) => {
  const c=gate?'A':'e';
  g.rect(4,10,4,19,c).rect(24,10,4,19,c);
  g.poly([[4,11],[7,5],[12,2],[19,2],[25,5],[28,11],[24,11],[22,7],[18,5],[13,5],[10,8],[8,12]],c);
  g.line(5,11,5,26,gate?'a':'T').line(8,6,12,4,gate?'W':'t').line(25,12,25,26,gate?'S':'E');
  for(const [x,y] of [[5,8],[7,17],[4,25],[24,4],[25,15]]) { g.line(x,y,x+1,y+5,'G'); leaf(g,x,y,'g'); leaf(g,x+1,y+3,'L'); }
};
for(const key of ['prop-door','prop-gate']) save(key,[0,1].map(f=>{
  const g=new Grid(32,32), gate=key==='prop-gate';
  doorFrame(g,gate);
  if(!f) {
    if(gate) {
      for(let x=10;x<=22;x+=4) g.rect(x,11,1,17,'E');
      g.line(9,16,22,16,'T').line(9,23,22,23,'T');
      g.rect(15,19,3,4,'Y').set(16,21,'E');
    } else {
      g.poly([[9,12],[12,7],[19,7],[23,12],[23,28],[9,28]],'G');
      g.line(12,11,12,27,'g').line(16,9,16,27,'g').line(20,12,20,27,'g');
      g.line(9,22,22,15,'e').line(9,14,22,24,'e');
      leaf(g,11,17,'L'); leaf(g,17,21,'L'); g.rect(19,19,2,2,'Y');
    }
  } else {
    g.line(8,12,9,27,'G').line(23,12,22,27,'G');
    leaf(g,8,21,'L'); leaf(g,22,23,'L');
    g.poly([[9,28],[16,25],[23,28],[16,29]],'T');
  }
  return finish(g);
}));

{
 const g=new Grid(16,16);
 g.ellipse(5,7,3,3,'Y').ellipse(5,7,1,1,'E').line(7,9,12,13,'Y').line(8,9,13,12,'y').rect(11,11,2,2,'Y').set(12,10,'Y');
 save('prop-key',[finish(g)]);
}
save('prop-portal',[0,1].map(f=>{
 const g=new Grid(32,32);
 g.ellipse(16,26,12,3,'V').ellipse(16,26,9,2,'v');
 g.ellipse(16,15,10,12,'V').ellipse(16,15,7,10,'v').ellipse(16,15,5,9,f?'b':'B').ellipse(15,14,3,7,f?'c':'b');
 g.line(11,9,12,7,'W').line(10,13,10,17,'W').line(18,24,20,23,'C');
 spark(g,f?24:22,f?6:4); spark(g,f?6:26,f?18:19,'W');
 return finish(g);
}));

save('prop-house',[0,1].map(f=>{
 const g=new Grid(32,48);
 g.rect(5,24,23,19,f?'t':'T').rect(5,24,4,19,f?'W':'e').rect(25,25,3,18,'e');
 g.poly([[1,25],[15,7],[30,25],[27,27],[5,27]],f?'R':'E');
 g.poly([[3,24],[15,8],[24,20],[25,24],[15,15],[6,25]],f?'r':'e');
 g.line(5,22,12,13,f?'p':'T').line(12,23,16,18,f?'p':'T');
 g.rect(15,20,3,4,'E').rect(16,21,1,2,f?'y':'T');
 g.rect(23,9,3,11,'S').rect(23,9,2,6,'A');
 g.rect(13,31,7,12,'E').rect(14,32,5,10,f?'B':'e').set(18,37,'Y');
 g.rect(7,29,5,6,'E').rect(8,30,3,4,f?'b':'S').line(9,30,9,33,'W');
 g.rect(21,29,5,6,'E').rect(22,30,3,4,f?'b':'S');
 g.line(6,42,26,42,'E').line(11,44,22,44,'A');
 if(f) {
   g.rect(21,36,5,2,'r').set(21,35,'P').set(23,34,'y').set(25,35,'P').line(23,36,23,35,'g');
   g.rect(7,36,4,2,'r').set(8,34,'p').set(10,35,'y');
 } else {
   g.line(7,30,11,34,'e').line(7,34,11,30,'E');
   g.line(22,31,25,33,'e').line(23,32,23,38,'E').line(23,38,21,40,'E');
   g.rect(15,15,3,2,'E').line(26,20,28,24,'E'); leaf(g,6,38,'g'); leaf(g,24,40,'G');
 }
 return finish(g);
}));

save('prop-fountain',[0,1].map(f=>{
 const g=new Grid(32,32);
 g.ellipse(16,25,13,4,'S').rect(4,21,25,4,'A').ellipse(16,21,12,4,'a').ellipse(16,21,9,2,f?'B':'S');
 g.rect(14,10,4,11,'A').rect(14,10,2,10,'a').ellipse(16,11,7,3,'S').ellipse(16,10,7,2,'a').ellipse(16,9,4,1,f?'b':'S');
 g.rect(15,5,2,4,'a').ellipse(16,5,2,2,'W');
 g.line(7,23,12,24,'W').line(19,25,25,24,'A');
 if(f) {
   g.line(16,4,16,2,'b').line(15,2,12,5,'b').line(12,5,11,9,'C');
   g.line(17,3,20,6,'b').line(20,6,21,9,'C');
   g.line(10,11,8,14,'b').line(8,14,7,20,'C').line(22,11,25,15,'b').line(25,15,25,20,'C');
   g.set(6,18,'W').set(24,18,'W').line(19,21,22,21,'b');
 } else { g.line(12,21,15,22,'E').set(20,21,'T'); }
 return finish(g);
}));

{
 const g=new Grid(32,24);
 g.poly([[2,12],[9,8],[14,12],[12,15],[15,17],[8,19]],'e');
 g.poly([[3,11],[9,8],[13,11],[9,14]],'T').line(4,12,10,9,'t');
 g.poly([[19,10],[24,8],[29,11],[29,16],[23,19],[17,16],[21,14]],'e');
 g.poly([[20,10],[24,8],[28,10],[23,13]],'T').line(21,10,24,9,'t');
 g.line(5,8,7,18,'E').line(25,8,26,17,'E');
 g.line(4,7,4,4,'T').line(28,8,28,5,'T').line(4,4,11,6,'E').line(22,6,28,5,'E');
 g.set(14,14,'T').set(16,17,'e'); save('prop-bridge-broken',[finish(g)]);
}
{
 const g=new Grid(32,32);
 g.rect(5,12,2,16,'e').rect(25,12,2,16,'e').rect(7,24,18,4,'T').rect(8,25,16,2,'t');
 g.poly([[2,14],[7,5],[23,5],[29,14]],'P');
 g.poly([[5,13],[9,6],[12,6],[10,14]],'W').poly([[15,14],[15,6],[19,6],[21,14]],'W');
 g.rect(3,14,26,3,'P').rect(5,14,4,3,'p').rect(12,14,4,3,'W').rect(20,14,4,3,'W');
 g.rect(12,19,8,5,'V').rect(13,20,6,3,'v');
 spark(g,16,21,'W'); g.rect(10,24,12,1,'E').set(8,22,'y').set(23,22,'c');
 save('prop-booth',[finish(g)]);
}
{
 const g=new Grid(16,32);
 g.rect(7,11,2,17,'S').rect(7,12,1,15,'A').rect(5,28,6,1,'A');
 g.poly([[3,4],[5,2],[11,2],[13,4]],'S').rect(4,5,8,7,'Y').rect(5,5,6,6,'y').rect(6,6,2,4,'W');
 g.line(4,4,12,4,'S').line(4,11,12,11,'S').line(8,4,8,11,'A').rect(6,12,4,1,'S');
 save('prop-lamp',[finish(g)]);
}
{
 const g=new Grid(32,24);
 g.rect(3,9,26,3,'e').rect(3,16,26,3,'e').line(4,9,28,9,'t').line(4,16,28,16,'T');
 for(const x of [4,14,25]) g.poly([[x,5],[x+2,3],[x+4,5],[x+4,20],[x,20]],'T').line(x+1,6,x+1,19,'t').line(x+3,6,x+3,20,'e').set(x+2,10,'E').set(x+2,17,'E');
 save('prop-fence',[finish(g)]);
}
{
 const g=new Grid(16,16);
 g.poly([[3,5],[12,5],[12,11],[14,12],[11,13],[4,13],[1,12],[3,10]],'e').rect(4,6,2,6,'T').line(10,7,10,11,'E');
 g.ellipse(8,5,5,2,'t').ellipse(8,5,3,1,'e').set(8,5,'T'); leaf(g,2,9,'L');
 save('prop-stump',[finish(g)]);
}
{
 const g=new Grid(16,16);
 g.poly([[6,7],[10,7],[10,11],[12,13],[4,13],[6,11]],'W').line(9,9,9,12,'t');
 g.ellipse(8,6,6,4,'R').ellipse(7,5,5,3,'r').line(3,8,13,8,'E').rect(5,3,2,2,'W').set(10,5,'W').set(3,6,'W');
 save('prop-mushroom',[finish(g)]);
}

// 표정은 대기·움직임·당황·친구가 된 웃음 순서예요.
const eyes=(g,x,y,gap,f)=>{
 if(f===2) { g.set(x,y,'O').set(x+1,y+1,'O').set(x,y+2,'O'); g.set(x+gap+1,y,'O').set(x+gap,y+1,'O').set(x+gap+1,y+2,'O'); }
 else if(f===3) { g.set(x,y+1,'O').set(x+1,y,'O').set(x+2,y+1,'O'); g.set(x+gap,y+1,'O').set(x+gap+1,y,'O').set(x+gap+2,y+1,'O'); }
 else { g.rect(x,y,2,3,'O').rect(x+gap,y,2,3,'O').set(x,y,'W').set(x+gap,y,'W'); }
};
save('mob-dummy',[0,1,2,3].map(f=>{
 const g=new Grid(16,16),dy=f===1?-1:0;
 g.rect(6,10,3,3,'E').line(3,13,11,13,'E');
 g.line(3,7+dy,1,8+dy,'T').line(12,7+dy,14,8+dy,'T');
 g.rect(3,4+dy,9,7,f===3?'t':'T').rect(4,3+dy,7,1,'t').rect(3,9+dy,9,2,'e');
 g.line(3,3+dy,11,3+dy,'Y').rect(5,1+dy,5,2,'T').rect(6,1+dy,3,1,'t');
 g.rect(6,10+dy,3,1,f===3?'L':'r'); eyes(g,5,5+dy,4,f);
 if(f===3) g.line(7,9+dy,9,9+dy,'R'); else g.set(8,9+dy,'E');
 return finish(g);
}));
save('mob-vine-slime',[0,1,2,3].map(f=>{
 const g=new Grid(24,24),dy=f===1?-1:0;
 g.ellipse(12,15+dy,9,f===1?6:5,f===3?'L':'g').ellipse(10,12+dy,7,6,f===3?'l':'L');
 g.ellipse(8,10+dy,3,2,'c').line(5,15+dy,7,16+dy,f===3?'L':'g');
 g.line(4,15+dy,2,12+dy,'G').line(2,12+dy,3,9+dy,'G'); leaf(g,2,9+dy,f===3?'l':'L');
 g.line(20,15+dy,22,11+dy,'G'); leaf(g,19,9+dy,'L');
 g.line(11,6+dy,12,3+dy,'G'); leaf(g,11,3+dy,f===3?'l':'L');
 eyes(g,8,12+dy,6,f); g.line(11,17+dy,14,17+dy,f===3?'R':'G');
 if(f===3) {g.set(11,18+dy,'R').set(13,18+dy,'R').set(6,16+dy,'p').set(18,16+dy,'p'); spark(g,19,5,'y');}
 return finish(g);
}));
save('mob-bug-worm',[0,1,2,3].map(f=>{
 const g=new Grid(16,16),dy=f===1?-1:0;
 g.ellipse(4,10,2,2,f===3?'v':'V').ellipse(8,10+dy,3,3,f===3?'p':'P').ellipse(11,8+dy,3,4,f===3?'p':'P');
 g.line(10,5+dy,9,3+dy,'V').line(12,4+dy,13,2+dy,'V').set(9,3+dy,'y').set(13,2+dy,'y');
 g.rect(3,9,2,3,'v').set(3,10,'V').line(6,9+dy,6,11+dy,'y');
 if(f===2) g.set(10,7+dy,'O').set(11,8+dy,'O').set(10,9+dy,'O').set(13,8+dy,'O');
 else if(f===3) g.set(10,8+dy,'O').set(11,7+dy,'O').set(12,8+dy,'O').set(13,7+dy,'O');
 else g.rect(10,7+dy,1,2,'O').rect(13,7+dy,1,2,'O').set(10,7+dy,'W');
 g.line(11,11+dy,13,11+dy,f===3?'R':'V');
 return finish(g);
}));
save('boss-forest-guardian',[0,1,2,3].map(f=>{
 const g=new Grid(48,48),dy=f===1?-1:0;
 // 뿌리 발과 둥근 줄기예요. 정화되면 왕관에 꽃이 피어요.
 g.poly([[15,34],[21,34],[21,43],[15,44],[9,44],[12,41]],'E').poly([[27,34],[33,34],[35,41],[40,44],[29,44],[27,42]],'E');
 g.rect(15,35,3,7,'T').rect(29,36,3,6,'T');
 g.poly([[10,21+dy],[15,17+dy],[18,22+dy],[14,31+dy],[10,35+dy],[5,33+dy],[7,30+dy]],'e');
 g.poly([[32,19+dy],[37,20+dy],[40,25+dy],[41,32+dy],[37,35+dy],[33,32+dy]],'E');
 g.ellipse(11,30+dy,4,4,'T').ellipse(37,30+dy,4,4,'e');
 g.poly([[14,12+dy],[20,8+dy],[29,8+dy],[34,14+dy],[34,31+dy],[31,38+dy],[20,39+dy],[14,34+dy]],'e');
 g.poly([[15,15+dy],[21,11+dy],[24,11+dy],[24,36+dy],[19,36+dy],[16,32+dy]],'T');
 g.line(18,22+dy,18,29+dy,'t').line(21,30+dy,21,35+dy,'E').line(29,28+dy,29,34+dy,'E').line(31,12+dy,31,19+dy,'E');
 // 이끼 왕관은 둥근 덩어리이고 왼쪽 위에 밝은 빛이 닿아요.
 const moss=f===3?'L':'g', light=f===3?'l':'L';
 g.ellipse(22,10+dy,11,6,'G').ellipse(16,8+dy,6,5,moss).ellipse(25,5+dy,7,4,moss).ellipse(32,10+dy,6,5,moss);
 g.ellipse(16,5+dy,4,2,light).ellipse(25,3+dy,3,1,light);
 g.poly([[16,11+dy],[15,17+dy],[18,15+dy],[20,10+dy]],moss).poly([[29,11+dy],[31,18+dy],[34,16+dy],[33,10+dy]],moss);
 g.ellipse(9,22+dy,4,3,moss).ellipse(36,21+dy,4,3,moss).line(6,22+dy,9,21+dy,light);
 g.ellipse(24,18+dy,8,6,'t'); eyes(g,19,16+dy,8,f);
 if(f===3) {
   g.line(22,23+dy,26,23+dy,'R').line(23,24+dy,25,24+dy,'R');
   g.rect(17,21+dy,2,1,'p').rect(29,21+dy,2,1,'p');
 } else g.line(23,23+dy,25,23+dy,'E');
 g.poly([[22,29+dy],[25,27+dy],[28,29+dy],[25,33+dy]],f===3?'y':'C').set(24,29+dy,'W');
 leaf(g,13,27+dy,light); leaf(g,30,33+dy,moss);
 g.line(25,3+dy,25,1+dy,'G'); leaf(g,25,1+dy,light);
 if(f===3) { g.set(30,5,'P').set(31,4,'p').set(32,5,'P').set(31,6,'y'); spark(g,40,9,'y'); }
 return finish(g);
}));

console.log('소품 18개, 몹 4개 텍스트 원본을 만들었어요.');
