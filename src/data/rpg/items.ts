import type { ItemDef } from '../schema';

const list: ItemDef[] = [
  // 모자
  { id: 'cap', name: '천 모자', icon: 'icon-item-cap', kind: 'equip', slot: 'hat', rarity: 'common', stats: { def: 1 }, overlay: 'equip-hat-cap', desc: '부드러운 천 모자예요. 햇볕을 가려 줘요.', price: 20 },
  { id: 'leafhat', name: '나뭇잎 모자', icon: 'icon-item-leafhat', kind: 'equip', slot: 'hat', rarity: 'uncommon', stats: { def: 1, maxHp: 3 }, overlay: 'equip-hat-leaf', desc: '숲속 나뭇잎을 엮어 만든 모자예요.', price: 45 },
  { id: 'rangerhat', name: '숲지기 모자', icon: 'icon-item-rangerhat', kind: 'equip', slot: 'hat', rarity: 'rare', stats: { def: 2, maxHp: 5 }, overlay: 'equip-hat-ranger', desc: '숲지기들이 쓰는 튼튼한 모자예요.' },
  // 도구
  { id: 'stick', name: '나무 지팡이', icon: 'icon-item-stick', kind: 'equip', slot: 'tool', rarity: 'common', stats: { atk: 1 }, overlay: 'equip-tool-stick', desc: '고장 난 것을 톡톡 두드려 고쳐요.', price: 20 },
  { id: 'hammer', name: '고침 망치', icon: 'icon-item-hammer', kind: 'equip', slot: 'tool', rarity: 'uncommon', stats: { atk: 2 }, overlay: 'equip-tool-hammer', desc: '삐걱거리는 기계를 뚝딱 고치는 망치예요.', price: 50 },
  { id: 'brush', name: '수호자의 붓', icon: 'icon-item-brush', kind: 'equip', slot: 'tool', rarity: 'rare', stats: { atk: 3, maxEn: 1 }, overlay: 'equip-tool-brush', desc: '숲의 수호자가 준 붓이에요. 고장 난 곳을 새로 그려 고쳐요.' },
  // 옷
  { id: 'vest', name: '견습 조끼', icon: 'icon-item-vest', kind: 'equip', slot: 'outfit', rarity: 'common', stats: { maxHp: 4 }, desc: '주머니가 많은 탐험가 조끼예요.', price: 25 },
  { id: 'cloak', name: '이끼 망토', icon: 'icon-item-cloak', kind: 'equip', slot: 'outfit', rarity: 'uncommon', stats: { maxHp: 6, def: 1 }, desc: '폭신한 이끼로 만든 망토예요.' },
  // 신발
  { id: 'boots', name: '가죽 신발', icon: 'icon-item-boots', kind: 'equip', slot: 'shoes', rarity: 'common', stats: { maxHp: 2 }, desc: '오래 걸어도 발이 편한 신발이에요.', price: 15 },
  { id: 'windboots', name: '바람 신발', icon: 'icon-item-windboots', kind: 'equip', slot: 'shoes', rarity: 'rare', stats: { maxHp: 2, maxEn: 1 }, desc: '바람처럼 가벼운 신발이에요.' },
  // 장신구·학습 도우미
  { id: 'glasses', name: '디버그 안경', icon: 'icon-item-glasses', kind: 'equip', slot: 'charm', rarity: 'uncommon', effect: { helper: 'debugGlasses' }, desc: '쓰고 있으면 프로그램이 틀렸을 때\n처음 틀린 칸을 알려 줘요.' },
  { id: 'flowmap', name: '순서도 지도', icon: 'icon-item-flowmap', kind: 'helper', rarity: 'uncommon', effect: { helper: 'flowMap' }, desc: '가지고 있으면 던전에서 지나온 길을\n작은 지도에 그려 줘요.' },
  // 소모품
  { id: 'apple', name: '회복 사과', icon: 'icon-item-apple', kind: 'consumable', rarity: 'common', effect: { heal: 10 }, desc: '먹으면 체력이 10 회복돼요.', price: 10 },
  { id: 'jelly', name: '에너지 젤리', icon: 'icon-item-jelly', kind: 'consumable', rarity: 'common', effect: { energy: 2 }, desc: '전투 중에 먹으면 이번 차례 에너지가 2 늘어요.', price: 12 },
  // 퀘스트·재료
  { id: 'forestkey', name: '숲 열쇠', icon: 'icon-item-forestkey', kind: 'quest', rarity: 'uncommon', desc: '덩굴 문을 여는 열쇠예요.' },
  { id: 'vine', name: '덩굴 조각', icon: 'icon-item-vine', kind: 'material', rarity: 'common', desc: '덩굴 슬라임이 떨어뜨린 재료예요.\n공방에서 쓸 수 있어요(준비 중).' },
];

export const ITEMS: Record<string, ItemDef> = Object.fromEntries(list.map((i) => [i.id, i]));

export const RARITY_LABEL: Record<ItemDef['rarity'], string> = {
  common: '보통',
  uncommon: '고급',
  rare: '희귀',
  legend: '전설',
};

export const SLOT_LABEL = { hat: '모자', outfit: '옷', tool: '도구', shoes: '신발', charm: '장신구' } as const;
