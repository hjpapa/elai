// C12-1: 순서의 숲 블록·소품. 기존 1배 원본과 C11 파일은 바꾸지 않아요.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, saveHires, loadGrid, root } from './c12-common.mjs';
const drawn=[];
const save=(key,frames)=>drawn.push(saveHires(key,frames));
const leaf=(g,x,y,c,side=1)=>g.poly([[x,y],[x+4*side,y-2],[x+7*side,y],[x+3*side,y+2]],c);
const spark=(g,x,y,r,c)=>g.line(x-r,y,x+r,y,c).line(x,y-r,x,y+r,c).set(x,y,'?');
const insideTop=(x,y)=>y>=0&&y<32&&x>=32-2*(y<16?y+1:32-y)&&x<32+2*(y<16?y+1:32-y);
function topPatch(g,points,color){const p=new Grid(64,48).poly(points,color);for(let y=0;y<32;y++)for(let x=0;x<64;x++)if(insideTop(x,y)&&p.get(x,y)!=='.')g.set(x,y,color);}
function topLine(g,x0,y0,x1,y1,c){const p=new Grid(64,48).line(x0,y0,x1,y1,c);for(let y=0;y<32;y++)for(let x=0;x<64;x++)if(insideTop(x,y)&&p.get(x,y)!=='.')g.set(x,y,c);}
function block(hedge){
 const g=new Grid(64,48);
 // 마름모 바깥을 늘리지 않고 앞의 두 면만 정확히16px 내려요.
 for(let x=0;x<64;x++){
  const top=16+Math.floor(Math.min(x,63-x)/2);
  for(let y=top+1;y<=top+16;y++){
   let c=hedge?(x<32?'I':'F'):(x<32?'f':'d');
   if(!hedge&&y===top+8)c=x<32?'d':'m';
   if(!hedge&&((x<32?[12,25]:[40,54]).includes(x))&&y-top<=8)c=x<32?'d':'m';
   if(!hedge&&((x<32?[6,19]:[35,48,59]).includes(x))&&y-top>8)c=x<32?'d':'m';
   if(y===top+16)c=hedge?'F':'d';
   g.set(x,y,c);
  }
 }
 for(let y=0;y<32;y++)for(let x=0;x<64;x++)if(insideTop(x,y))g.set(x,y,hedge?'J':'i');
 if(hedge){
  topPatch(g,[[3,15],[17,8],[22,10],[15,16],[10,21]],'M');
  topPatch(g,[[21,5],[31,1],[40,5],[36,11],[27,11]],'M');
  topPatch(g,[[37,12],[47,9],[59,15],[48,19],[39,18]],'L');
  topPatch(g,[[16,24],[23,18],[33,21],[37,27],[31,30]],'g');
  topPatch(g,[[41,21],[47,19],[52,21],[43,25]],'I');
  topLine(g,22,7,27,5,'l');topLine(g,8,16,11,14,'l');topLine(g,40,14,44,13,'M');
  for(const [x,y,c]of[[4,23,'J'],[13,29,'g'],[23,34,'J'],[6,30,'g'],[19,38,'g'],[37,35,'I'],[46,29,'I'],[55,24,'g'],[52,35,'I']])leaf(g,x,y,c);
  // 잎은 블록의 실제 옆면 밖으로 튀어나오지 않아요.
  for(let y=0;y<48;y++)for(let x=0;x<64;x++){const low=16+Math.floor(Math.min(x,63-x)/2);if(!insideTop(x,y)&&!(y>low&&y<=low+16))g.set(x,y,'.');}
 }else{
  topPatch(g,[[2,16],[16,9],[30,16],[17,22]],'j');
  topPatch(g,[[22,6],[32,1],[45,8],[33,14]],'a');
  topPatch(g,[[36,18],[49,11],[61,16],[47,23]],'i');
  topLine(g,16,8,47,24,'f');topLine(g,0,16,31,31,'f');topLine(g,33,0,63,15,'f');
  topLine(g,0,16,32,0,'f');topLine(g,16,24,48,8,'f');topLine(g,31,31,63,15,'f');
  topLine(g,18,9,29,15,'j');topLine(g,34,3,44,8,'j');topLine(g,33,17,45,11,'j');
  // 옆면 윗단 빛은 왼쪽에만 강하게 보여요.
  for(let x=1;x<31;x++){const y=17+Math.floor(x/2);g.set(x,y,'i');}
  for(let x=34;x<62;x++){const y=17+Math.floor((63-x)/2);g.set(x,y,'f');}
 }
 return g;
}
save('block-hedge',[block(true)]);save('block-wall',[block(false)]);
{
 const g=new Grid(64,48);
 polygon(g,[[7,33],[14,18],[35,9],[48,17],[57,31],[58,37],[43,43],[20,44],[8,39]],'f','d');
 polygon(g,[[9,32],[16,20],[34,11],[44,18],[33,29],[20,34]],'i','i');
 polygon(g,[[17,20],[33,13],[40,17],[30,23],[23,27]],'j','j');
 polygon(g,[[33,30],[44,19],[52,26],[56,36],[43,41],[28,42]],'A','f');
 polygon(g,[[10,34],[21,36],[27,42],[20,43],[10,38]],'f','f');
 g.line(20,19,31,15,'W').line(43,29,46,35,'d').line(31,36,30,40,'f');
 leaf(g,13,36,'I');leaf(g,10,34,'J');g.line(10,35,15,38,'F');
 save('prop-rock',[g]);
}
{
 const g=new Grid(32,32);
 polygon(g,[[6,10],[25,10],[25,22],[29,27],[23,28],[17,27],[10,28],[3,27],[6,22]],'U','Q');
 polygon(g,[[7,12],[12,12],[11,24],[8,26],[5,26],[8,21]],'X','X');
 g.line(9,14,9,22,'Z').line(20,14,21,23,'Q').line(16,19,15,25,'E').line(23,24,26,26,'X');
 g.ellipse(16,10,11,5,'Q').ellipse(15,9,10,4,'Z').ellipse(15,9,7,3,'U').ellipse(15,9,5,2,'t').ellipse(15,9,2,1,'X');
 g.line(8,8,11,6,'W').line(22,10,24,11,'X');
 g.line(6,20,4,18,'I');leaf(g,4,18,'J');
 save('prop-stump',[g]);
}
{
 const g=new Grid(32,32);
 polygon(g,[[12,15],[20,15],[20,23],[24,27],[20,28],[9,28],[8,26],[12,23]],'&','-');
 polygon(g,[[13,17],[16,17],[16,25],[13,27],[10,26],[14,23]],'?','?');
 g.line(19,19,19,24,'*').line(19,24,22,26,'*');
 g.ellipse(16,12,13,9,'s').ellipse(15,10,12,8,'u').ellipse(12,8,8,5,'r');
 polygon(g,[[3,13],[7,15],[16,17],[26,15],[28,13],[27,17],[20,20],[11,20],[5,17]],'s','s');
 g.line(7,17,12,18,'X').line(12,18,21,18,'Z').line(21,18,25,16,'U');
 g.ellipse(10,6,3,2,'?').ellipse(23,10,2,2,'&').rect(7,11,2,2,'&');g.line(6,7,8,5,'p');
 save('prop-mushroom',[g]);
}
function door(open){
 const g=new Grid(64,64);
 polygon(g,[[8,24],[12,15],[20,8],[28,5],[36,5],[45,9],[53,17],[56,24],[49,25],[45,18],[39,14],[32,12],[25,14],[18,20],[15,26]],'U','Q');
 polygon(g,[[8,24],[16,24],[16,59],[8,60]],'X','Q');polygon(g,[[48,24],[56,24],[56,60],[48,59]],'U','Q');
 g.line(10,26,10,56,'Z').line(14,28,14,52,'U').line(49,27,49,56,'X').line(54,28,54,55,'Q');
 g.line(14,16,22,10,'t').line(23,10,29,8,'Z').line(34,8,42,11,'X');
 g.line(12,39,13,44,'U').line(52,36,52,43,'Q').line(25,9,25,12,'U');
 if(!open){
  polygon(g,[[18,25],[23,18],[30,15],[35,15],[41,18],[46,25],[46,58],[18,58]],'I','F');
  polygon(g,[[19,26],[24,20],[27,18],[27,57],[19,57]],'g','I');
  for(const x of [25,32,39])g.line(x,x===32?17:21,x,56,'F');
  g.line(26,23,26,52,'J').line(33,19,33,55,'g').line(40,24,40,53,'g');
  polygon(g,[[17,30],[19,27],[46,47],[45,51]],'U','Q');g.line(19,29,43,47,'X');
  polygon(g,[[18,48],[44,31],[46,34],[19,52]],'U','Q');g.line(21,48,42,34,'X');
  g.rect(38,39,5,5,'+').rect(39,39,3,3,'Y').set(40,40,'y');
  leaf(g,25,34,'L');leaf(g,31,48,'J');
 }else{
  polygon(g,[[19,58],[32,53],[45,58],[32,60]],'X','U');g.line(23,57,31,55,'Z');
  g.line(17,27,18,53,'I').line(47,27,46,54,'F');leaf(g,18,48,'J');leaf(g,45,51,'L',-1);
 }
 g.line(12,18,10,30,'I').line(10,30,13,41,'I').line(13,41,10,53,'I');
 leaf(g,11,23,'J',-1);leaf(g,11,30,'L');leaf(g,12,41,'J',-1);leaf(g,10,51,'L');
 g.line(47,10,52,22,'I').line(52,22,50,34,'F');leaf(g,47,11,'L');leaf(g,51,21,'J',-1);leaf(g,51,31,'J');leaf(g,51,52,'L');
 return g;
}
save('prop-door',[door(false),door(true)]);
{
 const g=new Grid(32,32);
 // 열쇠는 바닥에 놓인 물건이며 그림자나 자체 불빛은 넣지 않아요.
 polygon(g,[[13,12],[16,12],[29,24],[29,27],[25,28],[12,16]],'Y','-');
 g.line(15,14,26,25,'y').line(16,16,25,26,'+');
 polygon(g,[[24,20],[26,18],[29,21],[27,23]],'Y','-');g.line(26,20,27,21,'y');
 g.ellipse(10,10,7,7,'-').ellipse(10,9,6,6,'Y').ellipse(10,9,3,3,'-').ellipse(10,9,2,2,'.');
 g.line(6,7,7,5,'y').line(8,4,12,4,'W').line(5,10,5,12,'+');
 save('prop-key',[g]);
}
function portal(f){
 const g=new Grid(64,64);
 // 두 프레임은 모두 열려 있고 안쪽 물결과 반짝임만 바뀌어요.
 g.ellipse(32,54,25,6,'D').ellipse(32,53,24,5,'V').ellipse(31,52,21,3,'v');
 g.line(16,54,25,56,'P').line(26,56,40,56,'v').line(18,51,23,50,'p');
 g.ellipse(32,30,22,26,'D').ellipse(32,29,21,25,'V').ellipse(31,28,17,22,'v');
 g.ellipse(32,29,14,21,f?'C':'n').ellipse(30,27,11,18,f?'c':'o').ellipse(28,25,7,15,f?'q':'b');
 g.line(24,11,28,8,'?').line(19,18,20,14,'W').line(17,23,17,30,'p');
 g.line(43,45,40,49,'P').line(35,51,39,50,'C');
 // 밝은 가느다란 면은 고정된 테두리를 따라가고 중앙 물결만 이동해요.
 if(f===0){g.line(27,17,24,25,'q').line(24,25,25,33,'q').line(33,35,35,42,'b');spark(g,48,10,3,'y');spark(g,52,42,2,'W');}
 else {g.line(31,15,34,23,'q').line(34,23,33,31,'q').line(27,36,28,43,'c');spark(g,47,9,2,'W');spark(g,12,43,3,'y');}
 return g;
}
save('prop-portal',[portal(0),portal(1)]);

// 전용 검토판은 옛 그림4배와 새 그림2배를 같은 크기로 나란히 보여줘요.
const colors=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const sw=600,pad=12;let sh=pad;const rows=drawn.map(({key,frames})=>{const old=loadGrid(key,false);const h=frames[0].h*2;const row={key,frames,old,y:sh};sh+=h+pad;return row;});
const sheet=new PNG({width:sw,height:sh});for(let i=0;i<sheet.data.length;i+=4)sheet.data.set([41,48,68,255],i);
for(const {frames,old,y:oy}of rows)for(const [set,scale,ox]of[[old,4,12],[frames,2,312]])set.forEach((g,f)=>g.rows.forEach((row,y)=>row.forEach((c,x)=>{if(c==='.')return;const hex=colors[c],rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++)sheet.data.set([...rgb,255],((oy+y*scale+dy)*sw+ox+(f*g.w+x)*scale+dx)*4);})));
mkdirSync(root+'assets-preview/',{recursive:true});writeFileSync(root+'assets-preview/c12-1-world.png',PNG.sync.write(sheet));
console.log('C12-1 세계 그림 '+drawn.length+'키 / '+drawn.reduce((n,a)=>n+a.frames.length,0)+'프레임 생성');
