import { h } from './dom';

/**
 * 휴대폰·태블릿 조작: 왼쪽 아래 조이스틱(8방향)과 오른쪽 아래 행동 단추.
 * 조이스틱 방향은 방향키와 같은 칸 방향으로 바꿔서 넘겨요(아이소라서 화면 위쪽 = 칸의 (-1, -1)).
 */
export interface TouchControls {
  el: HTMLElement;
  /** 행동 단추 글(가까이 있는 것에 따라 말하기·열기·읽기…). null이면 흐리게 */
  setAction(label: string | null): void;
  setHidden(hidden: boolean): void;
  destroy(): void;
}

/** 화면 각도 0°(오른쪽)부터 45°씩 시계 방향 → 칸 방향 */
const SECTORS: readonly [number, number][] = [
  [1, -1], // 오른쪽
  [1, 0], // 오른쪽 아래
  [1, 1], // 아래
  [0, 1], // 왼쪽 아래
  [-1, 1], // 왼쪽
  [-1, 0], // 왼쪽 위
  [-1, -1], // 위
  [0, -1], // 오른쪽 위
];

/** 화면의 조이스틱 방향(dx, dy, 아래가 +)을 칸 방향으로. 가운데 가까우면 null */
export function stickToGrid(dx: number, dy: number, dead = 14): [number, number] | null {
  if (Math.hypot(dx, dy) < dead) return null;
  const sector = (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8;
  return [...SECTORS[sector]];
}

/** 손가락으로 조작하는 기기인지(휴대폰·태블릿) */
export function isTouchFirst(): boolean {
  return window.matchMedia('(pointer: coarse)').matches;
}

export function touchControls(onDir: (d: [number, number] | null) => void, onAction: () => void): TouchControls {
  const knob = h('div', { class: 'stick-knob' });
  const base = h('div', { class: 'stick', role: 'group', 'aria-label': '움직이기 조이스틱' }, knob);
  const action = h('button', { class: 'btn touch-action', type: 'button', disabled: true, onclick: onAction }, '말하기') as HTMLButtonElement;
  const el = h('div', { class: 'touch-controls' }, base, action);
  const reach = 44;
  let pointer: number | null = null;
  const move = (e: PointerEvent) => {
    const r = base.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);
    const len = Math.hypot(dx, dy);
    onDir(stickToGrid(dx, dy));
    if (len > reach) {
      dx = (dx / len) * reach;
      dy = (dy / len) * reach;
    }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  const end = (e: PointerEvent) => {
    if (e.pointerId !== pointer) return;
    pointer = null;
    knob.style.transform = '';
    onDir(null);
  };
  base.addEventListener('pointerdown', (e) => {
    pointer = e.pointerId;
    try {
      // 손가락이 조이스틱 밖으로 나가도 계속 따라가게 잡아 둬요.
      base.setPointerCapture(e.pointerId);
    } catch {
      // 잡을 수 없는 포인터(일부 브라우저)면 그냥 진행해요.
    }
    move(e);
    e.preventDefault();
  });
  base.addEventListener('pointermove', (e) => {
    if (e.pointerId === pointer) move(e);
  });
  base.addEventListener('pointerup', end);
  base.addEventListener('pointercancel', end);
  return {
    el,
    setAction(label) {
      action.disabled = !label;
      action.textContent = label ?? '말하기';
    },
    setHidden(hidden) {
      el.hidden = hidden;
      if (hidden && pointer !== null) {
        pointer = null;
        knob.style.transform = '';
        onDir(null);
      }
    },
    destroy() {
      el.remove();
    },
  };
}
