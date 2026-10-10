/* Photo-derived estimates. Numbering approved; physical colours and stock not calibrated. */
(function(root){
  'use strict';
  const swatches=[["Clear iridescent", "#91a7a0"], ["Deep green", "#2c774b"], ["Iridescent blue", "#3339aa"], ["Iridescent purple", "#7139af"], ["Red", "#94262c"], ["Coral orange", "#ef7351"], ["Black & gold", "#462e25"], ["Black & silver", "#4e4747"], ["Silver grey", "#999ca2"], ["Emerald green", "#1d9d44"], ["Light blue", "#699bdb"], ["Lilac", "#a461c3"], ["Orange red", "#e0553f"], ["Orange yellow", "#f3a13c"], ["Copper brown", "#995748"], ["Black", "#19171a"], ["Milky white", "#f0eeea"], ["Grass green", "#4eb052"], ["Turquoise", "#22b3db"], ["Hot pink", "#ef6ba9"], ["Coral pink", "#f39db7"], ["Golden yellow", "#f5c853"], ["Antique gold", "#9b7347"], ["Blue-green on black", "#1c2a3e"], ["Iridescent white", "#dddce7"], ["Bright green", "#52f054"], ["Aqua", "#4ee6ed"], ["Rose pink", "#e777a3"], ["Light pink", "#f5b6d7"], ["Lime yellow", "#dcfa5e"], ["Copper gold", "#b7785b"], ["Blue-purple on black", "#222747"], ["Pale pink silver", "#e0d3dc"], ["Iridescent teal", "#1e9667"], ["Sky blue", "#5be1f1"], ["Pink", "#f29db5"], ["Peach pink", "#f3b8be"], ["Yellow", "#f7ed27"], ["Pale yellow", "#f8e29f"], ["Green-teal on black", "#2d4746"]];
  function rgb(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));}
  function lab([r,g,b]){const [R,G,B]=[r,g,b].map(v=>{v/=255;return v>.04045?Math.pow((v+.055)/1.055,2.4):v/12.92;});const f=v=>v>.008856?Math.cbrt(v):7.787*v+16/116;const x=f((R*.4124+G*.3576+B*.1805)/.95047),y=f(R*.2126+G*.7152+B*.0722),z=f((R*.0193+G*.1192+B*.9505)/1.08883);return [116*y-16,500*(x-y),200*(y-z)];}
  const palette=swatches.map(([name,hex],i)=>({id:String(i+1).padStart(2,'0'),name,hex,row:Math.floor(i/8)+1,column:i%8+1,rgb:rgb(hex),lab:lab(rgb(hex))}));
  const diameter=3;
  const boundary=Array.from({length:64},(_,i)=>[Math.cos(i*Math.PI/32)*1.502,Math.sin(i*Math.PI/32)*1.502]);
  function customSpec(width,height,pitch=3,shape='image',margin=0){
    if(!Number.isFinite(width)||!Number.isFinite(height)||width<12||height<12||width>600||height>600||!Number.isFinite(pitch)||pitch<diameter||pitch>5)throw new Error('Enter a width and height from 12 to 600 mm, with spacing from 3 to 5 mm.');
    if(!['image','rectangle','ellipse','heart'].includes(shape))throw new Error('Invalid pattern shape');
    const cols=Math.floor((width-2*margin-diameter)/pitch)+1,rows=Math.floor((height-2*margin-diameter)/pitch)+1;
    return {width,height,pitch,diameter,margin,cols,rows,offsetX:(width-cols*pitch)/2,offsetY:(height-rows*pitch)/2,shape,custom:true,size:width,n:cols,offset:(width-cols*pitch)/2};
  }
  function gridSpec(size,pitch=3,margin=3){if(![50,80,100].includes(size))throw new Error('Invalid board size or stone spacing');return {...customSpec(size,size,pitch,'rectangle',margin),size,custom:false};}
  function inside(spec,x,y){
    const r=diameter/2;
    if(x-r<spec.margin||y-r<spec.margin||x+r>spec.width-spec.margin||y+r>spec.height-spec.margin)return false;
    if(spec.shape==='ellipse')return boundary.every(([dx,dy])=>((x+dx-spec.width/2)/(spec.width/2))**2+((y+dy-spec.height/2)/(spec.height/2))**2<=1);
    if(spec.shape==='heart'){
      // The whole 3 mm drill, including its circumference, must fit inside the mask.
      const test=(px,py)=>{const X=(px/spec.width*2-1)*1.2,Y=(1-py/spec.height*2)*1.25+.12;return (X*X+Y*Y-1)**3-X*X*Y**3<=0;};
      return boundary.every(([dx,dy])=>test(x+dx,y+dy));
    }return true;
  }
  function nearest(color){const value=lab(color);let best=0,min=Infinity;palette.forEach((c,i)=>{const d=c.lab.reduce((s,v,k)=>s+(v-value[k])**2,0);if(d<min){min=d;best=i;}});return best;}
  function quantize(rgba,spec,skipBackground=false){const {cols,rows}=spec;if(rgba.length!==cols*rows*4)throw new Error('Sample data does not match the grid');const cells=[],counts=Array(40).fill(0);for(let i=0;i<cols*rows;i++){const j=i*4,alpha=rgba[j+3]/255,color=[rgba[j],rgba[j+1],rgba[j+2]],x=i%cols,y=Math.floor(i/cols);const px=spec.offsetX+(x+.5)*spec.pitch,py=spec.offsetY+(y+.5)*spec.pitch;const blank=alpha<.5||!inside(spec,px,py)||(skipBackground&&color.every(v=>v>=238));if(blank){cells.push(-1);continue;}const index=nearest(color);cells.push(index);counts[index]++;}return {...spec,cells,counts,total:counts.reduce((a,b)=>a+b,0),used:counts.filter(Boolean).length,paletteVersion:'supplier-photo2-row-major-40-photo-estimates-v1'};}
  function printTiles(spec){const nc=Math.floor(180/spec.pitch),nr=Math.floor(210/spec.pitch),tiles=[];for(let row=0;row<spec.rows;row+=nr)for(let col=0;col<spec.cols;col+=nc)tiles.push({col,row,cols:Math.min(nc,spec.cols-col),rows:Math.min(nr,spec.rows-row)});return tiles;}
  function outline(pattern){
    const cells=pattern.cells.map((v,k)=>{
      if(v<0)return -1;const x=k%pattern.cols,y=Math.floor(k/pattern.cols);let border=false,contrasts=0,peak=0;
      for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){
        const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=pattern.cols||ny>=pattern.rows)continue;
        const n=pattern.cells[ny*pattern.cols+nx];if(n<0){border=true;continue;}
        const distance=Math.sqrt(palette[v].lab.reduce((s,c,i)=>s+(c-palette[n].lab[i])**2,0));peak=Math.max(peak,distance);if(distance>=28)contrasts++;
      }
      return border||contrasts>=2||peak>=50?v:-1;
    });
    const counts=Array(40).fill(0);cells.forEach(i=>{if(i>=0)counts[i]++;});
    return {...pattern,cells,counts,total:counts.reduce((a,b)=>a+b,0),used:counts.filter(Boolean).length,style:'outline'};
  }
  const api={palette,gridSpec,customSpec,diameter,inside,printTiles,nearest,quantize,outline};root.PatternCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
