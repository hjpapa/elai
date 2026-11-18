import { CLAW_ROUNDS, CLAW_TITLE } from '../data/minigames/claw';
import { SORT_ROUNDS, SORT_TITLE } from '../data/minigames/sort';
import { LIGHT_ROUNDS, LIGHT_TITLE } from '../data/minigames/light';
import { ROUTE_ROUNDS, ROUTE_TITLE } from '../data/minigames/route';
import { BAKERY_ROUNDS, BAKERY_TITLE } from '../data/minigames/bakery';
import { FRUIT_ROUNDS, FRUIT_TITLE } from '../data/minigames/fruit';

export const CATALOG = [
  { id: 'claw', building: '마을 공방', map: 'workroom', name: '코딩 인형뽑기', icon: 'icon-card-grab', rounds: CLAW_ROUNDS, title: CLAW_TITLE },
  { id: 'sort', building: '마을 택배소', map: 'parcel', name: '코딩 택배 분류', icon: 'icon-stamp', rounds: SORT_ROUNDS, title: SORT_TITLE },
  { id: 'light', building: '마을 불빛 가게', map: 'lightshop', name: '코딩 불빛 그림', icon: 'icon-bulb-on', rounds: LIGHT_ROUNDS, title: LIGHT_TITLE },
  { id: 'route', building: '마을 지도방', map: 'maproom', name: '코딩 길찾기', icon: 'icon-goal', rounds: ROUTE_ROUNDS, title: ROUTE_TITLE },
  { id: 'bakery', building: '마을 빵집', map: 'bakery', name: '주문서 빵집', icon: 'icon-cake', rounds: BAKERY_ROUNDS, title: BAKERY_TITLE },
  { id: 'fruit', building: '마을 과일 가게', map: 'fruitshop', name: '과일 AI 가르치기', icon: 'icon-fruit', rounds: FRUIT_ROUNDS, title: FRUIT_TITLE },
] as const;
