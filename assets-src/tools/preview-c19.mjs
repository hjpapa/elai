import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {PNG} from 'pngjs';
import {BAKERY_ROUNDS} from '../../src/data/minigames/bakery.ts';
import {cakePixels} from '../../src/minigames/bakery/cakeArt.ts';
import {ASSETS,originOf} from '../../src/game/assets.ts';
import {parsePalette,loadAsset,canvas,blitScaled,label} from '../../scripts/build-assets.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const stages=[['prop-bakery','prop-oven','prop-cake-stand','prop-bread-shelf'],['icon-cake']];
const stage=Number(process.argv[2]??1);
if(!stages[stage-1])throw new Error('단계 1 또는 2를 지정해요.');
const palette=parsePalette(JSON.parse(await readFile(resolve(root,'assets-src/palette.json'),'utf8')));
const bg=palette.symbols.get('O'),ink=palette.symbols.get('W');
const records=[];
for(const key of stages[stage-1]){
 const spec=ASSETS.find(a=>a.key===key),asset=await loadAsset(spec,palette.symbols);
 if(!asset)throw new Error('원본 없음: '+key);
 const legacy=PNG.sync.read(await readFile(resolve(root,`assets-src/reference/c19-placeholders/${key}.png`)));
 records.push({...asset,legacy});
}
const width=Math.max(stage===1?1320:1120,...records.map(a=>a.spec.w*a.spec.frames*8+100));
const rowsHeight=records.reduce((n,a)=>n+a.spec.h*4+48,0);
const sheet=canvas(width,68+rowsHeight+(stage===1?1980:300),bg),right=Math.floor(width/2)+12;
label(sheet,'PLACEHOLDER / 4X',24,20,ink);label(sheet,'C19 ART / 2X',right,20,ink);
let row=68;
for(const a of records){
 label(sheet,a.spec.key,24,row,ink);label(sheet,a.spec.key,right,row,ink);
 blitScaled(a.legacy,sheet,24,row+22,4);blitScaled(a.png,sheet,right,row+22,2);
 row+=a.spec.h*4+48;
}
async function frame(key,f=0){
 const spec=ASSETS.find(a=>a.key===key),a=await loadAsset(spec,palette.symbols),density=a?.density??1;
 const strip=a?.png??PNG.sync.read(await readFile(resolve(root,`assets-src/reference/c19-placeholders/${key}.png`)));
 const png=new PNG({width:spec.w*density,height:spec.h*density});
 PNG.bitblt(strip,png,f*png.width,0,png.width,png.height,0,0);return{spec,png,density};
}
async function place(target,key,x,y,f=0,scale=4){
 const a=await frame(key,f),o=originOf(a.spec);
 blitScaled(a.png,target,Math.round(x-a.spec.w*scale*o.x),Math.round(y-a.spec.h*scale*o.y),scale/a.density);
}
if(stage===1){
 label(sheet,'REWARD STAND / GAME CAKE (LAST CUSTOMER)',24,row,ink);row+=34;
 for(let i=0;i<6;i++){
  const ox=24+i*210,a=await frame('prop-cake-stand',i+1),order=BAKERY_ROUNDS[i].customers.at(-1).want,px=cakePixels(order),game=new PNG({width:16,height:16});
  px.forEach((line,y)=>line.forEach((c,x)=>{if(c)game.data.set([...([1,3,5].map(k=>parseInt(c.slice(k,k+2),16))),255],(y*16+x)*4);}));
  label(sheet,'R'+(i+1),ox,row,ink,1);blitScaled(a.png,sheet,ox,row+22,2);blitScaled(game,sheet,ox+84,row+22,4);
 }
 row+=236;
 for(let state=0;state<2;state++){
  label(sheet,state?'BAKERY / ALL SIX CAKES':'BAKERY / EMPTY PLATES',24,row,ink);
  const base=row+225,at=(x,y)=>({x:560+(x-y)*64,y:base+(x+y)*32});
  for(let y=0;y<8;y++)for(let x=0;x<10;x++){const p=at(x,y);await place(sheet,'tile-room',p.x,p.y);}
  const objects=[];
  for(let x=0;x<10;x++)objects.push({x,y:0,key:[3,7].includes(x)?'block-room-window':'block-room-wall'});
  for(let y=1;y<8;y++)objects.push({x:0,y,key:y===3?'block-room-window':'block-room-wall'});
  for(const[x,y,key]of[[5,1,'prop-oven'],[3,1,'prop-floorlamp'],[8,2,'prop-bread-shelf'],[8,5,'prop-plant'],[6,7,'tile-doormat']])objects.push({x,y,key,f:key==='tile-doormat'?1:0});
  for(let i=0;i<6;i++)objects.push({x:1,y:1+i,key:'prop-cake-stand',f:state?i+1:0});
  objects.sort((a,b)=>a.x+a.y-b.x-b.y);
  for(const o of objects){const p=at(o.x,o.y);await place(sheet,o.key,p.x,p.y,o.f??0);}
  row+=850;
 }
}else{
 label(sheet,'DARK / CREAM BACKGROUND - 48PX AND 28PX',24,row,ink);
 const a=await frame('icon-cake');
 for(const[i,bg]of [[38,44,59],[255,244,210]].entries()){
  const panel=canvas(500,220,bg),text=i?[41,48,68]:ink;
  for(const[j,size]of [48,28].entries()){
   label(panel,size+'PX',28+j*220,20,text,1);
   for(let y=0;y<size;y++)for(let x=0;x<size;x++){const q=(Math.floor(y*32/size)*32+Math.floor(x*32/size))*4;if(a.png.data[q+3])panel.data.set(a.png.data.subarray(q,q+4),((65+y)*500+28+j*220+x)*4);}
  }
  blitScaled(panel,sheet,24+i*540,row+36,1);
 }

}
await mkdir(resolve(root,'assets-preview'),{recursive:true});
const target=resolve(root,`assets-preview/compare-19-${stage}.png`);
await writeFile(target,PNG.sync.write(sheet));console.log(target,`${sheet.width}x${sheet.height}`);
