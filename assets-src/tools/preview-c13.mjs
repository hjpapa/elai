import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {PNG} from 'pngjs';
import {ASSETS,originOf} from '../../src/game/assets.ts';
import {parsePalette,loadAsset,canvas,blitScaled,label} from '../../scripts/build-assets.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
export const STAGES=[
 ['prop-workshop','tile-room','tile-rug','tile-doormat','block-room-wall','block-room-window','prop-workbench','prop-toybox','prop-plant','prop-floorlamp','prop-cushion'],
 ['prop-claw-machine','prop-claw','icon-claw-exit','icon-card-grab'],
 ['prop-doll-dummy','prop-doll-slime','prop-doll-bug','prop-doll-bat','prop-doll-guardian','prop-doll-robi'],
 ['tile-cave'],
];
const stage=Number(process.argv[2]??1);if(!STAGES[stage-1])throw new Error('단계 1~4를 지정해요.');
const palette=parsePalette(JSON.parse(await readFile(resolve(root,'assets-src/palette.json'),'utf8')));
const bg=palette.symbols.get('O'),ink=palette.symbols.get('W');
const records=[];
for(const key of STAGES[stage-1]){
 const spec=ASSETS.find(a=>a.key===key),asset=await loadAsset(spec,palette.symbols);
 if(!asset)throw new Error('원본 없음: '+key);
 const legacy=PNG.sync.read(await readFile(resolve(root,'assets-src/reference',stage===4?'c13-cave-before.png':`c13-placeholders/${key}.png`)));
 records.push({...asset,legacy,legacyDensity:stage===4?2:1});
}
const width=Math.max(stage===1?1280:1100,...records.map(a=>a.spec.w*a.spec.frames*8+80));
const rowsHeight=records.reduce((n,a)=>n+a.spec.h*4+48,0);
const extra=stage===1?1000:stage===3?310:stage===4?420:0;
const sheet=canvas(width,68+rowsHeight+extra,bg),right=Math.floor(width/2)+12;
label(sheet,stage===4?'C12 CAVE / 2X':'PLACEHOLDER / 4X',24,20,ink);
label(sheet,'C13 ART / 2X',right,20,ink);
let row=68;
for(const a of records){
 label(sheet,a.spec.key,24,row,ink);label(sheet,a.spec.key,right,row,ink);
 blitScaled(a.legacy,sheet,24,row+22,4/a.legacyDensity);blitScaled(a.png,sheet,right,row+22,2);
 row+=a.spec.h*4+48;
}
async function frame(key,f=0){
 const spec=ASSETS.find(a=>a.key===key),a=await loadAsset(spec,palette.symbols);
 const density=a?.density??1;
 const strip=a?.png??PNG.sync.read(await readFile(resolve(root,`assets-src/reference/c13-placeholders/${key}.png`)));
 const png=new PNG({width:spec.w*density,height:spec.h*density});
 PNG.bitblt(strip,png,f*png.width,0,png.width,png.height,0,0);
 return{spec,png,density};
}
async function place(key,x,y,f=0){const a=await frame(key,f),o=originOf(a.spec);blitScaled(a.png,sheet,Math.round(x-a.spec.w*4*o.x),Math.round(y-a.spec.h*4*o.y),4/a.density);}
if(stage===1){
 label(sheet,'WORKROOM / MAP LAYOUT',24,row,ink);row+=220;
 const ox=544,oy=row;
 const at=(x,y)=>({x:ox+(x-y)*64,y:oy+(x+y)*32});
 for(let y=0;y<8;y++)for(let x=0;x<10;x++){const p=at(x,y);await place(x>=2&&x<=3&&y>=2&&y<=6?'tile-rug':'tile-room',p.x,p.y);}
 const objects=[];
 for(let x=0;x<10;x++)objects.push({x,y:0,key:[3,7].includes(x)?'block-room-window':'block-room-wall'});
 for(let y=1;y<8;y++)objects.push({x:0,y,key:y===3?'block-room-window':'block-room-wall'});
 for(const [x,y,key]of[[5,1,'prop-claw-machine'],[2,1,'prop-plant'],[3,1,'prop-floorlamp'],[7,1,'prop-toybox'],[8,1,'prop-workbench'],[6,7,'tile-doormat']])objects.push({x,y,key});
 for(let y=1;y<=6;y++)objects.push({x:1,y,key:'prop-cushion'});
 objects.sort((a,b)=>(a.x+a.y)-(b.x+b.y));
 for(const obj of objects){const p=at(obj.x,obj.y);await place(obj.key,p.x,p.y,obj.key==='tile-doormat'?1:0);}
}
if(stage===3){label(sheet,'DOLLS ON CUSHIONS / SHARED FOOT ANCHOR',24,row,ink);for(let i=0;i<records.length;i++){const x=90+i*175;await place('prop-cushion',x,row+160);await place(records[i].spec.key,x,row+160);}}
if(stage===4){
 label(sheet,'4 X 4 / OLD',24,row,ink);label(sheet,'4 X 4 / NEW',right,row,ink);
 for(let side=0;side<2;side++)for(let y=0;y<4;y++)for(let x=0;x<4;x++)blitScaled(side?records[0].png:records[0].legacy,sheet,(side?right:24)+196+(x-y)*32,row+55+(x+y)*16,1);
}
await mkdir(resolve(root,'assets-preview'),{recursive:true});
const target=resolve(root,`assets-preview/compare-13-${stage}.png`);await writeFile(target,PNG.sync.write(sheet));console.log(target,`${sheet.width}x${sheet.height}`);
