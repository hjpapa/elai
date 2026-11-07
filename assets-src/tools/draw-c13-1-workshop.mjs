import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, root, polygon, rounded, saveHires, loadGrid } from './c12-common.mjs';

// C13-1. C11 집의 앞 박공/오른쪽 긴 지붕을 잇는 작은 인형 공방이에요.
// 그림자는 넣지 않고 64×96 한 프레임의 발 기준점 (32,92)을 유지해요.
function workshop(open){
 const g=new Grid(64,96);
 // 앞 모서리를 살짝 깎아 문이 화면 아래 가운데를 향하게 해요.
 polygon(g,[[6,46],[24,55],[24,86],[6,77]],'&','U');
 polygon(g,[[24,55],[41,55],[41,86],[24,86]],'Z','U');
 polygon(g,[[41,55],[59,46],[59,77],[41,86]],'*','U');
 g.line(7,49,7,74,'?').line(23,57,23,83,'T').line(42,57,42,81,'X');
 // 창과 출입구를 받치는 낮은 석재 기단이에요.
 polygon(g,[[6,74],[24,83],[24,86],[6,77]],'i','d');
 polygon(g,[[24,83],[41,83],[41,86],[24,86]],'f','d');
 polygon(g,[[41,83],[59,74],[59,77],[41,86]],'f','d');
 g.line(8,75,23,82,'j').line(42,83,57,75,'i');
 // 왼쪽 밝은 벽의 목재 기둥과 작은 창. 면의 기울기는 C11 집과 같아요.
 g.line(8,52,8,74,'X').line(9,53,9,73,'t').line(22,61,22,81,'U');
 g.line(9,69,21,75,'T').line(10,70,20,75,'Z');
 polygon(g,[[11,58],[19,62],[19,72],[11,68]],'U','Q');
 g.poly([[12,60],[18,63],[18,70],[12,67]],open?'y':'o');
 g.line(13,61,13,66,open?'W':'q').line(15,62,15,68,'T').line(12,64,18,67,'T');
 polygon(g,[[10,68],[20,73],[20,75],[10,70]],'P','U');g.line(11,69,18,72,'p');
 // 오른쪽 큰 진열창. 빛은 유리 안의 색으로만 나타내고 바깥 번짐은 그리지 않아요.
 polygon(g,[[40,60],[57,51],[57,74],[40,83]],'U','Q');
 g.poly([[42,61],[55,54],[55,72],[42,79]],open?'y':'n');
 g.poly([[43,62],[47,60],[47,74],[43,76]],open?'&':'o');
 g.poly([[51,57],[54,55],[54,70],[51,72]],open?'Y':'B');
 // 진열대 안의 작은 로비 인형과 둥근 잎 인형: 얼굴과 재질만 간결히 표시해요.
 g.line(45,65,45,62,open?'Y':'A').set(45,62,open?'y':'i');
 rounded(g,43,65,6,5,open?'j':'i','d');g.rect(44,66,4,2,'N').set(44,66,open?'c':'b').set(47,66,open?'c':'b');
 g.rect(44,70,4,4,open?'a':'f').set(45,71,open?'C':'B');
 g.ellipse(52,66,2,3,open?'c':'C').line(51,62,53,61,open?'L':'I');g.set(51,65,'G').set(53,65,'G').set(52,67,open?'W':'c');
 g.line(42,76,55,69,open?'T':'S');g.line(43,77,55,71,open?'Z':'i');
 // 창살은 인형 얼굴을 가르지 않고 가운데의 빈 틈을 지나가요.
 g.line(49,59,49,75,'X').line(50,59,50,74,'t');
 g.line(43,62,46,60,open?'?':'q').line(52,58,54,57,open?'W':'b');
 polygon(g,[[39,82],[58,73],[58,76],[39,85]],'P','U');g.line(40,82,56,74,'p');
 // 가운데 문틀과 닫힌 나무문/열린 입구. 손잡이는 닫힌 문에만 보여요.
 rounded(g,24,64,17,24,'T','U');g.line(26,65,37,65,'Z').line(25,67,25,85,'t');
 rounded(g,27,67,11,19,open?'Q':'U','Q');
 if(open){
  // 어두운 문 안쪽, 따뜻한 마루, 바깥으로 기울어진 문짝으로 열림이 읽혀요.
  g.rect(28,68,9,16,'Q');g.poly([[33,69],[36,69],[36,78],[33,76]],'U');
  g.line(36,69,36,79,'Y').line(35,70,35,76,'+');
  g.poly([[31,78],[36,78],[36,84],[28,84]],'X');g.line(30,81,36,81,'T').line(28,84,36,84,'Z');
  polygon(g,[[27,68],[23,71],[23,86],[27,83]],'X','U');g.line(24,72,24,83,'T').set(24,78,'Y');
 }else{
  g.rect(28,68,9,16,'X').line(29,69,29,82,'T').line(32,69,32,83,'U').line(35,69,35,83,'U');
  rounded(g,29,69,6,7,'o','U');g.line(30,70,33,70,'q').line(30,71,30,73,'b');
  g.rect(35,78,2,2,'Y').set(35,78,'y');
 }
 // 문턱 아래 두 계단의 마지막 행은 y91이에요. 발밑 그림자와 구별돼요.
 polygon(g,[[25,85],[40,85],[43,88],[39,91],[25,91],[21,88]],'i','d');
 g.line(24,88,40,88,'j').line(25,89,39,89,'a').line(26,90,37,90,'f');
 if(open)g.line(28,86,37,86,'t');
 // C11 집과 같은 박공/긴 지붕 시점. 분홍 기와가 공방을 구별해요.
 polygon(g,[[3,47],[18,25],[34,63]],'T','Q');
 g.poly([[7,47],[18,31],[29,58]],'&');g.line(18,33,18,51,'X').line(9,46,27,55,'X');
 polygon(g,[[14,44],[18,39],[23,48],[23,52],[14,48]],'U','Q');
 g.poly([[16,44],[18,42],[21,47],[21,49],[16,47]],open?'y':'b');g.set(18,44,open?'W':'q');
 polygon(g,[[18,25],[42,13],[61,49],[34,63]],'P','s');
 g.poly([[19,25],[42,14],[47,24],[24,36]],'p');
 g.poly([[24,36],[47,24],[57,43],[34,56]],'P');
 g.poly([[34,56],[58,44],[61,49],[34,63]],'R');
 g.line(18,24,42,12,'p').line(17,25,33,60,'p');
 g.line(3,47,17,25,'p').line(3,48,33,64,'Q').line(34,64,61,50,'s');
 for(const [x0,y0,x1,y1]of[[22,33,45,21],[26,42,50,29],[30,50,54,38],[34,58,58,46]])g.line(x0,y0,x1,y1,'R');
 for(const [x0,y0,x1,y1]of[[30,29,34,37],[39,25,43,33],[35,38,39,45],[45,34,49,41],[39,47,43,54],[50,42,54,49]])g.line(x0,y0,x1,y1,'p');
 // 작은 환기 굴뚝은 같은 회색 재질이며 연기나 빛 번짐은 없어요.
 polygon(g,[[46,18],[53,21],[53,38],[46,35]],'f','d');polygon(g,[[43,20],[46,18],[46,35],[43,37]],'i','d');
 polygon(g,[[42,19],[46,17],[54,20],[50,22]],'j','d');g.line(45,20,48,21,'d').line(47,28,52,30,'d').line(44,29,45,28,'a');
 // 문 바로 위, 작은 나무판에 로비 천 인형의 실루엣을 걸어요.
 g.line(24,53,25,57,'d').line(39,56,38,58,'d').set(24,53,'i');
 rounded(g,24,56,17,9,'T','U');g.line(26,57,37,57,'Z').line(25,59,25,62,'t');
 g.line(31,56,31,58,'Y').set(31,56,'y');
 rounded(g,28,58,9,5,'a','d');g.rect(29,59,7,2,'N').set(30,59,'c').set(34,59,'c');
 g.rect(30,63,5,2,'C').set(30,63,'c');g.set(28,62,'i').set(36,62,'f');
 return g;
}
const result=saveHires('prop-workshop',[workshop(false),workshop(true)]);
// 위: C11 수리된 집, 닫힌 공방, 열린 공방 ×4. 아래: 같은 순서를 바닥 위 ×2로 확인해요.
const palette=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const frames=[loadGrid('prop-house')[1],...result.frames],width=840,height=640,png=new PNG({width,height});
for(let i=0;i<png.data.length;i+=4)png.data.set([38,44,59,255],i);
function draw(g,ox,oy,scale){for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.get(x,y);if(c==='.')continue;const rgb=[1,3,5].map(i=>parseInt(palette[c].slice(i,i+2),16));for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++)png.data.set([...rgb,255],(((oy+y*scale+dy)*width)+ox+x*scale+dx)*4);}}
frames.forEach((g,i)=>draw(g,12+i*276,8,4));
const grass=loadGrid('tile-grass')[0],path=loadGrid('tile-path')[0];
for(let i=0;i<3;i++){const x=70+i*276;draw(grass,x,568,2);draw(path,x,568,2);draw(frames[i],x,416,2);}
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c13-1-workshop.png',PNG.sync.write(png));
console.log('C13-1 prop-workshop: 64×96×2, 문 닫힘/열림, 집 비교·접지 검토판 완료');
