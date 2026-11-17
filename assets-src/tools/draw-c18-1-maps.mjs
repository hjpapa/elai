import {Grid,polygon,rounded,saveHires} from './c12-common.mjs';
import {ROUTE_ROUNDS} from '../../src/data/minigames/route.ts';
export const mazes=ROUTE_ROUNDS.map(r=>r.mazes[0]);
export function route(rows){
 let start,goal;rows.forEach((row,y)=>[...row].forEach((c,x)=>{if(c==='S')start={x,y};if(c==='G')goal={x,y};}));
 const queue=[[start]],seen=new Set([`${start.x},${start.y}`]);
 for(let i=0;i<queue.length;i++){const path=queue[i],p=path.at(-1);if(p.x===goal.x&&p.y===goal.y)return path;
  for(const[dx,dy]of[[1,0],[0,1],[-1,0],[0,-1]]){const x=p.x+dx,y=p.y+dy,k=`${x},${y}`;if(rows[y]?.[x]&&rows[y][x]!=='#'&&!seen.has(k)){seen.add(k);queue.push([...path,{x,y}]);}}
 }throw Error('미로에 길이 없어요.');
}
export const layout=rows=>({pitch:4,x:3+Math.floor((26-rows[0].length*4)/2),y:9+Math.floor((23-rows.length*4)/2)});
export function mapFrame(index){
 const g=new Grid(32,48);
 // 앞의 두 발과 뒤 지지대가 y44에서 바닥에 닿아요.
 polygon(g,[[22,29],[25,29],[29,43],[27,44],[23,34]],'U','Q');
 polygon(g,[[7,32],[10,32],[8,44],[4,44]],'X','U');
 polygon(g,[[22,32],[25,32],[28,44],[23,44]],'U','Q');
 g.line(7,35,6,42,'t').line(24,35,25,42,'X');
 rounded(g,1,5,30,32,'T','U');g.line(4,6,27,6,'Z').line(2,8,2,33,'t').line(29,9,29,33,'X');
 g.rect(3,8,26,26,'W').line(3,33,28,33,'*');
 if(index===0){
  for(let x=5;x<28;x+=4)g.line(x,10,x,31,'&');for(let y=11;y<32;y+=4)g.line(4,y,27,y,'&');
  g.line(15,9,15,31,'*').line(16,9,16,31,'?').line(4,20,27,20,'Z');
  g.poly([[24,8],[28,8],[28,12]],'Z').line(24,8,28,12,'*');
 }else{
  const rows=mazes[index-1],p=layout(rows),path=route(rows),center=t=>({x:p.x+t.x*4+1,y:p.y+t.y*4+1});
  rows.forEach((row,y)=>[...row].forEach((c,x)=>{if(c==='#'){g.rect(p.x+x*4,p.y+y*4,3,3,'d').set(p.x+x*4,p.y+y*4,'S');}}));
  for(let i=1;i<path.length;i++){const a=center(path[i-1]),b=center(path[i]);g.line(a.x,a.y,b.x,b.y,'C');}
  const s=center(path[0]),t=center(path.at(-1));g.rect(s.x-1,s.y-1,2,2,'B').set(s.x,s.y,'q');
  g.line(t.x-1,t.y-1,t.x-1,t.y+1,'R').line(t.x,t.y-1,t.x+1,t.y-1,'r').set(t.x,t.y,'R');
 }
 g.set(4,7,'W').set(28,35,'+');return g;
}
saveHires('prop-route-map',Array.from({length:7},(_,i)=>mapFrame(i)));
