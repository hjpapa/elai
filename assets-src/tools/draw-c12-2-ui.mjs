import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, rounded, root, saveHires, loadGrid } from './c12-common.mjs';

// C12-2: 공통 화면 아이콘. 중심 여백과 1px 남색 외곽을 모든 키에 맞춰요.
const image=()=>new Grid(32,32);
function oval(g,cx,cy,rx,ry,fill,edge='O'){
 const mask=image().ellipse(cx,cy,rx,ry,'W');
 for(let y=0;y<32;y++)for(let x=0;x<32;x++)if(mask.get(x,y)!=='.')
  g.set(x,y,[[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy])=>mask.get(x+dx,y+dy)==='.')?edge:fill);
 return g;
}
function finish(g){
 const rows=g.rows.map(r=>[...r]);
 for(let y=0;y<32;y++)for(let x=0;x<32;x++){
  if(x<2||y<2||x>=30||y>=30){g.set(x,y,'.');continue;}
  if(rows[y][x]!=='.'&&[[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy])=>(rows[y+dy]?.[x+dx]??'.')==='.'))g.set(x,y,'O');
 }
 return g;
}
const starPoints=[[16,3],[20,11],[28,12],[22,19],[24,28],[16,24],[7,28],[9,19],[3,12],[12,11]];
function star(empty=false){
 const g=image();polygon(g,starPoints,empty?'i':'Y','O');
 if(empty){
  const shape=g.rows.map(r=>[...r]);
  for(let y=0;y<32;y++)for(let x=0;x<32;x++)if(shape[y][x]!=='.'){
   let inner=true;
   for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++)if(Math.abs(dx)+Math.abs(dy)<=3&&(shape[y+dy]?.[x+dx]??'.')==='.')inner=false;
   g.set(x,y,inner?'.':'i');
  }
  g.line(15,7,13,12,'j').line(6,13,10,14,'a');
 }else{
  g.poly([[16,5],[17,15],[12,16],[6,13],[13,12]],'y');
  g.poly([[18,18],[21,20],[22,25],[16,22],[11,25],[13,20]],'+');
  g.line(15,7,14,12,'W').set(11,14,'?');
 }
 return g;
}
function heart(){
 const g=image();
 polygon(g,[[4,8],[8,4],[13,4],[16,7],[19,4],[24,4],[28,8],[28,14],[24,19],[16,27],[8,20],[4,14]],'r','O');
 g.poly([[22,8],[26,9],[26,14],[22,19],[16,25],[12,21],[19,18]],'R');
 g.poly([[6,9],[9,6],[12,6],[14,9],[12,12],[8,13],[6,12]],'p');
 g.line(8,8,11,7,'W');return g;
}
function draw(kind){
 const g=image();
 switch(kind){
 case 'robi':
  // 로비의 위쪽 방향은 안테나와 머리 위 반사광으로 분명하게 해요.
  g.line(16,3,16,7,'d').rect(15,2,3,3,'Y').set(15,2,'y');
  rounded(g,9,6,15,12,'i','d');g.poly([[11,7],[19,7],[21,9],[13,10],[10,9]],'j');
  rounded(g,11,9,11,6,'m','d');g.rect(13,10,2,2,'c').rect(18,10,2,2,'c');
  rounded(g,10,17,13,10,'a','d');g.poly([[11,18],[15,18],[14,24],[11,24]],'j');
  rounded(g,5,16,5,9,'i','d');rounded(g,23,16,5,9,'f','d');
  g.rect(14,19,5,4,'B').line(14,19,18,19,'b');
  rounded(g,10,26,5,3,'f','d');rounded(g,19,26,5,3,'f','d');break;
 case 'goal':
  rounded(g,6,3,4,26,'X','Q');g.line(7,5,7,26,'t');
  polygon(g,[[10,5],[28,5],[23,11],[28,18],[10,18]],'r','O');
  g.poly([[12,7],[23,7],[20,10],[13,10]],'p').line(12,15,23,15,'R');
  g.rect(4,27,10,2,'g');break;
 case 'gem':
  polygon(g,[[10,4],[21,4],[28,13],[17,28],[3,13]],'C','O');
  g.poly([[11,6],[16,6],[13,12],[6,12]],'c');
  g.poly([[16,6],[20,6],[25,12],[17,12]],'q');
  g.poly([[6,14],[13,14],[16,25]],'o');
  g.poly([[15,14],[25,14],[18,25]],'b').line(17,6,21,11,'?');break;
 case 'cell-tree':
  polygon(g,[[12,3],[20,3],[25,7],[28,12],[28,20],[24,26],[18,29],[10,27],[4,22],[3,14],[6,7]],'I','O');
  g.ellipse(12,12,7,7,'J').ellipse(20,12,6,6,'L').ellipse(13,20,7,5,'J');
  g.ellipse(10,9,4,2,'M').line(7,12,8,9,'l').line(17,6,21,7,'M');
  g.poly([[22,17],[26,15],[26,21],[22,24],[19,24],[21,21]],'F');break;
 case 'cell-water':
  rounded(g,3,3,26,26,'B','m');
  g.poly([[5,5],[19,5],[22,8],[16,11],[5,10]],'o');
  for(const[x,y,w]of[[6,9,8],[17,16,9],[5,23,11]])g.line(x,y,x+w,y,'o').line(x+2,y-1,x+w-1,y-1,'b').line(x+3,y-2,x+w-3,y-2,'q');
  break;
 case 'cell-rock':
  polygon(g,[[8,5],[19,4],[26,10],[29,19],[24,26],[13,28],[5,24],[3,16]],'i','O');
  g.poly([[8,7],[18,6],[18,11],[12,16],[5,15]],'j');
  g.poly([[20,8],[25,12],[27,19],[22,24],[15,25],[17,17]],'f');
  g.line(7,18,11,18,'a').line(22,14,24,18,'d');break;
 case 'coin':
  oval(g,16,16,12,12,'Y');oval(g,15,15,9,9,'y','+');
  g.line(8,9,12,6,'W').line(24,13,24,20,'T');
  g.poly([[15,10],[17,14],[21,16],[17,18],[15,22],[13,18],[9,16],[13,14]],'Y');
  g.line(15,12,14,15,'W');break;
 case 'energy':
  polygon(g,[[19,3],[7,17],[14,17],[11,29],[26,12],[19,12]],'B','O');
  g.poly([[18,6],[10,15],[16,15],[15,21],[22,14],[17,14]],'b');
  g.line(17,8,13,13,'q');break;
 case 'xp':
  polygon(g,[[16,3],[20,12],[29,16],[20,20],[16,29],[12,20],[3,16],[12,12]],'V','O');
  g.poly([[16,6],[16,15],[8,16],[14,13]],'v');
  g.poly([[18,18],[25,16],[19,20],[16,26],[16,20]],'v');
  g.rect(14,14,4,4,'W').set(14,14,'?');break;
 case 'bag':
  rounded(g,11,3,11,7,'X','Q');rounded(g,13,5,7,4,'.','Q');g.rect(14,5,5,3,'.');
  rounded(g,5,9,23,19,'X','Q');g.rect(6,12,3,12,'T').rect(25,13,2,11,'U');
  polygon(g,[[6,10],[26,10],[25,17],[19,19],[11,19],[6,16]],'T','Q');
  g.line(8,11,23,11,'t');
  rounded(g,10,20,13,6,'U','Q');g.line(11,21,20,21,'X');
  rounded(g,15,16,4,5,'Y','Q');g.set(16,17,'y');break;
 case 'book':
  polygon(g,[[3,6],[12,5],[16,8],[20,5],[29,6],[29,26],[20,25],[16,28],[12,25],[3,26]],'B','O');
  g.poly([[5,8],[12,7],[15,10],[15,25],[11,23],[5,24]],'&');
  g.poly([[17,10],[21,7],[27,8],[27,24],[21,23],[17,25]],'*');
  g.line(16,9,16,26,'N').line(6,9,11,8,'?');
  g.line(7,13,12,13,'i').line(7,18,12,18,'i').line(20,13,25,13,'+').line(20,18,25,18,'+');break;
 case 'gear':
  polygon(g,[[12,3],[19,3],[19,7],[23,9],[26,7],[29,12],[26,14],[26,18],[29,20],[26,25],[23,23],[19,25],[19,29],[12,29],[12,25],[8,23],[5,25],[2,20],[5,18],[5,14],[2,12],[5,7],[8,9],[12,7]],'i','O');
  g.poly([[13,5],[17,5],[17,10],[12,12],[8,16],[5,16],[8,11],[13,9]],'j');
  g.poly([[23,14],[24,19],[21,23],[17,25],[14,25],[14,22],[19,20]],'f');
  oval(g,15.5,16,6,6,'d');oval(g,15.5,16,3,3,'B','O');g.set(14,14,'b');break;
 case 'lock':
  oval(g,16,11,8,9,'i','O');oval(g,16,11,4,5,'.','O');
  rounded(g,5,15,23,14,'Y','O');g.rect(7,17,17,3,'y').line(8,17,20,17,'W');
  g.poly([[25,18],[27,18],[27,26],[24,28],[20,28],[22,25]],'+');
  oval(g,16,21,2,2,'Q','O');g.rect(15,21,3,5,'Q');break;
 case 'check':
  polygon(g,[[4,15],[9,20],[23,5],[28,10],[10,29],[2,21]],'J','O');
  g.poly([[5,16],[9,22],[24,7],[25,10],[10,25],[5,20]],'L');
  g.line(12,20,22,10,'M');break;
 case 'hint':
  oval(g,16,12,9,10,'Y','O');g.ellipse(13,8,4,3,'y').line(11,6,14,5,'W');
  g.poly([[20,9],[23,11],[22,17],[19,21],[16,21],[19,17]],'+');
  g.line(12,15,15,18,'W').line(15,18,15,22,'W').line(20,14,17,18,'W').line(17,18,17,22,'W');
  rounded(g,11,22,11,6,'f','O');g.line(12,23,20,23,'a').line(12,26,20,26,'d').rect(14,28,5,1,'Y');break;
 default:throw new Error('아이콘 이름 확인: '+kind);
 }
 return g;
}
const digits={
1:['.X.','XX.','.X.','.X.','XXX'],2:['XXX','..X','XXX','X..','XXX'],3:['XXX','..X','.XX','..X','XXX'],4:['X.X','X.X','XXX','..X','..X'],
5:['XXX','X..','XXX','..X','XXX'],6:['.XX','X..','XXX','X.X','XXX'],7:['XXX','..X','.X.','.X.','.X.'],8:['XXX','X.X','XXX','X.X','XXX']};
function badge(n){
 const g=image();polygon(g,[[8,4],[24,4],[28,10],[26,21],[16,29],[5,22],[3,11]],'Y','O');
 g.poly([[9,6],[22,6],[24,9],[10,9],[7,13],[6,20],[5,17],[5,11]],'y');
 g.poly([[24,11],[26,12],[24,21],[17,27],[14,25],[22,19]],'+');
 g.line(7,11,8,8,'W').line(9,7,15,7,'W');
 digits[n].forEach((r,y)=>[...r].forEach((v,x)=>{if(v==='X')g.rect(13+x*2,11+y*2,2,2,'Q');}));
 // 작은 푸른 고리는 열쇠 배지라는 뜻을 유지해요.
 g.rect(8,22,3,2,'B').set(8,22,'b');return g;
}
function pathStep(){
 const g=image();
 // 금빛 바닥과 구분되는 밝은 크림 신발 자국. 얇고 납작한 바닥 표시예요.
 polygon(g,[[6,19],[9,16],[15,14],[18,15],[18,18],[14,21],[9,23],[6,22]],'?','O');
 g.line(9,17,14,15,'W').line(8,21,12,20,'*');
 polygon(g,[[20,13],[24,13],[27,15],[27,17],[23,19],[20,18],[19,16]],'?','O');
 g.line(21,14,24,14,'W').line(22,17,25,16,'*');
 return g;
}
const reference=root+'assets-src/reference/c11-icon-path-step.txt';
if(!existsSync(reference)){mkdirSync(root+'assets-src/reference',{recursive:true});writeFileSync(reference,readFileSync(root+'assets-src/hires/icon/icon-path-step.txt'));}
const names=['robi','goal','gem','cell-tree','cell-water','cell-rock','star','star-empty','coin','heart','energy','xp','bag','book','gear','lock','check','hint'];
const drawn=names.map(name=>saveHires('icon-'+name,[finish(name==='star'?star():name==='star-empty'?star(true):name==='heart'?heart():draw(name))]));
for(let n=1;n<=8;n++)drawn.push(saveHires('icon-badge-'+n,[finish(badge(n))]));
drawn.push(saveHires('icon-path-step',[finish(pathStep())]));

const palette=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const rgb=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
function canvas(w,h,color){const p=new PNG({width:w,height:h});for(let i=0;i<p.data.length;i+=4)p.data.set([...rgb(color),255],i);return p;}
function paste(p,g,ox,oy,scale){for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.get(x,y);if(c==='.')continue;for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++)p.data.set([...rgb(palette[c]),255],((oy+y*scale+dy)*p.width+ox+x*scale+dx)*4);}}
const preview=canvas(1120,500,'#56657a');
for(let i=0;i<drawn.length;i++){
 const col=i%9,row=Math.floor(i/9),x=8+col*124,y=8+row*164;
 for(let yy=0;yy<154;yy++)for(let xx=0;xx<116;xx++)preview.data.set([...rgb(xx<58?'#262c3b':'#fff4d2'),255],((y+yy)*preview.width+x+xx)*4);
 paste(preview,drawn[i].frames[0],x+13,y+12,1);paste(preview,drawn[i].frames[0],x+71,y+12,1);
 paste(preview,drawn[i].frames[0],x+13,y+66,3);
}
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c12-2-ui.png',PNG.sync.write(preview));
const ground=canvas(680,400,'#56657a');
const oldRows=readFileSync(reference,'utf8').trimEnd().split(/\r?\n/),old=new Grid(32,32);old.rows=oldRows.map(r=>[...r]);
const marker=drawn.at(-1).frames[0];
['tile-grass','tile-path','tile-stone','tile-water'].forEach((key,i)=>{
 const tile=loadGrid(key,true)[0],x=18+i*164;
 paste(ground,tile,x,40,2);paste(ground,old,x+32,36,2);
 paste(ground,tile,x,165,2);paste(ground,marker,x+32,161,2);
 paste(ground,tile,x,300,1);paste(ground,marker,x+16,298,1);
});
writeFileSync(root+'assets-preview/c12-2-path-contrast.png',PNG.sync.write(ground));
console.log('C12-2 일반 아이콘 '+drawn.length+'키 작성 완료');
