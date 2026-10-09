const assert=require('node:assert/strict');
const core=require('./pattern-core-spark.js'),sampler=require('./image-sampling-wallfid.js');
for(const size of [50,80,100]){
  const spec=core.gridSpec(size),rgba=new Uint8ClampedArray(spec.cols*spec.rows*4);rgba.fill(255);
  const p=core.quantize(rgba,spec);assert.equal(p.total,spec.cols*spec.rows,'square-corner boards must retain every corner cell');
  assert.equal(spec.diameter,3);assert.equal(spec.custom,false);
  for(let row=0;row<spec.rows;row++)for(let col=0;col<spec.cols;col++){
    const x=spec.offsetX+(col+.5)*spec.pitch,y=spec.offsetY+(row+.5)*spec.pitch;
    assert(x-1.5>=3&&y-1.5>=3&&x+1.5<=size-3&&y+1.5<=size-3);
  }
}
for(const [width,height,pitch] of [[240,180,3],[600,12,3],[12,600,3],[187,213,3.2],[600,600,5]]){
  const spec=core.customSpec(width,height,pitch),rgba=new Uint8ClampedArray(spec.cols*spec.rows*4);rgba.fill(255);
  const p=core.quantize(rgba,spec);assert.equal(p.total,spec.cols*spec.rows);assert(p.total<=40000);assert.equal(p.counts.reduce((a,b)=>a+b),p.total);
  for(let row=0;row<spec.rows;row++)for(let col=0;col<spec.cols;col++)assert(core.inside(spec,spec.offsetX+(col+.5)*pitch,spec.offsetY+(row+.5)*pitch));
  const seen=new Set();for(const t of core.printTiles(spec)){
    assert(t.cols*pitch<=180&&t.rows*pitch<=210);
    for(let y=t.row;y<t.row+t.rows;y++)for(let x=t.col;x<t.col+t.cols;x++){const k=y*spec.cols+x;assert(!seen.has(k),'print tiles must not duplicate cells');seen.add(k);}
  }assert.equal(seen.size,p.cells.length,'print tiles must cover all cells exactly once');
}
for(const value of [NaN,0,11,601,Infinity])assert.throws(()=>core.customSpec(value,80));assert.throws(()=>core.customSpec(80,80,2.9));
for(const shape of ['ellipse','heart']){
  const spec=core.customSpec(120,90,3,shape),rgba=new Uint8ClampedArray(spec.cols*spec.rows*4);rgba.fill(255);const p=core.quantize(rgba,spec);
  assert(p.total>0&&p.total<spec.cols*spec.rows);assert.equal(p.cells[0],-1);assert(p.cells[Math.floor(spec.rows/2)*spec.cols+Math.floor(spec.cols/2)]>=0);
}
// A white interior enclosed by the subject is retained, while the outer white is removed.
const w=36,h=24,a=new Uint8ClampedArray(w*h*4);a.fill(255);
for(let y=4;y<20;y++)for(let x=5;x<31;x++)if(x<8||x>=28||y<7||y>=17)a.set([30,120,50,255],(y*w+x)*4);
const subject=sampler.subject(a,w,h,true,true);assert.equal(subject.rgba[3],0);assert.equal(subject.rgba[(12*w+18)*4+3],255);assert(subject.width<w&&subject.height<h);
// Existing transparency survives even with removal disabled.
a[3]=0;assert.equal(sampler.subject(a,w,h,false,false).rgba[3],0);
// Rectangular framing must keep original proportions and empty borders.
const frame=sampler.framing(400,200,600,'contain',1,50,50,300);assert.equal(frame.width/frame.height,2);assert.equal(frame.width,600);assert.equal(frame.height,300);
// Dark fine printed strokes over white remain dark; white-only cells remain white.
const ink=new Uint8ClampedArray(60*30*4);ink.fill(255);for(let y=0;y<30;y++)for(let x=13;x<17;x++)ink.set([25,25,25,255],(y*60+x)*4);
const spec=core.customSpec(12,12);const plain=sampler.sample(ink,60,30,spec,{outlines:false}),detail=sampler.sample(ink,60,30,spec,{outlines:true});
assert(detail[0]<plain[0]);assert(detail[8]>245);assert.equal(core.quantize(detail,spec).counts.reduce((a,b)=>a+b),spec.cols*spec.rows);
console.log('PASS: physical 3 mm bounds, square corners, rectangular extremes, silhouette whites, fine strokes, masks and complete non-overlapping print tiles.');
