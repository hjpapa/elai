async page => {
  await page.waitForFunction(() => window.__app?.game?.scene.isActive('Gallery'));
  return await page.evaluate(async () => {
    const {ASSETS}=await import('/src/game/assets.ts');
    const {drawRoomWall,drawRoomTile,drawRoomProp,drawRoomIcon}=await import('/src/game/textures/roomPlaceholders.ts');
    const result=[];
    const keys=["prop-parcel-office", "prop-sorter", "prop-parcel-stack", "prop-parcel-pile", "prop-sort-basket", "icon-sort-heart", "icon-sort-star", "icon-sort-ball", "icon-card-sendLeft", "icon-card-sendRight", "icon-stamp"];
    for(const spec of ASSETS.filter(a=>keys.includes(a.key))) {
      const c=document.createElement('canvas');c.width=spec.w*spec.frames;c.height=spec.h;
      const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;
      const draw={block:drawRoomWall,tile:drawRoomTile,prop:drawRoomProp,icon:drawRoomIcon}[spec.kind];
      if(!draw)continue;let valid=false;
      for(let f=0;f<spec.frames;f++){ctx.save();ctx.translate(f*spec.w,0);valid=draw(ctx,spec,f);ctx.restore();}
      if(valid)result.push({key:spec.key,png:c.toDataURL('image/png').split(',')[1]});
    }
    return result;
  });
}
