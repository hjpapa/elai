// 아이콘 원본을 손보기 위한 픽셀 도형 설계도예요. 빌드는 생성된 .txt만 읽어요.
import { Grid, save } from './pixel.mjs';
import { ASSETS } from '../../src/game/assets.ts';

const icon = () => new Grid(16, 16);
const finish = g => g.outline('O');
function heart(g, x = 3, y = 4, color = 'r', light = 'p') {
  g.stamp(['.CC.CC.', 'CCCCCCC', 'CCCCCCC', '.CCCCC.', '..CCC..', '...C...'].map(r => r.replaceAll('C', color)), x, y);
  g.set(x + 1, y + 1, light).set(x + 2, y + 1, light);
}
function star(g, color = 'Y') {
  g.poly([[8,2],[10,6],[13,6],[11,9],[12,13],[8,11],[4,13],[5,9],[2,6],[6,6]], color);
  g.line(8,3,7,7,'y').set(5,7,'W');
}
function sparkle(g, x, y, color, radius = 2) {
  g.line(x-radius,y,x+radius,y,color).line(x,y-radius,x,y+radius,color).set(x,y,'W');
}
function shield(g, color = 'B', light = 'b') {
  g.poly([[4,3],[11,3],[12,5],[11,10],[8,13],[4,10],[3,5]], color);
  g.line(5,4,10,4,light).line(4,5,5,9,light).line(8,5,8,10,'W');
}
function leaf(g, x=3, y=3, color='L') {
  g.poly([[x+1,y+5],[x+1,y+2],[x+4,y],[x+8,y],[x+7,y+5],[x+4,y+8]], color);
  g.line(x+1,y+7,x+6,y+2,'g').line(x+2,y+4,x+5,y+4,'l');
}
function key(g) {
  g.ellipse(5,5,3,3,'Y').ellipse(5,5,1,1,'.').line(7,7,12,12,'Y').line(8,7,13,12,'y');
  g.rect(10,11,2,3,'Y').rect(12,10,2,2,'Y').set(4,3,'W');
}
function hat(g, kind) {
  if (kind === 'leafhat') { leaf(g,3,3); g.poly([[2,10],[7,8],[13,10],[11,12],[4,12]],'g').line(3,10,9,9,'L'); }
  else if (kind === 'rangerhat') { g.poly([[4,9],[5,4],[8,5],[10,3],[11,9]],'g').line(5,8,11,8,'Y').ellipse(7.5,10,5.5,1.8,'G').line(3,10,8,9,'L').line(10,5,13,2,'t'); }
  else { g.ellipse(7,7.5,4.6,3.6,'r').poly([[3,9],[11,9],[13,11],[11,12],[3,11]],'R').line(4,5,7,4,'p').line(8,10,12,10,'r').set(10,8,'Y'); }
}
function tool(g, kind) {
  if (kind === 'stick') { g.line(5,13,10,4,'E').line(6,13,11,4,'T').line(9,4,9,2,'e').line(9,2,12,2,'T').set(11,3,'t'); }
  if (kind === 'hammer') { g.poly([[4,11],[9,5],[11,7],[6,13]],'e').line(5,11,9,6,'T').poly([[6,4],[8,2],[13,6],[11,9]],'A').line(7,4,9,3,'a').line(10,6,12,7,'S'); }
  if (kind === 'brush') { g.line(4,13,10,7,'e').line(5,13,11,7,'T').poly([[8,5],[10,3],[13,2],[13,6],[11,8]],'C').line(9,5,12,3,'c').line(8,7,10,9,'Y'); }
}
function boot(g, x, y, color, light) {
  g.poly([[x,y],[x+3,y],[x+3,y+4],[x+5,y+5],[x+5,y+7],[x,y+7]],color);
  g.line(x,y,x+2,y,light).line(x+1,y+2,x+1,y+4,light).line(x,y+7,x+5,y+7,'E');
}

const itemDraw = {
  cap: g => hat(g,'cap'), leafhat: g => hat(g,'leafhat'), rangerhat: g => hat(g,'rangerhat'),
  stick: g => tool(g,'stick'), hammer: g => tool(g,'hammer'), brush: g => tool(g,'brush'),
  vest: g => { g.poly([[4,3],[6,2],[7,5],[9,5],[10,2],[12,3],[11,7],[12,13],[9,13],[8,11],[7,13],[3,13],[4,7]],'B'); g.line(5,3,4,6,'b').line(8,6,8,10,'W').rect(4,10,2,2,'N').rect(10,10,2,2,'N').set(8,8,'Y'); },
  cloak: g => { g.ellipse(8,5,3,3,'g').poly([[5,5],[11,5],[13,12],[10,13],[8,12],[5,13],[2,12]],'g'); g.poly([[5,6],[7,6],[5,11],[3,12]],'L').line(10,7,11,11,'G').set(8,6,'Y').set(8,4,'G'); },
  boots: g => { boot(g,3,3,'e','T'); boot(g,8,5,'E','e'); },
  windboots: g => { boot(g,3,3,'B','b'); boot(g,8,5,'B','c'); g.line(2,7,5,9,'W').line(2,9,4,10,'b').set(12,3,'b'); },
  glasses: g => { g.rect(2,5,5,5,'V').rect(9,5,5,5,'V').rect(3,6,3,3,'b').rect(10,6,3,3,'b').line(6,6,9,6,'V').line(3,6,4,6,'W').set(10,6,'W').set(13,10,'v'); },
  flowmap: g => { g.poly([[3,2],[12,2],[13,12],[10,13],[3,12]],'t'); g.line(4,3,11,3,'W').rect(7,4,2,2,'B').line(8,6,8,8,'E').line(5,8,11,8,'E').rect(4,9,3,2,'g').rect(10,9,2,2,'r').set(12,12,'e'); },
  apple: g => { g.ellipse(6,8,3.3,4.6,'r').ellipse(10,8,3.3,4.6,'r').line(10,11,11,10,'R').rect(4,6,2,2,'p').line(8,5,8,2,'E').poly([[9,3],[10,2],[12,2],[11,4]],'L'); },
  jelly: g => { g.ellipse(8,11,5,1.8,'Y').poly([[3,11],[4,6],[6,4],[10,4],[12,6],[13,11]],'Y').ellipse(8,6,3.5,1.8,'y').rect(5,7,2,3,'W').line(10,9,11,11,'T').set(9,4,'W'); },
  forestkey: g => { key(g); g.poly([[2,4],[2,2],[5,2],[4,5]],'L').set(3,3,'l'); },
  vine: g => { g.line(4,13,8,9,'G').line(8,9,6,6,'g').line(6,6,10,2,'g').poly([[3,10],[3,7],[6,7],[6,10]],'L').line(4,8,5,9,'l').poly([[8,6],[10,4],[13,4],[11,7]],'g').line(10,5,12,5,'L'); },
};

function wheel(g) {
  g.ellipse(8,8,5,5,'S').ellipse(8,8,3,3,'Y').ellipse(8,8,1,1,'O').line(4,5,6,3,'a').line(8,4,8,6,'y').line(10,8,12,8,'t').line(8,10,8,12,'t').line(4,8,6,8,'y');
}
const digits = {
  1:['.O.','OO.','.O.','.O.','OOO'], 2:['OOO','..O','OOO','O..','OOO'],
  3:['OOO','..O','.OO','..O','OOO'],4:['O.O','O.O','OOO','..O','..O'],
  5:['OOO','O..','OOO','..O','OOO'],6:['.OO','O..','OOO','O.O','OOO'],
  7:['OOO','..O','.O.','.O.','.O.'],8:['OOO','O.O','OOO','O.O','OOO'],
};
function card(kind) {
  const colors = { attack:'R', heal:'g', collect:'Y', repeat:'e', if:'V', wait:'S' };
  const c = colors[kind] ?? 'B';
  const g = icon();
  g.rect(2,1,12,14,'O').rect(1,2,14,12,'O').rect(2,2,12,12,c).rect(3,3,10,10,'W').line(3,2,10,2,'w');
  const glyphs = {
    up:['...B...','..BBB..','.BBBBB.','...B...','...B...','...B...','...B...'],
    down:['...B...','...B...','...B...','...B...','.BBBBB.','..BBB..','...B...'],
    left:['..B....','.BB....','BBBBBBB','.BB....','..B....'],
    right:['....B..','....BB.','BBBBBBB','....BB.','....B..'],
    forward:['...B...','..BBB..','.BBBBB.','...B...','...B...','.......','..BBB..'],
    turnLeft:['..B....','.BBBBB.','BBBBBBB','.BB..BB','..B..BB','.....BB','.....BB'],
    turnRight:['....B..','.BBBBB.','BBBBBBB','BB..BB.','BB..B..','BB.....','BB.....'],
    collect:['...k...','..kk.k.','..kkkk.','k.kkkk.','kkkkkk.','.kkkk..','..kkk..'],
    attack:['....Y..','...YYY.','....Y..','...r...','..r....','.r.....','r......'],
    guard:['BBBBBBB','BbWWWBB','BbWBWBB','.BWBWB.','.BBBBB.','..BBB..','...B...'],
    heal:['.gg.gg.','ggggggg','ggggggg','.ggggg.','..ggg..','...g...'],
    wait:['SSSSSSS','.YWWWY.','..YWY..','...Y...','..YWY..','.YYYYY.','SSSSSSS'],
    repeat:['..eeee.','.ee..ee','ee...ee','ee.....','eeee...','.ee....','..e....'],
    if:['..VVV..','....V..','...VV..','...V...','.......','.V.V.V.','V..V..V'],
  };
  const rows = glyphs[kind];
  g.stamp(rows,4,Math.floor((16-rows.length)/2));
  if (kind==='collect') g.line(9,8,9,10,'h').set(6,9,'K');
  return g;
}

function intent(kind) {
  const g = icon();
  if (kind==='attack') { g.rect(4,4,8,7,'r').rect(3,7,2,4,'r').rect(6,11,5,2,'R').line(5,5,10,5,'p').line(6,4,6,7,'R').line(8,4,8,7,'R').line(10,4,10,7,'R').set(4,9,'p'); }
  if (kind==='guard') shield(g);
  if (kind==='charge') { g.poly([[9,2],[4,8],[7,8],[6,13],[12,6],[9,6]],'Y').line(8,4,6,7,'y').set(3,3,'r').set(12,11,'r'); }
  if (kind==='smash') { star(g,'r'); g.line(4,3,3,2,'Y').line(12,3,13,2,'Y').set(7,8,'y').set(9,8,'y'); }
  if (kind==='heal') { heart(g,4,5,'g','l'); g.line(11,3,11,5,'c').line(10,4,12,4,'c'); }
  if (kind==='idle') { g.stamp(['SSSS','..S.','.S..','SSSS'],3,9).stamp(['AAA','..A','AAA'],8,5).stamp(['aa','.a','aa'],12,2); }
  return finish(g);
}

function ui(kind) {
  const g = icon();
  switch(kind) {
    case 'robi':
      g.rect(3,5,10,7,'a').rect(5,3,6,2,'S').rect(5,2,6,1,'b').rect(2,7,2,4,'S').rect(12,7,2,4,'S').rect(5,6,6,4,'B').rect(6,6,4,1,'b').line(6,11,9,11,'W').set(7,4,'Y'); break;
    case 'goal':
      g.rect(3,3,2,10,'e').poly([[5,3],[12,3],[10,6],[12,8],[5,8]],'r').line(6,4,10,4,'p').line(2,13,7,13,'g'); break;
    case 'gem':
      g.poly([[5,3],[10,3],[13,7],[8,13],[2,7]],'C').poly([[5,4],[8,4],[6,7],[3,7]],'c').poly([[7,7],[12,7],[8,12]],'b').line(8,4,11,7,'W'); break;
    case 'cell-tree':
      g.ellipse(8,8,5.5,5.5,'G').ellipse(6,6,3.5,3.5,'g').ellipse(9,6,3,3,'L').ellipse(7,9,4,3,'g').line(5,4,7,3,'l').set(10,9,'G').set(9,11,'L'); break;
    case 'cell-water':
      g.rect(3,3,10,10,'B').line(4,5,6,5,'b').line(7,6,9,6,'b').line(10,5,12,5,'b').line(3,10,5,10,'b').line(6,11,9,11,'b').line(10,9,12,9,'b').set(4,4,'W'); break;
    case 'cell-rock':
      g.poly([[3,7],[6,3],[10,3],[13,7],[12,12],[5,13],[2,10]],'A').poly([[3,7],[6,4],[9,4],[8,8]],'a').poly([[9,8],[12,7],[11,11],[6,12]],'S').line(4,9,6,9,'a'); break;
    case 'star': star(g); break;
    case 'star-empty': star(g,'S'); g.poly([[8,5],[9,7],[11,7],[9,9],[10,11],[8,10],[6,11],[6,9],[5,7],[7,7]],'.'); break;
    case 'coin':
      g.ellipse(8,8,5,5,'Y').ellipse(7,7,4,4,'y').line(5,4,7,3,'W').stamp(['.Y.','YYY','.Y.'],6,6).line(11,7,11,10,'T'); break;
    case 'heart': heart(g,4,5); break;
    case 'energy': g.poly([[9,2],[4,8],[7,8],[6,13],[12,6],[9,6]],'B').line(8,4,6,7,'b').line(9,8,8,10,'c'); break;
    case 'xp': g.poly([[8,2],[9,6],[13,8],[9,9],[8,13],[6,9],[2,8],[6,6]],'V').line(8,4,7,7,'v').set(8,8,'W').set(3,3,'v').set(12,12,'v'); break;
    case 'bag':
      g.rect(6,2,4,2,'e').rect(5,3,6,1,'T').rect(3,5,10,8,'e').rect(4,5,8,3,'T').rect(5,9,6,3,'E').rect(6,9,4,2,'T').rect(7,7,2,2,'Y').line(4,5,4,7,'t'); break;
    case 'book':
      g.poly([[3,3],[7,3],[8,4],[9,3],[13,3],[13,12],[9,12],[8,13],[7,12],[3,12]],'B').rect(4,4,3,7,'W').rect(9,4,3,7,'t').line(8,5,8,11,'N').line(4,6,6,6,'a').line(10,6,11,6,'e').set(5,9,'Y'); break;
    case 'gear':
      g.ellipse(8,8,4,4,'A').rect(6,2,4,12,'A').rect(2,6,12,4,'A').poly([[3,4],[4,3],[12,11],[11,12]],'A').poly([[11,3],[12,4],[4,12],[3,11]],'A').ellipse(8,8,2,2,'O').set(8,8,'b').line(6,3,8,3,'a').line(3,6,3,8,'a'); break;
    case 'lock':
      g.ellipse(8,6,3,4,'A').ellipse(8,6,1,2,'.').rect(4,7,8,6,'Y').line(5,8,10,8,'y').rect(7,9,2,3,'E').set(8,10,'O'); break;
    case 'check': g.poly([[3,7],[5,9],[11,3],[13,5],[5,13],[2,10]],'g').line(4,8,5,10,'L').line(6,9,11,4,'L'); break;
    case 'hint':
      g.ellipse(8,6,4,4,'Y').ellipse(7,5,2,2,'y').rect(6,10,4,3,'S').line(6,11,9,11,'a').line(7,13,8,13,'Y').line(7,8,8,10,'W').set(3,3,'y').set(12,3,'y'); break;
    case 'part-wheel': wheel(g); break;
    default: throw new Error(`아이콘 설계가 없어요: ${kind}`);
  }
  return finish(g);
}

for (const spec of ASSETS.filter(a=>a.kind==='icon')) {
  let g;
  if (spec.key.startsWith('icon-item-')) { g=icon(); const name=spec.key.slice(10); if (!itemDraw[name]) throw new Error(`아이템 설계 없음: ${name}`); itemDraw[name](g); finish(g); }
  else if (spec.key.startsWith('icon-card-')) g=card(spec.key.slice(10));
  else if (spec.key.startsWith('icon-intent-')) g=intent(spec.key.slice(12));
  else if (spec.key.startsWith('icon-badge-')) {
    const n=Number(spec.key.at(-1)); g=icon();
    g.poly([[4,3],[11,3],[13,6],[12,10],[8,13],[3,10],[2,6]],'Y').line(5,4,10,4,'y').line(3,6,4,9,'W');
    g.stamp(digits[n],6,5).set(3+(n%3),11,'B').set(10+(n%2),4,'L'); finish(g);
  }
  else g=ui(spec.key.slice(5));
  // 모든 아이콘은 1px 투명 여백을 유지해요.
  for(let p=0;p<16;p++) { g.set(p,0,'.').set(p,15,'.').set(0,p,'.').set(15,p,'.'); }
  save(spec.key,[g]);
}
console.log(`아이콘 ${ASSETS.filter(a=>a.kind==='icon').length}개 텍스트 원본을 만들었어요.`);
