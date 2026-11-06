import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, root, saveHires, loadGrid } from './c12-common.mjs';

function oval(g,cx,cy,rx,ry,fill,edge){
 const mask=new Grid(g.w,g.h).ellipse(cx,cy,rx,ry,'W');
 for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++)if(mask.get(x,y)!=='.')
  g.set(x,y,[[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy])=>mask.get(x+dx,y+dy)==='.')?edge:fill);
 return g;
}
function star(g,cx,cy,r,fill,edge){
 const points=Array.from({length:10},(_,i)=>{const a=-Math.PI/2+i*Math.PI/5,d=i%2?r*.46:r;return [Math.round(cx+Math.cos(a)*d),Math.round(cy+Math.sin(a)*d)];});
 polygon(g,points,fill,edge);
}
function colors(f,boss=false){
 if(f===3)return {body:'C',light:'c',high:'q',shade:'I',edge:'F',muzzle:'c',muzzleLight:'q',muzzleShade:'o'};
 return boss?{body:'V',light:'v',high:'p',shade:'N',edge:'O',muzzle:'W',muzzleLight:'?',muzzleShade:'j'}:{body:'T',light:'t',high:'Z',shade:'U',edge:'Q',muzzle:'W',muzzleLight:'?',muzzleShade:'*'};
}
function smallFox(f){
 const g=new Grid(48,48),c=colors(f),b=f===1?-1:0,tail=f===1?-4:0;
 // 꼬리 끝의 크림색과 몸통 쪽 따뜻한 주황색이 멀리서도 구분돼요.
 polygon(g,[[26,31+b],[33,29+b],[35,23+tail],[38,20+tail],[43,17+tail],[44,23+tail],[42,31+tail],[38,36+b],[32,39+b],[27,38+b]],c.body,c.edge);
 g.poly([[37,23+tail],[42,19+tail],[42,24+tail],[40,29+tail],[37,27+tail],[35,30+tail]],c.muzzle);
 g.line(39,22+tail,41,21+tail,c.muzzleLight);
 g.poly([[39,31+tail],[36,35+b],[30,37+b],[28,36+b],[34,33+b]],c.shade);
 oval(g,20,34+b,14,8,c.body,c.edge);
 g.poly([[10,31+b],[15,28+b],[23,28+b],[27,31+b],[21,34+b],[12,35+b]],c.light);
 g.poly([[29,31+b],[33,34+b],[30,39+b],[24,41+b],[19,39+b],[25,37+b]],c.shade);
 polygon(g,[[10,36],[15,36],[16,42],[15,43],[9,43],[8,41]],c.body,c.edge);
 polygon(g,[[26,36],[31,36],[33,41],[32,43],[25,43],[24,41]],c.body,c.edge);
 g.line(10,41,14,41,c.muzzle).line(26,41,30,41,c.muzzle);
 // 두 귀 아래 얼굴은 볼을 둥글게 꺾어 뾰족한 가면처럼 보이지 않게 해요.
 polygon(g,[[5,18+b],[5,5+b],[10,8+b],[14,12+b],[25,12+b],[33,5+b],[34,19+b],[31,24+b],[25,29+b],[20,31+b],[13,28+b],[7,23+b]],c.body,c.edge);
 g.poly([[7,9+b],[11,13+b],[11,17+b],[7,15+b]],c.light);
 g.poly([[30,10+b],[31,9+b],[32,17+b],[28,18+b]],c.light);
 g.poly([[12,16+b],[15,13+b],[23,13+b],[26,16+b],[23,18+b],[17,17+b],[12,20+b]],c.light);
 g.line(15,14+b,19,14+b,c.high);
 g.poly([[30,18+b],[32,19+b],[29,24+b],[24,28+b],[21,29+b],[25,24+b]],c.shade);
 polygon(g,[[7,21+b],[12,23+b],[16,23+b],[20,25+b],[24,23+b],[29,22+b],[32,20+b],[29,25+b],[24,29+b],[20,31+b],[15,29+b],[10,25+b]],c.muzzle,c.edge);
 g.line(11,24+b,16,25+b,c.muzzleLight).line(24,25+b,28,24+b,c.muzzleLight);
 g.line(17,29+b,20,30+b,c.muzzleShade).line(20,30+b,23,29+b,c.muzzleShade);
 if(f===2){
  g.line(11,18,15,20,'O').line(15,20,12,22,'O');
  g.line(28,18,24,20,'O').line(24,20,27,22,'O');
 }else if(f===3){
  g.line(11,21,14,18,'F').line(14,18,17,21,'F');
  g.line(23,21,26,18,'F').line(26,18,29,21,'F');
 }else{
  g.rect(13,18+b,2,5,'O').set(13,18+b,'?');
  g.rect(25,18+b,2,5,'O').set(25,18+b,'?');
 }
 g.line(18,25+b,21,25+b,c.edge).line(19,26+b,20,26+b,c.edge);
 if(f===3){g.line(17,27,19,29,'F').line(19,29,22,27,'F');}
 else if(f===2){oval(g,20,28,1,1,c.muzzle,c.edge);}
 else g.line(19,27+b,19,28+b,c.edge).line(19,28+b,22,28+b,c.edge);
 star(g,34,33+b,3,'Y','+');g.set(34,32+b,'W');
 return g;
}
function starFox(f){
 const g=new Grid(96,96),c=colors(f,true),b=f===1?-2:0,tail=f===1?-5:0;
 polygon(g,[[55,61+b],[64,56+b],[68,45+tail],[74,36+tail],[88,27+tail],[90,39+tail],[87,52+tail],[80,64+b],[69,74+b],[57,77+b],[51,71+b]],c.body,c.edge);
 g.poly([[74,39+tail],[86,30+tail],[87,37+tail],[84,48+tail],[80,53+tail],[76,49+tail],[71,53+tail],[72,46+tail]],c.muzzle);
 g.poly([[78,38+tail],[85,33+tail],[85,38+tail],[81,44+tail],[77,44+tail]],c.muzzleLight);
 g.poly([[83,53+tail],[78,62+b],[69,70+b],[58,74+b],[55,70+b],[66,65+b],[74,57+b]],c.shade);
 g.line(66,60+b,71,55+b,c.light);
 oval(g,40,70+b,28,16,c.body,c.edge);
 g.poly([[18,64+b],[25,58+b],[36,56+b],[48,58+b],[53,64+b],[46,68+b],[32,67+b],[23,72+b],[18,71+b]],c.light);
 g.poly([[59,61+b],[66,69+b],[63,77+b],[55,82+b],[42,84+b],[36,81+b],[50,76+b],[56,70+b]],c.shade);
 // 밝은 발끝은 그림자와 떨어져 네 프레임 모두 같은 바닥 높이에 놓여요.
 polygon(g,[[20,77],[29,78],[29,86],[32,89],[30,91],[15,91],[14,88],[17,84]],c.body,c.edge);
 polygon(g,[[50,77],[60,77],[63,85],[66,89],[64,91],[49,91],[47,88]],c.body,c.edge);
 g.poly([[17,87],[26,87],[28,90],[16,90]],c.muzzle);
 g.poly([[50,87],[60,87],[63,90],[50,90]],c.muzzle);
 g.line(19,88,23,88,c.muzzleLight).line(52,88,57,88,c.muzzleLight);
 polygon(g,[[10,35+b],[10,8+b],[20,13+b],[28,23+b],[49,23+b],[66,9+b],[68,37+b],[63,47+b],[53,56+b],[40,62+b],[26,57+b],[15,48+b]],c.body,c.edge);
 g.poly([[14,15+b],[21,22+b],[23,32+b],[15,27+b]],c.light);
 g.poly([[61,17+b],[64,15+b],[65,32+b],[56,36+b]],c.light);
 g.line(16,19+b,19,23+b,c.high).line(62,21+b,62,25+b,c.high);
 g.poly([[24,32+b],[29,26+b],[40,25+b],[49,27+b],[53,32+b],[48,36+b],[36,34+b],[26,40+b],[21,39+b]],c.light);
 g.poly([[28,30+b],[32,27+b],[39,27+b],[43,29+b],[38,31+b],[32,31+b]],c.high);
 g.poly([[61,36+b],[65,38+b],[61,46+b],[52,54+b],[43,59+b],[40,57+b],[51,48+b],[57,42+b]],c.shade);
 polygon(g,[[14,41+b],[23,45+b],[31,45+b],[40,49+b],[49,45+b],[58,44+b],[65,40+b],[61,49+b],[52,57+b],[40,62+b],[28,58+b],[19,50+b]],c.muzzle,c.edge);
 g.poly([[20,45+b],[29,48+b],[36,49+b],[33,52+b],[26,51+b],[22,48+b]],c.muzzleLight);
 g.poly([[45,51+b],[51,48+b],[59,46+b],[55,51+b],[48,53+b]],c.muzzleLight);
 g.poly([[29,56+b],[40,60+b],[51,56+b],[45,60+b],[40,61+b],[34,59+b]],c.muzzleShade);
 if(f===2){
  g.line(23,36,31,41,'O').line(31,41,24,45,'O');
  g.line(57,36,49,41,'O').line(49,41,56,45,'O');
 }else if(f===3){
  g.line(22,41,28,35,'F').line(28,35,34,41,'F');
  g.line(46,41,52,35,'F').line(52,35,58,41,'F');
 }else{
  g.rect(27,36+b,4,9,'O').rect(27,36+b,2,2,'?');
  g.rect(50,36+b,4,9,'O').rect(50,36+b,2,2,'?');
 }
 polygon(g,[[36,50+b],[43,50+b],[41,53+b],[38,53+b]],c.edge,c.edge);
 if(f===2){oval(g,40,56,2,2,c.muzzle,c.edge);}
 else if(f===3){g.line(34,55,38,58,'F').line(38,58,42,58,'F').line(42,58,46,55,'F');}
 else g.line(40,53+b,40,57+b,c.edge).line(40,57+b,45,57+b,c.edge);
 // 원본의 이마 별과 비스듬한 별자리 띠를 작은 금색 장식으로 이어가요.
 star(g,40,28+b,5,'Y','+');g.set(39,27+b,'W').set(40,27+b,'y');
 g.line(21,69+b,34,73+b,'+').line(34,73+b,56,75+b,'+');
 g.line(21,68+b,34,72+b,'Y').line(34,72+b,56,74+b,'Y');
 star(g,27,69+b,3,'W','+');star(g,49,73+b,3,'W','+');
 g.set(35,72+b,'W').set(55,74+b,'y');
 return g;
}
const drawn=[
 saveHires('mob-meteor-fox',[0,1,2,3].map(smallFox)),
 saveHires('boss-star-fox',[0,1,2,3].map(starFox)),
];
const colorsMap=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors,rgb=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
const p=new PNG({width:1648,height:352});for(let i=0;i<p.data.length;i+=4)p.data.set([...rgb(colorsMap.S),255],i);
function paste(g,ox,oy,s){for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.get(x,y);if(c==='.')continue;for(let dy=0;dy<s;dy++)for(let dx=0;dx<s;dx++)p.data.set([...rgb(colorsMap[c]),255],((oy+y*s+dy)*p.width+ox+x*s+dx)*4);}}
let y=16;for(const e of drawn){loadGrid(e.key,false).forEach((g,f)=>paste(g,16+f*g.w*4,y,4));e.frames.forEach((g,f)=>paste(g,848+f*g.w*2,y,2));y+=e.frames[0].h*2+24;}
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c12-7-mobs.png',PNG.sync.write(p));
console.log('C12-7 천문대 몹 2키 8프레임 작성 완료');
