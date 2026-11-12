import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, root, polygon, rounded, saveHires, loadGrid } from './c12-common.mjs';

// C15-1. 같은 마을의 박공과 모서리 출입구를 잇는 작은 불빛 가게예요.
// 두 프레임의 지붕·벽은 같고 문과 유리·전구만 바뀌어요. 발은 (32,92), 그림자는 없어요.
function shop(on) {
  const g = new Grid(64, 96);
  // 회벽, 모서리 목재, 석재 기단: 왼쪽 면은 따뜻하고 오른쪽 면은 차분해요.
  polygon(g, [[6,46],[24,55],[24,86],[6,77]], '&', 'U');
  polygon(g, [[24,55],[41,55],[41,86],[24,86]], 'Z', 'U');
  polygon(g, [[41,55],[59,46],[59,77],[41,86]], '*', 'U');
  g.line(7,49,7,73,'?').line(23,57,23,83,'T').line(42,57,42,81,'X');
  polygon(g, [[6,74],[24,83],[24,86],[6,77]], 'i', 'd');
  polygon(g, [[24,83],[41,83],[41,86],[24,86]], 'f', 'd');
  polygon(g, [[41,83],[59,74],[59,77],[41,86]], 'f', 'd');
  g.line(8,75,23,82,'j').line(42,83,57,75,'i');
  g.line(8,52,8,74,'X').line(9,53,9,73,'Z').line(22,61,22,81,'U');
  // 왼쪽 작은 창은 켜진 유리의 밝은 중심과 어두운 꺼진 유리를 같은 면에 담아요.
  polygon(g, [[11,58],[19,62],[19,72],[11,68]], 'U', 'Q');
  g.poly([[12,60],[18,63],[18,70],[12,67]], on ? 'y' : 'd');
  g.line(13,61,13,66,on?'W':'f').line(15,62,15,68,'X').line(12,64,18,67,'X');
  polygon(g, [[10,68],[20,73],[20,75],[10,70]], 'V', 'N');
  g.line(11,69,18,72,'v');
  // 오른쪽 진열창. 작은 스탠드 둘과 매달린 전구 하나가 보여요.
  polygon(g, [[40,60],[57,51],[57,74],[40,83]], 'U', 'Q');
  g.poly([[42,61],[55,54],[55,72],[42,79]], on?'Y':'d');
  g.poly([[43,62],[47,60],[47,74],[43,76]], on?'y':'S');
  g.poly([[51,57],[54,55],[54,70],[51,72]], on?'t':'N');
  // 왼쪽 스탠드는 넓은 천 갓, 오른쪽은 둥근 유리 갓으로 구별해요.
  polygon(g, [[44,66],[47,65],[49,69],[43,72]], on?'W':'A', on?'T':'d');
  g.line(46,71,46,75,'U').line(44,76,48,74,'U');
  g.line(44,69,47,68,on?'?':'i');
  g.line(52,66,52,71,'U').line(50,72,54,70,'U');
  g.ellipse(52,64,2,3,on?'y':'f').line(51,63,51,65,on?'W':'i');
  g.line(50,57,50,61,'U').ellipse(50,62,1,2,on?'W':'A');
  // 진열대와 창살은 램프의 큰 형태를 가르지 않아요.
  g.line(42,77,55,70,'T').line(43,78,55,72,'Z');
  g.line(49,60,49,75,'X').line(50,64,50,73,'T');
  g.line(43,62,46,60,on?'?':'i').line(53,57,54,57,on?'W':'A');
  polygon(g, [[39,82],[58,73],[58,76],[39,85]], 'V', 'N');
  g.line(40,82,56,74,'v');
  // 중앙 문: 닫힘은 목재와 손잡이, 열림은 어두운 통로와 안쪽 금빛 마루예요.
  rounded(g,24,64,17,24,'T','U');
  g.line(26,65,37,65,'Z').line(25,67,25,85,'t');
  rounded(g,27,67,11,19,'Q','Q');
  if (on) {
    g.rect(28,68,9,16,'Q').poly([[33,69],[36,69],[36,78],[33,76]],'U');
    g.line(36,69,36,79,'Y').line(35,70,35,76,'+');
    g.poly([[31,78],[36,78],[36,84],[28,84]],'T');
    g.line(30,80,36,80,'t').line(28,84,36,84,'W');
    polygon(g, [[27,68],[23,71],[23,86],[27,83]], 'X', 'U');
    g.line(24,72,24,83,'T').set(24,78,'Y');
  } else {
    g.rect(28,68,9,16,'X').line(29,69,29,82,'T');
    g.line(32,69,32,83,'U').line(35,69,35,83,'U');
    rounded(g,29,69,6,7,'d','U');
    g.line(30,70,33,70,'f').line(30,71,30,73,'A');
    g.rect(35,78,2,2,'+').set(35,78,'t');
  }
  // 두 계단의 마지막 행은 y91. 아래 네 행은 투명해요.
  polygon(g, [[25,85],[40,85],[43,88],[39,91],[25,91],[21,88]], 'i', 'd');
  g.line(24,88,40,88,'j').line(25,89,39,89,'a').line(26,90,37,90,'f');
  if (on) g.line(28,86,37,86,'t');
  // C11~C14와 같은 박공/긴 지붕. 보라 기와에 남색 그늘을 두어요.
  polygon(g, [[3,47],[18,25],[34,63]], 'T', 'Q');
  g.poly([[7,47],[18,31],[29,58]],'&');
  g.line(18,33,18,51,'X').line(9,46,27,55,'X');
  polygon(g, [[14,44],[18,39],[23,48],[23,52],[14,48]], 'U', 'Q');
  g.poly([[16,44],[18,42],[21,47],[21,49],[16,47]],on?'y':'d');
  g.set(18,44,on?'W':'A');
  polygon(g, [[18,25],[42,13],[61,49],[34,63]], 'V', 'N');
  g.poly([[19,25],[42,14],[47,24],[24,36]],'v');
  g.poly([[24,36],[47,24],[57,43],[34,56]],'V');
  g.poly([[34,56],[58,44],[61,49],[34,63]],'N');
  g.line(18,24,42,12,'v').line(17,25,33,60,'v');
  g.line(3,47,17,25,'v').line(3,48,33,64,'Q').line(34,64,61,50,'N');
  for (const [x0,y0,x1,y1] of [[22,33,45,21],[26,42,50,29],[30,50,54,38],[34,58,58,46]]) g.line(x0,y0,x1,y1,'N');
  for (const [x0,y0,x1,y1] of [[30,29,34,37],[39,25,43,33],[35,38,39,45],[45,34,49,41],[39,47,43,54],[50,42,54,49]]) g.line(x0,y0,x1,y1,'v');
  // 같은 섬 석재의 낮은 환기 굴뚝. 장식은 절제해 지붕의 색이 먼저 보여요.
  polygon(g, [[46,18],[53,21],[53,38],[46,35]], 'f', 'd');
  polygon(g, [[43,20],[46,18],[46,35],[43,37]], 'i', 'd');
  polygon(g, [[42,19],[46,17],[54,20],[50,22]], 'j', 'd');
  g.line(45,20,48,21,'d').line(47,28,52,30,'d').line(44,29,45,28,'a');
  // 처마의 전선은 같은 위치에 고정하고, 알전구만 밝기·실루엣이 달라져요.
  g.line(5,50,20,59,'U').line(20,59,26,60,'U');
  g.line(39,61,46,61,'U').line(46,61,60,53,'U');
  for (const [x,y] of [[8,53],[15,57],[22,61],[44,63],[51,60],[58,56]]) {
    g.set(x,y-2,'U');
    if (on) {
      g.ellipse(x,y,2,2,'Y').ellipse(x,y,1,1,'y').set(x,y-1,'W');
      g.set(x-2,y-1,'t');
    } else {
      g.ellipse(x,y,1,2,'d').line(x,y-1,x,y,'A');
    }
  }
  // 문 위 금속판과 전구 간판: 글씨 없이 전구와 나사 소켓만으로 알아봐요.
  g.line(25,53,25,56,'d').line(39,55,39,57,'d');
  rounded(g,24,55,17,11,'N','O');
  g.line(26,56,37,56,'V').line(25,58,25,63,'V');
  g.ellipse(32,59,4,4,on?'Y':'d');
  g.ellipse(31,58,2,2,on?'W':'A');
  g.rect(30,61,5,2,on?'y':'f').rect(31,63,3,2,'i').line(31,64,33,64,'d');
  if (on) {
    // 실루엣 바깥 짧은 광선도 추가해 색을 구별하기 어려워도 켜짐이 보여요.
    g.set(27,58,'y').set(37,58,'y').set(32,54,'W');
    g.line(29,60,30,61,'y').line(34,60,33,61,'y');
  }
  return g;
}

const result = saveHires('prop-light-shop', [shop(false), shop(true)]);
const frames = [loadGrid('prop-house')[1], loadGrid('prop-workshop')[1], loadGrid('prop-parcel-office')[1], ...result.frames];
const palette = JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const width = 1380, height = 740, png = new PNG({width,height});
for(let i=0;i<png.data.length;i+=4) png.data.set([38,44,59,255],i);
function draw(g,ox,oy,scale) {
  for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++) {
    const c=g.get(x,y);if(c==='.')continue;
    const rgb=[1,3,5].map(i=>parseInt(palette[c].slice(i,i+2),16));
    for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++) png.data.set([...rgb,255],(((oy+y*scale+dy)*width)+ox+x*scale+dx)*4);
  }
}
// 위는 각 건물을 4배로, 아래는 경로 위 2배와 원래 PNG 크기로 비교해요.
frames.forEach((g,i)=>draw(g,12+i*276,8,4));
const path = loadGrid('tile-path')[0];
frames.forEach((g,i)=>{const x=70+i*276;draw(path,x,570,2);draw(g,x,418,2);draw(g,x+32,638,1);});
mkdirSync(root+'assets-preview',{recursive:true});
writeFileSync(root+'assets-preview/c15-shop-draft.png',PNG.sync.write(png));
let changes=0;
for(let y=0;y<96;y++)for(let x=0;x<64;x++)if(result.frames[0].get(x,y)!==result.frames[1].get(x,y))changes++;
console.log(JSON.stringify({key:result.key,frameSize:[64,96],frames:2,stripSize:[128,96],changedPixels:changes,bottomFourTransparent:result.frames.every(g=>g.rows.slice(92).every(row=>row.every(c=>c==='.'))),preview:'assets-preview/c15-shop-draft.png'}));
