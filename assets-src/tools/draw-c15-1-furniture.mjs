// C15-1: 전구판 기계와 나무 전등 진열대. 몸체는 고정하고 전구만 교대로 켜요.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, polygon, rounded, root, saveHires, loadGrid } from './c12-common.mjs';
import { label } from '../../scripts/build-assets.mjs';

function bulb(g,x,y,on,r=3){
 // 소켓을 포함한 실루엣은 같고, 켜질 때만 밝은 유리·테두리·반짝임이 생겨요.
 g.ellipse(x,y,r,r,on?'Y':'/');
 g.ellipse(x,y-1,r-1,r-1,on?'y':'S');
 g.line(x-1,y-2,x,y-2,on?'?':'i').set(x-1,y-1,on?'W':'f');
 g.rect(x-1,y+r-1,3,2,'d').line(x-1,y+r-1,x+1,y+r-1,'i');
 g.line(x-1,y+r+1,x+1,y+r+1,'S');
}
function lightboard(f){
 const g=new Grid(64,96);
 // 아이소 받침의 앞 꼭짓점이 발 기준 y92에 닿아요. 바닥 그림자는 없어요.
 polygon(g,[[10,82],[32,73],[54,82],[32,91]],'V','D');
 polygon(g,[[10,82],[32,91],[32,92],[10,85]],'V','D');
 polygon(g,[[32,91],[54,82],[54,85],[32,92]],'N','O');
 g.poly([[13,82],[32,75],[50,82],[32,89]],'v').line(14,82,31,76,'j');
 g.line(13,84,29,90,'V').line(35,90,51,84,'/');
 // 넓고 낮은 기둥, 관절과 전원선 덮개는 판보다 어둡게 남겨요.
 polygon(g,[[25,66],[37,66],[39,82],[32,86],[24,82]],'S','O');
 g.poly([[26,68],[29,68],[29,81],[32,83],[26,81]],'i');
 g.line(35,69,36,81,'d').line(29,78,33,79,'A');
 // 판의 윗면과 오른쪽 두께. 세운 판은 격자가 읽히도록 정면에 가깝게 보여요.
 polygon(g,[[6,19],[12,15],[56,15],[50,19]],'v','D');
 polygon(g,[[50,19],[56,15],[56,69],[50,74]],'N','O');
 g.line(54,20,54,67,'V').line(51,72,54,69,'/');
 rounded(g,6,18,45,58,'V','D');
 g.line(9,19,47,19,'v').line(7,22,7,71,'v');
 rounded(g,9,21,39,51,'N','O');
 g.rect(11,23,35,47,'m').line(11,23,45,23,'/');
 // 5×4 전구 격자. 각 숫자 판도 켜짐과 일치하게 0/1로 바뀌어요.
 for(let row=0;row<4;row++)for(let col=0;col<5;col++){
  const x=13+8*col,y=26+12*row,on=(row+col+f)%2===0;
  g.ellipse(x,y,3,3,on?'+':'O');
  g.ellipse(x,y,2,2,on?'y':'S').set(x-1,y-1,on?'?':'f').set(x,y,on?'W':'A');
  // 유리 오른쪽 가장자리는 따뜻한 테두리, 꺼진 전구는 남색 테두리예요.
  g.set(x+2,y,on?'Y':'/').set(x,y+2,on?'Y':'d');
  g.rect(x-2,y+4,5,5,'O').rect(x-1,y+5,3,3,'d');
  if(on)g.line(x,y+5,x,y+7,'j').line(x-1,y+7,x+1,y+7,'i').set(x-1,y+6,'i');
  else g.rect(x-1,y+5,3,3,'f').set(x,y+6,'d');
 }
 // 모서리 고정 핀과 아래쪽 넓은 받침 테두리(동전 구멍·가격표 없음).
 for(const[x,y]of[[8,21],[48,21],[8,72],[48,72]])g.set(x,y,'v');
 g.line(11,74,45,74,'v').line(14,75,43,75,'N');
 // 판 위에 걸린 보라 로봇 붓: 두 눈, 금속 붓테, 아래로 향하는 밝은 붓끝.
 g.line(19,14,42,14,'S').line(20,13,41,13,'i');
 rounded(g,22,3,18,10,'V','D');
 g.line(25,4,36,4,'v').line(23,6,23,10,'v').line(38,6,38,10,'N');
 rounded(g,25,6,12,6,'N','D');
 g.rect(27,8,2,2,'q').rect(33,8,2,2,'q').set(27,8,'?').set(33,8,'?');
 g.rect(29,13,5,3,'A').line(29,13,33,13,'j').line(29,15,33,15,'S');
 polygon(g,[[28,16],[34,16],[33,18],[31,21],[29,18]],'Y','+');
 g.line(30,17,31,19,'W').set(31,20,'?');
 return g;
}
function deskLamp(g,x,y,on,small=false){
 // y는 바닥 받침 중심. 위쪽의 천 갓이 가장 밝고 아래 받침은 고정이에요.
 const top=y-(small?15:19),half=small?6:7;
 g.ellipse(x,y,5,2,'E').ellipse(x,y-1,4,1,'+').line(x-2,y-2,x+1,y-2,'Y');
 g.rect(x-1,top+8,3,y-top-9,'U').line(x,top+8,x,y-3,'Y');
 polygon(g,[[x-3,top],[x+3,top],[x+half,top+8],[x-half,top+8]],on?'&':'f','U');
 g.poly([[x-2,top+1],[x,top+1],[x-2,top+7],[x-half+2,top+7]],on?'?':'i');
 g.poly([[x+2,top+1],[x+3,top+2],[x+half-1,top+7],[x+3,top+7]],on?'*':'S');
 g.line(x-half+1,top+8,x+half-1,top+8,on?'y':'A');
 g.set(x,top-1,'+');
}
function lantern(g,x,y,on,small=false){
 const half=small?4:5,top=y-(small?15:19);
 g.ellipse(x,top+2,3,3,'E').ellipse(x,top+2,2,2,'E');
 g.line(x-2,top,x,top-1,'X');
 polygon(g,[[x-half,top+5],[x,top+2],[x+half,top+5],[x+half-1,top+6],[x-half+1,top+6]],'+','E');
 g.line(x-half+1,top+5,x+half-1,top+5,'Y');
 g.rect(x-half+1,top+6,half*2-1,y-top-7,'U');
 g.rect(x-half+2,top+7,half*2-3,y-top-9,on?'y':'/');
 g.line(x-1,top+8,x-1,y-4,on?'W':'A');
 g.line(x+half-2,top+7,x+half-2,y-3,on?'Y':'S');
 g.line(x-half+1,top+6,x-half+1,y-2,'+').line(x+half-1,top+6,x+half-1,y-2,'E');
 g.ellipse(x,y-1,half,2,'E').line(x-half+1,y-2,x+half-1,y-2,'Y');
}
function bareBulb(g,x,y,on,small=false){
 bulb(g,x,y-(small?8:10),on,small?4:5);
 g.rect(x-2,y-4,5,3,'d').line(x-2,y-4,x+1,y-4,'i');
 g.ellipse(x,y,5,2,'U').ellipse(x,y-1,4,1,'X').line(x-2,y-2,x+1,y-2,'t');
}
function lampShelf(f){
 const g=new Grid(64,64);
 // 나무의 앞면은 밝게, 오른쪽 두께와 선반 안쪽은 차갑고 어둡게요.
 polygon(g,[[6,13],[13,9],[59,9],[52,13]],'t','U');
 polygon(g,[[52,13],[59,9],[59,51],[52,56]],'e','E');
 g.poly([[54,16],[57,14],[57,49],[54,52]],'U').line(58,14,58,48,'X');
 polygon(g,[[6,13],[52,13],[52,56],[6,56]],'T','U');
 g.rect(10,16,38,36,'Q').rect(11,17,36,34,'E');
 g.rect(10,16,38,2,'U').line(7,16,7,52,'t').line(50,15,50,53,'X');
 // 높이가 같은 선반 두 단. 앞쪽 띠가 전등 받침보다 앞에 와요.
 for(const y of[32,53]){
  polygon(g,[[9,y],[48,y],[52,y+3],[6,y+3]],'t','U');
  g.line(9,y+1,48,y+1,'Z').line(8,y+3,49,y+3,'X');
 }
 // 윗단은 스탠드·작은 등불·둥근 전구로 서로 다른 모양이에요.
 deskLamp(g,17,30,f===0,true);
 lantern(g,31,30,f===1,true);
 bareBulb(g,43,30,f===0);
 // 아랫단은 작은 등불·전구·스탠드. 위아래가 번갈아 빛나요.
 lantern(g,16,51,f===1,true);
 bareBulb(g,30,51,f===0,true);
 deskLamp(g,43,51,f===1,true);
 g.line(10,33,48,33,'Z').line(8,54,50,54,'T');
 // 다리와 앞 기단은 y60까지만. 넓은 진열대라 별도 그림자는 넣지 않아요.
 polygon(g,[[7,55],[13,55],[13,60],[8,60]],'T','U');g.line(8,56,8,59,'t');
 polygon(g,[[44,55],[51,55],[50,60],[44,60]],'X','E');g.line(45,56,45,59,'T');
 g.line(15,55,41,55,'U').line(19,56,28,56,'X');
 return g;
}
const art=[saveHires('prop-lightboard',[lightboard(0),lightboard(1)]),saveHires('prop-lamp-shelf',[lampShelf(0),lampShelf(1)])];
const palette=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const color=s=>[1,3,5].map(i=>parseInt(palette[s].slice(i,i+2),16));
const gray=rgb=>{const l=Math.round(rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722);return[l,l,l];};
const sheet=new PNG({width:1260,height:800});
for(let y=0;y<800;y++)for(let x=0;x<1260;x++)sheet.data.set([...(x<420?[38,44,59]:x<840?[255,244,210]:[71,71,71]),255],(y*1260+x)*4);
function paste(g,ox,oy,scale,monochrome=false){for(let y=0;y<g.h*scale;y++)for(let x=0;x<g.w*scale;x++){const s=g.get(Math.floor(x/scale),Math.floor(y/scale));if(s==='.')continue;const rgb=color(s);sheet.data.set([...(monochrome?gray(rgb):rgb),255],((oy+y)*1260+ox+x)*4);}}
const floor=loadGrid('tile-room')[0];
for(let panel=0;panel<3;panel++){
 const ox=panel*420,mono=panel===2,ink=panel===1?[41,48,68]:[255,244,210];
 label(sheet,['DARK F0 / F1','LIGHT F0 / F1','GRAY F0 / F1'][panel],ox+16,4,ink,1);
 art[0].frames.forEach((g,f)=>paste(g,ox+16+204*f,24,3,mono));
 art[1].frames.forEach((g,f)=>paste(g,ox+16+204*f,352,3,mono));
 label(sheet,'NATIVE SIZE / FLOOR ANCHORS',ox+16,624,ink,1);
 [...art[0].frames,...art[1].frames].forEach((g,i)=>{const x=ox+28+96*i;paste(floor,x,730,1,mono);paste(g,x,746-(g.h-4),1,mono);});
}
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c15-furniture-draft.png',PNG.sync.write(sheet));
console.log('C15-1 전구판 64x96x2 / 전등 진열대 64x64x2 원본 및 양 배경·회색조·접지 검토판 작성');
