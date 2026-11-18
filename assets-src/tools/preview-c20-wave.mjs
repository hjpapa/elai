import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { PNG } from 'pngjs';
import { root } from './c12-common.mjs';
import { canvas, label } from '../../scripts/build-assets.mjs';

const sheet=canvas(640,240,[38,44,59]);
const ink=[255,244,210];
async function sample(path,x,y,size) {
  const im=PNG.sync.read(await readFile(root+path));
  for(let dy=0;dy<size;dy++) for(let dx=0;dx<size;dx++) {
    const p=(Math.floor(dy*im.height/size)*im.width+Math.floor(dx*im.width/size))*4;
    if(im.data[p+3]) sheet.data.set(im.data.subarray(p,p+4),((y+dy)*sheet.width+x+dx)*4);
  }
}
for(const [column,path] of ['assets-src/reference/c20-placeholders/icon-card-followWave.png','public/assets/icon/icon-card-followWave.png'].entries()){
  const x=24+column*310;
  label(sheet,column?'NEW':'BEFORE',x,18,ink,2);
  for(const [index,size] of [28,56].entries()){
    label(sheet,size+'PX',x+100*index,58,ink,1);
    await sample(path,x+100*index,78,size);
  }
}
label(sheet,'FORWARD / TURN LEFT / TURN RIGHT / FOLLOW WAVE',24,165,ink,1);
for(const [i,id] of ['forward','turnLeft','turnRight','followWave'].entries())
  await sample('public/assets/icon/icon-card-'+id+'.png',24+i*65,190,28);
await mkdir(root+'assets-preview',{recursive:true});
await writeFile(root+'assets-preview/compare-20-3.png',PNG.sync.write(sheet));
