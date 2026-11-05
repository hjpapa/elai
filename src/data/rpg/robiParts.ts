import type { RobiPartDef } from '../schema';

const list: RobiPartDef[] = [
  { id: 'wheel', name: '바퀴 모터', chapter: 'ch1', ability: '로비가 바퀴로 씽씽 따라다니고, 전투 프로그램 칸이 1개 늘어나요.', unlocks: {}, slotBonus: 1, overlay: 'robi-part-wheel', icon: 'icon-part-wheel', desc: '구동 장치: 로봇을 움직이게 해요.' },
  { id: 'memoryChip', name: '메모리 칩', chapter: 'ch2', ability: '반복 카드를 쓸 수 있어요.\n반복 안의 카드는 에너지를 한 번만 써요.', unlocks: { repeat: true }, overlay: 'robi-part-memory', icon: 'icon-part-memory', desc: '기억 장치: 명령을 기억해 되풀이해요.' },
  { id: 'sensor', name: '센서', chapter: 'ch3', ability: '"만약" 카드를 쓸 수 있어요.', unlocks: { conds: ['enemySmash', 'enemyAttack', 'enemyGuard'] }, overlay: 'robi-part-sensor', icon: 'icon-part-sensor', desc: '입력 장치: 주변을 알아차려요.' },
  { id: 'dataLens', name: '데이터 렌즈', chapter: 'ch4', ability: '살펴보기 카드로 자료를 모아요.\n물결 높이 조건을 쓸 수 있어요.', unlocks: { cards: ['scan'], conds: ['waveHigh', 'waveMiddle'] }, overlay: 'robi-part-lens', icon: 'icon-part-lens', desc: '데이터를 모으고 정리해요.' },
  { id: 'learningChip', name: '학습 칩', chapter: 'ch5', ability: '내 모델로 슬라임을 구별해요.\n모델의 판단 조건을 쓸 수 있어요.', unlocks: { conds: ['modelPlayful'] }, overlay: 'robi-part-learnchip', icon: 'icon-part-learnchip', desc: '데이터로 배우는 장치예요.' },
  { id: 'predictModule', name: '예측 모듈', chapter: 'ch6', ability: '몹의 다음 행동을 확률로 보여 줘요.', unlocks: {}, overlay: 'robi-part-predict', desc: '기록으로 앞일을 예측해요.' },
  { id: 'talkModule', name: '대화 모듈', chapter: 'ch7', ability: '주문 카드와 공방 제작을 쓸 수 있어요.', unlocks: {}, overlay: 'robi-part-talk', desc: '사람의 말을 알아듣고 대답해요.' },
  { id: 'ethicsCore', name: '윤리 코어', chapter: 'ch8', ability: '로비가 스스로 옳고 그름을 묻는 "생각하는 AI"로 깨어나요.', unlocks: {}, overlay: 'robi-part-ethics', desc: '사람을 돕는 AI가 되도록 지켜 줘요.' },
];

export const ROBI_PARTS: Record<string, RobiPartDef> = Object.fromEntries(list.map((p) => [p.id, p]));
