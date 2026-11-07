import Phaser from 'phaser';
import './ui/styles.css';
import { app } from './game/app';
import { BattleScene } from './game/scenes/BattleScene';
import { BootScene } from './game/scenes/BootScene';
import { GalleryScene } from './game/scenes/GalleryScene';
import { canvasRatio, canvasSize, fitCanvas } from './game/screen';
import { TitleScene } from './game/scenes/TitleScene';
import { WorldScene } from './game/scenes/WorldScene';
import { MinigameHost } from './minigames/host';
import { MINIGAMES } from './minigames/registry';
import { MissionHost } from './missions/core/MissionHost';
import { CUSTOM, ENGINES } from './missions/registry';
import { portraitFor } from './ui/portraits';
import { UI } from './ui/ui';

app.ui = new UI(document.getElementById('ui')!);
app.ui.portrait = (who) => (app.state ? portraitFor(app.state.data, who) : '');
app.missions = new MissionHost(ENGINES, CUSTOM);
app.minigames = new MinigameHost(MINIGAMES);

// 개발 서버에서만: 브라우저 콘솔에서 게임 상태를 볼 수 있게 해요.
if (import.meta.env.DEV) Object.assign(window, { __app: app });

// 캔버스는 기기 픽셀 크기로 만들고 CSS로 창 크기에 맞춰요(화면 배율 125%·150%에서도 그림이 또렷해요).
// 창 크기가 잠깐 0이면 WebGL 프레임버퍼를 만들지 못해요(canvasSize가 최소 크기를 보장해요).
const ratio = canvasRatio();
const size = canvasSize(window.innerWidth, window.innerHeight, ratio);
app.game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#1b1f2a',
  scale: { mode: Phaser.Scale.NONE, width: size.width, height: size.height, zoom: 1 / ratio },
  scene: [BootScene, TitleScene, WorldScene, BattleScene, GalleryScene],
});
app.game.events.once(Phaser.Core.Events.READY, () => {
  fitCanvas(app.game);
  window.addEventListener('resize', () => fitCanvas(app.game));
});
