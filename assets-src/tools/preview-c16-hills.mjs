import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {PNG} from 'pngjs';
import {canvas,blitScaled,label} from '../../scripts/build-assets.mjs';
import {root} from './c12-common.mjs';
const [stage, captures]=process.argv.slice(2);
if(!/^[1-4]$/.test(stage)||!captures)throw Error('단계 1~4와 브라우저 캡처 폴더를 지정해요.');
const images=['overview','summit'].map(name=>PNG.sync.read(readFileSync(resolve(captures,`c16-${stage}-${name}.png`))));
const sheet=canvas(images[0].width,images.reduce((n,p)=>n+p.height+36,0),[24,29,47]);
let y=0;for(const [i,p]of images.entries()){label(sheet,`C16-${stage} / ${i?'SUMMIT AND NPC GUIDE':'MAP OVERVIEW'}`,20,y+10,[245,239,216]);blitScaled(p,sheet,0,y+36,1);y+=p.height+36;}
mkdirSync(resolve(root,'assets-preview'),{recursive:true});writeFileSync(resolve(root,`assets-preview/hills-16-${stage}.png`),PNG.sync.write(sheet));

