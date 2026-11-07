import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, rounded, root, saveHires, loadGrid } from './c12-common.mjs';

function card(right){
 const g=new Grid(32,32);
 // C12·C13 카드와 같은 여백과 세 겹 틀을 청록색으로 이어가요.
 rounded(g,2,2,28,28,'F','O');rounded(g,4,4,24,24,'C','F');rounded(g,6,6,20,20,'W','C');
 g.line(7,3,23,3,'C').line(3,7,3,23,'C').line(8,5,22,5,'?');
 // 상자는 두 카드에서 동일해요. 왼쪽 윗면이 밝고 오른쪽 옆면이 어두워요.
 polygon(g,[[10,10],[16,13],[16,17],[10,14]],'T','E');
 polygon(g,[[16,13],[22,10],[22,14],[16,17]],'X','E');
 polygon(g,[[16,7],[22,10],[16,13],[10,10]],'t','E');
 g.line(11,10,15,8,'Z').line(11,11,14,13,'K');
 g.poly([[13,9],[15,8],[19,10],[17,11]],'k');
 g.line(18,11,18,14,'*');
 const arrow=new Grid(32,32),points=[[7,22],[13,18],[13,20],[24,20],[24,24],[13,24],[13,26]];
 // 화살표 모양만 뒤집고, 밝은 가장자리는 매번 화면의 왼쪽 위에서 다시 계산해요.
 polygon(arrow,points.map(([x,y])=>[right?31-x:x,y]),'C','F');
 const base=arrow.rows.map(r=>[...r]);
 for(let y=0;y<32;y++)for(let x=0;x<32;x++){
  let c=base[y][x];
  if(c==='C'&&(base[y-1]?.[x]==='F'||base[y]?.[x-1]==='F'))c='c';
  if(c!=='.')g.set(x,y,c);
 }
 return g;
}
const drawn=[saveHires('icon-card-sendLeft',[card(false)]),saveHires('icon-card-sendRight',[card(true)])];
const palette=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors,rgb=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
const out=new PNG({width:960,height:400}),backgrounds=['#262c3b','#fff4d2','#2f8a86'];
for(let y=0;y<out.height;y++)for(let x=0;x<out.width;x++)out.data.set([...rgb(backgrounds[Math.floor(x/320)]),255],(y*out.width+x)*4);
function paste(g,ox,oy,size){
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const c=g.get(Math.floor(x*32/size),Math.floor(y*32/size));if(c!=='.')out.data.set([...rgb(palette[c]),255],((oy+y)*out.width+ox+x)*4);}
}
for(let b=0;b<3;b++){
 const ox=b*320;
 paste(drawn[0].frames[0],ox+16,16,128);paste(drawn[1].frames[0],ox+176,16,128);
 const reference=[loadGrid('icon-card-turnLeft')[0],loadGrid('icon-card-grab')[0],drawn[0].frames[0],drawn[1].frames[0]];
 reference.forEach((g,i)=>paste(g,ox+16+i*72,184,64));
 // 실제 명령 블록 28px와 40·60px를 같은 기준선에 놓아 방향 구별을 살펴봐요.
 let x=ox+8;for(const size of [28,40,60]){for(const e of drawn){paste(e.frames[0],x,364-size,size);x+=size+8;}x+=8;}
}
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c14-2-cards.png',PNG.sync.write(out));
console.log('C14-2 좌우 보내기 카드 2키 작성 완료');
