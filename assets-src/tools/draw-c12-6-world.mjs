// C12-6: 밝은 연구소 패널, 푸른 수납벽, 현미경, 움직이는 방울이 있는 관찰 병.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, rounded, saveHires, loadGrid, root } from './c12-common.mjs';
const drawn=[];const save=(key,frames)=>drawn.push(saveHires(key,frames));
const span=y=>{const w=4*(y<16?y+1:32-y);return[(64-w)/2,w];};
function lab(){
 const g=new Grid(64,32);
 for(let y=0;y<32;y++){const[l,w]=span(y);for(let x=l;x<l+w;x++){
  const u=(x+2*y)%32,v=(x-2*y+96)%32;let c='a';
  if(u===0||v===0)c='i';else if(u===1||v===1)c='A';
  else if(u===3||v===3)c='j';g.set(x,y,c);
 }}
 // 단정한 넓은 패널에는 작은 빛 한 덩어리만 더해요.
 g.poly([[23,10],[29,7],[35,10],[29,13]],'j').line(25,10,29,8,'?');
 for(let y=0;y<32;y++){const[l,w]=span(y);for(let x=0;x<64;x++)if(x<l||x>=l+w)g.set(x,y,'.');else if(x<l+2||x>=l+w-2||y<2||y>=30)g.set(x,y,'a');}
 return g;
}
save('tile-lab',[lab()]);
{
 const g=new Grid(64,48);
 for(let x=0;x<64;x++){
  const top=16+Math.floor(Math.min(x,63-x)/2);
  for(let y=top+1;y<=top+16;y++){
   const d=y-top,p=x%16,left=x<32;let c=left?'B':'N';
   if(p===1||p===14)c=left?'n':'m';
   if(p===2)c=left?'b':'/';
   if(d===1)c=left?'b':'B';else if(d===2)c=left?':':'/';
   if(d>=14)c=left?'/':'m';if(d===16)c=left?'n':'O';
   if(p===8&&d>=6&&d<=8)c=left?'q':'b';
   if(p===9&&d===8)c=left?'i':'/';g.set(x,y,c);
  }
 }
 const top=lab();for(let y=0;y<32;y++)for(let x=0;x<64;x++)if(top.get(x,y)!=='.')g.set(x,y,top.get(x,y));
 save('block-lab',[g]);
}
{
 const g=new Grid(48,64);
 // 굽은 금속 팔의 안쪽이 비어서 현미경 실루엣이 드러나요.
 polygon(g,[[31,54],[35,39],[34,25],[25,17],[28,11],[40,21],[43,38],[37,55]],'f','d');
 g.poly([[28,15],[29,13],[38,22],[40,38],[35,53],[33,53],[37,38],[36,24]],'i');
 g.line(28,16,36,23,'a').line(36,24,38,34,'j').line(40,26,41,37,'S');
 // 앞쪽의 관찰대, 얇은 표본 유리, 아래의 반사경.
 g.rect(28,42,4,12,'d').line(29,44,29,52,'f');
 polygon(g,[[7,38],[30,38],[35,41],[31,44],[6,44],[3,41]],'S','d');
 g.poly([[7,39],[29,39],[32,41],[6,41]],'i').line(7,39,27,39,'j');
 polygon(g,[[11,35],[22,35],[25,37],[14,38]],'b','n');g.line(12,35,20,35,'q').rect(16,36,3,1,'C');
 g.ellipse(20,49,5,3,'d').ellipse(20,49,4,2,'n').line(17,49,21,48,'b').set(19,48,'W');
 // 파란 경통과 짙은 접안렌즈는 옛 방향을 그대로 이어 가요.
 polygon(g,[[14,10],[20,6],[32,20],[26,27]],'B','m');
 g.poly([[15,11],[19,8],[28,19],[25,22]],'b').line(16,11,23,18,'q');
 g.poly([[27,22],[30,21],[27,27],[24,29],[22,27]],'S').line(25,25,27,23,'a');
 g.line(23,28,26,30,'O').line(23,29,25,31,'d');
 polygon(g,[[10,7],[16,2],[22,5],[16,11]],'d','O');g.line(12,7,17,3,'i').line(17,5,20,6,'S');
 // 조절 손잡이는 둥근 금속 고리와 따뜻한 중심으로 구분해요.
 g.ellipse(37,37,6,6,'d').ellipse(37,37,5,5,'S').ellipse(36,36,4,4,'i').ellipse(37,37,3,3,'U').ellipse(37,37,2,2,'Y').set(36,36,'y');
 polygon(g,[[9,53],[38,53],[43,57],[42,60],[6,60],[4,57]],'A','d');
 g.poly([[9,54],[37,54],[40,57],[7,57]],'i').line(10,54,35,54,'j').line(8,59,40,59,'f');
 save('prop-microscope',[g]);
}
function jar(f){
 const g=new Grid(32,48);
 polygon(g,[[9,11],[23,11],[27,16],[27,40],[23,44],[9,44],[5,40],[5,16]],'b','d');
 g.poly([[10,14],[22,14],[25,17],[25,39],[22,42],[10,42],[7,39],[7,17]],'N');
 g.rect(9,17,14,22,'m').rect(10,17,3,21,'n').line(24,17,24,38,'n');
 // 흔들리는 수면과 방울만 움직이고 유리병의 윤곽은 고정해요.
 for(let x=9;x<=23;x++){
  const surface=f?(x<15?29:30):(x<17?30:29);
  for(let y=surface;y<=39;y++)g.set(x,y,x<13?'o':x<21?'C':'n');
  g.set(x,surface,'c');
 }
 g.poly([[9,39],[23,39],[21,41],[11,41]],'C');
 const bubbles=f?[[15,18,2],[20,27,2],[15,33,2]]:[[14,21,2],[20,24,2],[16,35,2]];
 for(const[x,y,r]of bubbles){g.ellipse(x,y,r,r,'q').ellipse(x,y,r-1,r-1,'o').set(x-1,y-1,'W').set(x,y+r,'c');}
 // 반투명을 쓰지 않고 끊긴 반사광과 굽은 바닥으로 유리 느낌을 내요.
 g.line(8,17,8,31,'q').line(9,18,9,25,'W').line(8,35,8,38,'b');
 g.line(11,42,21,42,'q').line(25,18,25,31,'o');g.line(23,15,24,16,'b');
 polygon(g,[[5,6],[27,6],[29,9],[29,12],[3,12],[3,9]],'A','d');
 g.poly([[6,7],[26,7],[27,9],[5,9]],'i').line(7,7,24,7,'j');
 for(const x of[8,13,18,23])g.line(x,10,x,11,'f');g.line(5,12,27,12,'S');
 return g;
}
save('prop-jar',[jar(0),jar(1)]);

const colors=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const sw=700;let sh=12;const rows=drawn.map(({key,frames})=>{const r={key,frames,old:loadGrid(key,false),y:sh};sh+=frames[0].h*2+16;return r;});
const sheet=new PNG({width:sw,height:sh});for(let i=0;i<sheet.data.length;i+=4)sheet.data.set([38,44,59,255],i);
for(const{old,frames,y:oy}of rows)for(const[set,scale,ox]of[[old,4,12],[frames,2,362]])set.forEach((g,f)=>g.rows.forEach((row,y)=>row.forEach((c,x)=>{if(c==='.')return;const rgb=[1,3,5].map(i=>parseInt(colors[c].slice(i,i+2),16));for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++)sheet.data.set([...rgb,255],((oy+y*scale+dy)*sw+ox+(f*g.w+x)*scale+dx)*4);})));
mkdirSync(root+'assets-preview/',{recursive:true});writeFileSync(root+'assets-preview/c12-6-world.png',PNG.sync.write(sheet));
console.log('C12-6 연구소 세계 4키 / 5프레임 생성');
