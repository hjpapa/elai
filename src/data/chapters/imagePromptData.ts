import type { PromptData } from '../schema';
const blank = '................';
const rows = (values: string[]): string[] => values.map(row => row.padEnd(16, '.'));
export const imagePromptData: PromptData = {
 client:'공방 그림 모임',request:'밤의 바닷가에 고양이를 그려요.\n또렷한 픽셀 그림으로 부탁해요.',
 initialChoice:{role:'cat',task:'beach',how:'day',format:'pixel'},
 fallback:{opening:'그림 주문서를 살펴봐요.',body:['주인공·배경·시간·스타일을 골라요.']},
 slots:[
  {id:'role',label:'주인공',question:'누가 나올까요?',missing:'그림의 주인공을 골라요.',options:[{id:'cat',text:'고양이',quality:'good'},{id:'robot',text:'작은 로봇',quality:'bad',feedback:'이번 의뢰의 주인공은 고양이예요.'}]},
  {id:'task',label:'배경',question:'어디에 있을까요?',missing:'그림의 장소를 골라요.',options:[{id:'beach',text:'바닷가',quality:'good',body:['밤바다에서 쉬는 고양이예요.']},{id:'forest',text:'숲속',quality:'bad',feedback:'의뢰한 장소는 바닷가예요.'}]},
  {id:'how',label:'시간',question:'언제의 모습일까요?',missing:'그림의 시간을 골라요.',options:[{id:'night',text:'배경을 밤으로 바꿔 줘요',quality:'good'},{id:'day',text:'밝은 낮',quality:'bad',feedback:'처음 그림은 낮이에요.\n밤으로 고쳐서 부탁해 봐요.'}]},
  {id:'format',label:'스타일',question:'어떤 느낌일까요?',missing:'그림의 표현 방법을 골라요.',options:[{id:'pixel',text:'또렷한 픽셀 그림',quality:'good'},{id:'pink',text:'분홍 테두리 그림',quality:'bad',feedback:'의뢰한 또렷한 픽셀 표현을 골라요.'}]},
 ],
 image:{width:16,height:16,palette:{N:'#344d78',B:'#478bc7',b:'#82cce0',C:'#49b5b1',G:'#285c4b',g:'#4c8f4c',T:'#d39a62',E:'#684b3f',O:'#293044',r:'#ed7463',W:'#fff4d2',Y:'#e7b64f',y:'#ffe59a',P:'#cf719d',a:'#c7d6dc'},layers:[
  {slot:'task',option:'beach',rows:[...Array<string>(8).fill('bbbbbbbbbbbbbbbb'),'BBBBBBBBBBBBBBBB','CCBBCCBBCCBBCCBB','BBBBBBBBBBBBBBBB','CCBBCCBBCCBBCCBB',...Array<string>(4).fill('TTTTTTTTTTTTTTTT')]},
  {slot:'task',option:'forest',rows:[...Array<string>(8).fill('bbbbbbbbbbbbbbbb'),...Array<string>(4).fill('GGGGGGGGGGGGGGGG'),...Array<string>(4).fill('gggggggggggggggg')]},
  {slot:'how',option:'night',rows:rows(['NNNNNNNNNNNNNNNN','NNyNNNNNNNNNNNNN','NNNNNNNNNNNNWWNN','NNNNNNNyNNNWWWNN','NNNNNNNNNNNNWNNN','NNNNNNNNNNNNNNNN','NNNNyNNNNNNNNNNN','NNNNNNNNNNNNNNNN',...Array<string>(8).fill(blank)])},
  {slot:'how',option:'day',rows:rows(['bbbbbbbbbbbbbbbb','bbbbbbbbbbbbbbbb','bbbbbbbbbbbbYYbb','bbbbbbbbbbbYYYYb','bbbbbbbbbbbbYYbb',...Array<string>(3).fill('bbbbbbbbbbbbbbbb'),...Array<string>(8).fill(blank)])},
  {slot:'role',option:'cat',rows:rows([...Array<string>(7).fill(blank),'....E...E','....aE.Ea','....aaaaa','....aOaOa','.....ara','.....aaa..a','....aaaaaa','....aa.aa',blank])},
  {slot:'role',option:'robot',rows:rows([...Array<string>(7).fill(blank),'.....YYY','....OOOOO','....OaOaO','....OOOOO','.....BBB','....BBBBB','.....B.B','.....O.O',blank])},
  {slot:'format',option:'pixel',rows:['W..............W',...Array<string>(14).fill(blank),'W..............W']},
  {slot:'format',option:'pink',rows:['PPPPPPPPPPPPPPPP',...Array<string>(14).fill('P..............P'),'PPPPPPPPPPPPPPPP']},
 ]},
 explain:'조건을 고치면 그림도 달라져요.\n고쳐 묻기는 좋은 활용 방법이에요.',
};
