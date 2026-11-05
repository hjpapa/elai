import type { PromptData } from '../../data/schema';
import type { PromptChoice } from './evaluate';
/** 선택된 텍스트 격자를 순서대로 합성해요. 투명한 칸은 아래 그림을 남겨요. */
export function composePromptImage(data: PromptData, choice: PromptChoice): (string | null)[][] | null {
 const image=data.image;if(!image||!Number.isInteger(image.width)||!Number.isInteger(image.height)||image.width<1||image.height<1||image.width>64||image.height>64)return null;
 const pixels=Array.from({length:image.height},()=>Array<string|null>(image.width).fill(null));
 for(const layer of image.layers){
  if(choice[layer.slot]!==layer.option)continue;
  if(layer.rows.length!==image.height||layer.rows.some(row=>row.length!==image.width))return null;
  for(let y=0;y<image.height;y++)for(let x=0;x<image.width;x++){
   const value=layer.rows[y][x];if(value==='.')continue;const color=image.palette[value];
   if(!color||!/^#[0-9a-f]{6}$/i.test(color))return null;pixels[y][x]=color;
  }
 }
 return pixels;
}
