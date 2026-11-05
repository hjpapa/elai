import { describe, expect, it } from 'vitest';
import type { ClassifyData } from '../src/data/schema';
import { evaluateGroups, evaluateTree } from '../src/missions/classify/evaluate';
const data: ClassifyData = { mode: 'tree', intro: '', hint: '', maxQuestions: 2,
  cards: [{id:'a',label:'새',group:'bird',features:['wing']},{id:'b',label:'나비',group:'insect',features:['wing','six']},{id:'c',label:'참새',group:'bird',features:['wing']}],
  groups: [{id:'bird',label:'새'},{id:'insect',label:'곤충'}], questions: [{id:'wing',label:'날개가 있나요?',feature:'wing'},{id:'six',label:'다리가 여섯 개인가요?',feature:'six'}] };
describe('질문 규칙과 분류',()=>{
  it('혼합 잎은 실패하고 종류가 같은 잎은 성공해요',()=>{
    expect(evaluateTree(data,['wing']).success).toBe(false);
    expect(evaluateTree(data,['six']).success).toBe(true);
    expect(evaluateTree(data,['wing','six']).leaves.map(l=>l.cards.length)).toEqual([2,1]);
  });
  it('빈 입력·없는 질문·중복 질문은 성공할 수 없어요',()=>{
    for(const q of [[],['none'],['six','six']])expect(evaluateTree(data,q).success).toBe(false);
    expect(evaluateTree({...data,maxQuestions:1},['wing','six']).success).toBe(false);
  });
  it('이름표로 나누기는 빠짐·오답을 거절해요',()=>{
    expect(evaluateGroups({...data,mode:'sort'},{a:'bird',b:'insect',c:'bird'})).toBe(true);
    expect(evaluateGroups({...data,mode:'sort'},{a:'bird',b:'bird',c:'bird'})).toBe(false);
    expect(evaluateGroups({...data,mode:'sort'},{a:'bird',b:'insect'})).toBe(false);
  });
  it('군집은 묶음 이름이 달라도 같은 분할이면 맞아요',()=>{
    expect(evaluateGroups({...data,mode:'cluster'},{a:'insect',b:'bird',c:'insect'})).toBe(true);
    expect(evaluateGroups({...data,mode:'cluster'},{a:'bird',b:'bird',c:'insect'})).toBe(false);
  });
});
