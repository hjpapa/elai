import { app } from '../game/app';
import { DEFAULT_VOLUME, playSfx, setSoundEnabled, setVolume } from '../fx/sfx';
import { clear, h, lines } from './dom';

/** 소리 크기 단계(교실 상황에 맞게 고를 수 있게) */
const VOLUMES = [
  { label: '작게', value: 0.4 },
  { label: '보통', value: DEFAULT_VOLUME },
  { label: '크게', value: 1 },
];

/** 메뉴: 소리 켜기·크기, 저장 정보, 처음 화면으로 */
export function openMenu(): void {
  const handle = app.ui.panel(() => undefined, { title: '메뉴' });
  const render = () => {
    const d = app.state.data;
    const volume = d.settings.volume ?? DEFAULT_VOLUME;
    clear(handle.body);
    handle.body.append(
      h(
        'div',
        { class: 'row', style: 'justify-content:space-between;margin-bottom:12px' },
        h('span', {}, '소리'),
        h(
          'button',
          {
            class: `btn small ${d.settings.sound ? 'primary' : ''}`,
            onclick: () => {
              app.state.updateSettings({ sound: !d.settings.sound });
              setSoundEnabled(app.state.data.settings.sound);
              render();
            },
          },
          d.settings.sound ? '켜짐' : '꺼짐',
        ),
      ),
      h(
        'div',
        { class: 'row', style: 'justify-content:space-between;margin-bottom:12px' },
        h('span', {}, '소리 크기'),
        h(
          'div',
          { class: 'row', role: 'group', 'aria-label': '소리 크기' },
          ...VOLUMES.map((v) =>
            h(
              'button',
              {
                class: `chip ${Math.abs(volume - v.value) < 0.01 ? 'on' : ''}`,
                'aria-pressed': Math.abs(volume - v.value) < 0.01 ? 'true' : 'false',
                disabled: !d.settings.sound,
                onclick: () => {
                  app.state.updateSettings({ volume: v.value });
                  setVolume(v.value);
                  // 고른 크기를 바로 들어 볼 수 있게 확인 소리를 내요.
                  playSfx('item');
                  render();
                },
              },
              v.label,
            ),
          ),
        ),
      ),
      h(
        'p',
        { class: 'muted' },
        ...lines(
          app.classLink
            ? `학급: ${app.classLink.className} · ${app.classLink.nickname}\n게임은 자동으로 저장되고, 선생님 페이지에 진도가 기록돼요.`
            : '체험 모드예요. 게임은 이 기기에만 자동으로 저장돼요.',
        ),
      ),
      h(
        'div',
        { class: 'row end', style: 'margin-top:16px' },
        h(
          'button',
          {
            class: 'btn',
            onclick: async () => {
              handle.close();
              if (await app.ui.confirm('처음 화면으로 갈까요?\n지금까지 한 것은 저장돼요.')) location.reload();
            },
          },
          '처음 화면으로',
        ),
      ),
    );
  };
  render();
}
