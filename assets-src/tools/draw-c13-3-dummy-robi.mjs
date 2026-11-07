import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { Grid, root, polygon, rounded, saveHires, loadGrid } from './c12-common.mjs';

// C13-3. 정화된 허수아비 봇과 로비를 단추 눈·바느질이 있는 천 인형으로 바꿔요.
function button(g,x,y,edge,thread){
 g.line(x+1,y,x+1,y+2,edge).line(x,y+1,x+2,y+1,edge);
 g.set(x+1,y+1,thread);
}
function dummy(){
 const g=new Grid(32,32);
 // 막대 팔 대신 둥근 갈색 천 팔과 작은 봉제 발이에요.
 rounded(g,4,18,7,7,'X','U');g.line(6,19,8,19,'T').line(5,21,5,22,'Z').set(8,23,'E');
 rounded(g,22,18,7,7,'U','E');g.line(24,19,26,19,'X').set(26,22,'T');
 rounded(g,8,17,17,11,'I','G');g.poly([[10,19],[15,18],[16,23],[13,26],[10,25]],'J');
 g.poly([[22,20],[23,21],[23,25],[20,27],[18,25]],'G');
 rounded(g,7,23,8,5,'X','U').line(9,24,12,24,'T').set(11,26,'E');
 rounded(g,18,23,8,5,'U','E').line(20,24,23,24,'X').set(21,26,'T');
 // 민트 얼굴과 초록 몸은 정화 프레임의 색을 이어가요.
 rounded(g,7,7,19,12,'c','G');
 g.poly([[10,8],[19,8],[23,10],[21,11],[12,10],[8,12],[8,10]],'q');
 g.poly([[23,11],[24,12],[24,16],[21,18],[17,18],[20,16]],'C');
 button(g,12,12,'G','q');button(g,18,12,'G','q');
 g.line(14,16,18,16,'G').set(13,15,'G').set(19,15,'G');
 // 얼굴 옆 두 짧은 바느질 선과 앞섶 단추만 두어 점 잡티를 줄여요.
 g.line(8,14,9,14,'I').line(9,16,10,16,'I').set(21,21,'Y');
 g.line(10,19,22,19,'C').line(11,18,20,18,'q');
 polygon(g,[[12,19],[15,19],[16,23],[13,24]],'C','G');g.line(13,20,14,22,'q');
 // 기존 갈색 모자·금빛 띠도 부드러운 천 재질로 다시 그려요.
 rounded(g,9,2,15,6,'X','U');g.line(11,3,20,3,'Z').line(10,4,13,4,'T');
 g.line(20,4,21,4,'U').set(20,5,'T');
 polygon(g,[[7,7],[24,7],[27,9],[26,10],[5,10],[5,9]],'Y','+');
 g.line(8,8,23,8,'y').line(7,9,11,9,'W').line(21,9,25,9,'T');
 return g;
}
function robi(){
 const g=new Grid(32,32);
 // 딱딱한 금속 광택 대신 넓은 회청색 천 면과 짧은 박음질을 써요.
 rounded(g,4,18,7,7,'i','d').line(6,19,8,19,'j').line(5,21,5,22,'a');
 rounded(g,22,18,7,7,'f','d').line(24,19,26,19,'i').set(26,22,'a');
 rounded(g,8,17,17,11,'i','d');g.poly([[10,19],[15,18],[15,24],[12,26],[10,24]],'j');
 g.poly([[22,20],[23,21],[23,25],[20,27],[18,25]],'f');
 rounded(g,7,23,8,5,'i','d').line(9,24,12,24,'j').set(11,26,'f');
 rounded(g,18,23,8,5,'f','d').line(20,24,23,24,'i').set(21,26,'a');
 g.line(13,22,18,22,'B').line(13,21,17,21,'b').set(13,21,'q');
 g.line(10,22,10,23,'f').set(22,23,'d');
 // 위쪽 짧은 안테나는 둥근 천 끝으로 마무리해요.
 g.line(15,4,15,7,'f').line(16,4,16,7,'i');rounded(g,14,1,4,4,'Y','+').set(15,2,'y');
 rounded(g,5,6,22,13,'i','d');
 g.poly([[8,7],[20,7],[23,9],[18,10],[10,9],[6,11],[6,9]],'j');
 g.poly([[24,9],[25,10],[25,16],[22,18],[20,17],[23,15]],'f');
 rounded(g,8,10,16,8,'N','d');g.line(10,11,21,11,'m').line(10,17,21,17,'m');
 // 얼굴 화면 속 두 민트 단추와 실로 놓은 웃는 입이에요.
 button(g,12,12,'c','G');button(g,18,12,'c','G');
 g.line(14,16,17,16,'o').set(13,15,'c').set(18,15,'c');
 g.line(7,12,7,13,'f').line(7,15,7,16,'f').line(10,8,11,8,'i').line(14,8,15,8,'i');
 return g;
}
const dolls=[saveHires('prop-doll-dummy',[dummy()]),saveHires('prop-doll-robi',[robi()])];
// 위: 참고 원본/새 인형, 가운데: 32px·48px·방석, 아래: 닫힌 집게와 CSS 위치 합성이에요.
const palette=JSON.parse(readFileSync(root+'assets-src/palette.json','utf8')).colors;
const width=768,height=704,out=new PNG({width,height});
for(let y=0;y<height;y++)for(let x=0;x<width;x++)out.data.set([...(y<208?[38,44,59]:y<400?[255,244,210]:[215,205,236]),255],(y*width+x)*4);
function raw(g){const png=new PNG({width:g.w,height:g.h});for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){const c=g.get(x,y);if(c==='.')continue;const rgb=[1,3,5].map(i=>parseInt(palette[c].slice(i,i+2),16));png.data.set([...rgb,255],(y*g.w+x)*4);}return png;}
function blit(source,ox,oy,w,h=w){for(let y=0;y<h;y++)for(let x=0;x<w;x++){const sx=Math.min(source.width-1,Math.floor(x*source.width/w)),sy=Math.min(source.height-1,Math.floor(y*source.height/h));const a=(sy*source.width+sx)*4;if(!source.data[a+3])continue;out.data.set(source.data.subarray(a,a+4),((oy+y)*width+ox+x)*4);}}
const originals=[raw(loadGrid('mob-dummy')[3]),raw(loadGrid('char-robi')[0])],cushion=raw(loadGrid('prop-cushion')[0]),claw=raw(loadGrid('prop-claw')[1]);
function held(png,x,y,w){const dw=Math.round(w*.84);blit(png,x+Math.round((w-dw)/2),y+Math.round(w*.5),dw);blit(claw,x,y,w);}
for(const[i,{frames}]of dolls.entries()){
 const x=i*384,png=raw(frames[0]);blit(originals[i],x+24,24,i?96:128,i?144:128);blit(png,x+208,24,128);
 blit(png,x+24,244,32);blit(png,x+80,236,48);blit(cushion,x+200,224,128);blit(png,x+200,224,128);
 held(png,x+40,438,128);held(png,x+208,438,48);held(png,x+284,438,60);
}
mkdirSync(root+'assets-preview',{recursive:true});writeFileSync(root+'assets-preview/c13-3-dummy-robi.png',PNG.sync.write(out));
console.log('C13-3 허수아비 봇·로비 인형 32×32×1 2키, 원본/방석/집게/32·48px 검토판 완료');
