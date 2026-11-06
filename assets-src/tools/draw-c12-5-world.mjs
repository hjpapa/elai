// C12-5: 닳은 부두 목재, 상자, 등불 상태가 있는 등대와 흔들리는 부표.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, rounded, saveHires, loadGrid, root } from './c12-common.mjs';
const drawn=[];const save=(key,frames)=>drawn.push(saveHires(key,frames));
const span=y=>{const w=4*(y<16?y+1:32-y);return[(64-w)/2,w];};
function dock(){
 const g=new Grid(64,32);
 for(let y=0;y<32;y++){const[l,w]=span(y);for(let x=l;x<l+w;x++){
  const q=x+2*y,t=q%16,board=Math.floor(q/16);let c=board%2?'e':'X';
  if(t===0)c='E';else if(t===1)c='U';else if(t>=2&&t<=4)c='T';
  g.set(x,y,c);
 }}
 // 넓은 판재 사이에 길고 드문 나뭇결과 둥근 못 머리를 넣어요.
 g.line(12,16,22,11,'T').line(23,20,34,14,'U').line(37,21,48,15,'T');
 g.line(17,17,20,15,'X').line(42,10,47,13,'U');
 for(const[x,y]of[[15,14],[43,17]])g.rect(x,y,2,2,'S').set(x,y,'i');
 for(let y=0;y<32;y++){const[l,w]=span(y);for(let x=0;x<64;x++)if(x<l||x>=l+w)g.set(x,y,'.');else if(x<l+2||x>=l+w-2||y<2||y>=30)g.set(x,y,'e');}
 return g;
}
save('tile-dock',[dock()]);
{
 const g=new Grid(64,48);
 for(let x=0;x<64;x++){
  const top=16+Math.floor(Math.min(x,63-x)/2);
  for(let y=top+1;y<=top+16;y++){
   const d=y-top;let c=x<32?'T':'e';
   if(x%12===0)c=x<32?'U':'E';else if(x%12===1)c=x<32?'t':'X';
   if(d===1)c=x<32?'t':'T';if(d>=14)c=x<32?'X':'U';
   if(d===16)c=x<32?'U':'E';g.set(x,y,c);
  }
 }
 // 대각 버팀목의 넓은 면과 위쪽 가는 빛을 분리해요.
 polygon(g,[[2,20],[4,20],[29,42],[29,45]],'t','X');g.line(3,20,29,42,'Z');
 polygon(g,[[2,29],[3,31],[28,35],[29,33]],'T','X');
 polygon(g,[[34,42],[34,45],[61,21],[61,19]],'T','U');g.line(35,42,60,20,'t');
 polygon(g,[[34,33],[34,35],[60,31],[61,29]],'X','U');
 const top=dock();for(let y=0;y<32;y++)for(let x=0;x<64;x++)if(top.get(x,y)!=='.')g.set(x,y,top.get(x,y));
 // 최종 마름모+16px 옆면 마스크는 버팀목에도 정확히 적용해요.
 for(let y=0;y<48;y++)for(let x=0;x<64;x++){
  const[l,w]=y<32?span(y):[0,0];const t=16+Math.floor(Math.min(x,63-x)/2);
  if(!(y<32&&x>=l&&x<l+w)&&!(y>t&&y<=t+16))g.set(x,y,'.');
 }
 save('block-crate',[g]);
}
function lighthouse(on){
 const g=new Grid(64,96),body=new Grid(64,96).poly([[21,37],[43,37],[51,88],[13,88]],'a');
 // 가늘어지는 둥근 몸통. 띠도 몸통의 같은 조명을 따라요.
 for(let y=37;y<=88;y++)for(let x=0;x<64;x++)if(body.get(x,y)!=='.'){
  let left=x;while(body.get(left-1,y)!=='.')left--;let right=x;while(body.get(right+1,y)!=='.')right++;
  const rel=(x-left)/(right-left),stripe=(y>=48&&y<=56)||(y>=69&&y<=77);
  let c=rel<.26?'j':rel<.72?'a':rel<.88?'A':'f';
  if(stripe)c=rel<.26?'x':rel<.72?'r':rel<.88?'u':'R';
  if(x===left||x===right)c=stripe?'s':'d';g.set(x,y,c);
 }
 // 높은 건물의 돌 받침이며 별도의 바닥 그림자는 없어요.
 polygon(g,[[13,86],[51,86],[55,89],[51,92],[13,92],[9,89]],'A','d');
 g.poly([[13,87],[50,87],[52,89],[12,89]],'j').line(15,87,48,87,'?').line(14,91,49,91,'f');
 rounded(g,26,74,13,16,'E','O');g.rect(28,77,8,12,'U').line(28,77,28,87,'T').line(32,77,32,88,'E').rect(34,82,2,2,'Y');
 g.ellipse(32,62,5,5,'d').ellipse(32,62,4,4,'N').ellipse(31,61,2,2,'n').line(29,59,31,58,'q').set(30,60,'b');
 // 등실은 같은 틀에서 유리·등불만 바뀌어요.
 polygon(g,[[21,20],[43,20],[46,24],[46,36],[18,36],[18,24]],'d','O');
 g.rect(20,23,24,12,on?'Y':'N');g.rect(21,24,10,10,on?'y':'n').rect(34,24,8,10,on?'Y':'m');
 if(on){g.rect(24,25,5,7,'W').rect(25,26,3,5,'?').line(37,25,40,25,'y');g.line(7,28,12,28,'y').line(52,28,57,28,'Y');}
 else{g.line(21,25,25,23,'b').line(22,27,28,24,'/').line(36,25,38,24,'n');}
 g.rect(31,22,3,14,'d').line(31,23,31,34,'i').line(20,23,42,23,'f');
 polygon(g,[[16,35],[48,35],[50,38],[46,41],[18,41],[14,38]],'S','d');g.line(17,36,47,36,'i').line(19,40,45,40,'A');
 for(const x of[18,25,39,46])g.line(x,34,x,39,'d');g.line(18,34,46,34,'f');
 // 붉은 지붕은 원래의 삼각 실루엣을 유지해요.
 polygon(g,[[13,21],[32,7],[51,21],[47,23],[17,23]],'r','s');
 g.poly([[16,20],[31,9],[31,21],[18,22]],'x').poly([[32,9],[48,20],[46,22],[32,22]],'R');
 g.line(17,20,30,10,'z').line(16,22,47,22,'s');g.rect(31,4,2,4,'d').set(31,4,'i');
 return g;
}
save('prop-lighthouse',[lighthouse(false),lighthouse(true)]);
function buoy(f){
 const g=new Grid(32,48),b=f?-2:0,dx=f?1:0;
 // 오르내리는 몸체 바닥을 기준점에 맞춰요. 수면 그림자는 그리지 않아요.
 g.rect(15+dx,10+b,3,19,'d').line(15+dx,11+b,15+dx,27+b,'i');
 rounded(g,12+dx,5+b,9,7,'d','O');g.rect(14+dx,7+b,5,3,'Y').rect(14+dx,7+b,2,2,'y').line(14+dx,5+b,18+dx,5+b,'i');
 polygon(g,[[12+dx,25+b],[21+dx,25+b],[27+dx,41+b],[25+dx,44+b],[8+dx,44+b],[6+dx,41+b]],'r','s');
 g.poly([[12+dx,26+b],[16+dx,26+b],[13+dx,42+b],[8+dx,42+b]],'x');
 g.poly([[21+dx,27+b],[26+dx,41+b],[24+dx,43+b],[20+dx,43+b],[18+dx,27+b]],'R');
 g.poly([[10+dx,33+b],[23+dx,33+b],[24+dx,37+b],[9+dx,37+b]],'W');g.poly([[20+dx,33+b],[23+dx,33+b],[24+dx,37+b],[20+dx,37+b]],'a');
 g.line(9+dx,42+b,24+dx,42+b,'u').line(11+dx,27+b,14+dx,27+b,'z');
 // 금속 어깨와 고리로 작아도 부표임을 알아보게 해요.
 g.line(12+dx,25+b,20+dx,25+b,'d').line(13+dx,24+b,19+dx,24+b,'i');
 g.ellipse(22+dx,26+b,2,2,'d').set(22+dx,26+b,'.');
 return g;
}
save('prop-buoy',[buoy(0),buoy(1)]);

const colors=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const sw=860;let sh=12;const rows=drawn.map(({key,frames})=>{const r={key,frames,old:loadGrid(key,false),y:sh};sh+=frames[0].h*2+16;return r;});
const sheet=new PNG({width:sw,height:sh});for(let i=0;i<sheet.data.length;i+=4)sheet.data.set([38,44,59,255],i);
for(const{old,frames,y:oy}of rows)for(const[set,scale,ox]of[[old,4,12],[frames,2,442]])set.forEach((g,f)=>g.rows.forEach((row,y)=>row.forEach((c,x)=>{if(c==='.')return;const rgb=[1,3,5].map(i=>parseInt(colors[c].slice(i,i+2),16));for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++)sheet.data.set([...rgb,255],((oy+y*scale+dy)*sw+ox+(f*g.w+x)*scale+dx)*4);})));
mkdirSync(root+'assets-preview/',{recursive:true});writeFileSync(root+'assets-preview/c12-5-world.png',PNG.sync.write(sheet));
console.log('C12-5 항구 세계 4키 / 6프레임 생성');
