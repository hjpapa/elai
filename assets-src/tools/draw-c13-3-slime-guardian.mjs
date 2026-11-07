// C13-3: 정화된 숲 친구를 둥근 천 인형으로 바꾼 잎 슬라임과 숲 수호자.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, saveHires, loadGrid, root } from './c12-common.mjs';
function oval(g,cx,cy,rx,ry,fill,edge){
 const mask=new Grid(g.w,g.h).ellipse(cx,cy,rx,ry,fill);
 for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++)if(mask.get(x,y)!=='.')g.set(x,y,[[0,-1],[0,1],[-1,0],[1,0]].some(([dx,dy])=>mask.get(x+dx,y+dy)==='.')?edge:fill);
 return g;
}
function button(g,x,y,edge,base,hole){
 g.stamp(['.'+edge+edge+'.',edge+hole+base+edge,edge+base+hole+edge,'.'+edge+edge+'.'],x-2,y-2);
}
const drawn=[];
{
 const g=new Grid(32,32);
 // 빛나는 젤 대신 큰 천 색면으로 볼륨을 그려요. 맨 아래 y28이 엉덩이예요.
 oval(g,16,19,12,9,'L','F');
 g.poly([[22,12],[26,15],[27,21],[24,25],[18,27],[13,26],[21,24],[23,19]],'J');
 g.poly([[7,17],[10,13],[15,11],[19,12],[17,15],[11,17]],'l');
 // 머리에는 잎 하나만 붙어요.
 g.line(15,10,16,7,'I');
 polygon(g,[[14,9],[13,5],[16,2],[23,2],[21,6],[17,9]],'M','I');g.line(16,7,21,3,'l');
 button(g,11,18,'F','I','l');button(g,21,18,'F','I','L');
 g.line(14,22,15,23,'F').line(15,23,18,23,'F').line(18,23,19,22,'F');
 g.rect(8,22,2,1,'p').rect(23,22,2,1,'p');
 // 두 번의 짧은 감침질만 넣어 작은 화면에서 잡티가 되지 않게 해요.
 g.line(25,19,25,23,'I').line(24,20,26,20,'M').line(24,23,26,23,'M');
 drawn.push(saveHires('prop-doll-slime',[g]));
}
{
 const g=new Grid(32,32);
 // 짧고 둥근 손발과 앉은 줄기 몸. 발 사이 중앙도 y28에 닿아요.
 oval(g,7,21,4,5,'T','U');g.line(5,19,6,18,'Z');
 oval(g,25,21,4,5,'X','U');g.line(24,18,26,19,'T');
 oval(g,16,21,8,7,'T','U');g.poly([[11,17],[15,15],[16,19],[14,25],[10,25]],'Z');
 g.poly([[21,17],[23,22],[21,26],[17,27],[19,22]],'X');
 oval(g,10,26,4,2,'T','U');oval(g,22,26,4,2,'X','U');g.line(8,25,11,25,'Z').line(20,25,23,25,'T');
 // 원래 수호자의 밝은 나무 단면 얼굴을 부드러운 천으로 표현해요.
 oval(g,16,14,9,6,'Z','X');g.poly([[9,12],[12,9],[17,9],[19,11],[15,13],[9,14]],'&');
 button(g,12,14,'E','U','Z');button(g,21,14,'E','U','t');
 g.line(14,18,15,19,'E').line(15,19,18,19,'E').line(18,19,19,18,'E');
 g.rect(8,17,2,1,'p').rect(24,17,2,1,'p');
 // 이끼 머리 덩어리 셋과 작은 꽃 하나는 정화 프레임의 특징이에요.
 oval(g,10,8,7,4,'L','F');oval(g,17,6,7,4,'L','F');oval(g,24,8,6,4,'J','F');
 g.poly([[5,7],[8,5],[12,5],[14,7],[10,8],[6,9]],'l');g.poly([[13,5],[16,3],[20,3],[21,5],[17,6]],'M');
 g.line(7,6,10,6,'W').line(15,4,18,4,'l');g.poly([[20,9],[25,7],[28,9],[25,11],[21,11]],'J');
 g.rect(24,4,1,5,'p').rect(22,6,5,1,'p').set(24,6,'y');
 // 가슴의 금빛 보석은 납작한 마름모 천 조각으로 이어 가요.
 polygon(g,[[16,20],[19,23],[16,26],[13,23]],'Y','U');g.line(15,22,16,21,'y');g.line(16,24,17,23,'t');
 // 나뭇결 대신 팔과 배 옆의 간단한 봉제선이 보이게 해요.
 g.line(5,22,6,24,'X').line(4,22,6,22,'Z');g.line(23,22,23,24,'U').line(22,23,24,23,'T');
 drawn.push(saveHires('prop-doll-guardian',[g]));
}

const colors=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const sw=560,sh=332,sheet=new PNG({width:sw,height:sh});
for(let i=0;i<sheet.data.length;i+=4)sheet.data.set([38,44,59,255],i);
for(let y=0;y<sh;y++)for(let x=286;x<sw;x++)sheet.data.set([255,244,210,255],(y*sw+x)*4);
const cushion=loadGrid('prop-cushion')[0];
function paint(g,ox,oy,size){for(let y=0;y<size;y++)for(let x=0;x<size;x++){
 const c=g.get(Math.floor(x*g.w/size),Math.floor(y*g.h/size));if(c==='.')continue;
 const rgb=[1,3,5].map(i=>parseInt(colors[c].slice(i,i+2),16));sheet.data.set([...rgb,255],((oy+y)*sw+ox+x)*4);
}}
drawn.forEach(({frames},i)=>{const g=frames[0],y=12+i*160,composite=new Grid(32,32).stamp(cushion.rows);composite.stamp(g.rows);
 paint(g,12,y+80,32);paint(g,60,y+64,48);paint(g,120,y,128);paint(composite,300,y,128);paint(composite,456,y+64,48);
});
mkdirSync(root+'assets-preview/',{recursive:true});writeFileSync(root+'assets-preview/c13-3-slime-guardian.png',PNG.sync.write(sheet));
console.log('C13-3 숲 인형 2키 / 2프레임 생성: 왼쪽 32px·48px·4배 / 오른쪽 방석 합성 4배·48px');
