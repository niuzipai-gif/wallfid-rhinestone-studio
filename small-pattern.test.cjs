const assert=require('node:assert/strict'),core=require('./pattern-core-spark.js'),s=require('./image-sampling-wallfid.js');
const w=120,h=120,a=new Uint8ClampedArray(w*h*4);
// Continuous transparent fine outline crossing four actual 3 mm cells.
for(let y=0;y<h;y++)for(let x=14;x<17;x++)a.set([25,25,25,255],(y*w+x)*4);
const spec=core.customSpec(12,12),old=s.sample(a,w,h,spec,{outlines:true}),smart=s.sample(a,w,h,spec,{outlines:true,smart:true});
assert.equal(core.quantize(old,spec).total,0);assert.equal(core.quantize(smart,spec).total,4,'low-coverage connected thin strokes should survive once per crossed cell');
// White/green/red pixels must not average into a colour absent from the motif.
const block=new Uint8ClampedArray(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++)block.set(x%30<19?[29,157,68,255]:[240,238,234,255],(y*w+x)*4);
const p=core.quantize(s.sample(block,w,h,spec,{smart:true,outlines:true}),spec);assert(p.cells.every(i=>i===9),'a clear majority green must map to that fixed palette compartment');
// A single stray transparent pixel must not consume a drill.
const speck=new Uint8ClampedArray(w*h*4);speck.set([25,25,25,255],(19*w+14)*4);assert.equal(core.quantize(s.sample(speck,w,h,spec,{smart:true}),spec).total,0);
// Fixed palette identity and bounds are independent of image or size.
for(let i=0;i<40;i++){const e=core.palette[i];assert.equal(Number(e.id),i+1);assert.equal(e.row,Math.floor(i/8)+1);assert.equal(e.column,i%8+1);assert.equal(core.nearest(e.rgb),i);}
for(const size of [50,80,100]){const p=core.quantize(s.sample(block,w,h,core.gridSpec(size),{smart:true,outlines:true}),core.gridSpec(size));assert.equal(p.cells.filter(i=>i>=0).length,p.counts.reduce((a,b)=>a+b,0));assert(p.cells.every(i=>i>=-1&&i<40));}
const filled={...core.customSpec(30,30),cells:Array(100).fill(-1),counts:Array(40).fill(0)};for(let y=1;y<9;y++)for(let x=1;x<9;x++){filled.cells[y*10+x]=9;filled.counts[9]++;}filled.total=64;filled.used=1;
const edge=core.outline(filled);assert.equal(edge.total,28);assert.equal(edge.style,'outline');assert.equal(edge.counts[9],28);assert.deepEqual(filled.counts,[0,0,0,0,0,0,0,0,0,64,...Array(30).fill(0)],'outline must not mutate the full-colour baseline');assert(edge.cells.every((v,i)=>v<0||v===filled.cells[i]),'outline must keep original fixed palette IDs and positions');
console.log('PASS: connected fine lines, dominant fixed colours, isolated speck rejection and all 40 compartment identities.');
