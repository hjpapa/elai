import {readFileSync} from 'node:fs';
import {Grid,polygon,saveHires,root} from './c12-common.mjs';
import {BAKERY_ROUNDS} from '../../src/data/minigames/bakery.ts';
import {cakePixels} from '../../src/minigames/bakery/cakeArt.ts';
const palette=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const symbol=new Map(Object.entries(palette).map(([s,c])=>[c,s]));
const cream={strawberry:['p','P','R'],choco:['h','H','E'],vanilla:['W','t','T'],mint:['c','C','n']};
function stand(index){
 const g=new Grid(32,48);
 // 접시 아래 단단한 받침과 넓은 두 발, 끝은 y44에 닿아요.
 polygon(g,[[12,34],[19,34],[20,40],[26,42],[26,44],[6,44],[6,42],[12,40]],'T','U');
 g.line(13,35,13,40,'t').line(9,42,23,42,'Z').line(20,34,20,40,'X');
 if(!index){g.rect(2,32,28,2,'a').rect(4,34,24,2,'A').line(4,32,27,32,'j');return g;}
 const order=BAKERY_ROUNDS[index-1].customers.at(-1).want,px=cakePixels(order);
 // 케이크 자체는 게임 그림과 같은 16x16 좌표를 2배로 옮겨요. 위쪽 여백 4px.
 px.forEach((row,y)=>row.forEach((color,x)=>{if(color)g.rect(x*2,4+y*2,2,2,symbol.get(color));}));
 // 크림 윗면 바로 아래의 흘러내림과 오른쪽 그늘만 1px 보강해요.
 // 각 2x2 칸의 왼쪽 위는 원래 색을 남겨 원본 모양/토핑/글씨 판을 대조할 수 있어요.
 const [top,body,shade]=cream[order.flavor];
 for(let y=6;y<14;y++)for(let x=2;x<14;x++)if(px[y][x]===palette[body]){
  if(px[y-1]?.[x]===palette[top]&&x%3===0)g.set(x*2+1,4+y*2+1,top);
  if(px[y]?.[x+1]===palette[shade])g.set(x*2+1,4+y*2+1,shade);
 }
 for(let x=3;x<14;x+=2)g.set(x*2+1,32,'j');
 return g;
}
saveHires('prop-cake-stand',Array.from({length:7},(_,i)=>stand(i)));
