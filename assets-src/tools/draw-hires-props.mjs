// C11: 마을 소품의 2배 텍스트 원본. 이전 1배 원본은 그대로 남겨요.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { Grid } from './pixel.mjs';
import { ASSETS } from '../../src/game/assets.ts';
const root = fileURLToPath(new URL('../../', import.meta.url));
const colors = JSON.parse(readFileSync(root + 'assets-src/palette.json', 'utf8')).colors;
const drawings = new Map();
const edge = (g, points, c) => points.forEach((p, i) => g.line(...p, ...points[(i + 1) % points.length], c));
const poly = (g, points, fill, border) => { g.poly(points, fill); if (border) edge(g, points, border); };
const leaf = (g, x, y, c, side = 1) => g.poly([[x,y],[x+4*side,y-2],[x+7*side,y],[x+3*side,y+2]],c);
function save(key,frames){
 const s=ASSETS.find(a=>a.key===key);if(!s||frames.length!==s.frames||frames.some(g=>g.w!==s.w*2||g.h!==s.h*2))throw new Error('2배 규격 불일치 '+key);
 for(const g of frames)for(const row of g.rows)for(const c of row)if(c!=='.'&&!colors[c])throw new Error('팔레트 밖 '+c);
 const dir=root+'assets-src/hires/'+s.kind+'/';mkdirSync(dir,{recursive:true});writeFileSync(dir+key+'.txt',frames.map(g=>g.text()).join('\n\n')+'\n');drawings.set(key,frames);
}

function house(repaired){
 const g=new Grid(64,96),wall=repaired?'&':'*',side=repaired?'Z':'X';
 // 같은 바닥 중심(32,92). 밝은 왼쪽 아래 면에 출입문, 오른쪽 면에 창이에요.
 poly(g,[[6,46],[33,60],[33,91],[6,77]],wall,'U');
 poly(g,[[33,60],[59,47],[59,78],[33,91]],side,'U');
 g.line(7,76,32,89,'X').line(34,89,58,77,'U');
 g.line(8,48,8,76,repaired?'?':'Z').line(34,61,34,88,repaired?'t':'T');
 // 물결 없는 큰 회벽 면: 낮은 기단과 모서리 목재만 더해요.
 poly(g,[[6,74],[33,88],[33,91],[6,77]],'f','d');
 poly(g,[[33,88],[59,75],[59,78],[33,91]],'d','d');
 g.line(8,75,31,87,'i').line(35,88,56,77,'f');
 // 문틀은 벽과 같은 2:1 기울기, 안쪽은 익숙한 파랑이에요.
 poly(g,[[12,58],[26,65],[26,86],[12,79]],'Q','U');
 poly(g,[[14,61],[24,66],[24,83],[14,78]],repaired?'/':'U');
 g.line(15,62,15,77,repaired?':':'X').line(19,64,19,79,repaired?'B':'e');
 g.line(23,67,23,81,repaired?'m':'Q');
 g.rect(22,74,2,2,'Y').set(22,74,'y');
 poly(g,[[11,79],[26,87],[29,85],[14,77]],'i','f');g.line(12,79,26,86,'j');
 // 옆면 창과 작은 창턱.
 poly(g,[[42,60],[53,54],[53,67],[42,73]],'Q','U');
 poly(g,[[44,61],[51,57],[51,65],[44,69]],repaired?'o':'f');
 g.line(45,61,45,67,repaired?'q':'i').line(48,59,48,67,'Z').line(44,65,51,61,'Z');
 poly(g,[[40,73],[54,66],[54,69],[40,76]],repaired?'u':'U','U');
 if(repaired){g.line(44,72,44,69,'I').line(49,70,49,66,'I');leaf(g,44,70,'J',-1);g.rect(43,66,3,3,'p').set(44,67,'y');g.rect(49,64,3,3,'r').set(50,65,'y');}
 else {g.line(39,79,41,77,'U').line(41,77,40,75,'U').line(40,75,42,72,'U');g.line(9,56,12,57,'U').line(12,57,11,60,'U');}
 // 앞 박공은 왼쪽 아래, 긴 지붕은 오른쪽 위로 이어져요.
 poly(g,[[3,47],[18,25],[34,63]],repaired?'Z':'X','Q');
 poly(g,[[7,47],[18,31],[29,58]],repaired?'&':'*');
 g.line(18,33,18,51,'U').line(9,46,27,55,'U');
 poly(g,[[17,43],[22,46],[22,53],[17,50]],'U');
 poly(g,[[18,45],[21,47],[21,51],[18,49]],repaired?'y':'X');
 poly(g,[[18,25],[42,13],[61,49],[34,63]],repaired?'u':'U','s');
 poly(g,[[19,25],[42,14],[47,24],[24,36]],repaired?'x':'X');
 poly(g,[[24,36],[47,24],[57,43],[34,56]],repaired?'u':'e');
 poly(g,[[34,56],[58,44],[61,49],[34,63]],repaired?'s':'Q');
 g.line(18,24,42,12,repaired?'z':'t').line(17,25,33,60,repaired?'z':'T');
 g.line(3,47,17,25,repaired?'x':'T').line(3,48,33,64,'Q').line(34,64,61,50,'Q');
 // 1px 폭의 기와 겹침. 줄마다 이음 위치가 달라요.
 for(const [x0,y0,x1,y1] of [[22,33,45,21],[26,42,50,29],[30,50,54,38],[34,58,58,46]])g.line(x0,y0,x1,y1,repaired?'s':'U');
 for(const [x0,y0,x1,y1] of [[30,29,34,37],[39,25,43,33],[35,38,39,45],[45,34,49,41],[39,47,43,54],[50,42,54,49]])g.line(x0,y0,x1,y1,repaired?'x':'X');
 // 굴뚝도 왼쪽 면이 밝고 오른쪽 면은 푸른 회색이에요.
 poly(g,[[46,18],[53,21],[53,38],[46,35]],'f','d');poly(g,[[43,20],[46,18],[46,35],[43,37]],'i','d');
 poly(g,[[42,19],[46,17],[54,20],[50,22]],'j','d');g.line(45,20,48,21,'d');g.line(47,28,52,30,'d');g.line(44,29,45,28,'a');
 if(!repaired){g.line(30,39,32,41,'Q').line(32,41,30,45,'Q').line(30,45,33,47,'Q');leaf(g,8,73,'I');leaf(g,52,76,'I');}
 return g;
}
save('prop-house',[house(false),house(true)]);

function tree(){
 const g=new Grid(64,96);
 poly(g,[[26,56],[39,58],[39,81],[46,90],[35,92],[23,91],[18,91],[26,81]],'U','Q');
 poly(g,[[27,60],[32,59],[32,86],[28,90],[23,90],[28,80]],'X');
 g.line(29,64,29,80,'Z').line(36,68,35,84,'Q').line(34,82,39,89,'E');
 g.line(29,70,21,59,'U').line(37,69,45,57,'Q');
 // 큰 잎 덩어리는 밝은 위/왼쪽과 차가운 아래/오른쪽으로 나눠요.
 g.ellipse(32,39,27,31,'F').ellipse(14,41,11,19,'F').ellipse(50,42,11,19,'F');
 g.ellipse(29,25,20,20,'I').ellipse(16,35,13,18,'I').ellipse(47,34,12,18,'I').ellipse(32,51,23,17,'I');
 g.ellipse(23,21,15,14,'J').ellipse(13,34,9,12,'J').ellipse(40,21,12,12,'J');
 g.ellipse(24,14,10,6,'M').ellipse(12,29,5,6,'M').ellipse(38,17,7,5,'M');
 // 잎맥을 빽빽하게 넣지 않고 적은 수의 밝고 어두운 덩어리로 나눠요.
 poly(g,[[15,45],[23,39],[30,43],[26,50],[18,52]],'J');
 poly(g,[[35,46],[44,39],[52,44],[50,53],[41,56]],'g');
 g.line(19,11,25,9,'l').line(7,31,9,27,'l').line(35,14,39,13,'l');
 leaf(g,20,35,'M');leaf(g,33,32,'L');leaf(g,42,48,'J');leaf(g,18,57,'J');leaf(g,31,60,'g');
 g.ellipse(18,44,2,3,'u').ellipse(17,43,1,1,'z');g.ellipse(45,52,2,3,'R').ellipse(44,51,1,1,'r');
 return g;
}
save('prop-tree',[tree()]);
function pine(){
 const g=new Grid(64,96);
 poly(g,[[26,62],[38,62],[38,84],[43,91],[24,92],[21,89],[27,84]],'U','Q');g.rect(28,64,4,23,'X').line(28,73,28,86,'Z');g.line(35,73,35,87,'Q');
 const tiers=[[[32,5],[47,34],[40,32],[54,52],[47,50],[59,69],[47,74],[32,77],[5,70],[16,51],[9,52],[23,31],[16,34]],
 [[32,8],[37,27],[31,25],[43,45],[33,41],[45,66],[27,69],[10,67],[24,46],[18,48],[29,27],[23,29]]];
 poly(g,tiers[0],'F');poly(g,tiers[1],'I');
 poly(g,[[31,10],[32,25],[27,28],[22,30]],'J');poly(g,[[28,32],[32,32],[33,42],[22,46]],'J');poly(g,[[24,48],[30,46],[33,60],[18,64],[13,64]],'J');
 g.line(30,13,27,22,'M').line(25,35,22,40,'M').line(20,53,16,59,'M');
 leaf(g,32,63,'g');leaf(g,41,62,'I');leaf(g,34,39,'g');
 g.line(43,31,46,32,'I').line(48,50,52,51,'I').line(48,69,55,68,'I');
 return g;
}
save('prop-pine',[pine()]);
{
 const g=new Grid(64,48);
 g.ellipse(32,32,29,12,'F').ellipse(15,28,12,13,'I').ellipse(31,23,16,15,'I').ellipse(49,29,12,12,'I');
 g.ellipse(25,18,12,8,'J').ellipse(12,25,8,8,'J').ellipse(47,24,8,6,'J');
 g.ellipse(24,14,7,3,'M').ellipse(10,22,4,3,'M').ellipse(44,21,4,2,'M');
 leaf(g,23,31,'L');leaf(g,40,33,'J');leaf(g,15,37,'J');g.line(27,15,31,16,'l');
 g.rect(49,33,3,4,'p').rect(47,34,7,2,'p').rect(49,34,2,2,'y');
 save('prop-bush',[g]);
}

function gate(open){
 const g=new Grid(64,64);
 // 독립된 돌기둥과 아치예요. 열린 통로는 투명하게 남겨요.
 poly(g,[[8,23],[12,14],[20,7],[29,4],[35,4],[45,8],[53,15],[57,23],[50,25],[46,17],[39,12],[32,10],[25,12],[18,18],[15,25]],'f','d');
 poly(g,[[9,23],[17,23],[17,59],[9,59]],'i','d');poly(g,[[47,23],[55,23],[55,59],[47,59]],'f','d');
 g.line(10,25,10,57,'j').line(48,25,48,57,'i').line(54,25,54,57,'d');
 g.line(13,15,20,10,'j').line(23,8,29,6,'j').line(33,6,38,8,'i');
 for(const y of [31,42,53]) {g.line(10,y,16,y,'f').line(48,y,54,y,'d');}
 g.line(20,8,24,13,'d').line(30,5,30,10,'d').line(40,8,38,12,'d').line(48,13,44,17,'d');
 poly(g,[[8,58],[17,58],[19,60],[7,60]],'f','d');poly(g,[[46,58],[55,58],[57,60],[45,60]],'d','d');
 if(!open){
  for(const x of [21,28,35,42]){g.rect(x,23,2,35,'Q').line(x,24,x,56,'X');}
  g.rect(20,32,25,3,'U').line(21,32,44,32,'t');g.rect(20,48,25,3,'U').line(21,48,44,48,'X');
  g.rect(30,40,6,8,'+').rect(31,40,4,6,'Y').rect(32,43,2,2,'Q').set(32,40,'y');
 } else {
  g.line(18,22,18,55,'U').line(45,22,45,55,'Q');
  poly(g,[[20,58],[32,53],[44,58],[32,60]],'X','U');g.line(22,58,32,55,'t');
 }
 g.line(12,19,14,30,'I').line(14,30,10,43,'I');leaf(g,12,21,'J',-1);leaf(g,14,29,'L');leaf(g,11,39,'J',-1);
 g.line(50,10,52,20,'I');leaf(g,50,12,'J',-1);leaf(g,52,19,'L');leaf(g,49,46,'J');
 return g;
}
save('prop-gate',[gate(false),gate(true)]);

function fountain(water){
 const g=new Grid(64,64);
 g.ellipse(32,51,27,9,'d').rect(6,43,52,9,'f').ellipse(32,45,27,10,'i');
 g.ellipse(32,44,23,7,'d').ellipse(32,44,21,5,water?'n':'f');
 g.line(9,49,16,52,'j').line(16,52,26,54,'j').line(42,54,54,49,'f');
 g.line(11,56,18,58,'i').line(19,58,33,60,'i');
 for(const [x,y] of [[15,54],[28,56],[43,54],[53,51]])g.line(x,y,x,y+3,'d');
 if(water){g.line(15,44,23,46,'o').line(40,45,49,43,'q').line(36,48,43,47,'o');}
 else {g.line(17,44,23,46,'d').line(23,46,27,43,'d').line(44,41,45,44,'d');g.rect(39,45,3,1,'X');}
 poly(g,[[27,23],[36,23],[37,43],[32,47],[26,43]],'f','d');g.rect(28,25,3,18,'j').rect(31,26,3,18,'i');
 g.ellipse(32,25,15,5,'d').rect(18,20,28,4,'f').ellipse(32,21,15,5,'j').ellipse(32,20,11,3,water?'o':'f');
 g.line(21,24,28,26,'i').line(34,26,41,24,'f');
 g.rect(29,12,6,8,'i').rect(29,12,2,7,'j').ellipse(32,11,4,3,'j').ellipse(31,10,2,1,'?');
 if(water){
  g.line(31,10,31,5,'o').line(32,10,32,4,'q');
  g.line(30,5,26,5,'q').line(26,5,23,8,'o').line(23,8,22,16,'o');
  g.line(33,5,37,7,'q').line(37,7,40,12,'o').line(40,12,41,17,'n');
  g.line(19,23,16,27,'q').line(16,27,14,35,'o').line(14,35,14,43,'n');
  g.line(45,23,49,29,'o').line(49,29,50,40,'n');
  g.rect(13,33,2,3,'q').rect(49,36,2,3,'q');g.line(12,44,17,44,'o');
 }
 return g;
}
save('prop-fountain',[fountain(false),fountain(true)]);

{
 const g=new Grid(32,64);
 poly(g,[[12,53],[20,53],[24,59],[8,59]],'d');g.line(11,57,19,57,'f').line(11,58,21,58,'i');
 g.rect(14,24,5,30,'d').rect(14,26,2,27,'i').line(16,29,16,52,'f');
 poly(g,[[7,8],[11,4],[21,4],[25,8]],'d');g.line(9,7,12,5,'i').line(13,5,20,5,'j');g.rect(6,9,20,2,'d');
 poly(g,[[8,11],[24,11],[22,26],[10,26]],'+','d');poly(g,[[10,12],[22,12],[20,24],[12,24]],'Y');
 poly(g,[[11,12],[16,12],[16,24],[12,23]],'&');g.rect(12,13,2,8,'?').rect(16,12,2,13,'f');
 g.line(9,24,23,24,'d').rect(10,26,12,3,'d').line(11,27,19,27,'f');
 save('prop-lamp',[g]);
}
{
 const g=new Grid(64,64);
 g.rect(10,27,4,32,'U').rect(11,29,1,27,'Z').rect(49,27,4,32,'Q').rect(49,29,2,28,'X');
 poly(g,[[13,48],[48,48],[50,59],[12,59]],'U','Q');g.rect(15,50,30,7,'X').line(16,51,43,51,'Z');
 g.line(22,52,22,56,'U').line(38,52,38,56,'U');
 poly(g,[[4,27],[14,11],[47,11],[59,27]],'P','s');
 poly(g,[[8,26],[17,12],[24,12],[20,27]],'&');poly(g,[[31,27],[31,12],[39,12],[44,27]],'&');
 g.line(15,11,46,11,'p').line(7,26,13,15,'p').line(22,13,19,24,'?').line(32,13,34,24,'?');
 g.rect(5,27,54,5,'s');
 for(const [x,c] of [[6,'P'],[15,'&'],[24,'P'],[33,'&'],[42,'P'],[51,'&']]){g.rect(x,27,8,5,c);g.ellipse(x+3.5,31,3.5,2,c);}
 // 펼친 보라색 주문서와 별 배지: 기존 천막 색을 이어 가요.
 poly(g,[[24,38],[32,40],[40,38],[40,47],[32,49],[24,47]],'D');
 poly(g,[[25,39],[32,41],[32,47],[25,46]],'v');poly(g,[[33,41],[39,39],[39,46],[33,47]],'V');
 g.line(27,42,30,43,'W').line(34,43,37,42,'p').line(27,44,30,45,'W');
 g.rect(17,44,4,4,'Y').line(18,44,20,44,'y').rect(44,43,3,5,'c');
 save('prop-booth',[g]);
}
{
 const g=new Grid(64,48);
 g.rect(6,19,52,6,'U').line(7,19,57,19,'Z').line(8,21,56,21,'X');
 g.rect(6,33,52,6,'U').line(7,33,57,33,'t').line(8,35,56,35,'X');
 for(const x of [8,29,50]){poly(g,[[x,11],[x+4,6],[x+8,11],[x+8,43],[x,43]],'X','U');g.line(x+1,12,x+1,41,'Z').line(x+6,13,x+6,42,'e');g.rect(x+3,21,2,2,'Q').rect(x+3,35,2,2,'Q');g.line(x+3,27,x+4,30,'U');}
 save('prop-fence',[g]);
}
{
 const g=new Grid(32,48);
 poly(g,[[14,23],[20,23],[20,43],[13,44]],'U','Q');g.line(15,25,15,42,'X').line(16,28,16,38,'Z');
 poly(g,[[4,9],[24,9],[29,16],[24,24],[4,24]],'X','Q');g.line(5,10,23,10,'Z').line(5,22,23,22,'U');
 g.line(7,12,14,12,'t').line(7,20,12,20,'U');
 g.line(10,16,22,16,'Q').line(18,12,22,16,'Q').line(22,16,18,20,'Q');g.line(10,17,20,17,'U');
 g.rect(6,14,1,2,'U').rect(6,19,1,2,'U');
 save('prop-sign',[g]);
}
function chest(open){
 const g=new Grid(32,32);
 poly(g,[[3,17],[25,17],[29,20],[29,27],[25,28],[3,26]],'U','Q');
 poly(g,[[4,18],[24,18],[24,27],[4,25]],'X');poly(g,[[25,18],[28,20],[28,26],[25,27]],'E');
 g.line(5,20,23,21,'U').line(5,23,23,24,'U');
 g.rect(6,18,3,8,'+').rect(7,18,1,7,'y').rect(20,19,3,9,'Y').line(21,19,21,26,'y');
 if(!open){
  poly(g,[[3,16],[5,10],[9,8],[22,8],[27,12],[29,19],[24,20]],'U','Q');
  poly(g,[[4,15],[7,10],[22,10],[25,15],[24,18],[4,17]],'X');g.line(8,10,21,10,'Z');g.line(5,14,23,14,'U');
  poly(g,[[7,9],[10,9],[9,18],[6,17]],'Y');g.line(8,10,7,16,'y');poly(g,[[20,9],[23,10],[25,18],[22,19]],'+');g.line(21,10,23,17,'Y');
  g.rect(13,17,5,6,'Y').rect(14,18,3,3,'y').rect(15,19,1,2,'Q');
 }else{
  poly(g,[[3,4],[23,4],[28,8],[28,14],[24,16],[4,13]],'Q');poly(g,[[5,5],[22,5],[25,8],[24,13],[5,11]],'U');
  g.line(5,5,22,5,'Z').line(6,7,22,7,'X').line(5,12,23,15,'+');g.line(7,5,7,11,'Y').line(21,5,22,13,'Y');
  poly(g,[[4,16],[24,17],[27,19],[24,21],[4,19]],'Q');g.rect(9,17,4,2,'Y').rect(14,18,4,2,'y').rect(20,17,3,2,'+');g.line(5,19,23,21,'X');
 }
 return g;
}
save('prop-chest',[chest(false),chest(true)]);
{
 const g=new Grid(64,48);
 // 두 목재 다리 끝이 중앙에서 끊겨 있어요. 그림자 대신 실제 판자 단면만 그려요.
 poly(g,[[4,27],[19,19],[30,25],[25,30],[29,34],[23,42],[6,33]],'U','Q');
 poly(g,[[5,25],[19,18],[28,23],[23,28],[27,31],[21,36],[6,29]],'X','U');
 poly(g,[[40,22],[51,17],[60,22],[60,31],[47,39],[35,33],[41,29]],'U','Q');
 poly(g,[[42,21],[51,17],[59,21],[47,29],[39,27]],'X','U');
 g.line(8,24,20,19,'Z').line(11,28,24,22,'t').line(14,31,23,27,'U').line(43,22,51,18,'Z').line(45,26,56,20,'t');
 g.line(12,24,14,31,'U').line(20,21,22,26,'U').line(48,21,50,26,'U');
 g.rect(6,13,4,18,'U').line(7,14,7,29,'Z').rect(54,12,4,17,'Q').line(55,13,55,26,'X');
 g.line(8,14,22,19,'U').line(8,13,22,18,'Z').line(43,17,55,13,'U').line(43,16,55,12,'X');
 g.line(24,26,28,25,'Z').line(37,31,41,28,'X');
 save('prop-bridge-broken',[g]);
}

// 검토판: 옛 텍스트 4배, 새 텍스트 2배. 전부 같은 게임 속 크기예요.
function drawFrames(key,frames,scale){const s=ASSETS.find(a=>a.key===key),w=frames[0].w??frames[0][0].length,h=frames[0].h??frames[0].length;const out=new PNG({width:w*s.frames*scale,height:h*scale});frames.forEach((g,f)=>{const rows=g.rows??g;rows.forEach((row,y)=>[...row].forEach((c,x)=>{if(c==='.')return;const hex=colors[c],rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++)out.data.set([...rgb,255],((y*scale+dy)*out.width+(f*w+x)*scale+dx)*4);}));});return out;}
const sheets=[];let height=20;for(const [key,frames]of drawings){const s=ASSETS.find(a=>a.key===key);const old=readFileSync(root+'assets-src/'+s.kind+'/'+key+'.txt','utf8').trimEnd().split(/\r?\n\r?\n/).map(f=>f.split(/\r?\n/));const a=drawFrames(key,old,4),b=drawFrames(key,frames,2);sheets.push({a,b,y:height,key});height+=Math.max(a.height,b.height)+20;}
const sheet=new PNG({width:660,height});for(let i=0;i<sheet.data.length;i+=4)sheet.data.set([41,48,68,255],i);for(const {a,b,y}of sheets){for(const [png,ox] of [[a,12],[b,344]])for(let sy=0;sy<png.height;sy++)for(let sx=0;sx<png.width;sx++){const from=(sy*png.width+sx)*4;if(png.data[from+3])sheet.data.set(png.data.subarray(from,from+4),((y+sy)*sheet.width+ox+sx)*4);}}mkdirSync(root+'assets-preview/',{recursive:true});writeFileSync(root+'assets-preview/c11-props-comparison.png',PNG.sync.write(sheet));
console.log('C11 소품 '+drawings.size+'키 / '+[...drawings.values()].reduce((n,f)=>n+f.length,0)+'프레임: 2배 텍스트와 비교판 생성');
