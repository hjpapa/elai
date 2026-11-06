import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ASSETS } from '../../src/game/assets.ts';
export { Grid } from './pixel.mjs';
import { Grid } from './pixel.mjs';
export const root = fileURLToPath(new URL('../../', import.meta.url));
export function pose(f) { const step=f%5; return {back:f>=5,step,bob:[0,-2,0,-2,0][step],stride:[0,-2,0,2,0][step],swing:[0,-2,2,2,-2][step]}; }
export function polygon(g,points,fill,edge) {
  g.poly(points,edge); const inner=new Grid(g.w,g.h).poly(points,fill);
  for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++)if(inner.get(x,y)!=='.'&&[[0,-1],[0,1],[-1,0],[1,0]].every(([dx,dy])=>inner.get(x+dx,y+dy)!=='.'))g.set(x,y,fill);
  return g;
}
export function rounded(g,x,y,w,h,fill,edge) {return polygon(g,[[x+2,y],[x+w-3,y],[x+w-1,y+2],[x+w-1,y+h-3],[x+w-3,y+h-1],[x+2,y+h-1],[x,y+h-3],[x,y+2]],fill,edge);}
export function eye(g,x,y,c='O'){return g.rect(x,y,2,3,c).set(x,y,'?');}
export function saveHires(key,frames){
 const spec=ASSETS.find(a=>a.key===key);if(!spec||frames.length!==spec.frames||frames.some(g=>g.w!==spec.w*2||g.h!==spec.h*2))throw new Error('2배 규격 불일치: '+key);
 const symbols=new Set(Object.keys(JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors));
 for(const g of frames)for(const row of g.rows)for(const c of row)if(c!=='.'&&!symbols.has(c))throw new Error(key+': 팔레트 밖 글자 '+c);
 const dir=root+'assets-src/hires/'+spec.kind;mkdirSync(dir,{recursive:true});writeFileSync(dir+'/'+key+'.txt',frames.map(g=>g.text()).join('\n\n')+'\n');
 return {key,frames};
}
export function loadGrid(key,hires=true){const spec=ASSETS.find(a=>a.key===key),d=hires?2:1;return readFileSync(root+'assets-src/'+(hires?'hires/':'')+spec.kind+'/'+key+'.txt','utf8').trimEnd().split(/\r?\n\r?\n/).map(text=>{const g=new Grid(spec.w*d,spec.h*d);g.rows=text.split(/\r?\n/).map(row=>[...row]);return g;});}
