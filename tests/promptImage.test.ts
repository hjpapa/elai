import { describe,expect,it } from 'vitest';
import { imagePromptData } from '../src/data/chapters/imagePromptData';
import { evaluatePrompt } from '../src/missions/prompt/evaluate';
import { composePromptImage } from '../src/missions/prompt/image';
import { freshSave,GameState } from '../src/game/rpg/state';
import { canStart } from '../src/game/rpg/progress';
describe('그림 주문서와 기존 미리 해 보기',()=>{
 it('주인공·배경·시간·스타일을 겹치고 밤으로 고쳐도3별이에요',()=>{
  const initial=imagePromptData.initialChoice!;const changed={...initial,how:'night'};
  const day=composePromptImage(imagePromptData,initial)!,night=composePromptImage(imagePromptData,changed)!;
  expect(day).toHaveLength(16);expect(day.every(row=>row.length===16)).toBe(true);expect(day[3][3]).not.toEqual(night[3][3]);expect(day[10][6]).toEqual(night[10][6]);
  expect(evaluatePrompt(imagePromptData,initial).success).toBe(false);
  expect(evaluatePrompt(imagePromptData,changed)).toMatchObject({success:true,stars:3});
  expect(evaluatePrompt(imagePromptData,{...changed,role:undefined}).success).toBe(false);
 });
 it('손상된 격자·팔레트는 조용히 거절해요',()=>{
  const image=imagePromptData.image!;
  expect(composePromptImage({...imagePromptData,image:{...image,width:0}},{})).toBeNull();
  expect(composePromptImage({...imagePromptData,image:{...image,palette:{}}},imagePromptData.initialChoice!)).toBeNull();
 });
 it('마을의 두 기존 체험은7장p1전에도 기존 순서로 열려요',()=>{
  const s=new GameState(freshSave('별빛'));expect(canStart(s,'ch7-p2-m1')).toBe(true);expect(canStart(s,'ch7-p2-m2')).toBe(false);expect(canStart(s,'ch7-p2-m3')).toBe(false);
  s.completeMission('ch7-p2-m1',{success:true,stars:3,attempts:1,hints:0});expect(canStart(s,'ch7-p2-m2')).toBe(true);
  expect(canStart(s,'ch7-boss-m1')).toBe(false);
 });
});

it('필요한 그림 레이어가 없으면 좋은 주문서도 완료하지 못해요',()=>{
 const image=imagePromptData.image!;const choice={...imagePromptData.initialChoice,how:'night'};
 expect(evaluatePrompt({...imagePromptData,image:{...image,layers:image.layers.filter(l=>l.slot!=='role')}},choice).success).toBe(false);
});
