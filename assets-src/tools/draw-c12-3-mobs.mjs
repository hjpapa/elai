import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, root, saveHires, loadGrid } from './c12-common.mjs';

function oval(g,cx,cy,rx,ry,fill,edge){
 const mask=new Grid(g.w,g.h).ellipse(cx,cy,rx,ry,'W');
 for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++)if(mask.get(x,y)!=='.')
  g.set(x,y,[[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy])=>mask.get(x+dx,y+dy)==='.')?edge:fill);
 return g;
}
function smallBat(f){
 const g=new Grid(48,48),b=f===1?-2:0,calm=f===3,c={base:calm?'C':'V',lit:calm?'c':'v',high:calm?'q':'p',shade:calm?'I':'D',edge:calm?'F':'D'};
 for(const right of [false,true]){
  const x=n=>right?48-n:n;
  const points=f===1?[[19,24],[12,23],[3,21],[5,34],[10,31],[14,37],[18,32],[21,29]]:[[19,22],[12,16],[3,13],[4,29],[9,26],[13,33],[17,30],[20,30]];
  polygon(g,points.map(([xx,y])=>[x(xx),y+b]),c.base,c.edge);
  const light=f===1?[[5,23],[11,25],[17,27],[14,30],[9,27]]:[[5,16],[11,18],[17,23],[13,25],[8,21]];
  g.poly(light.map(([xx,y])=>[x(xx),y+b]),right?c.base:c.lit);
  const tip=f===1?[6,24]:[6,17];
  g.line(x(18),27+b,x(tip[0]),tip[1]+b,c.edge);
  g.line(x(17),27+b,x(f===1?13:11),(f===1?33:28)+b,c.shade);
  g.line(x(7),(f===1?24:17)+b,x(11),(f===1?26:19)+b,c.lit);
 }
 // 날개 뒤의 긴 귀와 동그란 몸, 윗왼쪽의 반사로 같은 보라 박쥐를 이어 가요.
 polygon(g,[[16,23+b],[16,8+b],[19,8+b],[23,20+b]],c.base,c.edge);
 polygon(g,[[27,22+b],[30,7+b],[33,7+b],[34,10+b],[31,24+b]],c.base,c.edge);
 g.poly([[18,11+b],[20,14+b],[21,20+b],[18,18+b]],c.lit);
 g.poly([[31,10+b],[32,11+b],[30,20+b],[29,20+b]],c.lit);
 oval(g,24,29+b,10,14,c.base,c.edge);
 g.poly([[17,23+b],[20,18+b],[25,17+b],[28,20+b],[25,24+b],[20,25+b],[18,28+b]],c.lit);
 g.poly([[31,23+b],[33,28+b],[32,36+b],[28,40+b],[25,41+b],[28,35+b]],c.shade);
 oval(g,23,35+b,5,6,c.lit,c.base);
 g.line(18,22+b,20,20+b,c.high);
 if(f===2){
  g.line(18,25,21,28,'O').line(21,28,18,30,'O');
  g.line(30,25,27,28,'O').line(27,28,30,30,'O');
  oval(g,25,34,2,2,c.lit,'O');
 }else if(calm){
  g.line(18,27,20,25,'F').line(20,25,22,27,'F');
  g.line(27,27,29,25,'F').line(29,25,31,27,'F');
  g.line(22,33,27,33,'F').line(23,35,26,35,'F');
  g.rect(16,30,3,2,'p').rect(31,30,3,2,'p');
 }else{
  g.rect(19,25+b,3,4,'O').set(19,25+b,'?');
  g.rect(28,25+b,3,4,'O').set(28,25+b,'?');
  g.line(23,33+b,27,33+b,'O').set(28,32+b,'O');
 }
 // 작고 둥근 발끝은 기준점 y44 바로 위에서 끝나요.
 g.rect(19,41+b,4,2,c.edge).rect(27,41+b,4,2,c.edge);
 g.set(20,41+b,c.lit).set(28,41+b,c.base);
 return g;
}
function king(f){
 const g=new Grid(96,96),b=f===1?-2:0,calm=f===3,c={base:calm?'C':'V',lit:calm?'c':'v',high:calm?'q':'p',shade:calm?'I':'D',edge:calm?'F':'D'};
 // 대장은 별 목장식을 한 같은 친구예요. 더 넓은 막에 두 가닥의 날개살을 그려요.
 for(const right of [false,true]){
  const x=n=>right?96-n:n;
  const pts=f===1?[[40,47],[26,45],[13,41],[4,42],[10,65],[18,62],[26,75],[31,69],[37,72],[44,61]]:[[40,43],[28,31],[19,26],[5,24],[7,53],[15,50],[22,64],[29,59],[35,67],[43,60]];
  polygon(g,pts.map(([xx,y])=>[x(xx),y+b]),c.base,c.edge);
  const patch=f===1?[[8,45],[16,44],[28,49],[37,54],[30,60],[21,53],[12,52]]:[[8,27],[17,29],[27,35],[36,43],[31,48],[21,40],[11,36]];
  g.poly(patch.map(([xx,y])=>[x(xx),y+b]),right?c.base:c.lit);
  const dark=f===1?[[10,55],[16,57],[21,63],[26,70],[29,62],[38,60],[37,67],[32,66],[27,72],[19,59],[11,62]]:[[8,43],[15,43],[20,49],[23,59],[28,54],[37,53],[36,62],[30,56],[24,60],[16,47],[9,49]];
  g.poly(dark.map(([xx,y])=>[x(xx),y+b]),c.shade);
  const tip=f===1?[9,46]:[9,29],rootY=f===1?56:49;
  g.line(x(39),rootY+b,x(tip[0]),tip[1]+b,c.edge);
  g.line(x(37),rootY+1+b,x(f===1?25:21),(f===1?68:57)+b,c.edge);
  g.line(x(12),(f===1?46:30)+b,x(21),(f===1?48:34)+b,c.lit);
  if(!right)g.line(x(13),(f===1?45:29)+b,x(18),(f===1?46:31)+b,c.high);
 }
 polygon(g,[[33,44+b],[31,14+b],[34,11+b],[38,12+b],[43,25+b],[46,44+b]],c.base,c.edge);
 polygon(g,[[51,43+b],[58,11+b],[62,9+b],[66,12+b],[67,19+b],[62,45+b]],c.base,c.edge);
 g.poly([[34,17+b],[37,18+b],[41,28+b],[42,37+b],[36,33+b]],c.lit);
 g.poly([[60,15+b],[63,13+b],[64,18+b],[60,34+b],[56,37+b]],c.lit);
 g.line(35,19+b,37,24+b,c.high).line(61,17+b,60,23+b,c.high);
 oval(g,48,59+b,20,29,c.base,c.edge);
 g.poly([[32,46+b],[36,37+b],[43,32+b],[51,32+b],[56,36+b],[50,42+b],[42,43+b],[36,48+b]],c.lit);
 g.poly([[62,45+b],[66,51+b],[67,63+b],[63,77+b],[56,84+b],[49,86+b],[56,75+b],[59,61+b]],c.shade);
 oval(g,46,69+b,12,15,c.lit,c.base);
 g.poly([[38,62+b],[43,58+b],[49,59+b],[47,65+b],[42,68+b],[39,74+b]],calm?'q':'v');
 g.line(36,42+b,40,38+b,c.high).line(40,37+b,45,35+b,c.high);
 if(f===2){
  g.line(36,49,42,54,'O').line(42,54,36,58,'O');
  g.line(61,49,55,54,'O').line(55,54,61,58,'O');
  oval(g,49,64,3,3,c.lit,'O');
 }else if(calm){
  g.line(35,54,40,49,'F').line(40,49,45,54,'F');
  g.line(54,54,59,49,'F').line(59,49,64,54,'F');
  g.line(43,62,54,62,'F').line(45,66,52,66,'F');
  g.rect(32,57,6,3,'p').rect(63,57,5,3,'p');
 }else{
  g.rect(37,49+b,5,7,'O').rect(56,49+b,5,7,'O');
  g.rect(37,49+b,2,2,'?').rect(56,49+b,2,2,'?');
  g.line(44,63+b,53,63+b,'O').line(53,63+b,55,61+b,'O');
 }
 // 발과 가슴 별은 흩어진 반짝이 대신 작은 재질 덩어리로 보여 줘요.
 polygon(g,[[36,83+b],[43,83+b],[44,89+b],[41,91+b],[33,91+b],[33,88+b]],c.base,c.edge);
 polygon(g,[[53,83+b],[60,83+b],[64,88+b],[64,91+b],[55,91+b],[52,89+b]],c.base,c.edge);
 g.line(35,88+b,40,87+b,c.lit).line(56,88+b,60,88+b,c.lit);
 g.line(38,69+b,48,75+b,'+').line(48,75+b,59,69+b,'+');
 polygon(g,[[48,72+b],[51,78+b],[58,78+b],[53,83+b],[54,89+b],[48,86+b],[42,89+b],[43,83+b],[38,78+b],[45,78+b]],'Y','Q');
 g.poly([[48,75+b],[48,81+b],[43,84+b],[45,79+b]],'y').set(47,78+b,'W');
 g.poly([[50,82+b],[52,85+b],[48,84+b],[45,86+b],[47,82+b]],'+');
 return g;
}
const drawn=[
 saveHires('mob-echo-bat',[0,1,2,3].map(smallBat)),
 saveHires('boss-bat-king',[0,1,2,3].map(king))
];
const colors=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors,rgb=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
const p=new PNG({width:1648,height:352});for(let i=0;i<p.data.length;i+=4)p.data.set([...rgb(colors.S),255],i);
function paste(g,ox,oy,s){for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.get(x,y);if(c==='.')continue;for(let dy=0;dy<s;dy++)for(let dx=0;dx<s;dx++)p.data.set([...rgb(colors[c]),255],((oy+y*s+dy)*p.width+ox+x*s+dx)*4);}}
let y=16;for(const e of drawn){loadGrid(e.key,false).forEach((g,f)=>paste(g,16+f*g.w*4,y,4));e.frames.forEach((g,f)=>paste(g,848+f*g.w*2,y,2));y+=e.frames[0].h*2+24;}
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c12-3-mobs.png',PNG.sync.write(p));
console.log('C12-3 박쥐2키 8프레임 작성 완료');
