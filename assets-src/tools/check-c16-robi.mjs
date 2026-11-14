import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {PNG} from 'pngjs';
import {ASSETS} from '../../src/game/assets.ts';
import {parsePalette,parseFrames,renderFrames,canvas,blitScaled,label} from '../../scripts/build-assets.mjs';
import {root,loadGrid,pose} from './c12-common.mjs';
const palette=parsePalette(JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')));
const partKeys=ASSETS.filter(a=>a.key.startsWith('robi-part-')).map(a=>a.key);
assert.equal(partKeys.length,8,'8부품을 모두 검사해요.');
const parts=new Map(partKeys.map(key=>[key,loadGrid(key)]));
const collisions=[],faceOcclusion=[],touching=[];
let pairChecks=0,faceChecks=0;
for(const flip of [false,true])for(let f=0;f<10;f++){
 const at=(key,x,y)=>parts.get(key)[f].get(flip?31-x:x,y);
 for(let i=0;i<partKeys.length;i++)for(let j=i+1;j<partKeys.length;j++){
  pairChecks++;let pixels=0;
  for(let y=0;y<48;y++)for(let x=0;x<32;x++)if(at(partKeys[i],x,y)!=='.'&&at(partKeys[j],x,y)!=='.')pixels++;
  if(pixels)collisions.push({a:partKeys[i],b:partKeys[j],f,flip,pixels});
 }
 for(const key of partKeys)if(f<5){
  faceChecks++;let pixels=0;
  for(let y=16+pose(f).bob;y<=22+pose(f).bob;y++)for(let x=9;x<=23;x++)if(at(key,flip?31-x:x,y)!=='.')pixels++;
  if(pixels)faceOcclusion.push({key,f,flip,pixels});
 }
 // 별·센서와 말풍선 사이에는 투명 한 픽셀 이상을 남겨요.
 for(const key of ['robi-part-predictor','robi-part-sensor'])for(let y=0;y<48;y++)for(let x=0;x<32;x++){
  if(at('robi-part-talk',x,y)==='.')continue;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(at(key,x+dx,y+dy)!=='.')touching.push({key,f,flip,x,y});
 }
}
for(let f=0;f<10;f++){
 const badge=parts.get('robi-part-ethics')[f];let count=0;
 for(let y=0;y<48;y++)for(let x=0;x<32;x++)if(badge.get(x,y)!=='.'){
  count++;if(f<5)assert.ok(x>=12&&x<=20&&y>=29+pose(f).bob&&y<=36+pose(f).bob,'가슴 범위');
  else assert.ok(x>=23&&x<=24&&y>=27+pose(f).bob&&y<=28+pose(f).bob,'뒤에서는 고정 탭만 보여요.');
 }
 if(f<5)assert.ok(count>0);else assert.equal(count,4);
}
const chosen=['robi-part-ethics','robi-part-talk','prop-doll-bug'];
const spec=key=>ASSETS.find(a=>a.key===key);
function png(key,before=false){const a=spec(key),file=before?`assets-src/reference/c16-before/${key}.txt`:`assets-src/hires/${a.kind}/${key}.txt`;return renderFrames(a,parseFrames(readFileSync(root+file,'utf8'),a,palette.symbols,2),palette.symbols,2);}
function flipStrip(p){const q=new PNG({width:p.width,height:p.height});for(let f=0;f<10;f++)for(let y=0;y<48;y++)for(let x=0;x<32;x++)p.data.copy(q.data,(y*320+f*32+31-x)*4,(y*320+f*32+x)*4,(y*320+f*32+x)*4+4);return q;}
function robi(before=false){const p=new PNG({width:320,height:48});for(const key of ['char-robi',...partKeys])blitScaled(png(key,before&&chosen.includes(key)),p,0,0,1);return p;}
const ink=palette.symbols.get('W'),bg=palette.symbols.get('O');
const sheet=canvas(1384,770,bg),right=716;
label(sheet,'BEFORE / ALL FRAMES',24,20,ink);label(sheet,'C16 / ALL FRAMES',right,20,ink);
for(const [i,key]of chosen.entries()){const y=60+i*146;label(sheet,key,24,y,ink,1);label(sheet,key,right,y,ink,1);blitScaled(png(key,true),sheet,24,y+24,2);blitScaled(png(key),sheet,right,y+24,2);}
label(sheet,'ALL 8 PARTS',24,490,ink);label(sheet,'ALL 8 PARTS',right,490,ink);
blitScaled(robi(true),sheet,24,516,2);blitScaled(robi(),sheet,right,516,2);
// 논리 원크기 16×16과 4배 64×64. 최근접 보간으로 정확히 절반 크기를 그려요.
function resizeNearest(p,w,h){const q=new PNG({width:w,height:h});for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(Math.floor(y*p.height/h)*p.width+Math.floor(x*p.width/w))*4;p.data.copy(q.data,(y*w+x)*4,i,i+4);}return q;}
for(const [before,x]of [[true,24],[false,right]]){
 const p=png('prop-doll-bug',before);label(sheet,'BUG / 16PX - 64PX',x,644,ink,1);blitScaled(resizeNearest(p,16,16),sheet,x,684,1);blitScaled(p,sheet,x+64,670,2);
}
const composite=canvas(1384,464,bg);
for(const [row,before]of [[0,true],[1,false]])for(const [flip,x]of [[false,24],[true,right]]){
 const y=row*156;label(composite,`${before?'BEFORE':'C16'} / ${flip?'FLIPPED':'NORMAL'}`,x,y+12,ink);
 for(let f=0;f<10;f++)label(composite,String(f),x+f*64+24,y+36,ink,1);
 blitScaled(flip?flipStrip(robi(before)):robi(before),composite,x,y+52,2);
}
label(composite,'C16 / NATIVE 16 X 24 / NORMAL AND FLIPPED',24,338,ink,1);
for(const [flip,x]of [[false,24],[true,384]])blitScaled(resizeNearest(flip?flipStrip(robi()):robi(),160,24),composite,x,362,1);
label(composite,'C16 / LIGHT BACKGROUND',24,420,ink,1);
for(let y=330;y<458;y++)for(let x=720;x<1370;x++)composite.data.set([255,244,210,255],(y*composite.width+x)*4);
blitScaled(robi(),composite,724,346,2);
const out=root+'assets-preview/';mkdirSync(out,{recursive:true});
writeFileSync(out+'compare-16-5.png',PNG.sync.write(sheet));writeFileSync(out+'robi-16.png',PNG.sync.write(composite));
const result={parts:partKeys.length,pairChecks,faceChecks,collisions,faceOcclusion,touching};
writeFileSync(out+'check-16-robi.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
assert.deepEqual(collisions,[],'부품 픽셀 겹침');assert.deepEqual(faceOcclusion,[],'얼굴 가림');assert.deepEqual(touching,[],'별/센서와 말풍선 간격');
