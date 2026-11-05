// C1: 몸과 장비는 같은 pose()를 써서 머리·손·보행 위치를 맞춰요.
import { Grid, save } from './pixel.mjs';

function pose(f) {
  const step = f % 5;
  return { back: f >= 5, step, bob: step === 1 || step === 3 ? -1 : 0,
    stride: [0, -1, 0, 1, 0][step], swing: [0, -1, 1, 1, -1][step] };
}

function head(g, p, skin, hair, light) {
  const y = 3 + p.bob;
  g.stamp([
    '..OOOOOO.',
    '.OHHHHHHO',
    'OHHhHHHHH',
    'OHHHHHHHH',
    'OHkkkkkkO',
    '.OkkkkkkO',
    '.OkkkkkkO',
    '..OkkkkO.',
    '...OOOO..',
  ].map(r => r.replaceAll('H', hair).replaceAll('h', light).replaceAll('k', skin)), 3, y);
  if (p.back) {
    // 머리의 윗면과 뒷면, 오른쪽 귀만 보여 우상향을 표현해요.
    g.rect(5, y + 3, 7, 4, hair).rect(5, y + 3, 1, 2, light);
    g.set(11, y + 3, skin).set(12, y + 3, 'O').set(12, y + 4, skin);
    g.set(11, y + 5, hair).set(10, y + 7, hair);
  } else {
    g.rect(8, y + 4, 1, 2, 'O').rect(10, y + 4, 1, 2, 'O');
    g.set(8, y + 4, 'W').set(10, y + 4, 'W');
    g.set(12, y + 6, skin).set(10, y + 7, 'E');
  }
}

function human(key, f) {
  const p = pose(f), g = new Grid(16, 24), b = p.bob;
  const configs = {
    'char-player': { skin: 'K', hair: 'E', light: 'e', cloth: 'B', lit: 'b', dark: 'N' },
    'char-elder': { skin: 'h', hair: 'a', light: 'W', cloth: 'V', lit: 'v', dark: 'D' },
    'char-chef': { skin: 'k', hair: 'D', light: 'E', cloth: 'T', lit: 't', dark: 'e' },
    'char-ranger': { skin: 'H', hair: 'D', light: 'E', cloth: 'g', lit: 'L', dark: 'G' },
  };
  const c = configs[key];
  // 그림자는 발 기준점 아래 두 줄만 쓰고, 신발 바닥은 21행에 둬요.
  g.rect(5, 22, 7, 1, 'S');
  const leftX = 5 + p.stride, rightX = 9 - p.stride;
  g.rect(leftX, 19 + Math.max(0, p.stride), 3, 3 - Math.max(0, p.stride), 'O');
  g.rect(rightX, 19 + Math.max(0, -p.stride), 3, 3 - Math.max(0, -p.stride), 'O');
  g.rect(leftX, 20, 2, 1, 'e').rect(rightX, 20, 2, 1, 'E');
  g.rect(4, 12 + b, 9, 7, 'O').rect(5, 12 + b, 7, 6, c.cloth);
  g.rect(5, 12 + b, 2, 5, c.lit).rect(11, 13 + b, 1, 5, c.dark);
  g.rect(5, 18 + b, 7, 1, c.dark);
  // 손과 도구의 접점은 앞 x12, 뒤 x3, y15+bob+swing으로 공유해요.
  const hy = 15 + b + p.swing;
  g.rect(3, 13 + b, 2, 3, 'O').set(3, 14 + b, c.cloth);
  g.rect(12, 13 + b, 2, 3, 'O').set(12, 14 + b, c.cloth);
  g.set(p.back ? 3 : 12, hy, c.skin).set(p.back ? 12 : 4, 16 + b - p.swing, c.skin);
  head(g, p, c.skin, c.hair, c.light);
  if (key === 'char-player') {
    if (p.back) {
      g.rect(5, 12 + b, 6, 6, 'E').rect(5, 12 + b, 5, 5, 'T');
      g.rect(6, 12 + b, 3, 1, 't').rect(6, 15 + b, 3, 2, 'e').set(8, 15 + b, 'Y');
    } else {
      g.rect(7, 12 + b, 2, 6, 'W').rect(10, 12 + b, 1, 6, 'T');
      g.set(10, 14 + b, 'Y').set(5, 16 + b, 'N');
    }
  }
  if (key === 'char-elder') {
    // 짧은 은발, 겹친 목도리, 나무 지팡이로 연령과 역할을 구분해요.
    g.rect(5, 11 + b, 7, 2, 't').rect(5, 13 + b, 2, 3, 'Y');
    g.rect(4, 17 + b, 9, 3, 'V').rect(5, 17 + b, 2, 2, 'v');
    g.line(14, 11 + b, 14, 21, 'O').line(13, 10 + b, 14, 10 + b, 'e');
    g.line(13, 12 + b, 13, 20, 'T');
    if (!p.back) g.set(7, 9 + b, 'a').set(10, 10 + b, 'W');
  }
  if (key === 'char-chef') {
    g.stamp(['...OOOOOO...', '..OWWWWWWO..', '.OWWwWWWwWO.', '..OWWWWWWO..', '...OWWWWO...'], 2, 1 + b);
    g.rect(6, 12 + b, 5, 7, 'W').rect(6, 14 + b, 1, 4, 'a');
    g.rect(7, 15 + b, 3, 2, 't').set(8, 13 + b, 'r');
    if (p.back) g.rect(5, 15 + b, 7, 1, 'W').set(8, 16 + b, 'W');
  }
  if (key === 'char-ranger') {
    g.poly([[3, 13 + b], [5, 12 + b], [11, 12 + b], [13, 19 + b], [3, 19 + b]], 'G');
    g.poly([[4, 13 + b], [6, 12 + b], [9, 13 + b], [8, 18 + b], [4, 18 + b]], 'g');
    g.set(6, 13 + b, 'l').line(4, 17 + b, 5, 16 + b, 'L');
    if (!p.back) g.line(8, 12 + b, 11, 17 + b, 'T').set(10, 16 + b, 'Y');
    g.stamp(['....OOO.....', '...OgLGO....', '..OgLLGGO...', '.OGggggGGO..', 'OggggggggGO.', '.OOOOOOOOO..'], 2, b);
    g.set(10, 2 + b, 'l').set(11, 1 + b, 'L');
    // 망토 밖으로 보이는 손의 앞뒤 흔들림도 4걸음에 맞춰요.
    g.set(p.back ? 3 : 12, hy, c.skin).set(p.back ? 12 : 4, 16 + b - p.swing, c.skin);
  }
  return g;
}

function robot(f) {
  const p = pose(f), g = new Grid(16, 24), b = p.bob;
  g.rect(4, 22, 8, 1, 'S');
  g.rect(5 + p.stride, 20, 3, 2, 'O').rect(9 - p.stride, 20, 3, 2, 'O');
  g.set(6 + p.stride, 20, 'A').set(10 - p.stride, 20, 'a');
  g.stamp(['...OOOOOO...', '..OaaWWaaO..', '.OaaaaaAAAO.', '.OaaaaaAAAO.', '..OAAAAAAO..', '...OOOOOO...'], 2, 14 + b);
  g.rect(2, 15 + b + p.swing, 2, 3, 'O').set(2, 16 + b + p.swing, 'a');
  g.rect(13, 15 + b - p.swing, 2, 3, 'O').set(13, 16 + b - p.swing, 'A');
  g.line(8, 2 + b, 8, 5 + b, 'A').set(8, 2 + b, 'Y').set(8, 1 + b, 'Y').set(7, 1 + b, 'y');
  g.stamp(['..OOOOOOOO..', '.OaaaWWaaaO.', 'OaaAAAAAAaaO', 'OaONNNNNNOaO', 'OaONNNNNNOAO', 'OaONNNNNNOAO', 'OAAOOOOOOAAO', '.OAAAAAAAAO.', '..OOOOOOOO..'], 2, 5 + b);
  if (p.back) {
    g.rect(5, 8 + b, 7, 4, 'A').rect(5, 8 + b, 1, 3, 'a');
    g.line(8, 9 + b, 10, 9 + b, 'S').line(8, 11 + b, 10, 11 + b, 'S');
    g.set(12, 7 + b, 'C').set(12, 8 + b, 'c');
  } else {
    g.rect(8, 9 + b, 1, 2, 'c').rect(11, 9 + b, 1, 2, 'c');
    g.set(9, 12 + b, 'C').set(10, 12 + b, 'C');
  }
  g.rect(7, 16 + b, 3, 2, p.back ? 'S' : 'B').set(7, 16 + b, 'b');
  return g;
}

function lantern(f) {
  const p = pose(f), b = p.bob, g = new Grid(16, 24);
  g.rect(6, 22, 4, 1, 'S');
  g.stamp(['......OOO......', '.....OPyPO.....', '....OPWWWPO....', '...OPWWWWWPO...', '..OPWWWWWWWPO..', '..OPWWWWWWWPO..', '..OPWWWWWWWPO..', '..OPWWWWWWWPO..', '...OPWWWWWPO...', '....OPPPPPO....', '.....OOOOO.....'], 0, 4 + b);
  // 갓과 아래쪽 술로 공중에 떠 있는 종이 등불을 표현해요.
  g.poly([[5, 4 + b], [7, 2 + b], [9, 4 + b], [11, 5 + b], [3, 5 + b]], 'P');
  g.line(4, 5 + b, 9, 5 + b, 'p');
  g.rect(6, 15 + b, 4, 2, 'P').rect(7, 17 + b, 2, 2, 'Y');
  g.line(7, 19 + b, 6 + p.stride, 20 + b, 'p').set(9 - p.stride, 20 + b, 'p');
  if (p.back) {
    g.line(5, 7 + b, 5, 12 + b, 'p').line(9, 7 + b, 9, 12 + b, 'p');
    g.set(11, 9 + b, 'O');
  } else {
    g.rect(7, 9 + b, 1, 2, 'O').rect(10, 9 + b, 1, 2, 'O');
    g.line(8, 12 + b, 9, 12 + b, 'P').set(5, 11 + b, 'p').set(11, 11 + b, 'p');
  }
  const wing = p.step === 2 || p.step === 4 ? 1 : 0;
  g.line(2, 11 + b, 0, 12 + b - wing, 'P').set(1, 12 + b - wing, 'p');
  g.line(13, 11 + b, 15, 10 + b + wing, 'P').set(14, 10 + b + wing, 'p');
  return g;
}

function equipment(key, f) {
  const p = pose(f), g = new Grid(16, 24), b = p.bob;
  if (key === 'robi-part-wheel') {
    // 바퀴의 접지 위치는 로비의 발과 같아요. 보행 중에도 일정하게 유지해요.
    for (const x of [5, 10]) {
      g.rect(x - 1, 19, 3, 4, 'O').rect(x, 20, 1, 2, 'Y');
      g.set(x, 20 + (p.step % 2), 'y');
    }
    g.rect(6, 20, 4, 2, 'S').line(6, 20, 9, 20, 'a');
    return g;
  }
  if (key.includes('-hat-')) {
    const hatY = 1 + b;
    if (key.endsWith('-cap')) {
      g.stamp(['....OOOOOO....', '...ORrrrrRO...', '..ORrrrRRRRO..', '..ORRRRRRRRO..', '...OOOOOOOOOO.'], 1, hatY);
      g.set(5, 2 + hatY, 'p').set(6, 1 + hatY, 'p');
      if (p.back) g.rect(6, 4 + hatY, 3, 1, 'T');
      else g.line(10, 4 + hatY, 13, 4 + hatY, 'r');
    } else if (key.endsWith('-leaf')) {
      g.stamp(['.......O......', '......OgO.....', '....OOgLLO....', '..OOgLLLLgO...', '.OgLLlLLgggO..', '..OOOOOOOOOO..'], 1, hatY);
      g.line(6, 4 + hatY, 10, 2 + hatY, 'G').set(10, hatY, 'e');
      if (p.back) g.set(7, 4 + hatY, 'L');
    } else {
      g.stamp(['......OO......', '.....OgLO.....', '....OgLLgO....', '...OGggggGO...', '.OOgggggggOO..', '..OOOOOOOOOO..'], 1, hatY);
      g.line(5, 3 + hatY, 10, 3 + hatY, 'T').set(11, 1 + hatY, 'l').set(12, hatY, 'L');
      if (p.back) g.line(5, 3 + hatY, 9, 3 + hatY, 'E').set(6, 3 + hatY, 'T');
    }
    return g;
  }
  const x = p.back ? 2 : 13;
  const hy = 15 + b + p.swing;
  // 자루는 손 옆에, 손잡이는 손 높이에 맞춰요. 모든 도구에 같은 흔들림을 써요.
  g.line(x, 10 + b + p.swing, x, 20 + b + p.swing, 'O');
  g.line(x, 11 + b + p.swing, x, 19 + b + p.swing, 'T');
  g.set(p.back ? 3 : 12, hy, 'K');
  if (key.endsWith('-stick')) {
    g.set(x - 1, 9 + b + p.swing, 'O').set(x, 8 + b + p.swing, 'E');
    g.set(x + 1, 9 + b + p.swing, 'T').set(x, 9 + b + p.swing, 't');
  } else if (key.endsWith('-hammer')) {
    g.rect(x - 2, 8 + b + p.swing, 5, 4, 'O');
    g.rect(x - 1, 9 + b + p.swing, 3, 2, 'A').line(x - 1, 9 + b + p.swing, x + 1, 9 + b + p.swing, 'a');
    g.set(x, 10 + b + p.swing, 'Y');
  } else {
    g.poly([[x - 1, 10 + b + p.swing], [x - 1, 7 + b + p.swing], [x + 1, 6 + b + p.swing], [x + 1, 10 + b + p.swing]], 'O');
    g.line(x, 7 + b + p.swing, x, 9 + b + p.swing, 'c');
    g.set(x + 1, 7 + b + p.swing, 'C').set(x, 10 + b + p.swing, 'Y');
  }
  return g;
}

const people = ['char-player', 'char-elder', 'char-chef', 'char-ranger'];
for (const key of people) save(key, Array.from({ length: 10 }, (_, f) => human(key, f)));
save('char-robi', Array.from({ length: 10 }, (_, f) => robot(f)));
save('char-zen', Array.from({ length: 10 }, (_, f) => lantern(f)));
for (const key of ['equip-hat-cap', 'equip-hat-leaf', 'equip-hat-ranger', 'equip-tool-stick', 'equip-tool-hammer', 'equip-tool-brush', 'robi-part-wheel']) {
  save(key, Array.from({ length: 10 }, (_, f) => equipment(key, f)));
}
console.log('캐릭터 6종과 겹침 레이어 7종, 모두 130프레임을 그렸어요.');
