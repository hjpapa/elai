import type { Cmd, Cond, MobAction } from '../data/schema';

export const CMD_LABEL: Record<Cmd, string> = {
  up: '위로',
  down: '아래로',
  left: '왼쪽으로',
  right: '오른쪽으로',
  forward: '앞으로',
  turnLeft: '왼쪽으로 돌기',
  turnRight: '오른쪽으로 돌기',
  collect: '줍기',
  grab: '집기',
  sendLeft: '왼쪽으로 보내기',
  sendRight: '오른쪽으로 보내기',
  attack: '공격',
  guard: '막기',
  heal: '회복',
  wait: '쉬기',
  scan: '살펴보기',
};

export const COND_LABEL: Record<Cond, string> = {
  signalRed: '앞 신호가 빨강이면',
  forecastRisk: '기록에 강타 위험이 있다면',
  modelPlayful: '내 모델이 장난꾸러기라면',
  waveHigh: '관찰한 물결이 3이면',
  waveMiddle: '관찰한 물결이 2이면',
  wallAhead: '앞이 막혔다면',
  pathAhead: '앞에 길이 있다면',
  pathLeft: '왼쪽에 길이 있다면',
  pathRight: '오른쪽에 길이 있다면',
  onGem: '보석 위라면',
  boxHeart: '하트 상자라면',
  boxStar: '별 상자라면',
  itemRound: '둥근 물건이라면',
  enemyAttack: '몹이 공격한다면',
  enemyGuard: '몹이 막는다면',
  enemyCharge: '몹이 힘을 모은다면',
  enemySmash: '몹이 강타한다면',
  lowHp: '내 체력이 적다면',
};

export const INTENT_LABEL: Record<MobAction, string> = {
  attack: '공격',
  guard: '막기',
  charge: '힘 모으기',
  smash: '강타',
  heal: '회복',
  idle: '멍하니',
};

export const cmdIcon = (c: Cmd) => `icon-card-${c}`;
export const intentIcon = (a: MobAction) => `icon-intent-${a}`;
