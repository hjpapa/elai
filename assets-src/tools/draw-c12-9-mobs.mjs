import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, root, saveHires, loadGrid } from './c12-common.mjs';

function oval(g,cx,cy,rx,ry,fill,edge){
 const mask=new Grid(g.w,g.h).ellipse(cx,cy,rx,ry,'W');
 for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++)if(mask.get(x,y)!=='.')
  g.set(x,y,[[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy])=>mask.get(x+dx,y+dy)==='.')?edge:fill);
 return g;
}
function softBox(g,x,y,w,h,r,fill,edge){
 return polygon(g,[[x+r,y],[x+w-1-r,y],[x+w-1,y+r],[x+w-1,y+h-1-r],[x+w-1-r,y+h-1],[x+r,y+h-1],[x,y+h-1-r],[x,y+r]],fill,edge);
}
function shadow(f){
 const g=new Grid(48,48),b=f===1?-2:0,arm=f===1?-3:0;
 const c=f===3?{body:'C',light:'c',high:'q',shade:'I',edge:'F'}:{body:'V',light:'v',high:'p',shade:'N',edge:'O'};
 // 작은 손과 둥근 머리로 무서운 유령 대신 장난꾸러기 천 친구처럼 보여요.
 polygon(g,[[11,23+b],[7,24+b+arm],[3,28+b+arm],[4,31+b+arm],[8,30+b+arm],[13,28+b]],c.body,c.edge);
 g.line(5,28+b+arm,9,26+b+arm,c.light);
 polygon(g,[[36,23+b],[40,25+b-arm],[44,29+b-arm],[43,32+b-arm],[39,30+b-arm],[35,28+b]],c.body,c.edge);
 g.line(39,26+b-arm,42,29+b-arm,c.light);
 polygon(g,[[9,31+b],[9,21+b],[11,14+b],[15,9+b],[21,6+b],[27,6+b],[33,9+b],[37,15+b],[39,23+b],[39,34+b],[38,41],[32,38],[f===1?23:25,43],[19,39],[13,42],[9,37]],c.body,c.edge);
 g.poly([[31,10+b],[35,16+b],[37,24+b],[37,34+b],[36,38],[32,35],[25,40],[22,38],[29,33+b],[32,25+b],[33,17+b]],c.shade);
 g.poly([[12,21+b],[14,15+b],[19,10+b],[25,8+b],[29,10+b],[28,13+b],[22,14+b],[17,18+b],[15,23+b]],c.light);
 g.line(17,14+b,21,11+b,c.high).line(22,10+b,25,10+b,c.high);
 g.line(12,28+b,13,32+b,c.light);
 if(f===2){
  g.line(15,20,20,23,'O').line(20,23,16,26,'O');
  g.line(33,20,28,23,'O').line(28,23,32,26,'O');
  oval(g,24,31,2,2,c.light,c.edge);
 }else if(f===3){
  g.line(14,23,18,19,'F').line(18,19,22,23,'F');
  g.line(27,23,31,19,'F').line(31,19,35,23,'F');
  g.line(20,29,23,32,'F').line(23,32,26,32,'F').line(26,32,29,29,'F');
  g.rect(13,27,3,1,'p').rect(33,27,3,1,'p');
 }else{
  oval(g,18,22+b,3,4,'W','O');oval(g,30,22+b,3,4,'W','O');
  g.rect(18,22+b,2,3,'N').rect(30,22+b,2,3,'N');
  g.set(18,22+b,'b').set(30,22+b,'b');
  g.line(22,31+b,26,31+b,c.edge).set(27,30+b,c.edge);
 }
 return g;
}
function golem(f){
 const g=new Grid(96,96),b=f===1?-2:0,arm=f===1?2:0;
 const c=f===3?{body:'C',light:'c',high:'q',shade:'I',deep:'F',edge:'F'}:{body:'A',light:'a',high:'j',shade:'f',deep:'d',edge:'O'};
 // 큰 돌 조각마다 왼쪽 위의 넓은 면과 오른쪽 아래의 짙은 면을 나눠요.
 softBox(g,24,72,20,20,3,c.body,c.edge);softBox(g,54,72,20,20,3,c.body,c.edge);
 g.rect(27,75,4,12,c.light).rect(57,75,4,12,c.light);
 g.poly([[39,74],[42,77],[42,87],[39,90],[28,90],[27,87],[37,86]],c.shade);
 g.poly([[69,74],[72,77],[72,87],[69,90],[58,90],[57,87],[67,86]],c.shade);
 g.line(29,88,38,88,c.high).line(59,88,68,88,c.high);
 softBox(g,17,36+b,63,41,6,c.body,c.edge);
 g.poly([[22,41+b],[27,38+b],[67,38+b],[73,42+b],[67,46+b],[30,45+b],[22,48+b]],c.light);
 g.line(28,40+b,61,40+b,c.high);
 g.poly([[73,44+b],[78,45+b],[78,69+b],[73,75+b],[32,75+b],[28,72+b],[68,70+b]],c.shade);
 // 팔은 둥근 어깨와 주먹 대신 말랑한 벙어리장갑 모양으로 그려요.
 oval(g,18,46+b+arm,11,11,c.body,c.edge);
 softBox(g,8,47+b+arm,21,26,5,c.body,c.edge);
 g.poly([[12,49+b+arm],[17,47+b+arm],[19,51+b+arm],[16,56+b+arm],[16,66+b+arm],[12,68+b+arm]],c.light);
 g.poly([[24,50+b+arm],[27,53+b+arm],[27,66+b+arm],[23,71+b+arm],[14,71+b+arm],[14,68+b+arm],[22,66+b+arm]],c.shade);
 g.line(12,51+b+arm,12,59+b+arm,c.high);
 oval(g,78,46+b-arm,11,11,c.body,c.edge);
 softBox(g,68,47+b-arm,21,26,5,c.body,c.edge);
 g.poly([[72,49+b-arm],[77,47+b-arm],[79,51+b-arm],[76,56+b-arm],[76,66+b-arm],[72,68+b-arm]],c.light);
 g.poly([[84,50+b-arm],[87,53+b-arm],[87,66+b-arm],[83,71+b-arm],[74,71+b-arm],[74,68+b-arm],[82,66+b-arm]],c.shade);
 g.line(72,51+b-arm,72,59+b-arm,c.high);
 // 정화 전에는 높이가 다른 세 막대, 정화 뒤에는 같은 높이의 민트 막대예요.
 softBox(g,31,50+b,35,22,3,c.deep,c.edge);
 softBox(g,33,52+b,31,17,2,'N',c.deep);
 const heights=f===3?[9,9,9]:[10,16,6],barColor=f===3?'c':'Y';
 heights.forEach((h,i)=>{
  const x=37+i*9,top=68+b-h;
  g.rect(x,top,6,h,barColor).line(x,top,x+5,top,f===3?'q':'y');
  g.line(x,top+1,x,67+b,f===3?'q':'y');
 });
 g.line(35,72+b,62,72+b,'Y').set(35,72+b,'y');
 // 넓은 얼굴은 둥근 모서리를 유지하며 원본의 짧은 윗돌도 함께 남겨요.
 softBox(g,25,12+b,47,35,7,c.body,c.edge);
 softBox(g,31,9+b,35,7,2,c.body,c.edge);
 g.line(34,11+b,61,11+b,c.high).line(34,13+b,63,13+b,c.light);
 g.poly([[28,20+b],[33,16+b],[44,16+b],[47,20+b],[41,23+b],[33,23+b],[30,29+b],[28,32+b]],c.light);
 g.line(30,21+b,30,29+b,c.high);
 g.poly([[65,18+b],[69,22+b],[69,38+b],[64,44+b],[35,44+b],[31,40+b],[61,40+b],[65,35+b]],c.shade);
 g.line(34,19+b,41,19+b,c.deep).line(56,19+b,63,19+b,c.deep);
 if(f===2){
  g.line(34,25,42,30,'O').line(42,30,35,34,'O');
  g.line(63,25,55,30,'O').line(55,30,62,34,'O');
  oval(g,49,38,3,2,c.light,c.edge);
 }else if(f===3){
  g.line(33,29,38,24,'F').line(38,24,43,29,'F');
  g.line(54,29,59,24,'F').line(59,24,64,29,'F');
  g.line(41,35,45,39,'F').line(45,39,52,39,'F').line(52,39,56,35,'F');
  g.rect(32,33,4,2,'p').rect(62,33,4,2,'p');
 }else{
  softBox(g,35,24+b,7,10,2,'N','O');softBox(g,55,24+b,7,10,2,'N','O');
  g.rect(36,25+b,3,3,'b').rect(56,25+b,3,3,'b');
  g.set(36,25+b,'W').set(56,25+b,'W');
  g.line(42,38+b,54,38+b,'O').set(55,37+b,'O');
 }
 return g;
}
const drawn=[
 saveHires('mob-fake-shadow',[0,1,2,3].map(shadow)),
 saveHires('boss-bias-golem',[0,1,2,3].map(golem)),
];
const colorsMap=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors,rgb=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
const p=new PNG({width:1648,height:352});for(let i=0;i<p.data.length;i+=4)p.data.set([...rgb(colorsMap.S),255],i);
function paste(g,ox,oy,s){for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.get(x,y);if(c==='.')continue;for(let dy=0;dy<s;dy++)for(let dx=0;dx<s;dx++)p.data.set([...rgb(colorsMap[c]),255],((oy+y*s+dy)*p.width+ox+x*s+dx)*4);}}
let y=16;for(const e of drawn){loadGrid(e.key,false).forEach((g,f)=>paste(g,16+f*g.w*4,y,4));e.frames.forEach((g,f)=>paste(g,848+f*g.w*2,y,2));y+=e.frames[0].h*2+24;}
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c12-9-mobs.png',PNG.sync.write(p));
console.log('C12-9 성 몹 2키 8프레임 작성 완료');
