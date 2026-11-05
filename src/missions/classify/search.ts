import type { Point } from '../../data/schema';
export interface SearchResult { distances: number[][]; path: Point[]; start: Point; goal: Point }
const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]] as const;
export function searchGrid(grid: string[]): SearchResult | null {
  if (!grid.length || !grid[0].length || grid.some(row => row.length !== grid[0].length || !/^[SG.#]+$/.test(row))) return null;
  const starts: Point[] = [], goals: Point[] = [];
  grid.forEach((row,y)=>[...row].forEach((cell,x)=>{if(cell==='S')starts.push({x,y});if(cell==='G')goals.push({x,y});}));
  if(starts.length!==1 || goals.length!==1)return null;
  const start=starts[0],goal=goals[0],distances=grid.map(row=>Array<number>(row.length).fill(-1));
  const queue:Point[]=[start],parents=new Map<string,Point>(); distances[start.y][start.x]=0;
  for(let i=0;i<queue.length;i++){
    const p=queue[i];
    for(const [dx,dy]of directions){const x=p.x+dx,y=p.y+dy;
      if(grid[y]?.[x]===undefined || grid[y][x]==='#' || distances[y][x]!==-1)continue;
      distances[y][x]=distances[p.y][p.x]+1;parents.set(x+','+y,p);queue.push({x,y});
    }
  }
  const path:Point[]=[];
  if(distances[goal.y][goal.x]>=0){let p=goal;path.unshift(p);while(p.x!==start.x||p.y!==start.y){p=parents.get(p.x+','+p.y)!;path.unshift(p);}}
  return {distances,path,start,goal};
}
export function evaluateSearch(grid:string[],path:Point[]):boolean{
  const result=searchGrid(grid);if(!result || !result.path.length || path.length!==result.path.length)return false;
  if(path[0].x!==result.start.x || path[0].y!==result.start.y || path.at(-1)!.x!==result.goal.x || path.at(-1)!.y!==result.goal.y)return false;
  return path.every((p,i)=>Number.isInteger(p.x)&&Number.isInteger(p.y)&&grid[p.y]?.[p.x]!==undefined&&grid[p.y][p.x]!=='#'&&(!i||Math.abs(p.x-path[i-1].x)+Math.abs(p.y-path[i-1].y)===1));
}
