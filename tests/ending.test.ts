import { describe, expect, it } from 'vitest';
import { ENDING_BADGES, hasEndingRequirements, shouldShowEnding } from '../src/game/rpg/ending';
import { freshSave, GameState } from '../src/game/rpg/state';
import { objective } from '../src/game/rpg/progress';
import { evaluateTable } from '../src/missions/classify/evaluate';
import type { ClassifyData } from '../src/data/schema';
describe('자료 균형과 마을 엔딩',()=>{
 it('치우친 자료를 실제 세 종류의 구성에 맞춰야 해요',()=>{
  const d:ClassifyData={mode:'balance',intro:'',hint:'',initialCounts:{a:8,b:2,c:0},groups:['a','b','c'].map(id=>({id,label:id})),cards:['a','b','c'].flatMap(group=>Array.from({length:4},(_,i)=>({id:group+i,label:group,group,features:[]})))};
  expect(evaluateTable(d,d.initialCounts!)).toBe(false);expect(evaluateTable(d,{a:4,b:4,c:4})).toBe(true);
  expect(evaluateTable(d,{a:6,b:6,c:6})).toBe(false);expect(evaluateTable(d,{a:4,b:4})).toBe(false);
 });
 it('배지8개는 서로 다른 장의 배지여야 하고 마지막 설명도 마쳐야 해요',()=>{
  const s=freshSave('별빛');s.badges=Array(8).fill('badge-1');s.flags['ch8-clear']=true;
  expect(hasEndingRequirements(s)).toBe(false);s.badges=[...ENDING_BADGES];delete s.flags['ch8-clear'];expect(hasEndingRequirements(s)).toBe(false);
  s.flags['ch8-clear']=true;expect(hasEndingRequirements(s)).toBe(true);expect(shouldShowEnding(s)).toBe(true);
 });
 it('마을에서만 열고 완료를 저장한 뒤에는 자동 반복하지 않아요',()=>{
  const s=new GameState(freshSave('별빛'));s.data.badges=[...ENDING_BADGES];s.setFlag('ch8-clear');s.setLocation('mirrormaze',1,1);
  expect(shouldShowEnding(s.data)).toBe(false);expect(objective(s)).toContain('마을');s.setLocation('village',12,16);expect(shouldShowEnding(s.data)).toBe(true);
  s.applyReward({title:'함께 자라는 친구',flags:['ending-seen']});
  const loaded=new GameState(JSON.parse(JSON.stringify(s.data)) as typeof s.data);expect(shouldShowEnding(loaded.data)).toBe(false);expect(loaded.data.titles).toContain('함께 자라는 친구');
 });
 it('예전 저장의 배지 누락과 미완료 상태는 엔딩을 열지 않아요',()=>{
  const old=freshSave('별빛');expect(shouldShowEnding(old)).toBe(false);old.badges=ENDING_BADGES.slice(0,7);old.flags['ch8-clear']=true;expect(shouldShowEnding(old)).toBe(false);
 });
});
