import { ASSETS } from '../../src/game/assets.ts';
import { PILOT_KEYS } from '../../scripts/build-assets.mjs';
export const STAGES = [null,
 {name:'1장 순서의 숲',keys:'block-hedge block-wall prop-rock prop-stump prop-mushroom prop-door prop-key prop-portal char-chef char-ranger equip-hat-leaf equip-hat-ranger equip-tool-hammer equip-tool-brush mob-vine-slime mob-bug-worm boss-forest-guardian'.split(' ')},
 {name:'화면 아이콘·효과',keys:[]},
 {name:'2장 반복의 동굴',keys:'tile-cave block-cave prop-crystal prop-stalagmite char-explorer mob-echo-bat boss-bat-king robi-part-memory icon-part-memory'.split(' ')},
 {name:'3장 갈림길 사막',keys:'tile-sand block-sandstone prop-cactus prop-signal char-guide mob-mirage-lizard boss-lizard-chief robi-part-sensor icon-part-sensor'.split(' ')},
 {name:'4장 데이터 항구',keys:'tile-dock block-crate prop-lighthouse prop-buoy char-harbor mob-fog-jelly boss-ledger-octo robi-part-lens icon-part-lens icon-card-scan'.split(' ')},
 {name:'5장 인식의 연구소',keys:'tile-lab block-lab prop-microscope prop-jar char-researcher mob-shift-slime boss-shift-king robi-part-learnchip icon-part-learnchip'.split(' ')},
 {name:'6장 길잡이 천문대',keys:'tile-observatory block-observatory prop-telescope prop-starlamp char-astronomer mob-meteor-fox boss-star-fox robi-part-predictor icon-part-predictor'.split(' ')},
 {name:'7장 프롬프트 공방',keys:'tile-wood prop-easel prop-bookshelf mob-babble-parrot boss-babble-king robi-part-talk icon-part-talk'.split(' ')},
 {name:'8장 윤리의 성',keys:'tile-castle block-castle prop-mirror prop-banner char-keeper mob-fake-shadow boss-bias-golem robi-part-ethics icon-part-ethics'.split(' ')},
];
const assigned=new Set([...PILOT_KEYS,...STAGES.slice(1).flatMap(s=>s.keys)]);
STAGES[2].keys=ASSETS.filter(a=>!assigned.has(a.key)).map(a=>a.key).concat('icon-path-step');
if(STAGES[2].keys.length!==70||new Set([...PILOT_KEYS,...STAGES.slice(1).flatMap(s=>s.keys)]).size!==ASSETS.length)throw new Error('C12 단계 목록 불일치');
