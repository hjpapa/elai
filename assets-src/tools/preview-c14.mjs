import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {PNG} from 'pngjs';
import {ASSETS,originOf} from '../../src/game/assets.ts';
import {parsePalette,loadAsset,canvas,blitScaled,label} from '../../scripts/build-assets.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const stages=[
 ['prop-parcel-office','prop-sorter','prop-parcel-stack','prop-parcel-pile'],
 ['prop-sort-basket','icon-sort-heart','icon-sort-star','icon-sort-ball','icon-card-sendLeft','icon-card-sendRight','icon-stamp'],
 ['block-cave'],
];
const stage=Number(process.argv[2]??1);if(!stages[stage-1])throw new Error('단계 1~3을 지정해요.');
const palette=parsePalette(JSON.parse(await readFile(resolve(root,'assets-src/palette.json'),'utf8'))),bg=palette.symbols.get('O'),ink=palette.symbols.get('W');
const records=[];
for(const key of stages[stage-1]){
 const spec=ASSETS.find(a=>a.key===key),asset=await loadAsset(spec,palette.symbols);
 if(!asset)throw new Error('원본 없음: '+key);
 const legacy=PNG.sync.read(await readFile(resolve(root,'assets-src/reference',stage===3?'c14-block-cave-before.png':`c14-placeholders/${key}.png`)));
 records.push({...asset,legacy,legacyDensity:stage===3?2:1});
}
const width=Math.max(stage===1?1280:1100,...records.map(a=>a.spec.w*a.spec.frames*8+80));
const rowsHeight=records.reduce((n,a)=>n+a.spec.h*4+48,0),extra=stage===1?1000:stage===3?440:0;
const sheet=canvas(width,68+rowsHeight+extra,bg),right=Math.floor(width/2)+12;
label(sheet,stage===3?'C12 WALL / 2X':'PLACEHOLDER / 4X',24,20,ink);label(sheet,'C14 ART / 2X',right,20,ink);
let row=68;
for(const a of records){label(sheet,a.spec.key,24,row,ink);label(sheet,a.spec.key,right,row,ink);blitScaled(a.legacy,sheet,24,row+22,4/a.legacyDensity);blitScaled(a.png,sheet,right,row+22,2);row+=a.spec.h*4+48;}
async function frame(key,f=0){const spec=ASSETS.find(a=>a.key===key),a=await loadAsset(spec,palette.symbols),density=a?.density??1;
 const strip=a?.png??PNG.sync.read(await readFile(resolve(root,`assets-src/reference/c14-placeholders/${key}.png`)));
 const png=new PNG({width:spec.w*density,height:spec.h*density});PNG.bitblt(strip,png,f*png.width,0,png.width,png.height,0,0);return{spec,png,density};}
async function place(key,x,y,f=0,source=null){const a=await frame(key,f),o=originOf(a.spec);blitScaled(source??a.png,sheet,Math.round(x-a.spec.w*4*o.x),Math.round(y-a.spec.h*4*o.y),4/a.density);}
if(stage===1){
 label(sheet,'PARCEL / MAP LAYOUT / ALL SIX STAMPS',24,row,ink);row+=220;
 const at=(x,y)=>({x:544+(x-y)*64,y:row+(x+y)*32});
 for(let y=0;y<8;y++)for(let x=0;x<10;x++){const p=at(x,y);await place('tile-room',p.x,p.y);}
 const objects=[];
 for(let x=0;x<10;x++)objects.push({x,y:0,key:[2,6].includes(x)?'block-room-window':'block-room-wall'});
 for(let y=1;y<8;y++)objects.push({x:0,y,key:y===4?'block-room-window':'block-room-wall'});
 for(const[x,y,key]of[[5,1,'prop-sorter'],[3,1,'prop-plant'],[7,1,'prop-floorlamp'],[8,1,'prop-parcel-pile'],[8,4,'prop-parcel-pile'],[6,7,'tile-doormat']])objects.push({x,y,key,f:key==='tile-doormat'?1:0});
 for(let i=0;i<6;i++)objects.push({x:1,y:1+i,key:'prop-parcel-stack',f:i%2});
 objects.sort((a,b)=>(a.x+a.y)-(b.x+b.y));for(const o of objects){const p=at(o.x,o.y);await place(o.key,p.x,p.y,o.f??0);}
}
if(stage===3){
 label(sheet,'OLD WALL / C13 FLOOR',24,row,ink);label(sheet,'NEW WALL / C13 FLOOR',right,row,ink);
 for(let side=0;side<2;side++){
  const at=(x,y)=>({x:(side?right:24)+256+(x-y)*64,y:row+94+(x+y)*32});
  for(let y=0;y<4;y++)for(let x=0;x<4;x++){const p=at(x,y);await place('tile-cave',p.x,p.y);}
  const walls=[];for(let x=0;x<4;x++)walls.push({x,y:0});for(let y=1;y<4;y++)walls.push({x:0,y});
  walls.sort((a,b)=>a.x+a.y-b.x-b.y);for(const w of walls){const p=at(w.x,w.y);await place('block-cave',p.x,p.y,0,side?records[0].png:records[0].legacy);}
  const p=at(2,2);await place('prop-crystal',p.x,p.y,1);
 }
}
await mkdir(resolve(root,'assets-preview'),{recursive:true});const target=resolve(root,`assets-preview/compare-14-${stage}.png`);await writeFile(target,PNG.sync.write(sheet));console.log(target,`${sheet.width}x${sheet.height}`);
