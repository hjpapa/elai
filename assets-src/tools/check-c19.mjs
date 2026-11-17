import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {PNG} from 'pngjs';
import {ASSETS} from '../../src/game/assets.ts';
import {BAKERY_ROUNDS} from '../../src/data/minigames/bakery.ts';
import {cakePixels} from '../../src/minigames/bakery/cakeArt.ts';
import {parsePalette,loadAsset} from '../../scripts/build-assets.mjs';
import {root} from './c12-common.mjs';
const stage=Number(process.argv[2]??1),keys=['prop-bakery','prop-oven','prop-cake-stand','prop-bread-shelf',...(stage===2?['icon-cake']:[])];
const palette=parsePalette(JSON.parse(await readFile(resolve(root,'assets-src/palette.json'),'utf8')));
const manifest=JSON.parse(await readFile(resolve(root,'public/assets/manifest.json'),'utf8'));
const atlas=JSON.parse(await readFile(resolve(root,'public/assets/atlas.json'),'utf8'));
const atlasPng=PNG.sync.read(await readFile(resolve(root,'public/assets/atlas.png')));
assert(atlasPng.width<=4096&&atlasPng.height<=4096);
const expected=[
 {flavor:'strawberry',shape:'heart'},
 {flavor:'choco',shape:'round',topping:'cherry'},
 {flavor:'mint',shape:'star',topping:'flower'},
 {flavor:'vanilla',shape:'square',topping:'candy',message:'birthday'},
 {flavor:'vanilla',shape:'heart',topping:'candy',message:'thanks'},
 {flavor:'mint',shape:'star',topping:'candy',message:'cheer'}];
let pixels=0,footPixels=0,cakeSamples=0,atlasPixels=0;const records=[];
for(const key of keys){
 const spec=ASSETS.find(a=>a.key===key),asset=await loadAsset(spec,palette.symbols),entry=manifest.assets.find(a=>a.key===key);
 assert.equal(asset.density,2);assert.equal(entry.density,2);
 const png=PNG.sync.read(await readFile(resolve(root,'public/assets',entry.file)));
 assert.equal(png.width,spec.w*2*spec.frames);assert.equal(png.height,spec.h*2);assert.deepEqual(png.data,asset.png.data);
 for(let i=0;i<png.data.length;i+=4){assert([0,255].includes(png.data[i+3]));pixels++;}
 if(spec.kind==='prop')for(let f=0;f<spec.frames;f++)for(let y=png.height-3;y<png.height;y++)for(let x=0;x<spec.w*2;x++){assert.equal(png.data[(y*png.width+f*spec.w*2+x)*4+3],0,key+': below foot');footPixels++;}
 if(key==='prop-cake-stand')for(const [n,order]of expected.entries()){
  assert.deepEqual(BAKERY_ROUNDS[n].customers.at(-1).want,order);
  const px=cakePixels(order);
  px.forEach((row,y)=>row.forEach((color,x)=>{
   const i=((4+y*2)*png.width+(n+1)*32+x*2)*4;
   if(color){assert.deepEqual([...png.data.subarray(i,i+4)],[...[1,3,5].map(k=>parseInt(color.slice(k,k+2),16)),255],`cake ${n+1} ${x},${y}`);cakeSamples++;}
   else if(y<14)assert.equal(png.data[i+3],0,`cake ${n+1} shape ${x},${y}`);
  }));
  // 토핑 세 묶음과 글씨 판은 2x2 영역 전체가 게임 그림과 같아야 해요.
  for(let y=3;y<=10;y++)for(let x=2;x<=12;x++)if(y<=5||(order.message&&y>=9&&x>=5&&x<=10)){
   const color=px[y][x];if(!color)continue;
   for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++){const i=((4+y*2+dy)*png.width+(n+1)*32+x*2+dx)*4;assert.deepEqual([...png.data.subarray(i,i+3)],[1,3,5].map(k=>parseInt(color.slice(k,k+2),16)));}
  }
 }

 records.push({key,size:[png.width,png.height],frames:spec.frames});
}
for(const entry of manifest.assets){const png=PNG.sync.read(await readFile(resolve(root,'public/assets',entry.file))),f=atlas.frames[entry.key].frame;assert.equal(f.w,png.width);assert.equal(f.h,png.height);for(let y=0;y<png.height;y++)for(let x=0;x<png.width;x++){const a=(y*png.width+x)*4,b=((f.y+y)*atlasPng.width+f.x+x)*4;assert.deepEqual(png.data.subarray(a,a+4),atlasPng.data.subarray(b,b+4));atlasPixels++;}}
console.log(JSON.stringify({stage,records,pixels,footPixels,cakeSamples,atlasPixels,atlas:[atlasPng.width,atlasPng.height],density2:manifest.assets.filter(a=>a.density===2).length}));
