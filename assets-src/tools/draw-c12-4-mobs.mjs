import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, root, saveHires, loadGrid } from './c12-common.mjs';

function oval(g,cx,cy,rx,ry,fill,edge){
 const mask=new Grid(g.w,g.h).ellipse(cx,cy,rx,ry,'W');
 for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++)if(mask.get(x,y)!=='.')
  g.set(x,y,[[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy])=>mask.get(x+dx,y+dy)==='.')?edge:fill);
 return g;
}
function colors(f){return f===3?{body:'C',light:'c',high:'q',shade:'I',edge:'F'}:{body:'T',light:'t',high:'Z',shade:'X',edge:'Q'};}
function smallLizard(f){
 const g=new Grid(48,48),b=f===1?-2:0,c=colors(f),tail=f===1?-3:0;
 // 뒤로 말린 꼬리는 아래로 갈수록 두꺼워져 몸통에 자연스럽게 이어져요.
 polygon(g,[[20,32+b],[17,38],[10,39],[5,36],[3,31],[4,25+tail],[7,21+tail],[11,21+tail],[14,25+tail],[12,29+tail],[9,28+tail],[9,25+tail],[7,27+tail],[7,31],[10,34],[15,34],[18,30+b]],c.body,c.edge);
 g.line(6,26+tail,8,23+tail,c.light).line(8,23+tail,10,23+tail,c.high);
 g.line(6,32,9,36,c.shade).line(9,36,14,36,c.shade);
 oval(g,24,33+b,12,8,c.body,c.edge);
 g.poly([[16,30+b],[20,27+b],[27,28+b],[27,32+b],[21,34+b],[17,34+b]],c.light);
 g.poly([[31,30+b],[35,33+b],[33,38+b],[28,40+b],[24,39+b],[30,36+b]],c.shade);
 // 발은 y44 바로 위에 놓고 바닥 그림자는 넣지 않아요.
 polygon(g,[[19,37],[23,37],[23,41],[25,42],[25,43],[17,43],[17,41]],c.body,c.edge);
 polygon(g,[[30,36],[34,37],[35,40],[38,42],[38,43],[29,43],[28,41]],c.body,c.edge);
 g.line(19,41,22,41,c.light).line(31,41,35,42,c.light);
 oval(g,29,20+b,12,11,c.light,c.edge);
 g.poly([[20,16+b],[24,11+b],[31,11+b],[34,14+b],[28,15+b],[23,19+b]],c.high);
 g.poly([[37,17+b],[40,21+b],[38,27+b],[33,30+b],[29,29+b],[34,25+b]],c.body);
 oval(g,37,27+b,7,4,c.light,c.edge);
 g.line(34,25+b,39,25+b,c.high).set(41,26+b,c.edge);
 if(f===2){
  g.line(25,17,29,21,'Q').line(29,21,25,24,'Q');
  oval(g,36,29,2,1,c.light,'Q');
 }else if(f===3){
  g.line(24,21,28,17,'F').line(28,17,32,21,'F');
  g.line(34,29,41,29,'F').set(40,30,'F');
  g.rect(29,25,3,2,'p');
 }else{
  oval(g,27,19+b,4,5,'W',c.edge);
  g.rect(28,17+b,2,5,'O').set(28,17+b,'?');
  g.line(34,29+b,41,29+b,c.edge);
 }
 // 두 조각의 큰 비늘만 남겨 멀리서도 맑은 몸색으로 보여요.
 g.poly([[20,32+b],[23,30+b],[24,33+b]],f===3?'q':'Y');
 g.poly([[25,36+b],[28,34+b],[29,37+b]],f===3?'c':'y');
 return g;
}
function chief(f){
 const g=new Grid(96,96),b=f===1?-2:0,c=colors(f),tail=f===1?-5:0;
 polygon(g,[[38,65+b],[31,77],[22,80],[13,78],[7,72],[5,62],[8,53+tail],[14,46+tail],[22,45+tail],[28,51+tail],[28,58+tail],[23,62+tail],[18,59+tail],[18,54+tail],[15,55+tail],[12,62],[13,68],[19,72],[27,70],[34,61+b]],c.body,c.edge);
 g.poly([[10,59+tail],[13,51+tail],[19,48+tail],[24,51+tail],[25,55+tail],[21,56+tail],[21,51+tail],[16,51+tail],[13,57+tail]],c.light);
 g.line(14,51+tail,18,49+tail,c.high);
 g.poly([[9,66],[14,72],[22,75],[28,73],[28,77],[21,79],[13,76]],c.shade);
 oval(g,48,69+b,24,16,c.body,c.edge);
 g.poly([[28,63+b],[35,56+b],[45,54+b],[53,58+b],[50,64+b],[40,66+b],[33,72+b],[28,71+b]],c.light);
 g.poly([[61,58+b],[68,63+b],[71,72+b],[66,80+b],[55,84+b],[47,83+b],[58,77+b],[62,70+b]],c.shade);
 // 짧은 두 발과 작은 발가락이 왕관보다 과하게 커 보이지 않게 해요.
 polygon(g,[[36,77],[44,77],[45,85],[49,88],[48,91],[31,91],[31,87],[35,84]],c.body,c.edge);
 polygon(g,[[58,76],[65,78],[66,84],[73,88],[75,91],[56,91],[54,87]],c.body,c.edge);
 g.line(34,88,42,87,c.light).line(58,87,67,89,c.light);
 g.line(36,90,36,88,c.shade).line(62,90,62,88,c.shade);
 oval(g,59,38+b,24,21,c.light,c.edge);
 g.poly([[39,31+b],[45,22+b],[54,18+b],[63,19+b],[70,23+b],[65,28+b],[55,28+b],[45,34+b]],c.high);
 g.poly([[76,28+b],[81,36+b],[80,46+b],[73,54+b],[64,58+b],[58,56+b],[69,48+b],[73,39+b]],c.body);
 // 목띠는 옛 청록 장식을 유지하고, 정화 뒤에도 짙은 테두리로 구분돼요.
 polygon(g,[[39,55+b],[55,56+b],[61,59+b],[60,64+b],[54,67+b],[39,64+b]],'C','F');
 g.poly([[41,57+b],[51,58+b],[57,60+b],[54,62+b],[41,61+b]],'c');
 g.rect(42,58+b,3,2,'q');
 oval(g,75,53+b,15,8,c.light,c.edge);
 g.poly([[64,50+b],[68,47+b],[79,47+b],[86,51+b],[82,53+b],[72,52+b]],c.high);
 g.line(68,59+b,84,59+b,c.edge).set(84,57+b,c.edge);
 g.rect(83,50+b,2,2,c.edge);
 if(f===2){
  g.line(48,34,55,40,'Q').line(55,40,48,46,'Q');
  oval(g,76,58,3,2,c.light,'Q');
 }else if(f===3){
  g.line(47,41,53,35,'F').line(53,35,59,41,'F');
  g.line(69,59,82,59,'F').line(72,62,79,62,'F');
  g.rect(57,48,5,3,'p');
 }else{
  oval(g,53,37+b,8,9,'W',c.edge);
  g.rect(55,33+b,4,9,'O').rect(55,33+b,2,2,'?');
 }
 // 작은 왕관의 세 꼭짓점과 가운데 보석이 대장임을 알려 줘요.
 polygon(g,[[40,24+b],[43,8+b],[49,15+b],[55,7+b],[61,16+b],[69,7+b],[72,25+b]],'Y','Q');
 g.poly([[43,12+b],[47,18+b],[54,12+b],[55,21+b],[44,21+b]],'y');
 g.line(43,23+b,68,23+b,'+').line(46,21+b,66,21+b,'W');
 g.rect(55,18+b,4,4,'C').set(55,18+b,'c');
 // 팔은 배를 따라 짧게 내려오며 발톱을 크게 그리지 않아요.
 polygon(g,[[61,68+b],[66,69+b],[68,75+b],[65,79+b],[60,77+b]],c.body,c.edge);
 g.line(63,70+b,64,74+b,c.light);
 g.poly([[37,66+b],[42,62+b],[44,68+b]],f===3?'q':'Y');
 g.poly([[45,75+b],[50,71+b],[53,77+b]],f===3?'c':'y');
 return g;
}
const drawn=[
 saveHires('mob-mirage-lizard',[0,1,2,3].map(smallLizard)),
 saveHires('boss-lizard-chief',[0,1,2,3].map(chief)),
];
const colorsMap=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors,rgb=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
const p=new PNG({width:1648,height:352});for(let i=0;i<p.data.length;i+=4)p.data.set([...rgb(colorsMap.S),255],i);
function paste(g,ox,oy,s){for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.get(x,y);if(c==='.')continue;for(let dy=0;dy<s;dy++)for(let dx=0;dx<s;dx++)p.data.set([...rgb(colorsMap[c]),255],((oy+y*s+dy)*p.width+ox+x*s+dx)*4);}}
let y=16;for(const e of drawn){loadGrid(e.key,false).forEach((g,f)=>paste(g,16+f*g.w*4,y,4));e.frames.forEach((g,f)=>paste(g,848+f*g.w*2,y,2));y+=e.frames[0].h*2+24;}
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c12-4-mobs.png',PNG.sync.write(p));
console.log('C12-4 도마뱀2키 8프레임 작성 완료');
