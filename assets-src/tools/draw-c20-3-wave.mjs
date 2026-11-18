import { Grid, rounded, polygon, saveHires } from './c12-common.mjs';

const g=new Grid(32,32);
rounded(g,2,2,28,28,'m','O');
rounded(g,4,4,24,24,'/','m');
rounded(g,6,6,20,20,'m','/');
g.line(7,3,23,3,'n').line(3,7,3,23,'n').line(8,5,22,5,'o');

// Two cyan wave fronts spread from the destination in the lower left.
for (const radius of [9,16]) {
  for (let y=7; y<=24; y++) for (let x=7; x<=24; x++) {
    const distance=Math.hypot(x-7,y-24);
    if (distance<=radius && distance>radius-2.5) g.set(x,y,'o');
  }
}
// A warm, broad arrow runs across the rings and points back to their source.
polygon(g,[[20,8],[24,12],[16,20],[19,22],[8,24],[10,14],[13,17]],'W','m');
g.line(20,10,13,17,'y').line(10,22,16,21,'Y');
saveHires('icon-card-followWave',[g]);
