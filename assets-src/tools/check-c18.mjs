import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {PNG} from 'pngjs';
import {ASSETS} from '../../src/game/assets.ts';
import {ROUTE_ROUNDS} from '../../src/data/minigames/route.ts';
import {parsePalette,loadAsset} from '../../scripts/build-assets.mjs';
import {root} from './c12-common.mjs';
const stage=Number(process.argv[2]??1),keys=['prop-route-house','prop-route-table','prop-route-map','prop-globe',...(stage===2?['icon-card-followWave']:[])];
const palette=parsePalette(JSON.parse(await readFile(resolve(root,'assets-src/palette.json'),'utf8')));
const manifest=JSON.parse(await readFile(resolve(root,'public/assets/manifest.json'),'utf8'));
const atlas=JSON.parse(await readFile(resolve(root,'public/assets/atlas.json'),'utf8'));
const atlasPng=PNG.sync.read(await readFile(resolve(root,'public/assets/atlas.png')));
assert(atlasPng.width<=4096&&atlasPng.height<=4096);
const expected=[['S*#','#**','##G'],['S***#','.##*#','.#.*G','...##'],['S*****','#####*','G*****'],['S*###','#**##','##**#','###*G'],['S*#...','#*#.#.','#***#.','###*#.','G***..'],['S**#.','##*#.','***#.','*###.','****G']];
let pixels=0,footPixels=0,mazeCells=0,atlasPixels=0;const records=[];
for(const key of keys){
 const spec=ASSETS.find(a=>a.key===key),asset=await loadAsset(spec,palette.symbols),entry=manifest.assets.find(a=>a.key===key);
 assert.equal(asset.density,2);assert.equal(entry.density,2);
 const png=PNG.sync.read(await readFile(resolve(root,'public/assets',entry.file)));
 assert.equal(png.width,spec.w*2*spec.frames);assert.equal(png.height,spec.h*2);assert.deepEqual(png.data,asset.png.data);
 for(let i=0;i<png.data.length;i+=4){assert([0,255].includes(png.data[i+3]));pixels++;}
 if(spec.kind==='prop')for(let f=0;f<spec.frames;f++)for(let y=png.height-3;y<png.height;y++)for(let x=0;x<spec.w*2;x++){assert.equal(png.data[(y*png.width+f*spec.w*2+x)*4+3],0,key+': below foot');footPixels++;}
 if(key==='prop-route-map')for(const [n,rows]of expected.entries()){
  assert.deepEqual(rows.map(r=>r.replaceAll('*','.')),ROUTE_ROUNDS[n].mazes[0]);
  const ox=3+Math.floor((26-rows[0].length*4)/2),oy=9+Math.floor((23-rows.length*4)/2);
  const distance=Array.from({length:rows.length},()=>Array(rows[0].length).fill(Infinity)),queue=[];let goal;
  rows.forEach((row,y)=>[...row].forEach((c,x)=>{if(c==='S'){queue.push({x,y});distance[y][x]=0;}if(c==='G')goal={x,y};}));
  for(let i=0;i<queue.length;i++){const p=queue[i];for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const x=p.x+dx,y=p.y+dy;if(rows[y]?.[x]&&rows[y][x]!=='#'&&distance[y][x]===Infinity){distance[y][x]=distance[p.y][p.x]+1;queue.push({x,y});}}}
  assert.equal(rows.join('').split('*').length,distance[goal.y][goal.x]);
  rows.forEach((row,y)=>[...row].forEach((c,x)=>{const i=((oy+y*4+1)*png.width+(n+1)*32+ox+x*4+1)*4;assert.deepEqual([...png.data.subarray(i,i+3)],palette.symbols.get({'#':'d','.':'W','*':'C',S:'q',G:'R'}[c]),`map ${n+1} cell ${x},${y}`);mazeCells++;}));
 }
 records.push({key,size:[png.width,png.height],frames:spec.frames});
}
for(const entry of manifest.assets){const png=PNG.sync.read(await readFile(resolve(root,'public/assets',entry.file))),f=atlas.frames[entry.key].frame;assert.equal(f.w,png.width);assert.equal(f.h,png.height);for(let y=0;y<png.height;y++)for(let x=0;x<png.width;x++){const a=(y*png.width+x)*4,b=((f.y+y)*atlasPng.width+f.x+x)*4;assert.deepEqual(png.data.subarray(a,a+4),atlasPng.data.subarray(b,b+4));atlasPixels++;}}
console.log(JSON.stringify({stage,records,pixels,footPixels,mazeCells,atlasPixels,atlas:[atlasPng.width,atlasPng.height],density2:manifest.assets.filter(a=>a.density===2).length}));
