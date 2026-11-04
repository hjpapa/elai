import { app } from '../game/app';
import { setSoundEnabled } from '../fx/sfx';
import { clear, h, lines } from './dom';

/** 메뉴: 소리, 저장 정보, 처음 화면으로 */
export function openMenu(): void {
  const handle = app.ui.panel(() => undefined, { title: '메뉴' });
  const render = () => {
    const d = app.state.data;
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
              d.settings.sound = !d.settings.sound;
              setSoundEnabled(d.settings.sound);
              app.state.setFlag('settings-touched');
              render();
            },
          },
          d.settings.sound ? '켜짐' : '꺼짐',
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
