const assert=require('node:assert/strict'),core=require('./pattern-core-spark.js'),sampler=require('./image-sampling-wallfid.js');
// A continuous sage-green dividing stroke over light green, crossing four cells.
// Its luminance is well above the old hard-coded black-ink threshold.
const w=120,rgba=new Uint8ClampedArray(w*w*4);
for(let y=0;y<w;y++)for(let x=0;x<w;x++)rgba.set(x>=13&&x<18?[150,164,96,255]:[221,234,163,255],(y*w+x)*4);
const spec=core.customSpec(12,12),sample=sampler.sample(rgba,w,w,spec,{smart:true,outlines:true});
for(let y=0;y<4;y++){
 const at=(y*4)*4;assert(sample[at]<180&&sample[at+1]<190,'continuous coloured outline must survive averaging');
 assert(sample[(y*4+2)*4]>200,'preserve pale interior instead of darkening every cell');
}
assert.equal(core.nearest([221,234,163],false,true)+1,27,'pale yellow-green artwork must stay yellow-green, not become pale yellow');
assert.equal(core.nearest([154,168,103])+1,15,'darker sage outline must remain darker than the pale green fill');
assert.equal(core.nearest([244,137,98])+1,3,'coral illustration must stay coral');
for(let i=0;i<40;i++)assert.equal(core.nearest(core.palette[i].rgb),i,'exact physical palette colour remains its own ID');
// A black outline can be darker than every measured physical stone.
assert.equal(core.nearest([0,0,0],true,true)+1,9,'unavailable absolute black must use the darkest kit colour');
// Published mathematical reference cases: hue wrap, neutral colours and near black.
for(const [a,b,expected] of [
 [[50,2.6772,-79.7751],[50,0,-82.7485],2.0425],
 [[50,0,0],[50,-1,2],2.3669],
 [[50,2.49,-.001],[50,-2.49,.001],7.1792],
 [[50,-.001,2.49],[50,.0011,-2.49],4.7461],
 [[2.0776,.0795,-1.135],[.9033,-.0636,-.5514],.9082]
])assert(Math.abs(core.deltaE00(a,b)-expected)<.0001,'CIEDE2000 reference pair');
for(const size of [50,80,100])for(const [w,h] of [[500,500],[300,800],[800,300]]){
 const spec=core.gridSpec(size),f=sampler.boardFraming(w,h,620,620,spec);
 const inset=spec.offsetX/spec.width*620,far=620-inset;
 assert(f.x>=inset-.001&&f.y>=inset-.001&&f.x+f.width<=far+.001&&f.y+f.height<=far+.001,'whole image fits inside usable drill area');
 assert(Math.abs(f.width/f.height-w/h)<.0001,'fitting never stretches the original');
}
// Closed white details (for example the bird belly) remain white after sampling.
const bird=new Uint8ClampedArray(w*w*4);
for(let y=0;y<w;y++)for(let x=0;x<w;x++)bird.set(x<30?[20,20,20,255]:x<60?[150,80,40,255]:[250,250,250,255],(y*w+x)*4);
const sampled=sampler.sample(bird,w,w,spec,{smart:true,outlines:true});
assert(sampled[12]>238&&sampled[13]>238&&sampled[14]>238,'enclosed opaque white is not replaced by a source fill colour');
console.log('PASS: continuous coloured strokes, unaffected interiors, pale-green/coral colour families and fixed IDs.');
