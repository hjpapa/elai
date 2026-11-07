import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, root, saveHires, loadGrid } from './c12-common.mjs';

// C12 동굴 도구와 C13 바닥 도구를 실행한 뒤 마지막에 돌려요.
// 현재 벽을 덧칠하지 않고, 보관된 C14 시작 기준본에서 옆면을 그대로 가져와요.
const before=new Grid(64,48);
before.rows=readFileSync(root+'assets-src/reference/c14-block-cave-before.txt','utf8').trimEnd().split(/\r?\n/).map(row=>[...row]);
if(before.rows.length!==48||before.rows.some(row=>row.length!==64))throw new Error('기준 벽의 크기가 64×48이 아니에요.');
const floor=loadGrid('tile-cave')[0],after=new Grid(64,48);
after.rows=before.rows.map(row=>[...row]);
const span=y=>{const width=4*(y<16?y+1:32-y);return [(64-width)/2,width];};
function top(x,y){if(y<0||y>=32)return false;const [left,width]=span(y);return x>=left&&x<left+width;}
for(let y=0;y<32;y++){
 const [left,width]=span(y);
 for(let x=left;x<left+width;x++){
  if(before.get(x,y)==='.'||floor.get(x,y)==='.')throw new Error('윗면 마름모 안에 빈 픽셀이 있어요.');
  after.set(x,y,floor.get(x,y));
 }
}
// 전체 둘레를 두르지 않고, 왼쪽 위 빛을 받는 짧은 돌턱 두 군데만 밝혀요.
// 넓은 밝은 판돌을 없애면서도 걸을 수 있는 바닥과 벽의 높이 차이는 남겨요.
for(let y=5;y<=7;y++){const [left]=span(y);after.rect(left, y, 2, 1, 'f');}
for(let y=19;y<=24;y++){const [left]=span(y);after.rect(left, y, 2, 1, 'f');}
// 오른쪽 앞 모서리는 바닥의 돌 틈과 같은 낮은 대비 색으로 짧게 접어요.
for(let y=20;y<=26;y++){const [left,width]=span(y);after.rect(left+width-2,y,2,1,'d');}
const firstCandidate=new Grid(64,48);firstCandidate.rows=after.rows.map(row=>[...row]);
// 바닥과 같은 S 바탕을 한 톤 어두운 d로 바꾸고 가는 돌 틈은 S로 남겨요.
// 짧은 왼쪽 돌턱 f와 흐린 광맥 /는 그대로 두어 윗면의 빛과 재질을 유지해요.
for(let y=0;y<32;y++){
 const [left,width]=span(y);
 for(let x=left;x<left+width;x++){
  const c=after.get(x,y);if(c==='S')after.set(x,y,'d');else if(c==='d')after.set(x,y,'S');
 }
}
const colors=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const count={topPixels:0,topChanged:0,outsideTopChanged:0,alphaMaskChanged:0,before:{},after:{}};
for(let y=0;y<48;y++)for(let x=0;x<64;x++){
 const a=before.get(x,y),b=after.get(x,y);
 if(b!=='.'&&!Object.hasOwn(colors,b))throw new Error('팔레트 밖 색: '+b);
 if((a==='.')!==(b==='.'))count.alphaMaskChanged++;
 if(top(x,y)){
  count.topPixels++;if(a!==b)count.topChanged++;
  count.before[a]=(count.before[a]??0)+1;count.after[b]=(count.after[b]??0)+1;
 }else if(a!==b)count.outsideTopChanged++;
}
if(count.topPixels!==1088||count.outsideTopChanged||count.alphaMaskChanged)throw new Error('윗면 밖 픽셀 또는 투명 마스크가 바뀌었어요.');
count.brightMineralsBefore=['n','o','q'].reduce((n,c)=>n+(count.before[c]??0),0);
count.brightMineralsAfter=['n','o','q'].reduce((n,c)=>n+(count.after[c]??0),0);
count.mutedMineralsAfter=count.after['/']??0;
saveHires('block-cave',[after]);

const rgb=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
function canvas(w,h){const p=new PNG({width:w,height:h});for(let i=0;i<p.data.length;i+=4)p.data.set([38,44,59,255],i);return p;}
function paste(p,g,ox,oy,s){for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.get(x,y);if(c==='.')continue;for(let dy=0;dy<s;dy++)for(let dx=0;dx<s;dx++){const px=ox+x*s+dx,py=oy+y*s+dy;if(px>=0&&py>=0&&px<p.width&&py<p.height)p.data.set([...rgb(colors[c]),255],(py*p.width+px)*4);}}}
function room(p,wall,ox,oy,n,s,dense=false){
 for(let sum=0;sum<2*n-1;sum++)for(let x=0;x<n;x++){
  const y=sum-x;if(y<0||y>=n)continue;
  const wallHere=dense ? (x!==5&&x!==6&&y!==5&&y!==6) : (x===0||y===0);
  paste(p,wallHere?wall:floor,ox+(x-y)*32*s,oy+(x+y)*16*s-(wallHere?16*s:0),s);
 }
}
mkdirSync(root+'assets-preview',{recursive:true});
const small=canvas(1168,512);
room(small,before,240,48,4,2);room(small,after,816,48,4,2);
paste(small,before,176,336,3);paste(small,after,752,336,3);
writeFileSync(root+'assets-preview/c14-3-cave-wall-small.png',PNG.sync.write(small));
const wide=canvas(1664,448);
room(wide,before,368,40,12,1,true);room(wide,after,1200,40,12,1,true);
writeFileSync(root+'assets-preview/c14-3-cave-wall-wide.png',PNG.sync.write(wide));
const tones=canvas(1664,448);
room(tones,firstCandidate,368,40,12,1,true);room(tones,after,1200,40,12,1,true);
writeFileSync(root+'assets-preview/c14-3-cave-wall-tones.png',PNG.sync.write(tones));
console.log(JSON.stringify(count,null,2));

