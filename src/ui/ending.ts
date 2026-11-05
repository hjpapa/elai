import { CHAPTERS } from '../data/chapters';
import { app } from '../game/app';
import { shouldShowEnding } from '../game/rpg/ending';
import { playSfx } from '../fx/sfx';
import { h, lines } from './dom';
import { icon, pxImg } from './icons';
import { robiLook } from './portraits';
let showing = false;
/** 여덟 배지로 마을에서 여는 마무리. 완료 버튼을 누른 뒤에만 본 기록을 남겨요. */
export async function showEnding(): Promise<void> {
  if (showing || !shouldShowEnding(app.state.data)) return;
  showing = true;
  try {
    await app.ui.dialogue([
      { who: 'robi', text: '여덟 열쇠가 모두 모였어요!\n함께 배운 시간이 빛나고 있어요.' },
      { who: 'robi', text: 'AI는 우리의 성장을 도와요.\n중요한 결정은 사람이 살펴봐요.' },
      { who: 'robi', text: '개인정보와 서로의 마음을 지켜요.\nAI 도움도 솔직히 밝혀요.' },
    ]);
    playSfx('success');
    await new Promise<void>(resolve => {
      const state = app.state;
      const handle = app.ui.panel(() => undefined, {
        title: '생각하는 AI 로비', wide: true, closable: false, className: 'ending-panel',
        onClose: () => { state.applyReward({ title: '함께 자라는 친구', flags: ['ending-seen'] }); resolve(); },
      });
      const look = pxImg(robiLook(state.data), 96, '여덟 부품을 모은 로비');
      look.style.height = '144px'; look.style.objectFit = 'contain';
      handle.body.append(h('div', { style: 'text-align:center' }, look,
        h('p', { class: 'robi-say' }, ...lines('사람이 살피고 결정해요.\nAI와 함께 배우고 자라요.'))), h('h3', {}, '함께 배운 여덟 가지'));
      const badges = h('div', { role: 'list', 'aria-label': '여덟 장의 배지', style: 'display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px' });
      for (const chapter of CHAPTERS.filter(c => c.badge)) badges.append(h('div', { role: 'listitem', style: 'padding:8px;border:1px solid #56657a;border-radius:8px;min-width:0' },
        pxImg(icon('icon-badge-' + chapter.index), 32, chapter.index + '장 배지'), h('p', {}, chapter.index + '장 ' + chapter.title)));
      handle.body.append(badges, h('h3', {}, '모아 온 칭호'));
      const titles = h('div', { class: 'row', style: 'flex-wrap:wrap' });
      for (const title of new Set([...state.data.titles, '함께 자라는 친구'])) titles.append(h('span', { class: 'chip' }, title));
      const done = h('button', { class: 'btn primary', 'aria-label': '마을에서 계속 탐험하기', onclick: () => handle.close() }, '마을에서 계속 탐험하기');
      handle.body.append(titles, h('p', {}, '배운 방법으로 주변의 일을 도와봐요.'), h('div', { class: 'row end', style: 'margin-top:12px' }, done));
      handle.body.tabIndex = -1;
      handle.body.focus({ preventScroll: true });
      handle.body.scrollTop = 0;
    });
  } finally { showing = false; }
}
