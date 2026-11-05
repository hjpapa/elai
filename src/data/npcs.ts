import type { NpcDef } from './schema';

export const NPCS: Record<string, NpcDef> = {
  elder: { id: 'elder', name: '촌장 다온', sprite: 'char-elder', role: '코딩 마을 촌장' },
  robi: { id: 'robi', name: '로비', sprite: 'char-robi', role: '도우미 로봇' },
  chef: { id: 'chef', name: '요리사 보리', sprite: 'char-chef', role: '숲속 요리사' },
  ranger: { id: 'ranger', name: '숲지기 솔', sprite: 'char-ranger', role: '순서의 숲 지킴이' },
  zen: { id: 'zen', name: '젠', sprite: 'char-zen', role: '프롬프트 공방의 AI' },
  guardian: { id: 'guardian', name: '숲의 수호자', sprite: 'boss-forest-guardian', role: '순서의 숲 수호자' },
  dummy: { id: 'dummy', name: '허수아비 봇', sprite: 'mob-dummy', role: '마을 연습장' },
  explorer: { id: 'explorer', name: '탐험가 하루', sprite: 'char-explorer', role: '동굴 탐험가' },
  batKing: { id: 'batKing', name: '메아리 박쥐 대장', sprite: 'boss-bat-king', role: '동굴의 메아리 지킴이' },
  guide: { id: 'guide', name: '길잡이 나루', sprite: 'char-guide', role: '사막 길잡이' },
  lizardChief: { id: 'lizardChief', name: '신기루 도마뱀 대장', sprite: 'boss-lizard-chief', role: '모래 미로 지킴이' },
  harborKeeper: { id: 'harborKeeper', name: '항구지기 모아', sprite: 'char-harbor', role: '항구 기록 지킴이' },
  ledgerOcto: { id: 'ledgerOcto', name: '장부 문어 대장', sprite: 'boss-ledger-octo', role: '등대 기록 지킴이' },
  researcher: { id: 'researcher', name: '연구원 여울', sprite: 'char-researcher', role: '인식 연구원' },
  shiftKing: { id: 'shiftKing', name: '변신 슬라임 대장', sprite: 'boss-shift-king', role: '표본실 지킴이' },
  astronomer: { id: 'astronomer', name: '별지기 온유', sprite: 'char-astronomer', role: '천문대 기록 연구원' },
  starFox: { id: 'starFox', name: '별자리 여우 대장', sprite: 'boss-star-fox', role: '별자리 미궁 지킴이' },
  sign: { id: 'sign', name: '표지판', sprite: 'prop-sign', role: '안내' },
};

export function npcName(id: string): string {
  if (id === 'player') return '나';
  return NPCS[id]?.name ?? id;
}
