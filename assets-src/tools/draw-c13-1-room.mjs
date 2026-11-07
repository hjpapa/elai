import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, root, saveHires } from './c12-common.mjs';

const mod=(n,m)=>((n%m)+m)%m;
const span=y=>{const w=4*(y<16?y+1:32-y);return [(64-w)/2,w];};
function tile(texture){
 const g=new Grid(64,32);
 for(let y=0;y<32;y++){
  const [left,w]=span(y);
  for(let x=left;x<left+w;x++)g.set(x,y,texture(mod(y+Math.floor(x/2)-16,32),mod(y-Math.floor(x/2)+16,32),x,y));
 }
 return g;
}
function floorTexture(u,v){
 // 이웃 칸의 이동은 u 또는 v에 정확히 32를 더해요. 가장자리도 같은 무늬가 이어져요.
 const row=mod(v-2,32),board=row<16?0:1,across=row%16;
 let c=board?'$':'T';
 if(across===0)c='X';
 else if(across===1)c='K';
 const end=board?6:22;
 if(u===end&&across>1&&across<15)c='X';
 const wave=board?24+Math.round(Math.sin((u+9)*Math.PI/16)):8+Math.round(Math.sin(u*Math.PI/16));
 if(v===wave&&mod(u+(board?13:0),32)<20)c=board?'T':'$';
 if(v===mod(wave+4,32)&&mod(u+(board?1:17),32)<9)c=board?'T':'$';
 return c;
}
function rugTexture(u,v){
 // 큰 마름모나 테두리 대신 밝기 차가 작은 복숭아색 고리를 천 전체에 이어 놓아요.
 const d=(a,b)=>Math.min(Math.abs(a-b),32-Math.abs(a-b));
 const r1=d(u,9)**2+d(v,10)**2,r2=d(u,26)**2+d(v,27)**2;
 if((r1>=18&&r1<=29)||(r2>=7&&r2<=14))return '%';
 if((v===20&&u>=13&&u<=16)||(u===29&&v>=12&&v<=15))return 'k';
 return 'p';
}
function mat(f){
 const g=new Grid(64,32);
 if(f===1){
  // 반투명 없이 좁은 문틈의 노란 빛을 뒤쪽 두 변에 걸쳐 표현해요.
  g.poly([[32,2],[48,10],[44,13],[32,7],[19,13],[15,10]],'Y');
  g.line(19,9,32,3,'y').line(32,3,44,9,'y');
 }
 polygon(g,[[32,5],[55,16],[32,28],[8,16]],'X','E');
 polygon(g,[[32,7],[51,16],[32,25],[12,16]],'T','U');
 // 고운 직조 줄은 마름모의 기울기를 따라 길게 이어져요.
 for(let v=10;v<=22;v+=3){
  const yy=v-16;
  const half=14-Math.abs(yy)*2;
  if(half>0)g.line(32-half,v,32+half,v,'X');
 }
 g.line(17,15,31,8,'K').line(33,8,47,15,'K');
 if(f===1){
  g.poly([[22,12],[32,7],[43,12],[39,15],[32,12],[25,15]],'y');
  // 바깥, 곧 화면 아래를 가리키는 화살표예요.
  polygon(g,[[28,12],[35,12],[35,18],[41,18],[32,25],[23,18],[28,18]],'W','O');
  g.line(30,14,33,14,'?').line(30,15,30,19,'?');
  g.line(28,20,32,23,'*');
 }
 return g;
}
const sideStart=x=>17+Math.floor(Math.min(x,63-x)/2);
function wall(window=false){
 const g=new Grid(64,112);
 // 윗면은 바닥과 같은 64×32 계단 마름모. 앞 가장자리만 얇게 눌러 두께를 보여 줘요.
 const cap=tile((u,v)=>{
  if(mod(v,16)===3)return 'X';
  if(mod(v,16)===4)return 't';
  return mod(u+v,32)<6?'K':'T';
 });
 g.stamp(cap.rows.map(r=>r.join('')));
 for(let x=0;x<64;x++){
  const right=x>=32,u=right?63-x:x,sy=sideStart(x),base=right?'Z':'&',light=right?'&':'W';
  g.set(x,sy-1,'X');
  for(let v=0;v<80;v++){
   let c=base;
   if(v<3)c=right?'X':'T';
   else if(v===3)c=right?'t':'Z';
   // 약한 벽지 잎무늬는 가장자리와 닿지 않으며 큰 빈 면을 남겨요.
   else if((Math.abs(u-9)+Math.abs(v-24)===3)||(Math.abs(u-24)+Math.abs(v-45)===3))c=light;
   if(v===66)c=right?'T':'t';
   else if(v===67)c=right?'X':'T';
   else if(v>=68&&v<=76)c=right?'e':'X';
   else if(v===77||v===78)c=right?'U':'e';
   else if(v===79)c=right?'Q':'E';
   g.set(x,sy+v,c);
  }
 }
 if(window)for(const right of [false,true]){
  const put=(u,v,c)=>{const x=right?63-u:u;g.set(x,sideStart(x)+v,c);};
  // 두 창의 u/v 규격이 같아 윗변·창턱이 같은 높이로 이어져요.
  for(let u=6;u<=25;u++)for(let v=16;v<=51;v++){
   let c;
   if(u===6||u===25||v===16||v===51)c=right?'Q':'E';
   else if(u<10||u>21||v<20||v>47)c=right?'e':'X';
   else{
    c=right?'o':'b';
    if(v>=40)c=right?'b':'q';
    if((u>=11&&u<=13&&v===23)||(u>=18&&u<=20&&v===25))c='q';
    if(u===15||u===16||v===33||v===34)c=right?'e':'X';
   }
   if((u===7&&v>16&&v<50)||(v===17&&u>6&&u<25))c=right?'T':'t';
   if((u===9&&v>=20&&v<=47)||(v===19&&u>=10&&u<=21))c=right?'U':'e';
   put(u,v,c);
  }
  for(let u=4;u<=27;u++)for(let v=52;v<=54;v++)put(u,v,v===52?(right?'T':'t'):v===53?(right?'e':'X'):(right?'Q':'E'));
 }
 return g;
}
const drawn=[
 saveHires('tile-room',[tile(floorTexture)]),
 saveHires('tile-rug',[tile(rugTexture)]),
 saveHires('tile-doormat',[mat(0),mat(1)]),
 saveHires('block-room-wall',[wall(false)]),
 saveHires('block-room-window',[wall(true)]),
];
const frames=Object.fromEntries(drawn.map(e=>[e.key,e.frames]));
const palette=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const rgb=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
function canvas(w,h){const p=new PNG({width:w,height:h});for(let i=0;i<p.data.length;i+=4)p.data.set([...rgb(palette.S),255],i);return p;}
function paste(p,g,ox,oy,s=2){for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.get(x,y);if(c==='.')continue;for(let dy=0;dy<s;dy++)for(let dx=0;dx<s;dx++){const px=ox+x*s+dx,py=oy+y*s+dy;if(px>=0&&px<p.width&&py>=0&&py<p.height)p.data.set([...rgb(palette[c]),255],(py*p.width+px)*4);}}}
mkdirSync(root+'assets-preview',{recursive:true});
const single=canvas(1136,272);let px=16;
for(const e of drawn)for(const g of e.frames){paste(single,g,px,24,2);px+=g.w*2+48;}
writeFileSync(root+'assets-preview/c13-1-room.png',PNG.sync.write(single));
const tiling=canvas(1168,368);
for(const [key,ox] of [['tile-room',240],['tile-rug',816]])for(let sum=0;sum<=6;sum++)for(let x=0;x<4;x++){const y=sum-x;if(y<0||y>=4)continue;paste(tiling,frames[key][0],ox+(x-y)*64,36+(x+y)*32,2);}
paste(tiling,frames['tile-doormat'][0],170,288,2);paste(tiling,frames['tile-doormat'][1],350,288,2);
writeFileSync(root+'assets-preview/c13-1-room-tiling.png',PNG.sync.write(tiling));
const walls=canvas(1184,640);
// 한쪽 방향만 따로 보지 않고 양쪽 뒤벽과 창문을 같은 모서리에 이어 놓아요.
for(let sum=0;sum<=12;sum++)for(let x=0;x<7;x++){
 const y=sum-x;if(y<0||y>=7)continue;
 const ox=528+(x-y)*64,oy=190+(x+y)*32;
 const floor=x>=2&&x<=3&&y>=2&&y<=6?'tile-rug':'tile-room';
 paste(walls,frames[floor][0],ox,oy,2);
}
for(let sum=0;sum<=6;sum++)for(let x=0;x<=sum;x++){
 const y=sum-x;if(x!==0&&y!==0)continue;
 const key=(x===3&&y===0)||(x===0&&y===3)?'block-room-window':'block-room-wall';
 paste(walls,frames[key][0],528+(x-y)*64,30+(x+y)*32,2);
}
paste(walls,frames['tile-doormat'][1],528+(5-6)*64,190+(5+6)*32,2);
writeFileSync(root+'assets-preview/c13-1-room-walls.png',PNG.sync.write(walls));
console.log('C13-1 바닥·벽 5키 6프레임 작성 완료');
