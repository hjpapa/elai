// C12-3: 수정 동굴의 바닥·벽·수정·석순. 1배 원본은 보존해요.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, saveHires, loadGrid, root } from './c12-common.mjs';
const drawn=[];const save=(key,frames)=>drawn.push(saveHires(key,frames));
const span=y=>{const w=4*(y<16?y+1:32-y);return[(64-w)/2,w];};
function caveTile(){
 const g=new Grid(64,32).rect(0,0,64,32,'S');
 // 작은 무작위 점 대신 넓은 회청색 바위 면과 짧은 층리예요.
 polygon(g,[[9,15],[20,9],[33,13],[27,18],[18,20]],'f','f');
 polygon(g,[[30,21],[44,14],[53,18],[40,25]],'d','d');
 polygon(g,[[26,7],[33,4],[42,8],[36,11]],'S','S');
 g.line(14,15,22,12,'i').line(15,16,24,13,'f');
 g.line(26,23,32,24,'f').line(41,16,48,17,'S').line(43,20,48,18,'N');
 g.line(18,21,23,19,'d').line(23,19,26,19,'d');
 // 원래 바닥의 청록 수정 조각을 한 작은 결면으로 이어 그려요.
 polygon(g,[[32,11],[36,9],[39,11],[35,13]],'o','n');g.line(34,10,36,10,'q');
 // 두 그림의 경계는 같은 색을 유지해 이웃 타일의 틈처럼 보이지 않아요.
 for(let y=0;y<32;y++){const [left,w]=span(y);for(let x=0;x<64;x++){if(x<left||x>=left+w)g.set(x,y,'.');else if(x<left+2||x>=left+w-2||y<2||y>=30)g.set(x,y,'S');}}
 return g;
}
save('tile-cave',[caveTile()]);
{
 const g=new Grid(64,48);
 for(let x=0;x<64;x++){
  const top=16+Math.floor(Math.min(x,63-x)/2);
  for(let y=top+1;y<=top+16;y++){
   const dy=y-top;let c=x<32?'d':'N';
   if(x<32&&dy<=4)c='S';
   if(x<32&&dy>10)c='N';
   if(x>=32&&dy>10)c='O';
   if(dy===7)c=x<32?'N':'O';
   if(dy===8&&x<23)c='S';
   if((x===15&&dy<7)||(x===24&&dy>7))c='N';
   if((x===42&&dy<7)||(x===53&&dy>7))c='O';
   if(dy===16)c=x<32?'N':'O';
   g.set(x,y,c);
  }
 }
 const top=caveTile();for(let y=0;y<32;y++)for(let x=0;x<64;x++)if(top.get(x,y)!=='.')g.set(x,y,top.get(x,y));
 g.line(4,23,11,26,'f').line(18,34,21,35,'S').line(39,30,45,27,'d');
 save('block-cave',[g]);
}
function crystal(f){
 const g=new Grid(32,48);
 // 서로 겹친 세 결정은 굵은 까만 윤곽 대신 청색 가장자리로 구분해요.
 polygon(g,[[5,40],[2,24],[7,18],[12,25],[14,42],[10,44]],'C','m');
 polygon(g,[[4,24],[7,20],[9,25],[10,40],[6,38]],'o','C');
 polygon(g,[[8,21],[11,26],[13,40],[11,41],[9,26]],'n','n');
 g.line(5,25,7,34,'q');
 polygon(g,[[12,41],[12,15],[18,4],[24,14],[22,41],[17,44]],'B','m');
 polygon(g,[[13,15],[18,7],[18,39],[15,42],[13,39]],'b','o');
 polygon(g,[[19,8],[23,15],[21,40],[18,42],[18,16]],'o','n');
 polygon(g,[[14,15],[18,8],[18,16]],'q','b');
 g.line(15,18,15,33,f?'?':'q').line(16,19,16,29,f?'W':'c').line(20,19,20,35,'n');
 polygon(g,[[21,42],[22,29],[28,22],[30,27],[28,40],[25,44]],'C','m');
 polygon(g,[[23,29],[27,25],[27,39],[24,42]],'o','C');
 g.line(24,30,24,36,f?'q':'c').line(28,28,28,36,'n');
 if(f){g.line(3,10,9,10,'q').line(6,7,6,13,'q').rect(5,9,3,3,'W').set(6,10,'?');}
 return g;
}
save('prop-crystal',[crystal(0),crystal(1)]);
{
 const g=new Grid(32,48);
 polygon(g,[[3,44],[5,37],[9,31],[10,21],[12,12],[14,7],[16,6],[18,11],[20,23],[21,32],[26,37],[29,44]],'S','d');
 polygon(g,[[5,42],[10,33],[12,21],[14,10],[16,9],[16,33],[20,42]],'A','f');
 polygon(g,[[11,29],[13,17],[14,12],[15,11],[14,30]],'i','A');
 polygon(g,[[17,13],[19,25],[20,34],[25,40],[21,40],[17,32]],'f','S');
 g.line(13,18,12,25,'j').line(10,34,14,32,'i').line(14,32,18,34,'f');
 g.line(7,39,12,37,'f').line(12,37,18,38,'S').line(21,41,25,42,'d');
 save('prop-stalagmite',[g]);
}
// 비교판: 모든 프레임을 옛4배/새2배로 같은 크기로 배치해요.
const colors=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const sw=600;let sh=12;const rows=drawn.map(({key,frames})=>{const r={key,frames,old:loadGrid(key,false),y:sh};sh+=frames[0].h*2+16;return r;});
const sheet=new PNG({width:sw,height:sh});for(let i=0;i<sheet.data.length;i+=4)sheet.data.set([38,44,59,255],i);
for(const {old,frames,y:oy}of rows)for(const [set,scale,ox]of[[old,4,12],[frames,2,312]])set.forEach((g,f)=>g.rows.forEach((row,y)=>row.forEach((c,x)=>{if(c==='.')return;const rgb=[1,3,5].map(i=>parseInt(colors[c].slice(i,i+2),16));for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++)sheet.data.set([...rgb,255],((oy+y*scale+dy)*sw+ox+(f*g.w+x)*scale+dx)*4);})));
mkdirSync(root+'assets-preview/',{recursive:true});writeFileSync(root+'assets-preview/c12-3-world.png',PNG.sync.write(sheet));
console.log('C12-3 동굴 세계4키/5프레임 생성');
