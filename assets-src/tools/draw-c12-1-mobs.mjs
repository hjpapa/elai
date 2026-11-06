import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, root, saveHires, loadGrid } from './c12-common.mjs';

// C12-1: 기존 숲 친구의 새싹·0/1 무늬·이끼 왕관을 2배 격자에서 다시 그려요.
function oval(g,cx,cy,rx,ry,fill,edge) {
 const mask=new Grid(g.w,g.h).ellipse(cx,cy,rx,ry,fill);
 for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++)if(mask.get(x,y)!=='.'){
  const boundary=[[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy])=>mask.get(x+dx,y+dy)==='.');
  g.set(x,y,boundary?edge:fill);
 }return g;
}
function leaf(g,x,y,w,h,fill='J',light='M',flip=false){
 const side=flip?-1:1;
 polygon(g,[[x,y],[x-side*w,y-h+1],[x-side*(w-1),y-h-2],[x-side*2,y-h],[x+side,y-2]],fill,'F');
 g.line(x-side,y-2,x-side*(w-2),y-h,light);
 return g;
}
function face(g,x,y,gap,f,size=2){
 const eye=(ex)=>{
  if(f===2)g.line(ex,y,ex+size,y+size,'F').line(ex+size,y+size,ex,y+size*2,'F');
  else if(f===3)g.line(ex,y+size,ex+size,y,'F').line(ex+size,y,ex+size*2,y+size,'F');
  else g.rect(ex,y,size,size+2,'F').set(ex,y,'?');
 };
 eye(x);eye(x+gap);
}
function slime(f){
 const g=new Grid(48,48),b=f===1?-2:f===2?1:0,calm=f===3;
 const base=calm?'L':'J',lit=calm?'l':'M',shade=calm?'J':'I';
 // 바닥은 발 기준 바로 위에 두고 윗몸만 천천히 오르내려요.
 polygon(g,[[9,42],[5,37],[6,29+b],[10,20+b],[16,14+b],[27,13+b],[35,18+b],[40,28+b],[42,37],[37,42],[31,43],[12,43]],base,'F');
 g.poly([[31,19+b],[36,23+b],[40,33+b],[38,39],[31,42],[20,42],[16,39],[29,38+b]],shade);
 g.poly([[9,28+b],[13,20+b],[18,17+b],[25,16+b],[29,18+b],[26,23+b],[17,24+b],[13,29+b]],lit);
 g.line(14,21+b,18,18+b,calm?'W':'l').line(11,27+b,13,24+b,calm?'l':'L');
 // 부드러운 덩굴팔은 몸 옆으로 나왔다가 위를 향해요.
 g.line(7,32+b,3,28+b,'F').line(3,28+b,3,22+b,'F').line(4,28+b,5,25+b,'I');
 leaf(g,5,22+b,4,5,calm?'M':'L',calm?'W':'M',false);
 g.line(39,31+b,44,26+b,'F').line(44,26+b,44,21+b,'F');
 leaf(g,44,23+b,5,6,'L','M',true);
 // 머리의 두 잎이 낡은 실루엣의 작은 왕관을 이어 가요.
 g.line(23,15+b,24,8+b,'F').line(24,11+b,28,8+b,'I');
 leaf(g,24,10+b,8,5,calm?'M':'L',calm?'W':'M',false);
 leaf(g,25,9+b,7,5,'J','L',true);
 face(g,16,27+b,13,f,3);
 if(f===3){
  g.line(23,36+b,28,36+b,'F').line(24,38+b,27,38+b,'F');
  g.rect(13,34+b,3,2,'p').rect(34,34+b,3,2,'p');
  g.rect(32,13,3,2,'p').rect(33,11,2,5,'p').set(33,13,'y');
 }else if(f===2)oval(g,25,37,2,2,'L','F');
 else g.line(23,36+b,27,36+b,'F').set(28,35+b,'F');
 return g;
}
function worm(f){
 const g=new Grid(32,32),b=f===1?-1:0,calm=f===3;
 // 세 마디가 오른쪽 위의 머리로 이어져요. 아래 4줄은 비워 둬요.
 oval(g,7,24,5,3,calm?'v':'V','D');
 oval(g,14,22+b,7,5,calm?'p':'P','D');
 oval(g,23,18+b,7,8,calm?'p':'P','D');
 g.poly([[4,23],[6,21],[9,22],[9,24],[5,25]],calm?'p':'v');
 g.poly([[10,19+b],[13,17+b],[17,19+b],[17,21+b],[13,21+b]],calm?'W':'p');
 g.poly([[19,14+b],[22,11+b],[26,13+b],[27,15+b],[24,15+b],[21,17+b]],calm?'W':'p');
 g.poly([[27,18+b],[29,19+b],[28,23+b],[25,25+b],[22,24+b],[26,23+b]],calm?'P':'s');
 // 더듬이는 낱개의 점이 아니라 짧은 줄과 둥근 끝으로 읽히게 해요.
 g.line(20,11+b,18,7+b,'D').line(18,7+b,18,5+b,'V');
 g.line(25,10+b,27,6+b,'D').line(27,6+b,27,3+b,'V');
 g.rect(17,4+b,3,2,'Y').set(17,4+b,'y');
 g.rect(26,2+b,3,2,'Y').set(26,2+b,'y');
 // 버그 친구의 0/1 무늬.
 g.rect(5,21,3,5,calm?'W':'v').rect(6,22,1,3,calm?'v':'V');
 g.line(12,20+b,13,19+b,'y').line(13,19+b,13,24+b,'y');
 if(f===2){
  g.line(20,17+b,22,19+b,'D').line(22,19+b,20,21+b,'D');
  g.line(27,17+b,25,19+b,'D').line(25,19+b,27,21+b,'D');
 }else if(f===3){
  g.line(19,19+b,21,17+b,'D').line(21,17+b,23,19+b,'D');
  g.line(25,19+b,27,17+b,'D').line(27,17+b,29,19+b,'D');
 }else{
  g.rect(20,17+b,2,3,'D').set(20,17+b,'?');
  g.rect(26,17+b,2,3,'D').set(26,17+b,'?');
 }
 g.line(22,23+b,26,23+b,'D');
 if(calm)g.line(23,24+b,25,24+b,'R');
 return g;
}
function guardian(f){
 const g=new Grid(96,96),b=f===1?-2:f===2?1:0,calm=f===3;
 const wood=calm?'T':'X',shade=calm?'X':'U',light=calm?'Z':'t',moss=calm?'L':'J';
 // 뿌리발: 접지는 y92이고 그림자는 따로 그리지 않아요.
 polygon(g,[[31,70],[42,70],[42,86],[38,90],[22,91],[18,89],[25,85],[28,79]],'U','Q');
 polygon(g,[[55,70],[66,71],[68,81],[76,87],[80,90],[76,91],[60,91],[55,87]],'U','Q');
 g.poly([[31,75],[37,73],[37,86],[32,89],[25,89],[31,85]],wood);
 g.poly([[58,76],[64,77],[66,85],[73,89],[64,89],[59,86]],wood);
 g.line(28,87,33,84,light).line(61,80,62,85,'T');
 // 왼팔에 따뜻한 빛, 오른팔에 푸른 갈색 그늘을 줘요.
 polygon(g,[[25,35+b],[35,39+b],[33,49+b],[26,59+b],[23,68+b],[14,71+b],[10,67+b],[12,58+b],[17,53+b],[18,42+b]],wood,'Q');
 g.poly([[19,43+b],[24,40+b],[27,43+b],[23,53+b],[17,61+b],[14,65+b],[14,58+b]],light);
 polygon(g,[[63,37+b],[74,39+b],[78,46+b],[78,54+b],[84,60+b],[85,68+b],[80,72+b],[71,69+b],[66,61+b],[65,49+b]],shade,'Q');
 g.poly([[69,43+b],[74,44+b],[75,55+b],[80,61+b],[79,67+b],[73,65+b],[70,57+b]],wood);
 // 동그란 손에 나뭇결 몇 줄만 남겨 딱딱한 주먹처럼 보이지 않게 해요.
 oval(g,19,64+b,8,7,wood,'Q');oval(g,77,64+b,8,7,shade,'Q');
 g.line(14,62+b,18,59+b,light).line(20,66+b,20,69+b,'U');
 g.line(74,61+b,77,59+b,wood).line(78,66+b,80,68+b,'Q');
 // 가운데 줄기는 정면의 밝은 면과 오른쪽 옆면을 구분해요.
 polygon(g,[[30,25+b],[38,18+b],[54,18+b],[65,26+b],[69,40+b],[68,66+b],[62,76+b],[52,80+b],[40,79+b],[30,73+b],[27,58+b],[28,39+b]],wood,'Q');
 g.poly([[31,31+b],[38,24+b],[45,22+b],[47,31+b],[43,42+b],[41,62+b],[43,75+b],[36,74+b],[31,68+b]],light);
 g.poly([[59,27+b],[65,29+b],[67,43+b],[65,66+b],[61,73+b],[54,77+b],[56,58+b],[60,47+b]],shade);
 g.line(35,49+b,35,58+b,'X').line(35,58+b,38,62+b,'X');
 g.line(43,64+b,42,73+b,'U').line(58,56+b,57,67+b,'Q');
 g.line(62,36+b,62,45+b,'Q').line(47,74+b,51,75+b,'T');
 // 얼굴은 나무 자체의 밝은 단면이에요.
 oval(g,49,39+b,17,13,light,'X');
 g.poly([[36,34+b],[41,29+b],[48,28+b],[53,31+b],[53,35+b],[43,38+b],[35,39+b]],calm?'&':'Z');
 if(f===2){
  g.line(39,35+b,43,39+b,'E').line(43,39+b,39,43+b,'E');
  g.line(59,35+b,55,39+b,'E').line(55,39+b,59,43+b,'E');
  oval(g,50,48+b,2,2,'T','E');
 }else if(calm){
  g.line(38,40+b,41,36+b,'E').line(41,36+b,44,40+b,'E');
  g.line(54,40+b,57,36+b,'E').line(57,36+b,60,40+b,'E');
  g.line(45,47+b,54,47+b,'R').line(47,50+b,52,50+b,'R');
  g.rect(35,43+b,4,2,'p').rect(61,43+b,4,2,'p');
 }else{
  g.rect(40,36+b,3,5,'E').set(40,36+b,'?');
  g.rect(56,36+b,3,5,'E').set(56,36+b,'?');
  g.line(47,48+b,53,48+b,'E').set(54,47+b,'E');
 }
 // 이끼 왕관은 큰 잎 덩어리 3개로 읽혀요. 동일한 점무늬를 반복하지 않아요.
 polygon(g,[[20,28+b],[17,23+b],[18,16+b],[23,10+b],[34,10+b],[39,6+b],[51,5+b],[58,9+b],[67,10+b],[74,16+b],[79,20+b],[79,28+b],[73,34+b],[67,32+b],[64,38+b],[59,33+b],[54,29+b],[37,29+b],[31,34+b],[27,30+b]],moss,'F');
 g.poly([[20,18+b],[24,13+b],[32,12+b],[37,16+b],[34,21+b],[27,23+b],[21,22+b]],calm?'l':'L');
 g.poly([[38,12+b],[42,8+b],[50,8+b],[54,11+b],[51,15+b],[43,16+b]],calm?'M':'L');
 g.line(24,14+b,30,13+b,calm?'W':'M').line(42,10+b,48,9+b,calm?'l':'M');
 g.poly([[60,13+b],[67,14+b],[74,20+b],[76,27+b],[72,31+b],[65,27+b],[62,24+b]],calm?'J':'I');
 g.line(24,25+b,28,28+b,'I').line(38,23+b,44,25+b,'g');
 // 어깨 이끼와 가슴 보석으로 옛 그림의 모습을 이어 가요.
 oval(g,20,43+b,7,5,moss,'F');g.line(15,42+b,20,40+b,calm?'l':'L');
 oval(g,73,42+b,7,5,calm?'J':'I','F');g.line(69,40+b,73,39+b,moss);
 polygon(g,[[44,59+b],[50,54+b],[57,59+b],[52,67+b],[48,67+b]],calm?'Y':'C',calm?'U':'F');
 g.poly([[45,59+b],[50,56+b],[52,59+b],[49,63+b]],calm?'y':'c').set(47,59+b,'?');
 leaf(g,30,64+b,6,6,calm?'L':'J','M',false);
 leaf(g,61,73+b,5,6,'J','L',true);
 g.line(49,8+b,50,3,'F');leaf(g,50,6,6,3,calm?'M':'L','l',true);
 if(calm){
  for(const [x,y]of[[62,15],[26,22]]){
   g.rect(x-3,y-1,2,3,'P').rect(x+2,y-1,2,3,'p').rect(x-1,y-3,3,2,'p').rect(x-1,y+2,3,2,'p').rect(x-1,y-1,3,3,'Y').set(x-1,y-1,'y');
  }
 }
 return g;
}
const drawn=[
 saveHires('mob-vine-slime',[0,1,2,3].map(slime)),
 saveHires('mob-bug-worm',[0,1,2,3].map(worm)),
 saveHires('boss-forest-guardian',[0,1,2,3].map(guardian)),
];
const palette=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const rgb=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
const canvas=new PNG({width:1648,height:448});
for(let i=0;i<canvas.data.length;i+=4)canvas.data.set([...rgb(palette.S),255],i);
function paint(g,ox,oy,s){
 for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.get(x,y);if(c==='.')continue;
  for(let dy=0;dy<s;dy++)for(let dx=0;dx<s;dx++)canvas.data.set([...rgb(palette[c]),255],((oy+y*s+dy)*canvas.width+ox+x*s+dx)*4);
 }
}
let y=16;
for(const e of drawn){
 const old=loadGrid(e.key,false);
 old.forEach((g,f)=>paint(g,16+f*g.w*4,y,4));
 e.frames.forEach((g,f)=>paint(g,848+f*g.w*2,y,2));
 y+=e.frames[0].h*2+24;
}
mkdirSync(root+'assets-preview',{recursive:true});
writeFileSync(root+'assets-preview/c12-1-mobs.png',PNG.sync.write(canvas));
console.log('C12-1 몹 3키 12프레임 작성 완료');
