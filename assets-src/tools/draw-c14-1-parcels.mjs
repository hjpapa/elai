import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, root, saveHires, loadGrid } from './c12-common.mjs';

const brown={top:'t',left:'T',right:'X',edge:'U',light:'Z',tape:'*'};
function box(g,cx,top,w,depth,h,c,{label=false,tape=true}={}){
 const half=w/2,left=cx-half,right=cx+half;
 const project=(u,v)=>[Math.round(left+u),Math.round(top+depth+u*depth/half+v)];
 polygon(g,[[left,top+depth],[cx,top+depth*2],[cx,top+depth*2+h],[left,top+depth+h]],c.left,c.edge);
 polygon(g,[[cx,top+depth*2],[right,top+depth],[right,top+depth+h],[cx,top+depth*2+h]],c.right,c.edge);
 polygon(g,[[cx,top],[right,top+depth],[cx,top+depth*2],[left,top+depth]],c.top,c.edge);
 g.line(left+1,top+depth,cx,top+1,c.light).line(left+1,top+depth+1,cx-1,top+depth*2,c.light);
 if(tape){
  // 테이프는 윗면의 두 평행한 변을 잇고 오른쪽 옆면으로 이어져요.
  const a=[cx-half/2,top+depth/2],b=[cx+half/2,top+depth*1.5],thick=w>=30?3:2;
  const strip=[[a[0]-thick,a[1]+1],[a[0]+thick,a[1]-1],[b[0]+thick,b[1]-1],[b[0]-thick,b[1]+1]].map(([x,y])=>[Math.round(x),Math.round(y)]);
  g.poly(strip,c.tape);
  polygon(g,[[Math.round(b[0]-thick),Math.round(b[1]+1)],[Math.round(b[0]+thick),Math.round(b[1]-1)],[Math.round(b[0]+thick),Math.round(b[1]-1+h)],[Math.round(b[0]-thick),Math.round(b[1]+1+h)]],c.tape,c.right);
  g.line(Math.round(a[0]),Math.round(a[1]),Math.round(b[0]),Math.round(b[1]),'Z');
 }
 if(label){
  const u=half*.23,v=Math.max(2,Math.floor(h*.28)),lw=Math.max(5,Math.floor(half*.53)),lh=Math.max(4,Math.floor(h*.42));
  polygon(g,[[u,v],[u+lw,v],[u+lw,v+lh],[u,v+lh]].map(([x,y])=>project(x,y)),'W','E');
  const [lx,ly]=project(u+1,v+1);g.line(lx,ly,lx+Math.max(1,lw-3),ly+Math.round((lw-3)*depth/half),'?');
 }
 return {project,half,h};
}
function sticker(g,face,kind){
 const [cx,cy]=face.project(face.half/2,face.h/2);
 // 기울어진 작은 면에서도 하트의 홈과 별의 다섯 끝이 뭉개지지 않게 표식을 또렷하게 해요.
 const rows=kind==='heart'?[
  '.WW...WW.',
  'WWWW.WWWW',
  'WWWWWWWWW',
  '.WWWWWWW.',
  '..WWWWW..',
  '...WWW...',
  '....W....',
 ]:[
  '....Y....',
  '....Y....',
  '...YYY...',
  'YYYYYYYYY',
  '.YYYYYYY.',
  '..YYYYY..',
  '..YY.YY..',
  '.YY...YY.',
  '.Y.....Y.',
 ];
 const ox=cx-4,oy=cy-(kind==='heart'?3:5);
 rows.forEach((row,y)=>[...row].forEach((c,x)=>{if(c!=='.')g.set(ox+x,oy+y,c==='Y'?'y':'W');}));
 if(kind==='heart')g.set(ox+1,oy+1,'?');
 else g.set(ox+4,oy+3,'W');
}
function stack(f){
 const g=new Grid(32,48),kind=f?'star':'heart';
 const c=f?{top:'b',left:'B',right:'n',edge:'m',light:'q',tape:'*'}:{top:'x',left:'r',right:'R',edge:'s',light:'z',tape:'*'};
 sticker(g,box(g,16,19,28,7,10,c),kind);
 sticker(g,box(g,16,10,22,5,12,{...c,top:f?'q':'p'}),kind);
 box(g,16,3,16,4,9,brown,{label:true});
 return g;
}
function pile(){
 const g=new Grid(64,64);
 // 넓은 아래 상자에 두 상자를 나란히 얹어, 앞 꼭짓점이 y60 바로 위에 닿아요.
 box(g,32,29,54,10,10,brown,{label:true});
 box(g,19,18,24,5,16,{...brown,top:'Z',left:'K',right:'T',light:'k'},{label:true});
 box(g,44,14,26,5,20,{...brown,top:'T',left:'X',right:'e',light:'t'},{label:true});
 // 종이 모서리의 짧은 접힘 두 개만 남기고 주소 칸은 비워 둬요.
 g.line(8,43,9,47,'X').line(51,43,54,42,'U');
 return g;
}
const drawn=[saveHires('prop-parcel-stack',[stack(0),stack(1)]),saveHires('prop-parcel-pile',[pile()])];
const palette=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors,rgb=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
const out=new PNG({width:1056,height:600});
for(let y=0;y<out.height;y++)for(let x=0;x<out.width;x++)out.data.set([...rgb(x<528?'#262c3b':'#fff4d2'),255],(y*out.width+x)*4);
function paste(g,ox,oy,scale){
 const w=Math.round(g.w*scale),h=Math.round(g.h*scale);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=g.get(Math.floor(x/scale),Math.floor(y/scale));if(c==='.')continue;out.data.set([...rgb(palette[c]),255],((oy+y)*out.width+ox+x)*4);}
}
const all=[...drawn[0].frames,drawn[1].frames[0]],floor=loadGrid('tile-room')[0];
for(let b=0;b<2;b++){
 const ox=b*528;
 all.forEach((g,i)=>paste(g,ox+[24,156,296][i],16,3));
 for(let i=0;i<2;i++){
  paste(all[i],ox+32+i*160,248,40/48);paste(all[i],ox+88+i*160,238,60/48);
 }
 paste(all[2],ox+384,238,60/64);
 all.forEach((g,i)=>{
  const cx=ox+[80,224,408][i],cy=552;
  paste(floor,cx-64,cy-32,2);paste(g,cx-g.w,cy-(g.h-4)*2,2);
 });
}
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c14-1-parcels.png',PNG.sync.write(out));
console.log('C14-1 보낸 상자·장식 상자 2키 3프레임 작성 완료');
