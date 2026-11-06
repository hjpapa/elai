import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, root, saveHires, loadGrid } from './c12-common.mjs';

function oval(g,cx,cy,rx,ry,fill,edge){
 const mask=new Grid(g.w,g.h).ellipse(cx,cy,rx,ry,'W');
 for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++)if(mask.get(x,y)!=='.')
  g.set(x,y,[[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy])=>mask.get(x+dx,y+dy)==='.')?edge:fill);
 return g;
}
function jelly(f){
 const g=new Grid(48,48),b=f===1?-2:0;
 const c=f===3?{body:'c',light:'q',high:'W',shade:'C',deep:'I',edge:'F'}:{body:'b',light:'q',high:'W',shade:'o',deep:'n',edge:'m'};
 // 네 촉수는 서로 겹치지 않는 굽이로 그리고 끝은 바닥 기준 위에 맞춰요.
 for(const [x,dir,tip] of [[11,-1,42],[19,1,43],[28,-1,43],[36,1,42]]){
  const bend=dir*(f===1?3:1),end=x+dir*2;
  polygon(g,[[x-2,27+b],[x+2,27+b],[x+2+bend,34],[x+bend,38],[end+1,tip-2],[end,tip],[end-3,tip],[end-4,tip-2],[x-2+bend,37],[x-2+bend,34]],c.shade,c.edge);
  g.line(x,29+b,x+bend,34,c.light).line(x+bend,34,x-1+bend,37,c.light);
  g.set(end-2,tip-1,c.light);
 }
 // 우산처럼 퍼지는 둥근 머리와 낮은 물결 가장자리가 해파리의 실루엣이에요.
 polygon(g,[[5,26+b],[6,19+b],[9,13+b],[14,8+b],[20,5+b],[27,5+b],[34,8+b],[39,13+b],[42,20+b],[43,27+b],[40,31+b],[35,32+b],[31,30+b],[27,32+b],[22,31+b],[18,32+b],[13,30+b],[9,31+b],[6,29+b]],c.body,c.edge);
 g.poly([[31,8+b],[37,13+b],[40,19+b],[41,26+b],[38,29+b],[35,29+b],[34,26+b],[36,20+b],[34,14+b]],c.shade);
 g.poly([[8,24+b],[14,26+b],[20,26+b],[26,28+b],[34,26+b],[40,26+b],[38,29+b],[34,30+b],[31,28+b],[27,30+b],[23,29+b],[18,30+b],[13,28+b],[9,29+b]],c.shade);
 g.poly([[10,17+b],[13,12+b],[20,8+b],[26,7+b],[29,9+b],[27,12+b],[20,13+b],[15,17+b],[12,19+b]],c.light);
 g.line(14,12+b,18,10+b,c.high).line(19,9+b,24,9+b,c.high);
 // 얇은 내부 굴곡 두 개만 넣어 유리 같은 몸통을 복잡하게 채우지 않아요.
 g.line(10,20+b,9,23+b,c.light).line(37,22+b,37,24+b,c.deep);
 if(f===2){
  g.line(15,19,18,22,'O').line(18,22,15,24,'O');
  g.line(31,19,28,22,'O').line(28,22,31,24,'O');
  oval(g,24,26,2,1,c.light,c.edge);
 }else if(f===3){
  g.line(14,22,17,19,'F').line(17,19,20,22,'F');
  g.line(27,22,30,19,'F').line(30,19,33,22,'F');
  g.line(21,25,23,27,'F').line(23,27,26,25,'F');
  g.rect(12,24,3,1,'p').rect(32,24,3,1,'p');
 }else{
  g.rect(16,19+b,2,5,'O').set(16,19+b,'W');
  g.rect(29,19+b,2,5,'O').set(29,19+b,'W');
  g.line(22,26+b,25,26+b,c.edge).set(26,25+b,c.edge);
 }
 return g;
}
function octo(f){
 const g=new Grid(96,96),b=f===1?-2:0,swing=f===1?4:0;
 const c=f===3?{body:'C',light:'c',high:'q',shade:'I',edge:'F'}:{body:'P',light:'p',high:'k',shade:'V',edge:'O'};
 // 양쪽 바깥 촉수가 말린 끝을 보여 주며 책 뒤로 이어져요.
 polygon(g,[[27,52+b],[18,54+b],[13,60+swing],[10,67+swing],[7,70+swing],[7,77+swing],[11,82+swing],[18,82+swing],[23,78+swing],[23,73+swing],[19,70+swing],[15,72+swing],[15,76+swing],[12,75+swing],[13,70+swing],[19,64+swing],[28,63+b]],c.body,c.edge);
 g.line(18,59+swing,15,64+swing,c.light).line(12,70+swing,10,73+swing,c.light);
 g.line(11,79+swing,17,80+swing,c.shade);
 polygon(g,[[70,52+b],[79,55+b],[84,62-swing],[85,69-swing],[89,72-swing],[89,79-swing],[85,84-swing],[78,84-swing],[73,80-swing],[73,75-swing],[77,72-swing],[81,74-swing],[81,78-swing],[84,77-swing],[82,70-swing],[77,65-swing],[69,63+b]],c.body,c.edge);
 g.line(80,60-swing,82,66-swing,c.light).line(85,73-swing,86,76-swing,c.light);
 g.line(79,82-swing,84,81-swing,c.shade);
 // 장부 아래의 세 다리는 길이를 고정하고 구부러지는 방향만 달라져요.
 for(const [x,dir] of [[33,-1],[48,1],[64,1]]){
  const dx=f===1?dir*3:0;
  polygon(g,[[x-5,69+b],[x+5,69+b],[x+4,80],[x+3+dx,85],[x+6+dx,88],[x+5+dx,91],[x-2+dx,91],[x-6+dx,88],[x-5,81]],c.body,c.edge);
  g.line(x-3,75,x-2,81,c.light).line(x-2,81,x-1+dx,86,c.light);
  g.line(x+2+dx,89,x+4+dx,89,c.light);
 }
 // 분홍 머리의 밝은 면은 왼쪽 위 한 덩어리로만 두어요.
 oval(g,48,40+b,29,29,c.body,c.edge);
 g.poly([[65,16+b],[73,23+b],[77,34+b],[76,47+b],[71,58+b],[62,65+b],[51,68+b],[42,66+b],[54,62+b],[64,54+b],[69,43+b],[69,31+b]],c.shade);
 g.poly([[24,29+b],[28,21+b],[37,15+b],[47,13+b],[55,16+b],[57,20+b],[52,24+b],[42,25+b],[32,31+b],[27,35+b],[24,34+b]],c.light);
 g.poly([[31,22+b],[37,18+b],[44,17+b],[48,18+b],[43,21+b],[36,22+b]],c.high);
 if(f===2){
  g.line(30,37,38,43,'O').line(38,43,30,49,'O');
  g.line(66,37,58,43,'O').line(58,43,66,49,'O');
  oval(g,48,55,4,3,c.light,c.edge);
 }else if(f===3){
  g.line(29,43,36,36,'F').line(36,36,43,43,'F');
  g.line(54,43,61,36,'F').line(61,36,68,43,'F');
  g.line(42,53,46,57,'F').line(46,57,50,57,'F').line(50,57,54,53,'F');
  g.rect(28,49,5,2,'p').rect(65,49,5,2,'p');
 }else{
  oval(g,36,41+b,7,9,'W',c.edge);oval(g,61,41+b,7,9,'W',c.edge);
  g.rect(37,39+b,4,8,'O').rect(60,39+b,4,8,'O');
  g.rect(37,39+b,2,2,'?').rect(60,39+b,2,2,'?');
  g.line(43,54+b,50,54+b,c.edge).line(50,54+b,53,52+b,c.edge);
 }
 // 펼친 장부의 책등과 종이 단면. 읽을 문자는 없이 줄과 작은 칸만 써요.
 polygon(g,[[23,63+b],[34,61+b],[48,64+b],[62,61+b],[74,63+b],[74,85+b],[62,86+b],[48,89+b],[35,86+b],[23,85+b]],'E','O');
 polygon(g,[[25,64+b],[35,63+b],[47,66+b],[47,86+b],[36,83+b],[25,83+b]],'W','O');
 polygon(g,[[49,66+b],[61,63+b],[72,64+b],[72,83+b],[61,83+b],[49,86+b]],'j','O');
 g.line(26,81+b,36,81+b,'*').line(36,81+b,45,84+b,'*');
 g.line(51,83+b,61,81+b,'a').line(61,81+b,70,81+b,'a');
 g.line(48,66+b,48,86+b,'T');
 for(const y of [68,73,78]){
  g.rect(28,y+b,2,2,'B').line(32,y+b,41,y+b,'/').line(32,y+1+b,41,y+1+b,'/');
  g.rect(54,y+b,2,2,'C').line(58,y+b,67,y+b,'n').line(58,y+1+b,67,y+1+b,'n');
 }
 // 앞 촉수 두 개가 양옆 표지를 가볍게 잡아요.
 polygon(g,[[23,63+b],[27,64+b],[29,69+b],[29,76+b],[26,79+b],[22,78+b],[20,74+b],[21,69+b]],c.body,c.edge);
 g.line(23,66+b,25,69+b,c.light).line(25,69+b,25,74+b,c.light);
 polygon(g,[[72,63+b],[76,64+b],[78,70+b],[77,76+b],[74,79+b],[70,77+b],[69,73+b],[71,69+b]],c.body,c.edge);
 g.line(73,66+b,74,70+b,c.light).set(73,74+b,c.light);
 return g;
}
const drawn=[
 saveHires('mob-fog-jelly',[0,1,2,3].map(jelly)),
 saveHires('boss-ledger-octo',[0,1,2,3].map(octo)),
];
const colorsMap=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors,rgb=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
const p=new PNG({width:1648,height:352});for(let i=0;i<p.data.length;i+=4)p.data.set([...rgb(colorsMap.S),255],i);
function paste(g,ox,oy,s){for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.get(x,y);if(c==='.')continue;for(let dy=0;dy<s;dy++)for(let dx=0;dx<s;dx++)p.data.set([...rgb(colorsMap[c]),255],((oy+y*s+dy)*p.width+ox+x*s+dx)*4);}}
let y=16;for(const e of drawn){loadGrid(e.key,false).forEach((g,f)=>paste(g,16+f*g.w*4,y,4));e.frames.forEach((g,f)=>paste(g,848+f*g.w*2,y,2));y+=e.frames[0].h*2+24;}
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c12-5-mobs.png',PNG.sync.write(p));
console.log('C12-5 항구 몹 2키 8프레임 작성 완료');
