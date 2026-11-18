import { DECORATIONS, decorReason, shopOffers } from '../data/rpg/shop';
import { app } from '../game/app';
import { playSfx } from '../fx/sfx';
import { h, lines } from './dom';
import { icon, pxImg } from './icons';
import './shop.css';

export function openShop(): void {
  const state = app.state;
  const panel = app.ui.panel(() => undefined, { title: '하루의 탐험 가게', className: 'shop-window' });
  const coins = h('p', {});
  const list = h('div', { class: 'shop-list' });
  const feedback = h('p', { class: 'shop-feedback', role: 'status' });
  let decorating = false;
  function product(name: string, sprite: string, desc: string, price: number, reason: string, buy: () => boolean, message: string) {
    const button = h('button', { class: 'btn', disabled: !!reason, 'aria-label': name + ' 사기', onclick: () => {
      if (buy()) {
        playSfx('item');
        feedback.textContent = message;
      }
      render();
      const next = Array.from(list.querySelectorAll('button')).find(b => b.ariaLabel === name + ' 사기' && !b.disabled);
      (next ?? (decorating ? decorTab : itemTab)).focus();
    } }, '사기');
    return h('article', { class: 'shop-product' }, pxImg(icon(sprite), 40),
      h('div', { class: 'shop-copy' }, h('strong', {}, name), h('p', {}, ...lines(desc)), h('span', {}, '동전 ' + price + '개'), reason ? h('p', {}, reason) : null), button);
  }
  function render() {
    coins.textContent = '가진 동전 ' + state.data.coins + '개';
    itemTab.setAttribute('aria-pressed', String(!decorating));
    decorTab.setAttribute('aria-pressed', String(decorating));
    itemTab.classList.toggle('primary', !decorating);
    decorTab.classList.toggle('primary', decorating);
    const rows = decorating
      ? DECORATIONS.map(d => product(d.name,d.icon,d.desc,d.price,decorReason(state,d),()=>state.buyDecor(d.id),'마을에 장식을 놓았어요.'))
      : shopOffers(state).map(({item,price,qty,reason}) => product(item.name,item.icon,item.desc + '\n가진 수 ' + qty + '개',price,reason,()=>state.buyItem(item.id),item.slot ? '가방에서 착용해요.' : item.name + ' 구매를 마쳤어요.'));
    list.replaceChildren(...rows);
  }
  const tab = (label: string, decor: boolean) => h('button', {class:'btn',onclick:()=>{
    decorating = decor;
    feedback.textContent = '';
    render();
  }},label);
  const itemTab = tab('탐험 용품',false), decorTab = tab('마을 꾸미기',true);
  panel.body.append(coins,h('div',{class:'row'},itemTab,decorTab),feedback,list);
  render();
  itemTab.focus();
}
