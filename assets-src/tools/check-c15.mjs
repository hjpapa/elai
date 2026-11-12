import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {PNG} from 'pngjs';
import {ASSETS} from '../../src/game/assets.ts';
import {LIGHT_ROUNDS} from '../../src/data/minigames/light.ts';
import {parsePalette,loadAsset} from '../../scripts/build-assets.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const stage=Number(process.argv[2]??1),keys=['prop-light-shop','prop-lightboard','prop-light-frame','prop-lamp-shelf',...(stage===2?['icon-bulb-off','icon-bulb-on','icon-light-brush','icon-card-lightOn','icon-card-nextRow']:[])];
const pal=parsePalette(JSON.parse(await readFile(resolve(root,'assets-src/palette.json'),'utf8')));
const manifest=JSON.parse(await readFile(resolve(root,'public/assets/manifest.json'),'utf8'));
const atlas=JSON.parse(await readFile(resolve(root,'public/assets/atlas.json'),'utf8'));
const atlasPng=PNG.sync.read(await readFile(resolve(root,'public/assets/atlas.png')));
assert(atlasPng.width<=4096&&atlasPng.height<=4096);
let pixels=0,feetPixels=0,patternCells=0,atlasPixels=0;
const records=[];
for(const key of keys){
 const spec=ASSETS.find(a=>a.key===key),a=await loadAsset(spec,pal.symbols),entry=manifest.assets.find(a=>a.key===key);
 assert.equal(a.density,2);assert.equal(entry.density,2);
 const png=PNG.sync.read(await readFile(resolve(root,'public/assets',entry.file)));
 assert.equal(png.width,spec.w*2*spec.frames);assert.equal(png.height,spec.h*2);assert.deepEqual(png.data,a.png.data);
 for(let i=0;i<png.data.length;i+=4){assert([0,255].includes(png.data[i+3]));pixels++;}
 if(spec.kind==='prop')for(let f=0;f<spec.frames;f++)for(let y=png.height-3;y<png.height;y++)for(let x=0;x<spec.w*2;x++){assert.equal(png.data[(y*png.width+f*spec.w*2+x)*4+3],0,key+': below foot');feetPixels++;}
 records.push({key,size:[png.width,png.height],frames:spec.frames});
 if(key==='prop-light-frame'){
  for(let f=1;f<=6;f++){
   const pic=LIGHT_ROUNDS[f-1].pictures[0],ox=5+Math.floor((22-pic[0].length*4)/2),oy=10+Math.floor((23-pic.length*4)/2);
   pic.forEach((row,y)=>[...row].forEach((bit,x)=>{
    const i=((oy+y*4+1)*png.width+f*32+ox+x*4+1)*4;
    assert.deepEqual([...png.data.subarray(i,i+3)],pal.symbols.get(bit==='1'?'W':'N'),`frame ${f},${x},${y}`);patternCells++;
   }));
  }
 }
}
// 모든 기존 그림도 새 한 장 아틀라스에 손실 없이 들어갔는지 확인해요.
for(const entry of manifest.assets){
 const png=PNG.sync.read(await readFile(resolve(root,'public/assets',entry.file))),rec=atlas.frames[entry.key];
 assert(rec,entry.key);const f=rec.frame;assert.equal(f.w,png.width);assert.equal(f.h,png.height);
 for(let y=0;y<png.height;y++)for(let x=0;x<png.width;x++){
  const a=(y*png.width+x)*4,b=((f.y+y)*atlasPng.width+f.x+x)*4;
  assert.deepEqual(png.data.subarray(a,a+4),atlasPng.data.subarray(b,b+4));atlasPixels++;
 }
}
console.log(JSON.stringify({stage,records,pixels,feetPixels,patternCells,atlasPixels,atlas:[atlasPng.width,atlasPng.height],generatedKeys:manifest.assets.length,density2:manifest.assets.filter(a=>a.density===2).length}));
