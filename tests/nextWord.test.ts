import { describe, expect, it } from 'vitest';
import type { NextWordData } from '../src/data/schema';
import { evaluateNextWord, nextWords } from '../src/missions/nextWord/evaluate';
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
