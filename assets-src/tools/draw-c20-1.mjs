import { Grid, loadGrid, polygon, rounded, saveHires } from './c12-common.mjs';
import { CRATE_FRUITS, FRUIT_ROUNDS } from '../../src/data/minigames/fruit.ts';
import { fruit } from './c20-fruit.mjs';

function shop(base) {
  // Reuse the village facade so the door and steps meet the existing portal.
  for (let y = 0; y < base.h; y++) for (let x = 0; x < base.w; x++) {
    const awning = (x <= 22 && y >= 49 + (x - 5) / 2 - 1) ||
                   (x >= 39 && y >= 59 - (x - 39) / 2 - 1);
    const paint = awning ? { r:'L', R:'g', s:'G' } : { r:'z', R:'x', s:'h' };
    const color = paint[base.get(x, y)];
    if (color) base.set(x, y, color);
  }
  rounded(base, 24, 54, 18, 13, 'Z', 'U');
  base.rect(27, 56, 12, 9, 'W');
  fruit(base, 'apple-red', 26, 52, 15);
  // A woven hamper sits against the display window to the right of the door.
  polygon(base, [[42,72],[55,65],[60,68],[59,77],[47,83],[42,80]], 'T', 'E');
  for (const [id,x,y] of [['apple-red',42,67],['apple-green',48,64],['tangerine',53,62]]) fruit(base,id,x,y,8);
  base.line(43,75,48,78,'t').line(48,78,59,72,'Z').line(48,81,58,76,'U');
  return base;
}

function robot(brightEye) {
  const g = new Grid(64,96);
  polygon(g, [[11,76],[38,65],[53,73],[53,81],[30,91],[11,82]], 'd','O');
  polygon(g, [[12,75],[35,65],[52,73],[30,84]], 'i','d');
  rounded(g, 23, 40, 21, 37, 'f', 'd');
  g.rect(25,44,3,27,'i').rect(39,45,4,25,'d');
  g.ellipse(32,35,17,16,'O').ellipse(32,34,16,15,'f').ellipse(31,32,14,12,'i');
  g.line(21,26,26,23,'j').line(26,23,32,23,'j');
  g.ellipse(31,36,10,10,'d').ellipse(31,36,8,8,'O').ellipse(31,36,6,6,brightEye?'C':'n');
  g.ellipse(30,35,3,3,brightEye?'q':'o').set(29,34,'?');
  rounded(g,24,52,15,12,brightEye?'n':'C','O');
  g.line(27,59,29,59,'q').line(29,59,31,55,'q').line(31,55,33,60,'q').line(33,60,36,57,'q');
  polygon(g,[[8,71],[26,64],[40,70],[39,80],[23,87],[8,80]],'X','E');
  polygon(g,[[9,71],[26,65],[39,70],[23,77]],'U','t');
  for(const [x,y,c] of [[17,62,'L'],[23,64,'r']]){
    rounded(g,x,y,8,10,'W','U');g.ellipse(x+3,y+4,2,2,c);
  }
  g.line(10,73,23,79,'t').line(23,79,38,73,'Z').line(24,83,37,77,'U');
  return g;
}

function crate(ids) {
  const g = new Grid(32,48);
  polygon(g,[[1,28],[18,21],[30,26],[30,37],[13,44],[1,38]],'T','E');
  polygon(g,[[2,28],[18,22],[29,26],[13,33]],'U','t');
  if(ids.length===3) fruit(g,ids[2],8,9);
  ids.slice(0,2).forEach((id,i)=>fruit(g,id,1+14*i,16-i*3));
  polygon(g,[[1,28],[13,33],[13,44],[1,38]],'X','E');
  polygon(g,[[13,33],[30,26],[30,37],[13,44]],'T','U');
  g.line(2,29,12,33,'t').line(14,33,29,27,'Z').line(2,34,12,38,'U').line(14,39,29,32,'X');
  g.set(4,35,'t').set(27,35,'t');
  return g;
}

function stand() {
  const g=new Grid(64,64);
  for(const [x,y] of [[6,45],[31,54],[56,44]]) rounded(g,x,y-8,6,15,'X','E');
  polygon(g,[[3,36],[32,20],[61,32],[61,43],[32,57],[3,46]],'X','E');
  polygon(g,[[3,36],[32,21],[61,32],[32,47]],'t','U');
  g.line(4,40,31,53,'T').line(33,52,60,39,'U');
  for(const [id,x,y] of [['apple-red',4,19],['banana',22,12],['grape',40,16]]){
    g.ellipse(x+9,y+17,10,6,'U').ellipse(x+9,y+15,10,5,'T');
    fruit(g,id,x,y-1,19);
    g.line(x+2,y+17,x+14,y+19,'t');
  }
  return g;
}

saveHires('prop-fruit-shop',loadGrid('prop-bakery').map(shop));
saveHires('prop-fruit-ai',[robot(false),robot(true)]);
saveHires('prop-fruit-crate',[crate([]),...FRUIT_ROUNDS.map(r=>crate(CRATE_FRUITS[r.id]))]);
saveHires('prop-fruit-stand',[stand()]);
