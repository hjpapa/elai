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
const geometry=[];for(const a of selected){if(!['tile','block','char','mob','prop','overlay'].includes(a.spec.kind))continue;for(const [f,g] of loadGrid(a.spec.key).entries()){if(['tile','block'].includes(a.spec.kind)){for(let y=0;y<g.h;y++){let width=0;for(let shift=0;shift<=(a.spec.kind==='block'?16:0);shift++){const yy=y-shift;if(yy>=0&&yy<32)width=Math.max(width,4*Math.min(yy+1,32-yy));}const lo=(64-width)/2;for(let x=0;x<64;x++)if((g.get(x,y)!=='.')!==(x>=lo&&x<lo+width))throw new Error(a.spec.key+': 마름모 경계 '+x+','+y);}}else{for(let y=g.h-3;y<g.h;y++)if(g.rows[y].some(c=>c!=='.'))throw new Error(a.spec.key+': 발 기준점 아래 픽셀, 프레임 '+f);}}geometry.push(a.spec.key);}
const faceOcclusion=[];for(const part of parts){const frames=loadGrid(part.spec.key);let pixels=0;for(let f=0;f<5;f++){const b=pose(f).bob;for(let y=16+b;y<=22+b;y++)for(let x=9;x<=23;x++)if(frames[f].get(x,y)!=='.')pixels++;}if(pixels)faceOcclusion.push({key:part.spec.key,pixels});}
const icons=selected.filter(a=>a.spec.kind==='icon');if(icons.length){const iconSheet=canvas(768,Math.ceil(icons.length/6)*126,[38,44,59]);icons.forEach((a,i)=>{const x=i%6*128,y=Math.floor(i/6)*126;for(let yy=y+24;yy<y+118;yy++)for(let xx=x+64;xx<x+128;xx++)iconSheet.data.set([255,244,210,255],(yy*768+xx)*4);label(iconSheet,a.spec.key.replace('icon-','').slice(0,20),x+2,y+5,palette.symbols.get('W'),1);blitScaled(a.png,iconSheet,x,y+38,2);blitScaled(a.png,iconSheet,x+64,y+38,2);});writeFileSync(out+'icons-'+stage+'.png',PNG.sync.write(iconSheet));}
const diagnostics={stage,keys:selected.length,frames:selected.reduce((s,a)=>s+a.spec.frames,0),density2:assets.filter(a=>a.density===2).length,compare:[compare.width,compare.height],parts:parts.map(a=>a.spec.key),collisions,faceOcclusion,geometry};
writeFileSync(out+`check-${stage}.json`,JSON.stringify(diagnostics,null,2)+'\n');console.log(JSON.stringify(diagnostics));if(collisions.length||faceOcclusion.length)throw new Error('로비 부품 겹침/얼굴 화면 가림이 있어요.');
