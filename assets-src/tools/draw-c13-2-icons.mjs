import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, rounded, root, saveHires, loadGrid } from './c12-common.mjs';

function exitHole(){
 const g=new Grid(32,32);
 rounded(g,2,2,28,28,'Y','O');
 // 밝은 금색과 짙은 황토색의 사선 띠로 연보라 놀이판에서도 테두리를 읽어요.
 for(let y=3;y<=28;y++)for(let x=3;x<=28;x++)if(g.get(x,y)==='Y'&&(x+y)%8<3)g.set(x,y,'+');
 g.line(6,3,25,3,'y').line(3,6,3,25,'y');
 g.line(7,28,25,28,'X').line(28,7,28,25,'X');
 // 구멍 안은 불투명 남색이고, 윗쪽의 짧은 벽면만 보여 깊이를 표현해요.
 rounded(g,7,7,18,18,'O','E');
 g.rect(9,8,13,2,'D').line(8,10,8,21,'D');
 g.line(9,25,22,25,'y').line(25,9,25,22,'X');
 return g;
}
function grabCard(){
 const g=new Grid(32,32);
 // C12 카드와 같은 2px 여백, 28/24/20px 세 겹 테두리를 분홍색으로 이어가요.
 rounded(g,2,2,28,28,'s','O');rounded(g,4,4,24,24,'P','s');rounded(g,6,6,20,20,'W','P');
 g.line(7,3,23,3,'P').line(3,7,3,23,'P').line(8,5,22,5,'?');
 g.rect(14,7,4,6,'S').rect(15,8,2,4,'a').set(15,8,'?');
 // 은색 손가락 두 개가 안쪽으로 굽어 집는 동작을 나타내요.
 polygon(g,[[11,15],[14,17],[10,21],[10,23],[13,23],[13,26],[9,26],[7,23],[7,20]],'i','S');
 polygon(g,[[20,15],[24,20],[24,23],[22,26],[18,26],[18,23],[21,23],[21,21],[17,17]],'i','S');
 g.line(11,18,8,21,'j').line(8,22,10,25,'j');
 g.line(20,18,23,21,'a').line(23,22,21,25,'a');
 rounded(g,10,11,12,6,'P','D');
 g.line(12,12,19,12,'p').rect(13,13,5,2,'p').line(13,13,16,13,'?');
 return g;
}
const drawn=[saveHires('icon-claw-exit',[exitHole()]),saveHires('icon-card-grab',[grabCard()])];
const palette=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const rgb=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
const out=new PNG({width:960,height:416}),backgrounds=['#262c3b','#fff4d2','#b5a0dc'];
for(let y=0;y<out.height;y++)for(let x=0;x<out.width;x++)out.data.set([...rgb(backgrounds[Math.floor(x/320)]),255],(y*out.width+x)*4);
function paste(g,ox,oy,scale,sample=1){for(let y=0;y<g.h;y+=sample)for(let x=0;x<g.w;x+=sample){const c=g.get(x,y);if(c==='.')continue;for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++)out.data.set([...rgb(palette[c]),255],((oy+y/sample*scale+dy)*out.width+ox+x/sample*scale+dx)*4);}}
for(let b=0;b<3;b++){
 const ox=b*320;
 paste(drawn[0].frames[0],ox+16,20,4);paste(drawn[1].frames[0],ox+176,20,4);
 paste(loadGrid('icon-card-forward')[0],ox+24,188,2);paste(loadGrid('icon-card-collect')[0],ox+128,188,2);paste(drawn[1].frames[0],ox+232,188,2);
 paste(drawn[0].frames[0],ox+48,308,4,2);paste(drawn[1].frames[0],ox+208,308,4,2);
}
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c13-2-icons.png',PNG.sync.write(out));
console.log('C13-2 출구·집기 아이콘 2키 2프레임 작성 완료');
