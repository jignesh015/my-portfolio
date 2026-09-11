// Mechanical sprite slicing and WebP optimization; does not redraw the artwork.
// Usage: NODE_PATH=<bundled packages> node scripts/prepare-hero.cjs <sheet.png>
const sharp = require('sharp');
const fs = require('node:fs/promises');
(async () => {
  const input = process.argv[2];
  if (!input) throw Error('Pass the generated transparent sprite sheet path');
  const meta = await sharp(input).metadata();
  if (!meta.hasAlpha) throw Error('Sprite sheet must have true transparency');
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const names = ['window','desk','person','ide','unity','controller'];
  await fs.mkdir('public/images/hero', {recursive:true});
  const report = [];
  for (let index=0; index<names.length; index++) {
    const x0=Math.floor((index%3)*info.width/3), x1=Math.floor((index%3+1)*info.width/3);
    // The authored top-row feet/desk legs extend below the nominal midpoint.
    const split=Math.round(info.height*0.546875);
    const y0=index<3?0:split, y1=index<3?split:info.height;
    let left=x1,top=y1,right=x0,bottom=y0;
    for(let y=y0;y<y1;y++) for(let x=x0;x<x1;x++) {
      if(data[(y*info.width+x)*4+3]>8) {left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
    }
    if(right<left) throw Error(`Empty sprite: ${names[index]}`);
    left=Math.max(x0,left-3);top=Math.max(y0,top-3);right=Math.min(x1-1,right+3);bottom=Math.min(y1-1,bottom+3);
    const crop={left,top,width:right-left+1,height:bottom-top+1};
    for(const size of [240,480]) await sharp(input).extract(crop).resize({width:size}).webp({quality:75,alphaQuality:85,effort:4}).toFile(`public/images/hero/${names[index]}-${size}.webp`);
    report.push({id:names[index],crop,width:480,height:Math.round(crop.height/crop.width*480)});
  }
  console.log(JSON.stringify({sheet:meta,assets:report},null,2));
})();
