// C12-4: 갈림길 사막 바닥·사암벽·선인장·신호등. 기존 원본/팔레트는 보존해요.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, rounded, saveHires, loadGrid, root } from './c12-common.mjs';
const drawn=[];const save=(key,frames)=>drawn.push(saveHires(key,frames));
const span=y=>{const w=4*(y<16?y+1:32-y);return[(64-w)/2,w];};
function sand(){
 const g=new Grid(64,32).rect(0,0,64,32,'t');
 // 바람이 남긴 두 줄의 넓은 결. 무작위 모래 점은 넣지 않아요.
 polygon(g,[[9,16],[17,12],[25,11],[31,12],[28,14],[20,14],[13,17]],'Z','Z');
 g.line(12,17,20,15,'T').line(20,15,27,15,'T').line(27,15,32,13,'T');
 polygon(g,[[29,22],[37,19],[47,18],[53,19],[47,21],[38,22],[33,24]],'Z','Z');
 g.line(34,24,40,23,'T').line(40,23,47,23,'T').line(47,23,50,21,'T');
 g.line(23,8,28,7,'Z').line(37,13,41,12,'Z');
 // 모든 둘레는 같은 모래색이라 타일 사이에 짙은 선이 생기지 않아요.
 for(let y=0;y<32;y++){const[left,w]=span(y);for(let x=0;x<64;x++)if(x<left||x>=left+w)g.set(x,y,'.');else if(x<left+2||x>=left+w-2||y<2||y>=30)g.set(x,y,'t');}
 return g;
}
save('tile-sand',[sand()]);
{
 const g=new Grid(64,48);
 for(let x=0;x<64;x++){
  const top=16+Math.floor(Math.min(x,63-x)/2);
  for(let y=top+1;y<=top+16;y++){
   const d=y-top;let c=x<32?'T':'e';
   if(d<=4)c=x<32?'T':'X';else if(d<=8)c=x<32?'X':'U';else if(d<=13)c=x<32?'T':'e';else c=x<32?'X':'U';
   if(d===1)c=x<32?'t':'T';
   if(d===6||d===14)c=x<32?'e':'U';
   if((x===15&&d>=8&&d<=12)||(x===40&&d>=3&&d<=6))c=x<32?'e':'U';
   g.set(x,y,c);
  }
 }
 const top=sand();for(let y=0;y<32;y++)for(let x=0;x<64;x++)if(top.get(x,y)!=='.')g.set(x,y,top.get(x,y));
 g.line(5,24,10,27,'t').line(23,38,27,40,'X').line(46,29,50,27,'X');
 save('block-sandstone',[g]);
}
{
 const g=new Grid(32,48);
 // 두 팔은 서로 높이가 다르고 끝이 둥글어요.
 rounded(g,2,19,7,14,'J','F');rounded(g,5,28,10,7,'I','F');g.line(4,21,4,28,'M').line(7,30,11,30,'J');
 rounded(g,24,13,6,14,'I','F');rounded(g,19,23,9,7,'I','F');g.line(25,15,25,23,'J').line(21,25,24,25,'M');
 rounded(g,10,7,13,38,'I','F');g.ellipse(16,10,5,5,'J');g.rect(11,13,5,29,'J');
 g.line(12,15,12,38,'M').line(13,13,13,26,'L').line(19,13,19,41,'g').line(21,15,21,41,'F');
 // 작은 가시는 옅은 짧은 묶음 세 개만 넣어요.
 g.line(16,20,18,19,'M').line(15,30,17,29,'L').line(16,38,18,37,'M');
 g.ellipse(16,5,4,2,'P').ellipse(15,4,2,2,'p').ellipse(18,5,2,2,'p').rect(15,5,3,2,'Y').set(16,5,'y');
 save('prop-cactus',[g]);
}
function signal(green){
 const g=new Grid(32,48);
 polygon(g,[[11,41],[21,41],[24,44],[8,44]],'d','O');g.line(11,42,20,42,'i');
 g.rect(14,28,5,14,'d').rect(14,29,2,12,'i').line(16,31,16,40,'f');
 rounded(g,5,3,23,29,'d','O');rounded(g,7,5,19,25,'S','d');g.line(9,4,23,4,'i').line(6,8,6,27,'f');
 g.ellipse(16,12,7,6,'O').ellipse(16,12,6,5,green?'D':'r');
 g.ellipse(16,24,7,6,'O').ellipse(16,24,6,5,green?'L':'F');
 if(green){
  g.line(12,21,15,20,'M');g.line(21,25,19,27,'J');
  // 색을 보지 않아도 아래 칸의 확인 표시로 이동임을 알 수 있어요.
  g.poly([[11,24],[13,22],[15,24],[20,20],[22,22],[15,28]],'W');g.line(15,26,20,21,'?');
  g.line(12,9,15,8,'s');
 }else{
  g.line(12,9,15,8,'p').line(21,13,19,15,'R');
  // 위 칸의 가로 멈춤 선은 큰 불투명 덩어리로 그려요.
  g.rect(12,11,9,3,'W').line(13,11,19,11,'?');
  g.line(12,21,15,20,'I');
 }
 return g;
}
save('prop-signal',[signal(false),signal(true)]);

const colors=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const sw=600;let sh=12;const rows=drawn.map(({key,frames})=>{const r={key,frames,old:loadGrid(key,false),y:sh};sh+=frames[0].h*2+16;return r;});
const sheet=new PNG({width:sw,height:sh});for(let i=0;i<sheet.data.length;i+=4)sheet.data.set([38,44,59,255],i);
for(const {old,frames,y:oy}of rows)for(const [set,scale,ox]of[[old,4,12],[frames,2,312]])set.forEach((g,f)=>g.rows.forEach((row,y)=>row.forEach((c,x)=>{if(c==='.')return;const rgb=[1,3,5].map(i=>parseInt(colors[c].slice(i,i+2),16));for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++)sheet.data.set([...rgb,255],((oy+y*scale+dy)*sw+ox+(f*g.w+x)*scale+dx)*4);})));
mkdirSync(root+'assets-preview/',{recursive:true});writeFileSync(root+'assets-preview/c12-4-world.png',PNG.sync.write(sheet));
console.log('C12-4 사막 세계4키/5프레임 생성');
