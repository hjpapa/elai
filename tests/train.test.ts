import { describe, expect, it } from 'vitest';
import type { TrainData } from '../src/data/schema';
import { evaluateTraining, evaluateComparison, predictLabel, trainSelection } from '../src/missions/train/evaluate';
const data: TrainData = { intro:'',features:['높이','점'],labels:[{id:'friend',label:'친구'},{id:'playful',label:'장난꾸러기'}],
  examples:[{id:'a',features:[1,1],label:'friend'},{id:'b',features:[2,1],label:'friend'},{id:'c',features:[1,2],label:'friend'},
    {id:'d',features:[8,8],label:'playful'},{id:'e',features:[9,8],label:'playful'},{id:'f',features:[8,9],label:'playful'}],
  tests:[{id:'t1',features:[2,2],label:'friend'},{id:'t2',features:[9,9],label:'playful'}],minExamples:6,k:3,threshold:1,hint:'' };
const selected = Object.fromEntries(data.examples.map(e=>[e.id,e.label]));
describe('가까운 이웃으로 분류 학습',()=>{
  it('학습 자료와 다른 시험 예시를 실제로 분류해요',()=>{
    const model=trainSelection(data,selected)!;
    expect(evaluateTraining(data,model,selected)).toMatchObject({accuracy:1,success:true});
    expect(predictLabel(model.samples,[2,3])).toBe('friend');expect(predictLabel(model.samples,[7,9])).toBe('playful');
  });
  it('한쪽 예시만 쓰면 정확도가 떨어지고 완료할 수 없어요',()=>{
    const biased={a:'friend',b:'friend',c:'friend'};
    expect(evaluateTraining(data,trainSelection(data,biased),biased)).toMatchObject({accuracy:0.5,success:false});
    const wrong=Object.fromEntries(data.examples.map(e=>[e.id,'friend']));
    expect(evaluateTraining(data,trainSelection(data,wrong),wrong).success).toBe(false);
  });
  it('빈 값과 미지 이름표, 차원이 다른 특징을 거절해요',()=>{
    expect(trainSelection(data,{})).toBeNull();expect(trainSelection(data,{a:'unknown'})).toBeNull();expect(trainSelection(data,{unknown:'friend'})).toBeNull();
    expect(predictLabel([], [1,2])).toBeNull();expect(predictLabel([{features:[NaN,1],label:'friend'}],[1,2])).toBeNull();
    expect(predictLabel([{features:[1],label:'friend'}],[1,2])).toBeNull();expect(predictLabel(data.examples,[1,2],0)).toBeNull();
  });
  it('동률은 거리로 결정하고 학습 후 이름표 변경은 재학습해야 해요',()=>{
    expect(predictLabel([{features:[1],label:'a'},{features:[5],label:'b'}],[2],2)).toBe('a');
    const model=trainSelection(data,selected)!;
    expect(evaluateTraining(data,model,{...selected,a:'playful'}).success).toBe(false);
    model.samples[0].features[0]=99;expect(data.examples[0].features[0]).toBe(1);
    expect(evaluateTraining(data,model,selected).success).toBe(false);
  });
});

it('같은 시험 자료로 소량과 충분한 예시를 모두 시험하고 비교해야 해요',()=>{
 const compare={...data,comparison:{smallCount:2,question:'어느 결과가 더 잘 맞았나요?',choices:['소량','전체'],answer:1}};
 const trials=[{count:2,accuracy:.5},{count:6,accuracy:1}];
 expect(evaluateComparison(compare,trials,1)).toBe(true);expect(evaluateComparison(compare,trials,0)).toBe(false);
 expect(evaluateComparison(compare,[trials[1]],1)).toBe(false);expect(evaluateComparison(compare,[trials[0]],1)).toBe(false);
 expect(evaluateComparison(compare,[trials[0],{count:6,accuracy:NaN}],1)).toBe(false);
 expect(evaluateComparison(compare,[{count:2,accuracy:1},trials[1]],1)).toBe(false);
});

it('비교 미션은 최소 표본만 채워도 전체 표본 비교를 생략할 수 없어요',()=>{
 const compare={...data,minExamples:4,comparison:{smallCount:2,question:'',choices:['전체'],answer:0}};
 expect(evaluateComparison(compare,[{count:2,accuracy:.5},{count:4,accuracy:1}],0)).toBe(false);
 expect(evaluateComparison(compare,[{count:2,accuracy:.5},{count:6,accuracy:1}],0)).toBe(true);
});
