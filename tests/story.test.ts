import {expect,it} from 'vitest';
import {STORIES} from '../src/data/story';
import {CHAPTERS} from '../src/data/chapters';
import {freshSave} from '../src/game/rpg/state';
import {storyForVisit} from '../src/game/rpg/story';
import {ENDING_BADGES} from '../src/game/rpg/ending';

it('장마다 입구 대화 한 번, 완료한 옛 저장은 조용히 기록해요',()=>{
  for(const chapter of CHAPTERS.slice(1)){
    const s=freshSave('로비'), map=chapter.entryMap!;
    const plan=()=>storyForVisit(s,map,false,false);
    expect(plan().lines).toEqual(STORIES[chapter.id].enter);
    expect(storyForVisit(s,map,true,false)).toEqual({lines:[],flags:[]});
    expect(storyForVisit(s,map,false,true)).toEqual({lines:[],flags:[]});
    s.flags[chapter.id+'-clear']=true;
    expect(plan().lines).toEqual([]);
    for(const f of plan().flags)s.flags[f]=true;
    expect(plan().flags).toEqual([]);
  }
});

it('마을에서는 최신 장 한 편만 보이고 엔딩이 먼저예요',()=>{
  const s=freshSave('로비');
  for(let i=1;i<=7;i++)s.flags['ch'+i+'-clear']=true;
  const plan=()=>storyForVisit(s,'village',false,false);
  expect(plan().lines).toEqual(STORIES.ch7.clear);
  for(const f of plan().flags)s.flags[f]=true;
  expect(plan()).toEqual({lines:[],flags:[]});
  s.flags['ch8-clear']=true;s.badges=[...ENDING_BADGES];s.location.map='village';
  expect(plan()).toEqual({lines:[],flags:[]});
  s.flags['ending-seen']=true;
  expect(plan()).toEqual({lines:[],flags:['story:ch8:clear']});
});

it('각 장면은 3~5번의 짧은 말풍선으로 읽어요',()=>{
  expect(Object.keys(STORIES)).toHaveLength(8);
  for(const chapter of Object.values(STORIES))for(const scene of [chapter.enter,chapter.clear]){
    expect(scene.length).toBeGreaterThanOrEqual(3);expect(scene.length).toBeLessThanOrEqual(5);
    for(const {text} of scene){expect(text.split('\n').length).toBeLessThanOrEqual(2);expect(text.split('\n').every(l=>[...l].length<=20)).toBe(true);}
  }
});
