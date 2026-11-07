// C13-1: 따뜻한 공방의 작업대, 열린 장난감 상자, 화분, 스탠드와 낮은 방석.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, rounded, saveHires, root } from './c12-common.mjs';
const drawn=[];const save=(key,g)=>drawn.push(saveHires(key,[g]));
{
 const g=new Grid(64,64);
 // 세 개의 보이는 다리와 낮은 가로대. 맨 앞 다리가 발 기준점에 닿아요.
 polygon(g,[[7,31],[12,33],[12,51],[7,50]],'T','U');g.line(8,34,8,48,'t');
 polygon(g,[[53,27],[58,25],[58,49],[53,52]],'e','E');g.line(54,31,54,49,'X');
 polygon(g,[[27,41],[34,40],[34,60],[28,60]],'X','E');g.line(28,44,28,58,'T');
 polygon(g,[[10,45],[29,54],[54,43],[54,47],[30,59],[10,49]],'X','U');g.line(12,46,29,54,'T');
 // 넓은 작업대 윗면은 두 방향 모두 2:1 기울기를 따라요.
 polygon(g,[[4,27],[28,39],[28,46],[4,34]],'T','U');
 polygon(g,[[28,39],[60,23],[60,30],[28,46]],'e','E');g.line(30,40,58,26,'X');
 polygon(g,[[4,27],[36,11],[60,23],[28,39]],'T','U');
 g.poly([[6,27],[36,12],[57,23],[28,37]],'t').line(8,27,35,14,'Z');
 g.line(17,29,32,21,'X').line(27,32,39,26,'T').line(30,35,39,31,'X');
 // 서랍의 작은 막대 손잡이는 돈이나 투입구 모양을 쓰지 않아요.
 polygon(g,[[9,32],[23,39],[23,43],[9,36]],'X','U');g.line(10,32,22,38,'t').line(15,36,19,38,'E');
 // 천 작업 매트와 두 공구: 둥근 망치, 짧은 붓.
 polygon(g,[[19,23],[31,17],[43,23],[31,29]],'o','n');g.line(21,23,31,18,'q');
 polygon(g,[[14,24],[16,23],[24,30],[22,31]],'X','U');
 rounded(g,10,19,11,6,'f','d');g.rect(12,20,7,2,'a').line(11,20,11,23,'i');
 g.line(26,19,35,24,'U').line(26,18,35,23,'t');polygon(g,[[33,22],[36,21],[40,24],[37,26]],'B','m');g.line(35,22,38,24,'b');
 // 분홍 실타래는 양 끝의 나무 원판과 세 줄의 감긴 실로 읽혀요.
 g.ellipse(45,23,6,2,'U').ellipse(45,22,6,2,'t');g.rect(41,14,9,9,'P');
 g.line(42,15,47,15,'p').line(42,18,48,18,'p').line(42,21,48,21,'p').line(49,15,49,21,'R');
 g.ellipse(45,13,6,2,'T').ellipse(45,12,5,2,'Z').rect(44,11,3,2,'U').set(44,11,'X');
 save('prop-workbench',g);
}
{
 const g=new Grid(64,48);
 // 뚜껑은 뒤쪽 경첩을 중심으로 세워 두어 상자 안을 가리지 않아요.
 polygon(g,[[8,24],[34,11],[34,1],[8,14]],'T','U');
 g.poly([[10,21],[31,11],[31,5],[10,15]],'Z').line(10,14,31,4,'t');
 g.line(10,23,32,12,'X').line(9,17,9,21,'Y');
 // 깊은 내부와 밝은 나무 테두리는 열린 상태를 확실하게 보여 줘요.
 polygon(g,[[8,24],[34,11],[59,24],[32,37]],'U','E');
 g.poly([[12,24],[34,14],[55,24],[32,34]],'Q');
 // 세 가지 장난감은 글자와 얼굴 없이 공·블록 모양으로만 그려요.
 g.ellipse(35,23,7,7,'n').ellipse(34,22,6,6,'b').ellipse(32,20,3,2,'q');g.line(30,24,34,27,'C');
 g.ellipse(47,25,5,5,'s').ellipse(46,24,4,4,'r').ellipse(44,22,2,1,'p');
 polygon(g,[[16,25],[22,22],[27,25],[21,28]],'M','F');polygon(g,[[16,25],[21,28],[21,33],[16,30]],'J','F');polygon(g,[[21,28],[27,25],[27,30],[21,33]],'I','F');
 polygon(g,[[8,24],[32,37],[32,44],[8,33]],'Y','U');
 polygon(g,[[32,37],[59,24],[59,32],[32,44]],'+','U');
 g.line(9,25,31,37,'y').line(33,37,58,25,'T').line(10,32,30,42,'T');
 // 구멍 없는 천 조각 장식. 동전이나 잠금쇠로 보이지 않게 사각이에요.
 polygon(g,[[17,30],[24,34],[24,39],[17,35]],'p','R');g.line(18,31,22,33,'W');
 g.line(47,34,52,32,'U');
 save('prop-toybox',g);
}
{
 const g=new Grid(32,48);
 polygon(g,[[6,30],[27,30],[23,44],[10,44]],'h','!');
 g.poly([[8,32],[15,33],[15,42],[11,42]],'x').poly([[23,32],[26,31],[22,43],[20,43]],'H');
 g.line(10,34,12,40,'z').line(13,43,21,43,'#');
 g.ellipse(16,30,11,4,'H').ellipse(16,29,11,3,'K').ellipse(16,29,8,2,'U');g.line(7,29,10,28,'z');
 g.line(16,29,15,11,'I').line(16,27,8,20,'I').line(16,25,24,19,'I');
 function leaf(x,y,rx,ry,base,lit){g.ellipse(x,y,rx,ry,'F').ellipse(x,y-1,rx-1,ry-1,base).ellipse(x-1,y-2,Math.max(2,rx-3),Math.max(1,ry-3),lit);}
 leaf(9,16,6,5,'J','M');leaf(22,18,7,5,'I','J');leaf(16,9,6,6,'J','L');
 leaf(7,24,5,4,'J','M');leaf(25,25,5,4,'I','J');g.line(14,14,15,17,'M');
 save('prop-plant',g);
}
{
 const g=new Grid(32,64);
 polygon(g,[[10,54],[22,54],[27,57],[26,60],[6,60],[5,57]],'f','d');
 g.poly([[10,55],[22,55],[24,57],[8,57]],'i').line(10,55,21,55,'j').line(9,59,24,59,'S');
 g.rect(14,17,5,39,'U').rect(15,18,3,37,'+').line(15,20,15,53,'Y');
 g.ellipse(16,52,4,2,'+').line(14,51,17,51,'Y');
 // 발 y60에서 80% 높이 = y8.8. 크림색 빛 중심을 y9에 맞춰요.
 polygon(g,[[11,3],[21,3],[28,18],[4,18]],'&','+');
 g.poly([[12,4],[15,4],[13,17],[6,17]],'W');g.poly([[19,4],[21,4],[26,17],[21,17]],'*');
 g.line(13,4,19,4,'?').line(12,7,11,11,'?');g.line(6,18,26,18,'Y');
 g.ellipse(16,18,11,2,'Y').ellipse(16,17,10,1,'y').line(12,17,20,17,'W');
 g.rect(15,1,3,2,'+').line(15,1,17,1,'Y');
 save('prop-floorlamp',g);
}
{
 const g=new Grid(32,32);
 // 높이는 y19..28의 10px뿐. 같은 발 기준점의 인형 뒤에 낮게 놓여요.
 polygon(g,[[8,19],[23,19],[29,22],[30,25],[25,28],[7,28],[2,25],[3,22]],'P','s');
 g.ellipse(16,22,12,3,'p').line(8,21,13,20,'W').line(14,20,20,20,'p');
 g.line(5,25,8,26,'R').line(24,26,27,25,'R');
 g.line(10,27,12,27,'p').line(20,27,22,27,'p');
 save('prop-cushion',g);
}

const colors=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const sw=650;let sh=12;const rows=drawn.map(({key,frames})=>{const r={key,frames,y:sh};sh+=frames[0].h*3+18;return r;});
const sheet=new PNG({width:sw,height:sh});for(let i=0;i<sheet.data.length;i+=4)sheet.data.set([38,44,59,255],i);
for(let y=0;y<sh;y++)for(let x=sw/2;x<sw;x++)sheet.data.set([255,244,210,255],(y*sw+x)*4);
for(const{frames,y:oy}of rows)for(const ox of[40,365])frames.forEach((g,f)=>g.rows.forEach((row,y)=>row.forEach((c,x)=>{if(c==='.')return;const rgb=[1,3,5].map(i=>parseInt(colors[c].slice(i,i+2),16));for(let dy=0;dy<3;dy++)for(let dx=0;dx<3;dx++)sheet.data.set([...rgb,255],((oy+y*3+dy)*sw+ox+(f*g.w+x)*3+dx)*4);})));
mkdirSync(root+'assets-preview/',{recursive:true});writeFileSync(root+'assets-preview/c13-1-furniture.png',PNG.sync.write(sheet));
console.log('C13-1 가구 5키 / 5프레임 생성');
