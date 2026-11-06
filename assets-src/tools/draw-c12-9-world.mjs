// C12-9: 따뜻한 성 석재, 흐림/맑음 거울과 책·마음 깃발.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, rounded, saveHires, loadGrid, root } from './c12-common.mjs';
const drawn=[];const save=(key,frames)=>drawn.push(saveHires(key,frames));
const span=y=>{const w=4*(y<16?y+1:32-y);return[(64-w)/2,w];};
function stone(){
 const g=new Grid(64,32);
 for(let y=0;y<32;y++){const[l,w]=span(y);for(let x=l;x<l+w;x++){
  const q=(x+2*y)%32;let c='a';if(q===0)c='i';else if(q===1)c='A';else if(q>=3&&q<=5)c='j';g.set(x,y,c);
 }}
 // 길고 성긴 돌줄눈과 따뜻한 햇빛 한 면. 점 잡티는 넣지 않아요.
 g.line(22,9,33,15,'i').line(23,9,34,15,'j');
 g.poly([[23,16],[29,13],[39,18],[33,21]],'j').line(27,16,33,19,'W');
 for(let y=0;y<32;y++){const[l,w]=span(y);for(let x=0;x<64;x++)if(x<l||x>=l+w)g.set(x,y,'.');else if(x<l+2||x>=l+w-2||y<2||y>=30)g.set(x,y,'a');}
 return g;
}
save('tile-castle',[stone()]);
{
 const g=new Grid(64,48);
 for(let x=0;x<64;x++){
  const top=16+Math.floor(Math.min(x,63-x)/2);
  for(let y=top+1;y<=top+16;y++){
   const d=y-top,left=x<32;let c=left?'A':'S';
   if(d===1)c=left?'i':'f';if(d===5||d===6)c=left?'v':'V';
   if(d===8)c=left?'f':'d';if(d>=14)c=left?'f':'d';if(d===16)c=left?'S':'O';
   if((x%16===0&&d>=2&&d<=7)||(x%16===8&&d>=9&&d<=13))c=left?'S':'d';
   g.set(x,y,c);
  }
 }
 const top=stone();for(let y=0;y<32;y++)for(let x=0;x<64;x++)if(top.get(x,y)!=='.')g.set(x,y,top.get(x,y));
 save('block-castle',[g]);
}
function mirror(clear){
 const g=new Grid(64,96);
 g.rect(20,77,6,11,'+').line(21,79,21,86,'y').rect(40,77,6,11,'U').line(40,79,40,86,'Y');
 polygon(g,[[15,85],[49,85],[54,89],[51,92],[13,92],[10,89]],'Y','U');g.line(16,86,48,86,'y').line(15,91,49,91,'+');
 const outer=new Grid(64,96).ellipse(32,31,24,25,'Y').rect(8,31,49,49,'Y');
 const glass=new Grid(64,96).ellipse(32,33,18,20,'b').rect(14,33,37,41,'b');
 for(let y=0;y<96;y++)for(let x=0;x<64;x++)if(outer.get(x,y)!=='.'){
  const edge=[[0,-1],[0,1],[-1,0],[1,0]].some(([dx,dy])=>outer.get(x+dx,y+dy)==='.');
  g.set(x,y,edge?'U':x<20?'y':x>45?'+':'Y');
 }
 for(let y=0;y<96;y++)for(let x=0;x<64;x++)if(glass.get(x,y)!=='.'){
  const edge=[[0,-1],[0,1],[-1,0],[1,0]].some(([dx,dy])=>glass.get(x+dx,y+dy)==='.');
  g.set(x,y,edge?'n':clear?(x<23?'q':x<43?'b':'o'):(x<23?':':'B'));
 }
 g.line(11,31,11,72,'W').line(16,76,48,76,'y').line(20,13,25,9,'y');
 if(clear){
  // 기존 로비를 닮은 기록의 반사예요. 실제 사람 얼굴이나 글자는 없어요.
  rounded(g,22,40,23,18,'i','f');g.rect(24,42,19,13,'a').line(25,42,40,42,'j');
  rounded(g,26,46,15,8,'N','d');g.rect(28,48,3,3,'c').rect(36,48,3,3,'c').set(28,48,'q').set(36,48,'q');
  rounded(g,26,60,15,13,'a','f');g.rect(28,63,11,8,'C').line(28,63,36,63,'c');
  g.line(33,34,33,39,'Y').rect(32,33,3,2,'y').set(32,33,'W');
  g.line(20,27,30,17,'W').line(21,28,31,18,'?').line(43,66,48,61,'W');
 }else{
  g.ellipse(32,52,10,16,'N').ellipse(32,41,8,8,'V').rect(26,56,14,12,'V');
  g.rect(28,42,2,2,'b').rect(36,42,2,2,'b');
  // 넓고 낮은 대비의 흐림 띠는 불투명 팔레트 색으로만 표현해요.
  g.poly([[16,30],[25,27],[39,30],[48,28],[48,32],[37,34],[25,31],[16,34]],':');
  g.poly([[16,54],[25,52],[39,55],[48,53],[48,56],[37,59],[25,56],[16,58]],'/');
  g.line(20,26,28,18,'b').line(43,67,48,62,'b');
 }
 polygon(g,[[27,5],[37,5],[38,10],[26,10]],'Y','U');
 g.poly([[32,1],[35,4],[32,7],[29,4]],'Y').line(31,3,32,2,'y').set(32,4,'W');
 return g;
}
save('prop-mirror',[mirror(false),mirror(true)]);
{
 const g=new Grid(48,64);
 // 넓은 천은 옛 모양을 유지하고 지지대는 발 기준점 아래 가운데로 모아요.
 g.rect(22,6,5,53,'U').line(23,8,23,58,'Y').line(24,8,24,57,'y');
 polygon(g,[[19,55],[29,55],[34,59],[31,60],[17,60],[14,59]],'A','d');g.line(19,56,28,56,'j').line(18,59,31,59,'f');
 polygon(g,[[12,11],[42,11],[42,45],[28,54],[12,45]],'V','N');
 g.poly([[14,13],[19,14],[19,45],[28,51],[14,44]],'v');
 g.poly([[36,13],[40,13],[40,44],[29,51],[35,43]],'N');g.line(39,15,39,42,'V');
 g.line(15,13,38,13,'v').line(14,44,28,52,'+').line(29,51,40,44,'U');
 // 책장은 좌우 면이 다르고, 위의 마음은 밝은 청록색 한 덩어리예요.
 polygon(g,[[18,34],[26,36],[26,44],[18,42]],'W','v');g.line(19,35,25,37,'?');
 polygon(g,[[28,36],[36,34],[36,42],[28,44]],'a','N');g.line(29,37,35,35,'j').line(27,36,27,44,'Y');
 g.poly([[21,22],[24,21],[27,25],[30,21],[33,22],[34,26],[27,33],[20,26]],'C');
 g.poly([[21,22],[24,22],[27,26],[30,22],[32,23],[32,26],[27,31],[22,26]],'c').line(22,23,24,23,'q');
 g.rect(9,7,35,3,'U').line(10,7,43,7,'Y').line(11,7,41,7,'y');
 g.ellipse(9,8,2,2,'Y').set(8,7,'y').ellipse(44,8,2,2,'Y').set(43,7,'y');
 g.poly([[24,2],[27,5],[24,8],[21,5]],'Y').set(23,4,'y');
 save('prop-banner',[g]);
}

const colors=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const sw=860;let sh=12;const rows=drawn.map(({key,frames})=>{const r={key,frames,old:loadGrid(key,false),y:sh};sh+=frames[0].h*2+16;return r;});
const sheet=new PNG({width:sw,height:sh});for(let i=0;i<sheet.data.length;i+=4)sheet.data.set([38,44,59,255],i);
for(const{old,frames,y:oy}of rows)for(const[set,scale,ox]of[[old,4,12],[frames,2,442]])set.forEach((g,f)=>g.rows.forEach((row,y)=>row.forEach((c,x)=>{if(c==='.')return;const rgb=[1,3,5].map(i=>parseInt(colors[c].slice(i,i+2),16));for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++)sheet.data.set([...rgb,255],((oy+y*scale+dy)*sw+ox+(f*g.w+x)*scale+dx)*4);})));
mkdirSync(root+'assets-preview/',{recursive:true});writeFileSync(root+'assets-preview/c12-9-world.png',PNG.sync.write(sheet));
console.log('C12-9 성 세계 4키 / 5프레임 생성');
