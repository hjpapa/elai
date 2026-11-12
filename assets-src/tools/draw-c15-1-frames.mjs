import { Grid, polygon, rounded, saveHires } from './c12-common.mjs';
import { LIGHT_ROUNDS } from '../../src/data/minigames/light.ts';

// 판 데이터의 첫 그림을 그대로 써서 보상 액자의 칸 순서를 지켜요.
export const pictures = LIGHT_ROUNDS.map(r => r.pictures[0]);
export function layout(pic) {
  const pitch = 4;
  return { pitch, x: 5 + Math.floor((22 - pic[0].length * pitch) / 2), y: 10 + Math.floor((23 - pic.length * pitch) / 2) };
}
export function frame(index) {
  const g = new Grid(32, 48);
  // 뒤 받침과 두 발. 접지는 y44, 그 아래 세 줄은 투명이에요.
  polygon(g, [[22,29],[25,29],[29,43],[27,44],[24,36]], 'U', 'Q');
  g.line(25,31,28,42,'X');
  polygon(g, [[6,33],[10,33],[8,44],[4,44]], 'e', 'Q');
  polygon(g, [[22,33],[25,33],[28,44],[23,44]], 'U', 'Q');
  g.line(7,36,6,42,'t').line(24,36,25,42,'X');
  // 따뜻한 목재 테두리와 뒤쪽 오른면, 밝은 왼쪽 위.
  polygon(g, [[3,5],[27,5],[30,8],[30,35],[27,38],[3,38],[1,35],[1,8]], 'U', 'Q');
  rounded(g,2,5,27,32,'T','E');
  g.line(5,6,25,6,'Z').line(3,9,3,33,'t');
  g.line(5,35,26,35,'X').line(28,10,28,33,'U');
  rounded(g,5,9,22,25,'N','Q');
  g.line(6,10,24,10,'m').line(6,11,6,31,'m');
  g.line(7,33,25,33,'e');
  const pic = index ? pictures[index - 1] : Array(5).fill('00000');
  const at = layout(pic);
  pic.forEach((row,y) => [...row].forEach((bit,x) => {
    const xx = at.x + x * at.pitch, yy = at.y + y * at.pitch;
    g.rect(xx,yy,3,3,bit === '1' ? 'Y' : 'm');
    g.set(xx+1,yy+1,bit === '1' ? 'W' : 'N');
    g.set(xx,yy,bit === '1' ? '?' : 'S');
  }));
  // 나무틀 접합 못은 두 개만. 숫자·가격·장식 문자는 넣지 않아요.
  g.set(5,7,'W').set(25,34,'+');
  return g;
}
saveHires('prop-light-frame', Array.from({length:7},(_,i)=>frame(i)));
console.log('C15-1 액자 7프레임: 첫 숫자 그림과 동일한 4px 칸, y44 접지');
