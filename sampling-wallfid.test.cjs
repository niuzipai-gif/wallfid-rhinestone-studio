const assert=require('node:assert/strict');
const {withoutWhite}=require('./image-sampling-wallfid.js');
const core=require('./pattern-core-spark.js');
// Thin brown strokes must retain their brown hue instead of blending into white paper.
const pixels=new Uint8ClampedArray(100*100*4).fill(255);
for(let y=0;y<100;y++)for(let x=4;x<7;x++){const j=(y*100+x)*4;pixels.set([90,58,43,255],j);}
const result=withoutWhite(pixels,100,10);
for(let y=0;y<10;y++){const j=y*10*4;assert.deepEqual([...result.slice(j,j+4)],[90,58,43,255]);assert.equal(core.palette[core.nearest([...result.slice(j,j+3)])].id,'07');}
assert.equal([...result].filter((v,i)=>i%4===3&&v===255).length,10);
assert.equal(withoutWhite(new Uint8ClampedArray(400).fill(255),10,2).every(v=>v===0),true);
assert.equal(withoutWhite(new Uint8ClampedArray(400),10,2).every(v=>v===0),true);
console.log('PASS: thin-stroke colour, white background and transparent blank sampling.');
