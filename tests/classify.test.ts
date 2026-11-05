import { describe, expect, it } from 'vitest';
import type { ClassifyData } from '../src/data/schema';
import { evaluateBinary, evaluatePixels, evaluateGroups, evaluateTable, evaluateTree } from '../src/missions/classify/evaluate';
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


describe('자료의 표와 이진수',()=>{
  it('빈도표는 모든 종류의 정확한 개수를 요구해요',()=>{
    expect(evaluateTable(data,{bird:2,insect:1})).toBe(true);
    expect(evaluateTable(data,{bird:1,insect:2})).toBe(false);
    expect(evaluateTable(data,{bird:2})).toBe(false);
    expect(evaluateTable(data,{bird:1.5,insect:1})).toBe(false);
  });
  it('네 비트의 합과 목표를 맞추고 잘못된 숫자를 거절해요',()=>{
    const binary: ClassifyData = {...data,mode:'binary',cards:[{id:'a',label:'등대5',group:'5',features:[]},{id:'b',label:'등대12',group:'12',features:[]}]};
    expect(evaluateBinary(binary,{a:String(4|1),b:String(8|4)})).toBe(true);
    for(const actual of ([{a:'4',b:'12'},{a:'5',b:'16'},{a:'NaN',b:'12'},{}] as Record<string,string>[]))expect(evaluateBinary(binary,actual)).toBe(false);
    expect(evaluateBinary({...binary,cards:[{id:'a',label:'큰값',group:'16',features:[]}]},{a:'16'})).toBe(false);
  });
});


it('표의 미지 종류와 이진수의 모호한 입력은 성공하지 않아요',()=>{
  expect(evaluateTable({...data,cards:[{id:'x',label:'미지',group:'unknown',features:[]}]},{})).toBe(false);
  expect(evaluateTable(data,{bird:2,insect:1,unknown:0})).toBe(false);
  const zero: ClassifyData = {...data,mode:'binary',cards:[{id:'a',label:'0',group:'0',features:[]}]};
  expect(evaluateBinary(zero,{})).toBe(true);
  expect(evaluateBinary(zero,{a:''})).toBe(false);
  expect(evaluateBinary(zero,{a:' '})).toBe(false);
  expect(evaluateBinary({...zero,cards:[]},{})).toBe(false);
});

it('픽셀의 켜진 수가 같아도 위치가 다르면 다시 맞춰요',()=>{
 const pixels:ClassifyData={...data,mode:'pixels',cards:[{id:'p',label:'화살표',group:'',features:['010','111']}]};
 expect(evaluatePixels(pixels,{p:'010111'})).toBe(true);expect(evaluatePixels(pixels,{p:'111010'})).toBe(false);expect(evaluatePixels(pixels,{})).toBe(false);
 expect(evaluatePixels({...pixels,cards:[{...pixels.cards[0],features:['02','11']}]},{p:'0211'})).toBe(false);
});
