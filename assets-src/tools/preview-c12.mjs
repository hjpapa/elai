import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {PNG} from 'pngjs';
import {ASSETS} from '../../src/game/assets.ts';
import {parsePalette,loadAsset,comparisonSheet,canvas,blitScaled,label,parseFrames,renderFrames} from '../../scripts/build-assets.mjs';
import {STAGES} from './c12-stages.mjs';
import {root,loadGrid,pose} from './c12-common.mjs';
const stage=Number(process.argv[2]);if(!STAGES[stage])throw new Error('단계 번호 1~9가 필요해요.');
const palette=parsePalette(JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')));
const assets=await Promise.all(ASSETS.map(spec=>loadAsset(spec,palette.symbols)));
const selected=STAGES[stage].keys.map(key=>assets.find(a=>a.spec.key===key));
if(selected.some(a=>a.density!==2))throw new Error('아직 1배인 단계 원본이 있어요.');
const pathReference=root+'assets-src/reference/c11-icon-path-step.txt';
if(stage===2&&existsSync(pathReference)){const a=assets.find(a=>a.spec.key==='icon-path-step');a.legacy=renderFrames(a.spec,parseFrames(readFileSync(pathReference,'utf8'),a.spec,palette.symbols,2),palette.symbols,2);a.legacyDensity=2;}
const out=root+'assets-preview/';mkdirSync(out,{recursive:true});
const compare=comparisonSheet(assets,palette,STAGES[stage].keys);writeFileSync(out+`compare-${stage}.png`,PNG.sync.write(compare));
// 나눠진 검토판은 모든 프레임을 원래 비율로 읽기 쉽게 보여요.
let part=0;for(let y=0;y<compare.height;y+=1200){const crop=new PNG({width:compare.width,height:Math.min(1200,compare.height-y)});PNG.bitblt(compare,crop,0,y,crop.width,crop.height,0,0);writeFileSync(out+`compare-${stage}-part-${++part}.png`,PNG.sync.write(crop));}
const hats=assets.filter(a=>a.spec.key.startsWith('equip-hat-')&&a.density===2),tools=assets.filter(a=>a.spec.key.startsWith('equip-tool-')&&a.density===2),parts=assets.filter(a=>a.spec.key.startsWith('robi-part-')&&a.density===2);
const rows=[];for(const h of hats)for(const t of tools)rows.push({name:h.spec.key+' / '+t.spec.key,keys:['char-player',h.spec.key,t.spec.key]});
rows.push({name:'ROBI ALL CURRENT 2X PARTS',keys:['char-robi',...parts.map(a=>a.spec.key)]});
const composite=(keys,flip)=>{const png=new PNG({width:320,height:48});for(const key of keys){const a=assets.find(a=>a.spec.key===key);blitScaled(a.png,png,0,0,1);}if(flip){const flipped=new PNG({width:320,height:48});for(let f=0;f<10;f++)for(let y=0;y<48;y++)for(let x=0;x<32;x++)png.data.copy(flipped.data,(y*320+f*32+31-x)*4,(y*320+f*32+x)*4,(y*320+f*32+x)*4+4);return flipped;}return png;};
if(stage!==2){const sheet=canvas(1328,rows.length*132,[38,44,59]);rows.forEach((row,i)=>{label(sheet,row.name,16,i*132+8,palette.symbols.get('W'),1);label(sheet,'FLIPPED',680,i*132+8,palette.symbols.get('W'),1);blitScaled(composite(row.keys,false),sheet,16,i*132+26,2);blitScaled(composite(row.keys,true),sheet,680,i*132+26,2);});writeFileSync(out+'overlays.png',PNG.sync.write(sheet));writeFileSync(out+`overlays-${stage}.png`,PNG.sync.write(sheet));}
const collisions=[];for(let i=0;i<parts.length;i++)for(let j=i+1;j<parts.length;j++){const a=loadGrid(parts[i].spec.key),b=loadGrid(parts[j].spec.key);let pixels=0;for(let f=0;f<10;f++)for(let y=0;y<48;y++)for(let x=0;x<32;x++)if(a[f].get(x,y)!=='.'&&b[f].get(x,y)!=='.')pixels++;if(pixels)collisions.push({a:parts[i].spec.key,b:parts[j].spec.key,pixels});}
const diagnostics={stage,keys:selected.length,frames:selected.reduce((s,a)=>s+a.spec.frames,0),density2:assets.filter(a=>a.density===2).length,compare:[compare.width,compare.height],parts:parts.map(a=>a.spec.key),collisions};
writeFileSync(out+`check-${stage}.json`,JSON.stringify(diagnostics,null,2)+'\n');console.log(JSON.stringify(diagnostics));if(collisions.length)throw new Error('로비 부품끼리 겹쳐요.');
