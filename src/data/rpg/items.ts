import type { ItemDef } from '../schema';

const list: ItemDef[] = [
  // 모자
  { id: 'cap', name: '천 모자', icon: 'icon-item-cap', kind: 'equip', slot: 'hat', rarity: 'common', stats: { def: 1 }, overlay: 'equip-hat-cap', desc: '햇볕을 가리는 천 모자예요.\n쓰면 몸을 조금 더 지켜 줘요.', price: 20 },
  { id: 'leafhat', name: '나뭇잎 모자', icon: 'icon-item-leafhat', kind: 'equip', slot: 'hat', rarity: 'uncommon', stats: { def: 1, maxHp: 3 }, overlay: 'equip-hat-leaf', desc: '나뭇잎을 엮은 폭신한 모자예요.\n몸을 지키고 최대 체력을 늘려요.', price: 45 },
  { id: 'rangerhat', name: '숲지기 모자', icon: 'icon-item-rangerhat', kind: 'equip', slot: 'hat', rarity: 'rare', stats: { def: 2, maxHp: 5 }, overlay: 'equip-hat-ranger', desc: '숲길을 다닐 때 쓰는 모자예요.\n몸을 지키고 최대 체력을 늘려요.' },
  // 도구
  { id: 'stick', name: '나무 지팡이', icon: 'icon-item-stick', kind: 'equip', slot: 'tool', rarity: 'common', stats: { atk: 1 }, overlay: 'equip-tool-stick', desc: '고장 난 곳을 톡톡 두드려요.\n친구를 고치는 힘이 늘어요.', price: 20 },
  { id: 'hammer', name: '고침 망치', icon: 'icon-item-hammer', kind: 'equip', slot: 'tool', rarity: 'uncommon', stats: { atk: 2 }, overlay: 'equip-tool-hammer', desc: '삐걱대는 부품을 뚝딱 고쳐요.\n지팡이보다 고치는 힘이 세요.', price: 50 },
  { id: 'brush', name: '수호자의 붓', icon: 'icon-item-brush', kind: 'equip', slot: 'tool', rarity: 'rare', stats: { atk: 3, maxEn: 1 }, overlay: 'equip-tool-brush', desc: '수호자가 건넨 빛나는 붓이에요.\n고치는 힘과 최대 에너지가 늘어요.' },
  // 옷
  { id: 'vest', name: '견습 조끼', icon: 'icon-item-vest', kind: 'equip', slot: 'outfit', rarity: 'common', stats: { maxHp: 4 }, desc: '주머니가 많은 탐험 조끼예요.\n입으면 최대 체력이 늘어요.', price: 25 },
  { id: 'cloak', name: '이끼 망토', icon: 'icon-item-cloak', kind: 'equip', slot: 'outfit', rarity: 'uncommon', stats: { maxHp: 6, def: 1 }, desc: '폭신한 이끼를 두른 망토예요.\n몸을 지키고 최대 체력을 늘려요.' },
  // 신발
  { id: 'boots', name: '가죽 신발', icon: 'icon-item-boots', kind: 'equip', slot: 'shoes', rarity: 'common', stats: { maxHp: 2 }, desc: '발을 편하게 감싸는 신발이에요.\n신으면 최대 체력이 늘어요.', price: 15 },
  { id: 'windboots', name: '바람 신발', icon: 'icon-item-windboots', kind: 'equip', slot: 'shoes', rarity: 'rare', stats: { maxHp: 2, maxEn: 1 }, desc: '바람처럼 가벼운 신발이에요.\n최대 체력과 에너지가 늘어요.' },
  // 장신구·학습 도우미
  { id: 'glasses', name: '디버그 안경', icon: 'icon-item-glasses', kind: 'equip', slot: 'charm', rarity: 'uncommon', effect: { helper: 'debugGlasses' }, desc: '가방에서 안경을 착용해요.\n실행 뒤 잘못된 칸을 짚어 줘요.' },
  { id: 'flowmap', name: '순서도 지도', icon: 'icon-item-flowmap', kind: 'helper', rarity: 'uncommon', effect: { helper: 'flowMap' }, desc: '가방에 넣고 미로를 탐험해요.\n작은 지도에 지나온 길이 보여요.' },
  // 소모품
  { id: 'apple', name: '회복 사과', icon: 'icon-item-apple', kind: 'consumable', rarity: 'common', effect: { heal: 10 }, desc: '아삭! 먹으면 힘이 나요.\n체력을 10만큼 회복해요.', price: 10 },
  { id: 'jelly', name: '에너지 젤리', icon: 'icon-item-jelly', kind: 'consumable', rarity: 'common', effect: { energy: 2 }, desc: '전투 중에 먹는 말랑한 젤리예요.\n이번 차례 에너지가 2 늘어요.', price: 12 },
  // 퀘스트·재료
  { id: 'forestkey', name: '숲 열쇠', icon: 'icon-item-forestkey', kind: 'quest', rarity: 'uncommon', desc: '미로의 덩굴 문에 쓰는 열쇠예요.\n문 가까이 가서 열어 봐요.' },
  { id: 'vine', name: '덩굴 조각', icon: 'icon-item-vine', kind: 'material', rarity: 'common', desc: '슬라임이 남긴 덩굴 재료예요.\n공방에서 쓰는 기능은 준비 중이에요.' },
  { id: 'dataVest', name: '기록가 조끼', icon: 'icon-item-vest', kind: 'equip', slot: 'outfit', rarity: 'rare', stats: { maxHp: 8, def: 2 }, desc: '항구의 기록가가 준 조끼예요.\n체력과 몸을 지키는 힘이 늘어요.' },
  { id: 'researchBoots', name: '연구원 신발', icon: 'icon-item-windboots', kind: 'equip', slot: 'shoes', rarity: 'rare', stats: { maxHp: 5, maxEn: 1 }, desc: '표본을 살피며 걸을 때 편해요.\n최대 체력과 에너지가 늘어요.' },
];

export const ITEMS: Record<string, ItemDef> = Object.fromEntries(list.map((i) => [i.id, i]));

export const RARITY_LABEL: Record<ItemDef['rarity'], string> = {
  common: '보통',
  uncommon: '고급',
  rare: '희귀',
  legend: '전설',
};

export const SLOT_LABEL = { hat: '모자', outfit: '옷', tool: '도구', shoes: '신발', charm: '장신구' } as const;
