import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {PNG} from 'pngjs';
import {ASSETS} from '../../src/game/assets.ts';
import {parsePalette,parseFrames,renderFrames,canvas,blitScaled,label} from '../../scripts/build-assets.mjs';
import {root} from './c12-common.mjs';
const spec=ASSETS.find(a=>a.key==='prop-doll-bug');
const pal=parsePalette(JSON.parse(readFileSync(resolve(root,'assets-src/palette.json'),'utf8')));
const render=path=>renderFrames(spec,parseFrames(readFileSync(resolve(root,path),'utf8'),spec,pal.symbols,2),pal.symbols,2);
const before=render('assets-src/reference/c17-before/prop-doll-bug.txt'),after=render('assets-src/hires/prop/prop-doll-bug.txt');
// 16px 원래 크기는 축소 필터 없이 각 2px 블록 중앙을 샘플링해요.
function native(source){const p=new PNG({width:16,height:16});for(let y=0;y<16;y++)for(let x=0;x<16;x++){const i=((y*2+1)*32+x*2+1)*4;p.data.set(source.data.subarray(i,i+4),(y*16+x)*4);}return p;}
const captures=process.argv[2];
const shot=captures&&existsSync(resolve(captures,'c17-5-workroom.png'))?PNG.sync.read(readFileSync(resolve(captures,'c17-5-workroom.png'))):null;
const out=canvas(1360,shot?1320:320,[28,32,44]);
for(const [i,img]of [before,after].entries()){
 const x=24+i*680;label(out,i?'C17 BODY PATTERN':'C16 LABEL PATCH',x,20,[245,239,216]);
 label(out,'16PX',x,62,[245,239,216]);blitScaled(native(img),out,x+22,100,1);
 label(out,'4X',x+120,62,[245,239,216]);blitScaled(img,out,x+120,88,2);
 label(out,'DETAIL',x+240,62,[245,239,216]);blitScaled(img,out,x+240,88,6);
}
if(shot){label(out,'WORKROOM / SIX DOLLS',24,290,[245,239,216]);blitScaled(shot,out,0,320,1);}
writeFileSync(resolve(root,'assets-preview/compare-17-5.png'),PNG.sync.write(out));
