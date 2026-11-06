// C12-7: 별자리가 새겨진 밤빛 돌, 금테 벽, 황동 망원경과 별 등불.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, saveHires, loadGrid, root } from './c12-common.mjs';
const drawn=[];const save=(key,frames)=>drawn.push(saveHires(key,frames));
const span=y=>{const w=4*(y<16?y+1:32-y);return[(64-w)/2,w];};
function floor(){
 const g=new Grid(64,32).rect(0,0,64,32,'N');
 // 옛 네 점 별자리만 넓게 남겨 반복되는 바닥을 조용하게 유지해요.
 for(const[a,b]of[[[20,16],[32,10]],[[32,10],[44,18]],[[20,16],[34,22]]]){
  g.line(a[0],a[1]+1,b[0],b[1]+1,'m').line(...a,...b,'/');
 }
 for(const[x,y]of[[20,16],[44,18],[34,22]])g.rect(x-1,y,3,2,'m').rect(x,y-1,2,2,'a').set(x,y-1,'q');
 g.poly([[32,7],[33,9],[36,10],[33,11],[32,13],[31,11],[29,10],[31,9]],'Y').line(32,8,32,10,'y').set(31,10,'W');
 for(let y=0;y<32;y++){const[l,w]=span(y);for(let x=0;x<64;x++)if(x<l||x>=l+w)g.set(x,y,'.');else if(x<l+2||x>=l+w-2||y<2||y>=30)g.set(x,y,'N');}
 return g;
}
save('tile-observatory',[floor()]);
{
 const g=new Grid(64,48);
 for(let x=0;x<64;x++){
  const top=16+Math.floor(Math.min(x,63-x)/2);
  for(let y=top+1;y<=top+16;y++){
   const d=y-top,p=x%16,left=x<32;let c=left?'V':'N';
   if(d===1)c=left?'v':'/';if(d===2)c=left?'y':'Y';if(d===3)c=left?'+':'U';
   if(d>=13)c=left?'/':'m';if(d===16)c=left?'N':'O';
   if((p===7||p===8)&&d>=6&&d<=10)c=left?'v':':';
   if(p===9&&d>=7&&d<=11)c=left?'N':'m';
   g.set(x,y,c);
  }
 }
 const top=floor();for(let y=0;y<32;y++)for(let x=0;x<64;x++)if(top.get(x,y)!=='.')g.set(x,y,top.get(x,y));
 save('block-observatory',[g]);
}
{
 const g=new Grid(64,64);
 // 삼각대는 세 다리가 갈라지고 바닥에 닿는 지점만 남아요.
 polygon(g,[[31,37],[34,39],[17,59],[12,60]],'A','d');g.line(31,40,16,58,'i').line(14,60,18,60,'d');
 polygon(g,[[33,37],[49,56],[52,60],[47,60],[30,40]],'i','d');g.line(34,40,48,57,'j').line(47,60,51,60,'d');
 polygon(g,[[30,40],[34,40],[35,60],[30,60]],'+','U');g.line(31,42,31,58,'Y');
 g.line(22,49,41,49,'d').line(23,49,31,53,'f').line(32,53,41,49,'A');
 // 뒤쪽 접안부와 원통형 황동 경통.
 polygon(g,[[10,28],[16,32],[12,39],[5,35]],'S','O');g.line(7,34,11,37,'i').line(10,30,13,32,'f');
 polygon(g,[[11,26],[42,10],[55,24],[24,41]],'Y','U');
 g.poly([[13,26],[41,12],[45,16],[18,31]],'y').line(14,26,40,13,'W');
 g.poly([[19,32],[47,17],[53,24],[25,39]],'+').poly([[19,32],[46,18],[48,20],[23,35]],'Y');
 g.line(19,24,29,36,'+').line(20,23,30,35,'y');g.line(36,15,47,28,'+').line(37,15,48,27,'Y');
 // 렌즈 입구는 축 방향에 수직인 면으로 따로 읽히게 해요.
 polygon(g,[[40,9],[46,5],[60,19],[54,25]],'Y','U');
 polygon(g,[[43,10],[46,8],[57,19],[54,22]],'B','m');
 g.poly([[45,10],[46,9],[55,18],[54,20]],'b').line(45,11,51,17,'W').line(47,10,55,18,'q');
 g.line(42,10,45,7,'y').line(56,23,58,21,'+');
 g.ellipse(32,38,6,6,'d').ellipse(32,38,5,5,'V').ellipse(31,37,3,3,'v').ellipse(32,38,2,2,'Y').set(31,37,'y');
 save('prop-telescope',[g]);
}
function lamp(f){
 const g=new Grid(32,64);
 polygon(g,[[7,55],[25,55],[29,59],[27,60],[5,60],[3,59]],'A','d');g.line(7,56,24,56,'j').line(6,59,26,59,'f');
 g.rect(13,30,7,26,'U').rect(14,31,4,24,'+').line(14,32,14,54,'Y').line(15,32,15,52,'y');
 polygon(g,[[10,30],[22,30],[23,33],[9,33]],'Y','U');g.line(11,31,21,31,'y');
 const points=[[16,5],[20,13],[29,15],[22,22],[24,31],[16,27],[8,31],[10,22],[3,15],[12,13]];
 polygon(g,points,f?'y':'Y','U');
 g.poly([[16,7],[16,18],[5,15],[13,14]],f?'W':'y');
 g.poly([[16,7],[19,14],[27,16],[16,18]],f?'y':'Y');
 g.poly([[16,18],[22,23],[23,29],[16,25]],f?'Y':'+');
 g.poly([[16,18],[10,23],[9,29],[16,25]],f?'y':'Y');
 g.line(16,13,16,20,f?'?':'W').line(13,17,18,17,f?'W':'y');
 if(f){g.line(2,7,4,7,'y').line(3,6,3,8,'W');g.rect(28,5,2,2,'W');g.line(2,27,4,27,'y').set(3,26,'W');}
 return g;
}
save('prop-starlamp',[lamp(0),lamp(1)]);

const colors=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const sw=700;let sh=12;const rows=drawn.map(({key,frames})=>{const r={key,frames,old:loadGrid(key,false),y:sh};sh+=frames[0].h*2+16;return r;});
const sheet=new PNG({width:sw,height:sh});for(let i=0;i<sheet.data.length;i+=4)sheet.data.set([38,44,59,255],i);
for(const{old,frames,y:oy}of rows)for(const[set,scale,ox]of[[old,4,12],[frames,2,362]])set.forEach((g,f)=>g.rows.forEach((row,y)=>row.forEach((c,x)=>{if(c==='.')return;const rgb=[1,3,5].map(i=>parseInt(colors[c].slice(i,i+2),16));for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++)sheet.data.set([...rgb,255],((oy+y*scale+dy)*sw+ox+(f*g.w+x)*scale+dx)*4);})));
mkdirSync(root+'assets-preview/',{recursive:true});writeFileSync(root+'assets-preview/c12-7-world.png',PNG.sync.write(sheet));
console.log('C12-7 천문대 세계 4키 / 5프레임 생성');
