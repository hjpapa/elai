import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, root, polygon, rounded, saveHires, loadGrid } from './c12-common.mjs';

// C14-1. 같은 마을 지붕 시점과 중앙 문을 쓰는 파란 택배소예요.
// 발 기준점 (32,92), 프레임0 낡고 닫힘 / 프레임1 수리되어 열림이에요.
function office(open){
 const g=new Grid(64,96),wall=open?'j':'i',front=open?'a':'A',side=open?'i':'f';
 const roof=open?'B':'f',roofLight=open?'b':'A',roofShade=open?'N':'S',roofEdge=open?'m':'d';
 const wood=open?'T':'X',woodLight=open?'Z':'T',glass=open?'y':'S';
 // C13처럼 앞 모서리를 깎아 문과 문턱이 화면 아래 가운데를 향해요.
 polygon(g,[[6,46],[24,55],[24,86],[6,77]],wall,'d');
 polygon(g,[[24,55],[41,55],[41,86],[24,86]],front,'d');
 polygon(g,[[41,55],[59,46],[59,77],[41,86]],side,'d');
 g.line(7,49,7,74,open?'?':'a').line(23,57,23,83,open?'i':'f').line(42,57,42,81,open?'f':'S');
 // 밝은 왼쪽 면, 푸른 오른쪽 면의 낮은 석재 기단이에요.
 polygon(g,[[6,74],[24,83],[24,86],[6,77]],open?'i':'f','d');
 polygon(g,[[24,83],[41,83],[41,86],[24,86]],'f','d');
 polygon(g,[[41,83],[59,74],[59,77],[41,86]],open?'f':'S','d');
 g.line(8,75,23,82,open?'j':'i').line(42,83,57,75,open?'i':'f');
 // 회벽 사이 목재와 파란 창턱은 공방의 분홍 장식과 구별돼요.
 g.line(8,52,8,74,wood).line(9,53,9,73,woodLight).line(22,61,22,81,'U');
 g.line(9,69,21,75,open?'a':'f').line(10,70,20,75,open?'j':'i');
 polygon(g,[[11,58],[19,62],[19,72],[11,68]],'U','Q');
 g.poly([[12,60],[18,63],[18,70],[12,67]],glass);
 g.line(13,61,13,66,open?'W':'A').line(15,62,15,68,wood).line(12,64,18,67,wood);
 polygon(g,[[10,68],[20,73],[20,75],[10,70]],roof,roofEdge);g.line(11,69,18,72,roofLight);
 // 옆면의 넓은 창 안에는 장난감 대신 포장 상자가 보여요.
 polygon(g,[[40,60],[57,51],[57,74],[40,83]],'U','Q');
 g.poly([[42,61],[55,54],[55,72],[42,79]],glass);
 g.poly([[43,62],[47,60],[47,74],[43,76]],open?'&':'f');
 g.poly([[51,57],[54,55],[54,70],[51,72]],open?'Y':'d');
 // 아래 상자: 윗면·앞면·옆면을 나누고 빈 주소 칸만 남겨요.
 polygon(g,[[43,69],[47,67],[51,69],[47,71]],open?'t':'X','U');
 polygon(g,[[43,69],[47,71],[47,76],[43,74]],open?'T':'U','E');
 polygon(g,[[47,71],[51,69],[51,74],[47,76]],open?'X':'E','E');
 g.line(45,70,45,74,open?'W':'i').set(44,69,open?'Z':'T');
 // 위쪽 작은 상자도 글자 없는 종이 테이프만 보여요.
 polygon(g,[[49,62],[52,60],[55,62],[52,64]],open?'t':'X','U');
 polygon(g,[[49,62],[52,64],[52,69],[49,67]],open?'T':'U','E');
 polygon(g,[[52,64],[55,62],[55,67],[52,69]],open?'X':'E','E');
 g.line(50,63,50,66,open?'W':'i').set(52,62,open?'Z':'T');
 g.line(42,77,55,70,wood).line(43,78,55,72,woodLight);
 g.line(48,60,48,66,wood).line(49,59,49,62,woodLight);
 g.line(43,62,46,60,open?'?':'A').line(52,58,54,57,open?'W':'i');
 polygon(g,[[39,82],[58,73],[58,76],[39,85]],roof,roofEdge);g.line(40,82,56,74,roofLight);
 // 가운데 나무 문. 고쳐진 프레임은 문짝이 바깥으로 젖혀져 빈 통로가 보여요.
 rounded(g,24,64,17,24,wood,'U');g.line(26,65,37,65,woodLight).line(25,67,25,85,open?'t':'X');
 rounded(g,27,67,11,19,'Q','Q');
 if(open){
  g.rect(28,68,9,16,'Q').poly([[33,69],[36,69],[36,78],[33,76]],'U');
  g.line(36,69,36,79,'Y').line(35,70,35,76,'+');
  g.poly([[31,78],[36,78],[36,84],[28,84]],'X').line(30,81,36,81,'T').line(28,84,36,84,'Z');
  polygon(g,[[27,68],[23,71],[23,86],[27,83]],'T','U');g.line(24,72,24,83,'Z').set(24,78,'Y');
 }else{
  g.rect(28,68,9,16,'U').line(29,69,29,82,'X').line(32,69,32,83,'E').line(35,69,35,83,'E');
  rounded(g,29,69,6,7,'f','U');g.line(30,70,33,70,'A').line(30,71,30,73,'i');
  g.rect(35,78,2,2,'+').set(35,78,'Y');g.line(28,81,31,82,'E');
 }
 polygon(g,[[25,85],[40,85],[43,88],[39,91],[25,91],[21,88]],open?'i':'f','d');
 g.line(24,88,40,88,open?'j':'i').line(25,89,39,89,open?'a':'A').line(26,90,37,90,'f');
 if(open)g.line(28,86,37,86,'t');
 // C11 집과 같은 앞 박공 / 오른쪽 긴 지붕. 바랜 회청색에서 맑은 파랑으로 바뀌어요.
 polygon(g,[[3,47],[18,25],[34,63]],wood,'Q');
 g.poly([[7,47],[18,31],[29,58]],open?'j':'i');g.line(18,33,18,51,'X').line(9,46,27,55,'X');
 polygon(g,[[14,44],[18,39],[23,48],[23,52],[14,48]],'U','Q');
 g.poly([[16,44],[18,42],[21,47],[21,49],[16,47]],open?'y':'f').set(18,44,open?'W':'A');
 polygon(g,[[18,25],[42,13],[61,49],[34,63]],roof,roofEdge);
 g.poly([[19,25],[42,14],[47,24],[24,36]],roofLight);
 g.poly([[24,36],[47,24],[57,43],[34,56]],roof);
 g.poly([[34,56],[58,44],[61,49],[34,63]],roofShade);
 g.line(18,24,42,12,open?'q':'i').line(17,25,33,60,roofLight);
 g.line(3,47,17,25,roofLight).line(3,48,33,64,'Q').line(34,64,61,50,roofEdge);
 for(const[x0,y0,x1,y1]of[[22,33,45,21],[26,42,50,29],[30,50,54,38],[34,58,58,46]])g.line(x0,y0,x1,y1,roofShade);
 for(const[x0,y0,x1,y1]of[[30,29,34,37],[39,25,43,33],[35,38,39,45],[45,34,49,41],[39,47,43,54],[50,42,54,49]])g.line(x0,y0,x1,y1,roofLight);
 polygon(g,[[46,18],[53,21],[53,38],[46,35]],'f','d');polygon(g,[[43,20],[46,18],[46,35],[43,37]],open?'i':'A','d');
 polygon(g,[[42,19],[46,17],[54,20],[50,22]],open?'j':'i','d');g.line(45,20,48,21,'d').line(47,28,52,30,'d').line(44,29,45,28,'a');
 // 낡은 때에는 금 두 곳과 바랜 기와만 있어요. 잔해나 무서운 흔적은 없어요.
 if(!open){
  g.line(30,39,32,41,'d').line(32,41,31,44,'d');
  g.poly([[39,31],[42,30],[44,33],[41,34]],'A');
  g.line(11,73,13,74,'f').line(13,74,12,77,'f');
 }
 // 문 위 상자 간판. 세 면과 종이 띠로 읽히며 글자·브랜드·돈 표시는 없어요.
 g.line(24,53,25,57,'d').line(39,56,38,58,'d').set(24,53,open?'i':'f');
 rounded(g,24,56,17,9,open?'a':'i',roofEdge);g.line(26,57,37,57,open?'j':'a');
 polygon(g,[[27,58],[32,55],[37,58],[32,61]],open?'t':'X','U');
 polygon(g,[[27,58],[32,61],[32,65],[27,62]],open?'T':'U','E');
 polygon(g,[[32,61],[37,58],[37,62],[32,65]],open?'X':'E','E');
 g.line(29,57,34,60,open?'W':'i').line(29,60,29,63,open?'Z':'A').set(30,62,open?'W':'i');
 return g;
}
const result=saveHires('prop-parcel-office',[office(false),office(true)]);
// 왼쪽부터 C11 집·C13 공방·택배소 낡음·택배소 수리, 아래는 같은 바닥 접지예요.
const palette=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const frames=[loadGrid('prop-house')[1],loadGrid('prop-workshop')[1],...result.frames],width=1116,height=640,png=new PNG({width,height});
for(let i=0;i<png.data.length;i+=4)png.data.set([38,44,59,255],i);
function draw(g,ox,oy,scale){for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.get(x,y);if(c==='.')continue;const rgb=[1,3,5].map(i=>parseInt(palette[c].slice(i,i+2),16));for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++)png.data.set([...rgb,255],(((oy+y*scale+dy)*width)+ox+x*scale+dx)*4);}}
frames.forEach((g,i)=>draw(g,12+i*276,8,4));
const path=loadGrid('tile-path')[0];for(let i=0;i<4;i++){const x=70+i*276;draw(path,x,568,2);draw(frames[i],x,416,2);}
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c14-1-office.png',PNG.sync.write(png));
console.log('C14-1 prop-parcel-office: 64×96×2, 낡은 닫힘/고친 열림, 마을 건물 비교·접지 검토판 완료');
