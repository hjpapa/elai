import { Grid, polygon, saveHires } from './c12-common.mjs';
import { fruit } from './c20-fruit.mjs';

const g = new Grid(32,32);
// An arched wooden handle behind the fruit stays visible on both backgrounds.
for (const [radius, color] of [[10,'E'],[9,'t'],[8,'U']]) {
  for (let x=-radius; x<=radius; x++) {
    const y=15-Math.round(Math.sqrt(radius*radius-x*x));
    g.line(16+x,y,16+x,y+2,color);
  }
}
fruit(g,'apple-red',1,5,17);
fruit(g,'banana',13,3,18);
polygon(g,[[2,18],[12,20],[29,16],[27,26],[14,30],[5,26]],'T','Q');
g.line(3,19,13,22,'Z').line(13,22,28,18,'t');
g.line(5,23,14,26,'U').line(14,26,27,22,'X');
g.line(10,23,11,27,'X').line(20,22,19,27,'U');
saveHires('icon-fruit',[g]);
