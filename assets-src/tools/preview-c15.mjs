import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {PNG} from 'pngjs';
import {ASSETS,originOf} from '../../src/game/assets.ts';
import {parsePalette,loadAsset,canvas,blitScaled,label} from '../../scripts/build-assets.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const stages=[['prop-light-shop','prop-lightboard','prop-light-frame','prop-lamp-shelf'],['icon-bulb-off','icon-bulb-on','icon-light-brush','icon-card-lightOn','icon-card-nextRow']];
const stage=Number(process.argv[2]??1);
if(!stages[stage-1])throw new Error('단계 1 또는 2를 지정해요.');
const palette=parsePalette(JSON.parse(await readFile(resolve(root,'assets-src/palette.json'),'utf8')));
const bg=palette.symbols.get('O'),ink=palette.symbols.get('W');
const records=[];
for(const key of stages[stage-1]){
 const spec=ASSETS.find(a=>a.key===key),asset=await loadAsset(spec,palette.symbols);
 if(!asset)throw new Error('원본 없음: '+key);
 const legacy=PNG.sync.read(await readFile(resolve(root,`assets-src/reference/c15-placeholders/${key}.png`)));
 records.push({...asset,legacy});
}
const width=Math.max(stage===1?1320:1120,...records.map(a=>a.spec.w*a.spec.frames*8+100));
const rowsHeight=records.reduce((n,a)=>n+a.spec.h*4+48,0);
const sheet=canvas(width,68+rowsHeight+(stage===1?1710:520),bg),right=Math.floor(width/2)+12;
label(sheet,'PLACEHOLDER / 4X',24,20,ink);label(sheet,'C15 ART / 2X',right,20,ink);
let row=68;
for(const a of records){
 label(sheet,a.spec.key,24,row,ink);label(sheet,a.spec.key,right,row,ink);
 blitScaled(a.legacy,sheet,24,row+22,4);blitScaled(a.png,sheet,right,row+22,2);
 row+=a.spec.h*4+48;
}
async function frame(key,f=0){
 const spec=ASSETS.find(a=>a.key===key),a=await loadAsset(spec,palette.symbols),density=a?.density??1;
 const strip=a?.png??PNG.sync.read(await readFile(resolve(root,`assets-src/reference/c15-placeholders/${key}.png`)));
 const png=new PNG({width:spec.w*density,height:spec.h*density});
 PNG.bitblt(strip,png,f*png.width,0,png.width,png.height,0,0);return{spec,png,density};
}
async function place(target,key,x,y,f=0,scale=4){
 const a=await frame(key,f),o=originOf(a.spec);
 blitScaled(a.png,target,Math.round(x-a.spec.w*scale*o.x),Math.round(y-a.spec.h*scale*o.y),scale/a.density);
}
if(stage===1){
 for(let state=0;state<2;state++){
  label(sheet,state?'LIGHTSHOP / ALL SIX PICTURES':'LIGHTSHOP / EMPTY FRAMES',24,row,ink);
  const base=row+225,at=(x,y)=>({x:560+(x-y)*64,y:base+(x+y)*32});
  for(let y=0;y<8;y++)for(let x=0;x<10;x++){const p=at(x,y);await place(sheet,'tile-room',p.x,p.y);}
  const objects=[];
  for(let x=0;x<10;x++)objects.push({x,y:0,key:[3,7].includes(x)?'block-room-window':'block-room-wall'});
  for(let y=1;y<8;y++)objects.push({x:0,y,key:y===3?'block-room-window':'block-room-wall'});
  for(const[x,y,key]of[[5,1,'prop-lightboard'],[3,1,'prop-floorlamp'],[8,2,'prop-lamp-shelf'],[8,5,'prop-plant'],[6,7,'tile-doormat']])objects.push({x,y,key,f:key==='tile-doormat'?1:0});
  for(let i=0;i<6;i++)objects.push({x:1,y:1+i,key:'prop-light-frame',f:state?i+1:0});
  objects.sort((a,b)=>a.x+a.y-b.x-b.y);
  for(const o of objects){const p=at(o.x,o.y);await place(sheet,o.key,p.x,p.y,o.f??0);}
  row+=850;
 }
}else{
 label(sheet,'DARK BULB BOARD / OFF - ON - BRUSH / 48PX',24,row,ink);
 const panel=canvas(980,220,palette.symbols.get('N'));
 for(const[ox,on]of[[30,false],[210,true],[390,false],[570,true]]){
  const bulb=await frame(on?'icon-bulb-on':'icon-bulb-off');blitScaled(bulb.png,panel,ox,38,3);
  label(panel,on?'1':'0',ox+41,148,ink);
 }
 const brush=await frame('icon-light-brush');blitScaled(brush.png,panel,780,28,3);
 blitScaled(panel,sheet,24,row+36,1);
 row+=300;
 label(sheet,'GRAYSCALE / BRIGHTNESS + RAYS',24,row,ink);
 const mono=PNG.sync.read(PNG.sync.write(panel));
 for(let i=0;i<mono.data.length;i+=4){const v=Math.round(.2126*mono.data[i]+.7152*mono.data[i+1]+.0722*mono.data[i+2]);mono.data[i]=mono.data[i+1]=mono.data[i+2]=v;}
 blitScaled(mono,sheet,24,row+26,1);
}
await mkdir(resolve(root,'assets-preview'),{recursive:true});
const target=resolve(root,`assets-preview/compare-15-${stage}.png`);
await writeFile(target,PNG.sync.write(sheet));console.log(target,`${sheet.width}x${sheet.height}`);
