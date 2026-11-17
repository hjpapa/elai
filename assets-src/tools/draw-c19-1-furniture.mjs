import {Grid,polygon,rounded,saveHires} from './c12-common.mjs';
function oven(f){
 const g=new Grid(64,96);
 // 넓은 기단과 둥근 창. 왼쪽 위는 따뜻하게, 오른쪽 면은 짙게 그려요.
 polygon(g,[[8,82],[31,74],[56,82],[34,92],[9,87]],'d','Q');g.line(11,84,32,90,'i');
 polygon(g,[[9,18],[19,13],[56,13],[47,19]],'K','U');
 polygon(g,[[47,19],[56,13],[57,80],[47,87]],'H','Q');g.line(53,22,54,77,'h');
 rounded(g,7,18,42,69,'h','Q');g.line(10,20,44,20,'K').line(8,23,8,80,'K');
 g.line(10,81,44,81,'H').line(11,85,44,85,'U');
 // 상단 환기구와 작은 주문서 꽂이. 장식 글자는 종이의 짧은 줄뿐이에요.
 rounded(g,29,24,15,8,'U','Q');for(let x=32;x<43;x+=3)g.line(x,26,x,29,'Q');
 rounded(g,11,24,14,13,'X','U');g.rect(13,23,10,11,'W').line(14,26,21,26,'i').line(14,29,19,29,'i');
 g.line(11,35,24,35,'T').line(12,36,23,36,'U');
 g.ellipse(28,54,16,17,'Q').ellipse(27,53,15,16,'S').ellipse(27,53,13,14,'U');
 g.ellipse(27,53,11,12,f?'y':'T').ellipse(25,50,8,8,f?'W':'Y');
 g.line(17,47,19,43,f?'?':'t').line(34,56,34,59,f?'Y':'X');
 // 둥근 창 안의 빵과 선반은 고정, 빛만 달라져요.
 g.line(18,61,35,61,'H').line(19,62,34,62,'Q');
 g.ellipse(26,57,6,3,'h').ellipse(25,56,5,2,'K').line(23,55,24,56,'W').line(27,55,28,56,'W');
 g.line(15,51,15,57,'i').line(37,48,38,53,'d');
 rounded(g,21,69,16,5,'d','Q');g.line(23,70,33,70,'a');
 for(const[x,y]of[[13,73],[42,73]])g.ellipse(x,y,2,2,'U').set(x,y-1,'T');
 g.line(12,78,43,78,'U').line(14,79,41,79,'K');
 return g;
}
function breadShelf(){
 const g=new Grid(64,64);
 polygon(g,[[5,10],[13,6],[59,6],[52,10]],'t','U');
 polygon(g,[[52,10],[59,6],[59,53],[52,59]],'e','E');g.line(56,13,56,51,'X');
 rounded(g,5,10,48,49,'T','U');g.line(8,11,49,11,'Z').line(6,14,6,55,'t');
 g.rect(10,15,38,37,'E').rect(11,16,36,35,'U');
 // 윗단: 식빵 두 개와 칼집 있는 둥근 빵.
 for(const x of [14,27]){rounded(g,x,20,10,12,'h','E');g.ellipse(x+4,21,5,5,'K');g.ellipse(x+4,20,4,3,'t');g.line(x+2,22,x+2,28,'W');g.line(x+2,30,x+7,30,'X');}
 g.ellipse(42,27,6,5,'h').ellipse(41,25,5,3,'K');g.line(38,24,40,26,'W').line(42,23,44,25,'W');
 g.rect(9,32,40,4,'T').line(10,32,47,32,'Z').line(10,35,47,35,'U');
 // 아랫단: 긴 바게트, 작은 롤빵, 둥근 빵으로 모양을 나눠요.
 polygon(g,[[12,46],[17,40],[32,39],[34,42],[28,48],[14,50]],'K','H');
 g.line(16,44,29,41,'t');for(const x of [19,24,29])g.line(x,41,x+1,44,'W');
 g.ellipse(40,47,7,5,'h').ellipse(39,45,6,3,'K').line(36,44,38,46,'W').line(40,44,42,46,'W');
 g.rect(9,52,40,4,'T').line(10,52,47,52,'Z').line(10,55,47,55,'U');
 g.rect(7,57,6,4,'U').rect(46,57,6,4,'E').line(8,58,11,58,'X');
 return g;
}
saveHires('prop-oven',[oven(0),oven(1)]);saveHires('prop-bread-shelf',[breadShelf()]);
