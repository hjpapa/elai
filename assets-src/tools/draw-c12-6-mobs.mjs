import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, root, saveHires, loadGrid } from './c12-common.mjs';

function oval(g,cx,cy,rx,ry,fill,edge){
 const mask=new Grid(g.w,g.h).ellipse(cx,cy,rx,ry,'W');
 for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++)if(mask.get(x,y)!=='.')
  g.set(x,y,[[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy])=>mask.get(x+dx,y+dy)==='.')?edge:fill);
 return g;
}
const colors=f=>f===3?{body:'C',light:'c',high:'q',shade:'I',edge:'F'}:{body:'V',light:'v',high:'p',shade:'N',edge:'O'};
function spot(g,x,y,r,f){
 oval(g,x,y,r,r,f===3?'q':'b',f===3?'o':'n');
 g.set(x-1,y-1,f===3?'W':'q');
}
function smallSlime(f){
 const g=new Grid(48,48),c=colors(f),stretch=f===1,faceY=stretch?-5:0;
 // 귀처럼 뻗은 돌기 두 개는 말랑한 몸과 같은 보라색으로 이어져요.
 polygon(g,stretch?[[9,24],[11,4],[17,11],[21,21]]:[[10,25],[10,6],[15,11],[21,23]],c.body,c.edge);
 polygon(g,stretch?[[27,22],[37,5],[39,26]]:[[27,24],[35,6],[39,26]],c.body,c.edge);
 g.line(12,11,14,19,c.light).line(35,12,35,20,c.light);
 // 대기 1은 키만 키우지 않고 왼쪽으로 늘어난 비대칭 실루엣으로 변해요.
 const shape=stretch?
  [[5,35],[7,23],[10,16],[16,10],[22,9],[29,12],[35,19],[39,27],[42,36],[40,40],[35,42],[27,43],[15,43],[8,41]]:
  [[4,33],[6,27],[11,22],[17,19],[27,19],[35,22],[40,27],[43,34],[42,38],[37,41],[29,43],[16,43],[8,41],[5,38]];
 polygon(g,shape,c.body,c.edge);
 g.poly(stretch?
  [[29,14],[34,20],[38,29],[40,36],[38,39],[33,41],[24,42],[19,40],[28,38],[33,33],[33,24]]:
  [[35,24],[39,29],[41,35],[39,38],[34,40],[26,42],[18,41],[28,38],[35,33]],c.shade);
 g.poly(stretch?
  [[9,23],[13,16],[18,12],[23,12],[26,15],[24,20],[18,21],[13,26],[10,27]]:
  [[8,28],[12,23],[18,21],[25,21],[28,24],[23,27],[17,27],[12,31],[9,31]],c.light);
 g.line(stretch?15:13,stretch?16:24,stretch?19:18,stretch?13:22,c.high);
 if(f===2){
  g.line(15,26,19,29,'O').line(19,29,15,32,'O');
  g.line(32,26,28,29,'O').line(28,29,32,32,'O');
  oval(g,24,35,2,1,c.light,c.edge);
 }else if(f===3){
  g.line(14,29,17,26,'F').line(17,26,20,29,'F');
  g.line(27,29,30,26,'F').line(30,26,33,29,'F');
  g.line(21,33,23,35,'F').line(23,35,26,33,'F');
  g.rect(11,31,3,1,'p').rect(33,31,3,1,'p');
 }else{
  g.rect(16,26+faceY,2,5,'O').set(16,26+faceY,'?');
  g.rect(29,26+faceY,2,5,'O').set(29,26+faceY,'?');
  g.line(22,34+faceY,25,34+faceY,'O').set(26,33+faceY,'O');
 }
 spot(g,12,36,2,f);spot(g,34,34,2,f);spot(g,27,39,2,f);
 return g;
}
function king(f){
 const g=new Grid(96,96),c=colors(f),stretch=f===1,faceY=stretch?-9:0;
 polygon(g,stretch?[[18,49],[20,7],[29,17],[41,43]]:[[19,51],[19,9],[28,18],[42,47]],c.body,c.edge);
 polygon(g,stretch?[[54,44],[75,8],[79,52]]:[[53,49],[72,9],[78,53]],c.body,c.edge);
 g.poly([[22,18],[27,23],[33,40],[26,37]],c.light);
 g.poly([[70,21],[72,18],[73,40],[65,43]],c.light);
 g.line(23,21,26,28,c.high).line(72,25,72,32,c.high);
 const shape=stretch?
  [[9,73],[12,51],[18,35],[29,23],[39,18],[51,19],[63,26],[72,39],[79,54],[86,72],[85,80],[78,87],[65,90],[48,91],[31,90],[18,87],[11,81]]:
  [[8,70],[11,58],[20,48],[31,41],[42,38],[56,38],[69,43],[80,53],[86,64],[88,75],[84,82],[76,87],[63,90],[46,91],[29,90],[17,86],[10,80]];
 polygon(g,shape,c.body,c.edge);
 // 하단 오른쪽 그림자는 세로 띠보다 넓은 덩어리로 묶어 젤의 부피를 보여 줘요.
 g.poly(stretch?
  [[61,27],[70,40],[76,55],[82,72],[81,79],[74,85],[61,88],[43,89],[34,86],[51,82],[63,73],[68,60],[67,43]]:
  [[69,45],[79,55],[84,66],[86,75],[81,81],[73,85],[61,88],[43,89],[32,86],[48,82],[64,76],[73,65]],c.shade);
 g.poly(stretch?
  [[18,47],[24,35],[33,26],[40,22],[49,23],[54,29],[50,35],[40,36],[29,45],[24,53],[19,53]]:
  [[16,58],[22,49],[32,44],[42,41],[51,42],[57,47],[53,53],[42,54],[30,59],[22,65],[17,64]],c.light);
 g.poly(stretch?
  [[27,36],[34,28],[40,25],[46,25],[43,29],[36,32],[31,38]]:
  [[23,51],[32,46],[41,44],[46,45],[42,48],[34,49],[27,54]],c.high);
 if(f===2){
  g.line(30,52,39,58,'O').line(39,58,30,64,'O');
  g.line(66,52,57,58,'O').line(57,58,66,64,'O');
  oval(g,48,70,4,2,c.light,c.edge);
 }else if(f===3){
  g.line(28,57,35,50,'F').line(35,50,42,57,'F');
  g.line(54,57,61,50,'F').line(61,50,68,57,'F');
  g.line(41,65,45,69,'F').line(45,69,50,69,'F').line(50,69,55,65,'F');
  g.rect(26,62,5,2,'p').rect(65,62,5,2,'p');
 }else{
  g.rect(33,52+faceY,4,9,'O').rect(33,52+faceY,2,2,'?');
  g.rect(60,52+faceY,4,9,'O').rect(60,52+faceY,2,2,'?');
  g.line(43,68+faceY,51,68+faceY,'O').line(51,68+faceY,54,65+faceY,'O');
 }
 spot(g,26,72,5,f);spot(g,70,67,5,f);spot(g,59,78,4,f);
 // 원본의 아래 금색 띠와 가운데 밝은 장식으로 대장을 구분해요.
 polygon(g,[[34,82],[41,84],[54,84],[62,82],[62,86],[54,88],[41,88],[34,86]],'Y','Q');
 g.line(36,84,42,86,'y').line(42,86,53,86,'y').line(54,86,60,84,'y');
 polygon(g,[[48,78],[52,82],[48,86],[44,82]],'W','+');
 g.set(48,80,'?').line(48,84,50,82,'*');
 return g;
}
const drawn=[
 saveHires('mob-shift-slime',[0,1,2,3].map(smallSlime)),
 saveHires('boss-shift-king',[0,1,2,3].map(king)),
];
const colorsMap=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors,rgb=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
const p=new PNG({width:1648,height:352});for(let i=0;i<p.data.length;i+=4)p.data.set([...rgb(colorsMap.S),255],i);
function paste(g,ox,oy,s){for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.get(x,y);if(c==='.')continue;for(let dy=0;dy<s;dy++)for(let dx=0;dx<s;dx++)p.data.set([...rgb(colorsMap[c]),255],((oy+y*s+dy)*p.width+ox+x*s+dx)*4);}}
let y=16;for(const e of drawn){loadGrid(e.key,false).forEach((g,f)=>paste(g,16+f*g.w*4,y,4));e.frames.forEach((g,f)=>paste(g,848+f*g.w*2,y,2));y+=e.frames[0].h*2+24;}
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c12-6-mobs.png',PNG.sync.write(p));
console.log('C12-6 연구소 몹 2키 8프레임 작성 완료');
