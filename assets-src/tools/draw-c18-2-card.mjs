import {Grid,polygon,rounded,saveHires} from './c12-common.mjs';
const g=new Grid(32,32);
// 다른 카드와 같은 2px 여백과 둥근 틀, 안쪽은 짙은 바다색이에요.
rounded(g,2,2,28,28,'m','O');rounded(g,4,4,24,24,'/','m');rounded(g,6,6,20,20,'m','/');
g.line(7,3,23,3,'n').line(3,7,3,23,'n').line(8,5,22,5,'o');
// 작은 숫자 2 쪽이 물결의 중심이에요. 두 고리는 도착점까지 남은 거리를 나타내요.
for(const r of [7,11])for(let y=8;y<=23;y++)for(let x=9;x<=24;x++){const d=(x-9)**2+(y-23)**2;if(d<=r*r&&d>=(r-1.6)**2)g.set(x,y,'o');}
// 큰 숫자 쪽에서 작은 숫자 쪽으로 향하는 굵은 화살표.
polygon(g,[[22,11],[25,14],[18,21],[20,23],[12,24],[13,16],[15,18]],'W','m');
g.line(22,13,16,19,'?').line(14,21,17,21,'y');
// 숫자가 흐려져도 고리의 중심으로 향하는 방향은 남아요.
g.stamp(['WWW','..W','.WW','..W','WWW'],21,7);
g.stamp(['qqq','..q','qqq','q..','qqq'],7,21);
saveHires('icon-card-followWave',[g]);
