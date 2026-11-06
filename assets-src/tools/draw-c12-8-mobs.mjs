import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, root, saveHires, loadGrid } from './c12-common.mjs';

function oval(g,cx,cy,rx,ry,fill,edge){
 const mask=new Grid(g.w,g.h).ellipse(cx,cy,rx,ry,'W');
 for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++)if(mask.get(x,y)!=='.')
  g.set(x,y,[[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy])=>mask.get(x+dx,y+dy)==='.')?edge:fill);
 return g;
}
function colors(f,boss=false){
 if(f===3)return {body:'C',light:'c',high:'q',shade:'I',edge:'F',wing:'C',wingLight:'c',wingShade:'I'};
 return boss?{body:'V',light:'v',high:'p',shade:'N',edge:'O',wing:'B',wingLight:'b',wingShade:'m'}:{body:'r',light:'p',high:'z',shade:'u',edge:'Q',wing:'B',wingLight:'b',wingShade:'m'};
}
function smallParrot(f){
 const g=new Grid(48,48),c=colors(f),b=f===1?-1:0,tail=f===1?2:0;
 // 뒤로 내려오는 파랑·금색 꼬리는 몸통과 날개보다 가늘고 길어요.
 polygon(g,[[17,27+b],[22,30+b],[15,38],[7+tail,43],[3+tail,42],[7+tail,35]],c.wing,c.edge);
 g.line(15,32,8+tail,39,c.wingLight).line(8+tail,39,6+tail,41,c.wingLight);
 polygon(g,[[21,29+b],[25,31+b],[21+tail,40],[17+tail,43],[16+tail,41]],f===3?'c':'Y',c.edge);
 g.line(21,33,19+tail,39,f===3?'q':'y');
 oval(g,22,30+b,12,12,c.body,c.edge);
 g.poly([[13,26+b],[16,21+b],[23,19+b],[28,23+b],[25,27+b],[18,28+b],[15,33+b]],c.light);
 g.poly([[29,24+b],[33,29+b],[31,36+b],[25,40+b],[20,41+b],[18,39+b],[25,35+b],[28,30+b]],c.shade);
 // 두 발끝의 높이는 대기 동작과 상관없이 고정해요.
 g.rect(23,37,3,6,'Q').rect(30,36,3,7,'Q');
 g.line(24,38,24,42,'Y').line(31,37,31,42,'Y');
 g.line(21,43,27,43,'Q').line(28,43,35,43,'Q');
 g.line(22,42,26,42,'Y').line(29,42,34,42,'Y');
 // 머리의 두 금색 깃은 왕관이 아닌 가벼운 깃털 모양이에요.
 polygon(g,[[20,10+b],[19,3+b],[23,5+b],[26,8+b],[30,3+b],[31,11+b]],'Y','Q');
 g.line(21,6+b,24,9+b,'y').line(29,6+b,29,9+b,'W');
 oval(g,27,17+b,11,11,c.body,c.edge);
 g.poly([[18,13+b],[21,9+b],[27,7+b],[32,10+b],[31,13+b],[26,13+b],[21,17+b],[18,17+b]],c.light);
 g.line(22,10+b,26,9+b,c.high);
 g.ellipse(29,18+b,7,7,c.light);
 g.poly([[33,14+b],[36,18+b],[33,23+b],[29,25+b],[26,24+b],[31,22+b]],c.body);
 if(f===2){g.line(26,15,30,18,'O').line(30,18,26,21,'O');}
 else if(f===3){g.line(25,18,28,15,'F').line(28,15,31,18,'F');}
 else{g.rect(28,14+b,2,5,'O').set(28,14+b,'?');}
 // 열리는 부리의 틈만으로 재잘거림을 보여 주고 글자나 말풍선은 넣지 않아요.
 polygon(g,[[35,14+b],[40,16+b],[44,19+b],[42,23+b],[38,26+b],[35,23+b]],'Y','Q');
 g.poly([[36,15+b],[40,17+b],[42,19+b],[38,20+b],[36,19+b]],'y');
 g.line(37,16+b,39,17+b,'W');
 if(f===1){g.poly([[36,20+b],[42,20+b],[39,23+b],[36,22+b]],'O');g.line(36,23+b,39,24+b,'+');}
 else{g.line(36,21+b,41,20+b,'+');g.line(39,23+b,41,21+b,'+');}
 if(f===3)g.rect(24,22,3,1,'p');
 const wing=f===1?[[15,23+b],[4,24+b],[5,29+b],[10,34+b],[18,37+b],[21,34+b],[20,28+b]]:[[15,23+b],[11,27+b],[12,33+b],[17,38+b],[21,36+b],[21,29+b]];
 polygon(g,wing,c.wing,c.edge);
 g.poly(f===1?[[7,26+b],[13,26+b],[17,29+b],[18,33+b],[13,32+b],[9,29+b]]:[[13,27+b],[16,25+b],[19,29+b],[19,33+b],[17,35+b],[14,31+b]],c.wingLight);
 g.line(f===1?10:15,33+b,18,36+b,c.wingShade);
 return g;
}
function parrotKing(f){
 const g=new Grid(96,96),c=colors(f,true),b=f===1?-2:0,tail=f===1?4:0;
 polygon(g,[[31,55+b],[41,63+b],[28,80],[13+tail,91],[7+tail,89],[12+tail,74]],c.wing,c.edge);
 g.poly([[27,64],[33,64],[26,75],[15+tail,85],[11+tail,87],[16+tail,78]],c.wingLight);
 g.line(17+tail,85,24,80,c.wingShade);
 polygon(g,[[40,61+b],[48,66+b],[40+tail,83],[34+tail,90],[30+tail,89],[34+tail,77]],f===3?'c':'Y',c.edge);
 g.line(40,69,36+tail,80,f===3?'q':'y');
 oval(g,44,62+b,24,24,c.body,c.edge);
 g.poly([[25,53+b],[31,44+b],[42,39+b],[52,43+b],[56,50+b],[50,55+b],[37,55+b],[30,62+b],[25,63+b]],c.light);
 g.poly([[59,46+b],[65,56+b],[66,68+b],[59,78+b],[49,84+b],[39,85+b],[34,81+b],[49,76+b],[56,66+b],[59,56+b]],c.shade);
 // 가는 다리와 발가락을 짙은 테두리로 묶고 바닥 그림자는 넣지 않아요.
 g.rect(44,77,5,13,'Q').rect(58,76,5,14,'Q');
 g.rect(45,79,2,10,'Y').rect(59,78,2,11,'Y');
 polygon(g,[[43,88],[48,88],[52,90],[51,91],[40,91],[39,90]],'Y','Q');
 polygon(g,[[57,88],[62,88],[67,90],[66,91],[54,91],[53,90]],'Y','Q');
 g.line(42,89,46,89,'y').line(56,89,60,89,'y');
 polygon(g,[[40,19+b],[39,5+b],[46,9+b],[51,14+b],[60,4+b],[62,19+b],[55,22+b]],'Y','Q');
 g.poly([[42,9+b],[47,13+b],[50,18+b],[44,17+b]],'y');
 g.line(58,10+b,59,15+b,'W');
 oval(g,53,32+b,23,23,c.body,c.edge);
 g.poly([[34,24+b],[39,15+b],[49,11+b],[58,12+b],[64,17+b],[61,23+b],[50,23+b],[41,28+b],[36,33+b],[32,31+b]],c.light);
 g.poly([[40,19+b],[47,15+b],[54,14+b],[58,16+b],[51,19+b],[45,20+b]],c.high);
 g.ellipse(58,35+b,14,14,c.light);
 g.poly([[65,25+b],[72,31+b],[70,42+b],[62,48+b],[54,49+b],[51,46+b],[60,43+b],[65,37+b]],c.body);
 g.line(49,29+b,52,27+b,c.high);
 if(f===2){g.line(52,29,61,35,'O').line(61,35,53,41,'O');}
 else if(f===3){g.line(51,35,57,29,'F').line(57,29,63,35,'F');g.rect(49,41,5,2,'p');}
 else{g.rect(56,28+b,4,9,'O').rect(56,28+b,2,2,'?');}
 polygon(g,[[72,26+b],[80,30+b],[87,36+b],[85,43+b],[79,49+b],[73,46+b],[71,39+b]],'Y','Q');
 g.poly([[74,28+b],[80,32+b],[84,35+b],[83,38+b],[77,38+b],[73,35+b]],'y');
 g.line(75,30+b,79,32+b,'W');
 if(f===1){g.poly([[73,38+b],[84,38+b],[79,44+b],[74,42+b]],'O');g.line(74,44+b,79,46+b,'+');}
 else{g.line(73,39+b,84,37+b,'+');g.line(79,45+b,83,40+b,'+');}
 // 대장의 펼친 책 목깃은 크림색 두 페이지와 금색 책등으로 구분돼요.
 polygon(g,[[35,53+b],[45,58+b],[47,61+b],[58,54+b],[60,56+b],[60,69+b],[48,77+b],[45,76+b],[34,69+b],[34,55+b]],'E','O');
 polygon(g,[[36,55+b],[44,60+b],[46,63+b],[46,73+b],[36,67+b]],'W','O');
 polygon(g,[[48,63+b],[58,57+b],[58,67+b],[48,74+b]],'j','O');
 g.line(38,59+b,43,62+b,'*').line(38,63+b,43,66+b,'*');
 g.line(51,63+b,55,60+b,'a').line(51,67+b,55,64+b,'a');
 g.line(47,63+b,47,74+b,'Y').set(47,63+b,'y');
 const wing=f===1?[[28,46+b],[9,47+b],[7,53+b],[12,63+b],[21,72+b],[34,78+b],[40,72+b],[39,59+b]]:[[29,46+b],[22,51+b],[18,59+b],[22,69+b],[31,79+b],[39,75+b],[41,64+b],[37,52+b]];
 polygon(g,wing,c.wing,c.edge);
 g.poly(f===1?[[12,51+b],[23,50+b],[31,56+b],[35,64+b],[34,71+b],[27,69+b],[19,61+b],[13,56+b]]:[[24,54+b],[29,50+b],[35,55+b],[37,63+b],[34,71+b],[29,68+b],[23,60+b]],c.wingLight);
 g.poly(f===1?[[18,63+b],[26,69+b],[34,73+b],[34,76+b],[25,72+b],[20,68+b]]:[[24,65+b],[31,72+b],[36,73+b],[34,76+b],[29,73+b]],c.wingShade);
 g.line(f===1?16:24,59+b,f===1?24:29,66+b,c.wing);
 return g;
}
const drawn=[
 saveHires('mob-babble-parrot',[0,1,2,3].map(smallParrot)),
 saveHires('boss-babble-king',[0,1,2,3].map(parrotKing)),
];
const colorsMap=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors,rgb=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
const p=new PNG({width:1648,height:352});for(let i=0;i<p.data.length;i+=4)p.data.set([...rgb(colorsMap.S),255],i);
function paste(g,ox,oy,s){for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.get(x,y);if(c==='.')continue;for(let dy=0;dy<s;dy++)for(let dx=0;dx<s;dx++)p.data.set([...rgb(colorsMap[c]),255],((oy+y*s+dy)*p.width+ox+x*s+dx)*4);}}
let y=16;for(const e of drawn){loadGrid(e.key,false).forEach((g,f)=>paste(g,16+f*g.w*4,y,4));e.frames.forEach((g,f)=>paste(g,848+f*g.w*2,y,2));y+=e.frames[0].h*2+24;}
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c12-8-mobs.png',PNG.sync.write(p));
console.log('C12-8 공방 몹 2키 8프레임 작성 완료');
