const assert=require('node:assert/strict'),{framing,photo}=require('./image-sampling-wallfid.js'),{quantize,gridSpec}=require('./pattern-core-spark.js');
for(const [w,h] of [[1280,2276],[2276,1280],[1200,1200]]){
 const fit=framing(w,h,620),fill=framing(w,h,620,'cover');
 assert(Math.abs(fit.width/fit.height-w/h)<1e-10,'fit preserves aspect ratio');
 assert(fit.x>=-1e-8&&fit.y>=-1e-8&&fit.x+fit.width<=620.0001&&fit.y+fit.height<=620.0001,'entire source fits');
 assert(fill.width>=619.999&&fill.height>=619.999,'cover fills board');
 assert(Math.abs(fill.width/fill.height-w/h)<1e-10,'cover does not stretch');
 const zoom=framing(w,h,620,'contain',2,0,100);assert(Math.abs(zoom.x)<1e-10);assert.equal(zoom.y,620-zoom.height);
}
function raster(w,fn){const out=new Uint8ClampedArray(w*w*4);for(let y=0;y<w;y++)for(let x=0;x<w;x++)out.set(fn(x,y),(y*w+x)*4);return out;}
const portrait=raster(60,(x,y)=>x>=15&&x<45?[30,80,150,255]:[255,255,255,0]);
const sampled=photo(portrait,60,6);assert.equal(Array.from(sampled).filter((v,i)=>i%4===3&&v===255).length,24,'transparent sides are not white stones; half-covered edge cells retained');
assert.throws(()=>quantize(sampled,gridSpec(50)),/Sample data/);
const black=raster(20,()=>[0,0,0,255]);assert.deepEqual(photo(black,20,1,true),new Uint8ClampedArray([0,0,0,255]),'pure black stays black');
const bright=raster(20,()=>[160,190,230,255]);assert.deepEqual(photo(bright,20,1,true),photo(bright,20,1,false),'bright illustrations remain unchanged');
const lights=raster(20,(x,y)=>x<4&&y<4?[25,60,230,255]:[4,6,20,255]);
const ordinary=photo(lights,20,1,false),enhanced=photo(lights,20,1,true);
assert(enhanced[2]>ordinary[2]*2,'small blue lights survive dark-area averaging');
assert(enhanced[2]>enhanced[1]&&enhanced[1]>enhanced[0],'blue light hue is preserved');
const clean=raster(62,(x,y)=>x>=14&&x<48?[35,45,100,255]:[255,0,0,0]);
for(const size of [50,80,100]){const spec=gridSpec(size),p=quantize(photo(clean,62,spec.n,true),spec);assert(p.total>0&&p.total<spec.n**2);assert.equal(p.counts.reduce((a,b)=>a+b,0),p.total);assert(p.cells.every(v=>v===-1||(v>=0&&v<40)));assert.equal(p.n,{50:14,80:24,100:31}[size]);}
console.log('PASS: portrait/landscape framing, transparent padding, dark-light sampling, fixed physical grids and 40-compartment counts.');
