import { describe,expect,it } from 'vitest';
import { evaluateSearch,searchGrid } from '../src/missions/classify/search';
describe('물결 탐색의 거리와 최단 경로',()=>{
 it('벽을 돌아 물결 순서대로 모든 가까운 칸을 찾아요',()=>{
  const grid=['S.#.','..#.','...G'];const r=searchGrid(grid)!;
  expect(r.distances).toEqual([[0,1,-1,7],[1,2,-1,6],[2,3,4,5]]);expect(r.path).toHaveLength(6);expect(evaluateSearch(grid,r.path)).toBe(true);
 });
 it('목표에 도착해도 점프·벽 통과·우회는 거절해요',()=>{
  const grid=['S..','.#.','..G'];const r=searchGrid(grid)!;
  expect(evaluateSearch(grid,[r.start,r.goal])).toBe(false);
  expect(evaluateSearch(grid,[r.start,{x:1,y:0},{x:1,y:1},{x:2,y:1},r.goal])).toBe(false);
  expect(evaluateSearch(grid,[r.start,{x:1,y:0},r.start,...r.path.slice(1)])).toBe(false);
 });
 it('갈 수 없는 목표와 중복/없는 출발·목표·잘못된 격자를 거절해요',()=>{
  expect(searchGrid(['S#G'])?.path).toEqual([]);expect(evaluateSearch(['S#G'],[])).toBe(false);
  for(const grid of [[],['S..'],['SSG'],['S@G'],['S.','G']])expect(searchGrid(grid)).toBeNull();
 });
});
