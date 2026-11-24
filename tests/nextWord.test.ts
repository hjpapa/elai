import { describe, expect, it } from 'vitest';
import type { NextWordData } from '../src/data/schema';
import { contextWords, evaluateNextWord, nextWordProblems, nextWordViews, nextWords, sampleSteps } from '../src/missions/nextWord/evaluate';
const d:NextWordData={intro:'',start:'로비는',steps:2,corpora:[{id:'a',label:'숲',sentences:['로비는 나무를 봐요','로비는 나무를 봐요','로비는 꽃을 봐요']},{id:'b',label:'바다',sentences:['로비는 별을 봐요','로비는 물을 봐요']}],question:{q:'모음이 바뀌면?',choices:['같아요','달라져요'],answer:1},hint:''};
describe('작은 글 모음의 다음 말',()=>{
 it('바로 다음의 실제 횟수와 비율을 세고 글 모음을 바꾸면 달라져요',()=>{
  expect(nextWords(d.corpora[0].sentences,'로비는')).toEqual([{word:'나무를',count:2,probability:2/3},{word:'꽃을',count:1,probability:1/3}]);
  expect(nextWords(d.corpora[1].sentences,'로비는').map(c=>c.word)).not.toContain('나무를');
  expect(nextWords(['  로비는   별을 봐요  '],'로비는')[0].word).toBe('별을');
  expect(nextWords([], '로비는')).toEqual([]);expect(nextWords(d.corpora[0].sentences,'없는말')).toEqual([]);
 });
 it('두 모음의 실제 연결과 비교 답을 모두 요구해요',()=>{
  const stories={a:['로비는','나무를','봐요'],b:['로비는','별을','봐요']};
  expect(evaluateNextWord(d,stories,1)).toBe(true);expect(evaluateNextWord(d,stories,0)).toBe(false);
  expect(evaluateNextWord(d,{a:stories.a},1)).toBe(false);expect(evaluateNextWord(d,{...stories,b:['로비는','나무를','봐요']},1)).toBe(false);
  expect(evaluateNextWord(d,{...stories,a:['로비는','봐요']},1)).toBe(false);
 });
});

it('같은 글 모음 id를 두 번 써서 비교를 건너뛸 수 없어요',()=>{
 expect(evaluateNextWord({...d,corpora:[d.corpora[0],d.corpora[0]]},{a:['로비는','나무를','봐요']},1)).toBe(false);
});

const mix=['로비는 동굴에서 수정을 찾아요.','로비는 동굴에서 보석을 찾아요.','로비는 숲에서 수정을 찾아요.','토끼는 달에서 수정을 먹어요.'];
const w:NextWordData={intro:'앞말을 비교해요.',start:'로비는',steps:3,windows:[1,2],corpora:[{id:'mix',label:'섬 이야기',sentences:mix}],
 question:{q:'앞말을 두 개 보면?',choices:['다음 말이 또렷해져요','아무것도 안 바뀌어요'],answer:0},
 samples:{intro:'젠이 세 번 이어 썼어요.',corpus:'mix',window:1,answers:[
  {id:'a',label:'젠의 답 1',words:['로비는','동굴에서','수정을','찾아요.']},
  {id:'b',label:'젠의 답 2',words:['로비는','동굴에서','수정을','먹어요.']},
  {id:'c',label:'젠의 답 3',words:['로비는','숲에서','수정을','찾아요.']}],
  question:{q:'왜 답이 다를까요?',choices:['덜 나온 말도 고를 때가 있어요','젠이 고장 났어요'],answer:0}},hint:''};
describe('앞말 수와 젠이 이어 쓴 답',()=>{
 it('앞말을 여러 개 보면 그 낱말들이 이어진 자리만 세요',()=>{
  expect(nextWords(mix,'수정을').map(c=>[c.word,c.count])).toEqual([['찾아요.',2],['먹어요.',1]]);
  expect(nextWords(mix,['동굴에서','수정을']).map(c=>[c.word,c.count])).toEqual([['찾아요.',1]]);
  expect(nextWords(mix,['달에서','수정을']).map(c=>c.word)).toEqual(['먹어요.']);
  expect(nextWords(mix,[])).toEqual([]);expect(nextWords(mix,['숲에서','보석을'])).toEqual([]);
  expect(contextWords(['로비는','동굴에서','수정을'],2)).toEqual(['동굴에서','수정을']);expect(contextWords(['로비는'],2)).toEqual(['로비는']);
 });
 it('앞말 수마다 탭을 만들고 탭마다 그 앞말 수로 이은 문장을 요구해요',()=>{
  expect(nextWordViews(w).map(v=>[v.id,v.window,v.label])).toEqual([['mix@1',1,'섬 이야기 · 앞말 1개'],['mix@2',2,'섬 이야기 · 앞말 2개']]);
  expect(nextWordViews(d).map(v=>v.id)).toEqual(['a','b']);
  const ok={'mix@1':['로비는','동굴에서','수정을','먹어요.'],'mix@2':['로비는','동굴에서','수정을','찾아요.']};
  expect(evaluateNextWord(w,ok,0,0)).toBe(true);
  expect(evaluateNextWord(w,{...ok,'mix@2':['로비는','동굴에서','수정을','먹어요.']},0,0)).toBe(false);
  expect(evaluateNextWord(w,ok,0,1)).toBe(false);expect(evaluateNextWord(w,ok,0,null)).toBe(false);expect(evaluateNextWord(w,ok,1,0)).toBe(false);
  expect(evaluateNextWord(w,{'mix@1':ok['mix@1']},0,0)).toBe(false);
  for(const windows of [[1,1],[0,2],[1,2.5],[1,9]])expect(evaluateNextWord({...w,windows},ok,0,0),String(windows)).toBe(false);
 });
 it('젠의 답마다 낱말의 비율과 덜 나온 말을 알려 줘요',()=>{
  const [a,b,c]=w.samples!.answers;
  expect(sampleSteps(w,a)!.map(s=>[s.word,Math.round(s.probability*100),s.top])).toEqual([['동굴에서',67,true],['수정을',50,true],['찾아요.',67,true]]);
  expect(sampleSteps(w,b)!.at(-1)).toMatchObject({word:'먹어요.',top:false});
  expect(sampleSteps(w,c)![0]).toMatchObject({word:'숲에서',top:false});
  expect(sampleSteps(w,{id:'x',label:'x',words:['로비는','달에서']})).toBeNull();
  expect(sampleSteps(w,{id:'x',label:'x',words:['토끼는','달에서']})).toBeNull();
  expect(sampleSteps({...w,samples:{...w.samples!,corpus:'없음'}},a)).toBeNull();
 });
 it('데이터 점검은 끝까지 이을 수 있는지와 비교할 거리를 확인해요',()=>{
  expect(nextWordProblems(w)).toEqual([]);expect(nextWordProblems(d)).toEqual([]);
  expect(nextWordProblems({...w,corpora:[{id:'mix',label:'섬 이야기',sentences:['로비는 숲에서 나무를 봐요.']}],samples:undefined})).toEqual(expect.arrayContaining(['섬 이야기: 앞말 수를 바꿔도 다음 말이 달라지지 않아요.']));
  expect(nextWordProblems({...w,steps:9})).toEqual(expect.arrayContaining(['섬 이야기 · 앞말 1개: 9낱말까지 이어 갈 수 없어요.']));
  const s=w.samples!;
  expect(nextWordProblems({...w,samples:{...s,answers:[s.answers[0],{...s.answers[0],id:'z'}]}})).toEqual(expect.arrayContaining(['젠의 답끼리 문장이 같아요.','덜 나온 말을 고른 답이 하나 있어야 해요.']));
  expect(nextWordProblems({...w,samples:{...s,answers:[s.answers[1],s.answers[2]]}})).toEqual(['가장 많이 나온 말만 고른 답이 하나 있어야 해요.']);
  expect(nextWordProblems({...w,samples:{...s,answers:[...s.answers,{id:'bad',label:'젠의 답 4',words:['로비는','달에서','수정을','먹어요.']}]}})).toEqual(['젠의 답 4: 글 모음에 없는 연결이 있어요.']);
  expect(nextWordProblems({...w,question:{...w.question,answer:5}})).toEqual(['비교 질문의 보기와 답을 살펴요.']);
 });
});
