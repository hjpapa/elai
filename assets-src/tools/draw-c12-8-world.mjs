// C12-8: 따뜻한 원목 마루, 풍경 그림 이젤과 근거 자료 책장.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, rounded, saveHires, loadGrid, root } from './c12-common.mjs';
const drawn=[];const save=(key,frames)=>drawn.push(saveHires(key,frames));
const span=y=>{const w=4*(y<16?y+1:32-y);return[(64-w)/2,w];};
{
 const g=new Grid(64,32);
 for(let y=0;y<32;y++){const[l,w]=span(y);for(let x=l;x<l+w;x++){
  const u=(x+2*y)%20,board=Math.floor((x+2*y)/20);let c=board%2?'e':'X';
  if(u===0)c='U';else if(u===1)c='e';else if(u===2)c='t';else if(u===3)c='T';
  g.set(x,y,c);
 }}
 // 실내 마루는 못과 풍화 대신 긴 결, 드문 판재 이음만 보여 줘요.
 g.line(12,17,24,11,'T').line(26,22,38,16,'T').line(40,20,49,15,'U');
 g.line(20,11,27,14,'U').line(21,11,28,14,'T');g.line(30,8,34,7,'T');
 for(let y=0;y<32;y++){const[l,w]=span(y);for(let x=0;x<64;x++)if(x<l||x>=l+w)g.set(x,y,'.');else if(x<l+2||x>=l+w-2||y<2||y>=30)g.set(x,y,'e');}
 save('tile-wood',[g]);
}
{
 const g=new Grid(48,64);
 polygon(g,[[20,8],[23,9],[14,60],[9,60]],'T','E');g.line(20,13,12,58,'t');
 polygon(g,[[27,8],[30,8],[42,60],[37,60]],'X','E');g.line(29,14,39,58,'T');
 polygon(g,[[23,10],[26,10],[28,59],[24,59]],'U','E');
 // 앞틀의 위·왼쪽은 밝게, 오른쪽과 아래는 한 단계 어둡게 해요.
 rounded(g,6,11,36,41,'T','E');g.rect(8,13,31,36,'t').rect(39,14,2,35,'X');
 g.rect(10,15,28,33,'W').line(10,15,36,15,'?');
 // 옛 하늘·해·두 산·들판의 풍경을 넓은 색면으로 이어 가요.
 g.rect(12,17,24,27,'b').rect(12,27,24,9,'q');
 g.ellipse(30,22,4,4,'Y').ellipse(29,21,3,3,'y').set(28,20,'W');
 g.line(15,22,21,22,'W').line(17,21,20,21,'?');
 g.poly([[12,35],[20,26],[29,36]],'C').poly([[14,34],[20,28],[23,32],[19,31]],'c');
 g.poly([[21,36],[30,29],[35,35],[35,38]],'G').poly([[25,34],[30,31],[32,33]],'J');
 g.rect(12,36,24,8,'c').poly([[12,39],[20,37],[27,39],[35,37],[35,43],[12,43]],'M');
 g.line(14,42,22,41,'l');
 g.line(9,13,37,13,'Z').line(40,17,40,46,'e');
 polygon(g,[[20,6],[28,6],[29,12],[19,12]],'U','E');g.line(21,7,27,7,'t').rect(22,9,4,2,'X');
 polygon(g,[[5,51],[42,51],[44,54],[40,56],[5,56],[3,54]],'T','E');g.line(6,52,41,52,'t').line(6,55,39,55,'X');
 save('prop-easel',[g]);
}
{
 const g=new Grid(64,80);
 // 뒤판, 굵은 기둥과 세 선반을 구분해 책이 납작한 무늬로 보이지 않게 해요.
 polygon(g,[[5,8],[58,8],[60,71],[57,74],[6,74]],'E','Q');
 g.rect(11,11,43,60,'Q').rect(12,12,40,58,'E');
 g.rect(6,10,6,62,'T').line(7,12,7,69,'t').line(10,13,10,70,'X');
 g.rect(54,10,5,62,'e').line(54,12,54,69,'X').line(58,13,58,70,'U');
 polygon(g,[[59,9],[61,8],[61,70],[59,73]],'U','E');
 function book(x,y,w,h,base,shade,lit,band=true){
  g.rect(x,y,w,h,shade).rect(x+1,y+1,w-2,h-2,base).line(x+1,y+1,x+1,y+h-2,lit);
  if(band)g.line(x+2,y+3,x+w-2,y+3,'W');
  g.line(x+2,y+h-3,x+w-2,y+h-3,lit);
 }
 book(14,13,6,15,'B','N','b');book(22,15,8,13,'V','N','v');book(32,11,6,17,'r','s','x');
 // 첫 선반의 초록 책만 조금 기대어 있어요.
 polygon(g,[[40,17],[48,16],[51,27],[42,27]],'G','F');g.line(41,18,43,25,'J').line(43,19,47,18,'W');
 book(14,36,10,14,'C','F','c');book(26,34,6,16,'P','s','p');book(34,38,6,12,'Y','U','y',false);book(42,34,8,16,'B','N','b');
 book(14,58,6,14,'V','N','v');book(22,58,10,14,'r','s','x');book(34,60,6,12,'G','F','J',false);book(42,58,8,14,'N','O','/');
 for(const y of[28,50,72]){
  g.rect(10,y,45,3,'X').line(10,y,54,y,'t').line(11,y+1,53,y+1,'T');
  if(y<72)g.line(12,y+3,52,y+3,'Q');
 }
 polygon(g,[[4,4],[59,4],[62,7],[60,11],[3,11],[2,7]],'T','E');
 g.poly([[5,5],[58,5],[60,7],[4,7]],'t').line(6,5,56,5,'Z').line(4,10,58,10,'X');
 g.rect(7,74,7,3,'E').line(8,74,12,74,'T').rect(50,74,7,3,'E').line(51,74,55,74,'X');
 save('prop-bookshelf',[g]);
}

const colors=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const sw=700;let sh=12;const rows=drawn.map(({key,frames})=>{const r={key,frames,old:loadGrid(key,false),y:sh};sh+=frames[0].h*2+16;return r;});
const sheet=new PNG({width:sw,height:sh});for(let i=0;i<sheet.data.length;i+=4)sheet.data.set([38,44,59,255],i);
for(const{old,frames,y:oy}of rows)for(const[set,scale,ox]of[[old,4,12],[frames,2,362]])set.forEach((g,f)=>g.rows.forEach((row,y)=>row.forEach((c,x)=>{if(c==='.')return;const rgb=[1,3,5].map(i=>parseInt(colors[c].slice(i,i+2),16));for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++)sheet.data.set([...rgb,255],((oy+y*scale+dy)*sw+ox+(f*g.w+x)*scale+dx)*4);})));
mkdirSync(root+'assets-preview/',{recursive:true});writeFileSync(root+'assets-preview/c12-8-world.png',PNG.sync.write(sheet));
console.log('C12-8 공방 세계 3키 / 3프레임 생성');
