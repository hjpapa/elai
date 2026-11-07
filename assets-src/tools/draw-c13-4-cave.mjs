import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, root, saveHires, loadGrid } from './c12-common.mjs';

const mod=(n,m)=>((n%m)+m)%m;
const span=y=>{const w=4*(y<16?y+1:32-y);return [(64-w)/2,w];};
const cracks=[
 [[0,7],[5,9],[10,8],[16,12],[24,11],[29,8],[32,7]],
 [[16,12],[17,18],[14,23],[16,27]],
 [[27,25],[32,27],[36,26],[39,29]],
];
function segmentDistance(x,y,a,b){
 const dx=b[0]-a[0],dy=b[1]-a[1],den=dx*dx+dy*dy;
 const t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/den));
 return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);
}
function texture(u,v){
 // 판돌을 채우거나 둘레를 두르지 않고, 낮은 대비의 좁은 틈만 이웃 칸으로 이어가요.
 for(const chain of cracks)for(let i=1;i<chain.length;i++)for(const du of [-32,0,32])for(const dv of [-32,0,32])
  if(segmentDistance(u+du,v+dv,chain[i-1],chain[i])<.55)return 'd';
 // 밝은 청록 덩어리는 없애고, 한쪽 경계에 걸친 짧고 흐린 광맥 하나만 남겨요.
 if((u===31&&v===21)||(u===0&&v===22)||(u===1&&v===23))return '/';
 return 'S';
}
const cave=new Grid(64,32);
for(let y=0;y<32;y++){
 const [left,w]=span(y);
 for(let x=left;x<left+w;x++)cave.set(x,y,texture(mod(y+Math.floor(x/2)-16,32),mod(y-Math.floor(x/2)+16,32)));
}
saveHires('tile-cave',[cave]);
const before=new Grid(64,32);before.rows=readFileSync(root+'assets-src/reference/c13-cave-before.txt','utf8').trimEnd().split(/\r?\n/).map(r=>[...r]);
const colors=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors,rgb=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
function canvas(w,h){const p=new PNG({width:w,height:h});for(let i=0;i<p.data.length;i+=4)p.data.set([38,44,59,255],i);return p;}
function paste(p,g,ox,oy,s){for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.get(x,y);if(c==='.')continue;for(let dy=0;dy<s;dy++)for(let dx=0;dx<s;dx++)p.data.set([...rgb(colors[c]),255],((oy+y*s+dy)*p.width+ox+x*s+dx)*4);}}
function field(p,g,ox,oy,n,s){for(let sum=0;sum<2*n-1;sum++)for(let x=0;x<n;x++){const y=sum-x;if(y<0||y>=n)continue;paste(p,g,ox+(x-y)*32*s,oy+(x+y)*16*s,s);}}
mkdirSync(root+'assets-preview',{recursive:true});
const small=canvas(1168,368);
field(small,before,240,24,4,2);field(small,cave,816,24,4,2);
const crystal=loadGrid('prop-crystal')[1];
for(const ox of [240,816])paste(small,crystal,ox+64-crystal.w,24+128+32-(crystal.h-4)*2,2);
paste(small,before,176,296,2);paste(small,cave,752,296,2);
writeFileSync(root+'assets-preview/c13-4-cave-tiling.png',PNG.sync.write(small));
const wide=canvas(1664,448);
field(wide,before,368,24,12,1);field(wide,cave,1200,24,12,1);
writeFileSync(root+'assets-preview/c13-4-cave-wide.png',PNG.sync.write(wide));
console.log('C13-4 동굴 바닥 1키 재작화와 4×4·12×12 비교판 생성 완료');
