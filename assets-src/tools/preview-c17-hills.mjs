import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {PNG} from 'pngjs';
import {canvas,blitScaled,label} from '../../scripts/build-assets.mjs';
import {root} from './c12-common.mjs';
const [stage,captures]=process.argv.slice(2);
if(!/^[1-4]$/.test(stage)||!captures)throw Error('단계 1~4와 브라우저 캡처 폴더를 지정해요.');
const read=name=>PNG.sync.read(readFileSync(resolve(captures,name+'.png')));
const bg=[24,29,47],ink=[245,239,216];
let sheet,name;
if(stage==='1'){
 const scenes=['summit','observatory','cave'];sheet=canvas(2720,scenes.length*1040,bg);
 for(const [row,scene]of scenes.entries())for(const [col,state]of ['before','after'].entries()){
  label(sheet,`C17 ${scene} / ${state}`,col*1360+20,row*1040+12,ink);
  blitScaled(read(`c17-edges-${scene}-${state}`),sheet,col*1360,row*1040+40,1);
 }
 name='edges-17-1.png';
}else{
 const images=['overview','summit'].map(scene=>read(`c17-${stage}-${scene}`));
 sheet=canvas(images[0].width,images.reduce((n,p)=>n+p.height+36,0),bg);let y=0;
 for(const [i,p]of images.entries()){label(sheet,`C17-${stage} / ${i?'SUMMIT AND NPC GUIDE':'MAP OVERVIEW'}`,20,y+10,ink);blitScaled(p,sheet,0,y+36,1);y+=p.height+36;}
 name=`hills-17-${stage}.png`;
}
mkdirSync(resolve(root,'assets-preview'),{recursive:true});writeFileSync(resolve(root,'assets-preview',name),PNG.sync.write(sheet));
