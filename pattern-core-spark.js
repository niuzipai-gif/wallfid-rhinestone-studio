/* Physical sample order, 2026-10-13. Front/body pixel estimates; not instrument-calibrated. */
(function(root){
  'use strict';
  const swatches=[["Black & silver", "#1e1c1f"], ["Black & gold", "#211b1c"], ["Coral orange", "#ff6b3a"], ["Red", "#39191e"], ["Iridescent purple", "#5243b4"], ["Iridescent blue", "#2b2dc2"], ["Deep green", "#1d2829"], ["Clear iridescent", "#c0c6cf"], ["Black", "#121017"], ["Copper brown", "#62443e"], ["Orange yellow", "#ffa040"], ["Orange red", "#c0242d"], ["Lilac", "#a760d9"], ["Light blue", "#5c87e7"], ["Emerald green", "#3f874a"], ["Silver grey", "#c8c4cf"], ["Iridescent white", "#c3bcc4"], ["Antique gold", "#775a3c"], ["Golden yellow", "#ffb64d"], ["Coral pink", "#f46189"], ["Hot pink", "#ff3a9a"], ["Turquoise", "#3088c4"], ["Grass green", "#375a3c"], ["Milky white", "#f0f0f0"], ["Blue-purple on black", "#19171c"], ["Copper gold", "#684e3a"], ["Lime yellow", "#d8eb56"], ["Light pink", "#ff87b5"], ["Rose pink", "#ad2652"], ["Aqua", "#68bebd"], ["Bright green", "#a1f867"], ["Clear iridescent", "#e0e3e6"], ["Blue-green on black", "#101320"], ["Pale yellow", "#fff6a2"], ["Yellow", "#fdff51"], ["Pale pink silver", "#d36e9f"], ["Peach pink", "#ffa1c9"], ["Sky blue", "#81c0cf"], ["Iridescent teal", "#0e699d"], ["Clear iridescent", "#cccede"]];
  function rgb(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));}
  function lab([r,g,b]){const [R,G,B]=[r,g,b].map(v=>{v/=255;return v>.04045?Math.pow((v+.055)/1.055,2.4):v/12.92;});const f=v=>v>.008856?Math.cbrt(v):7.787*v+16/116;const x=f((R*.4124+G*.3576+B*.1805)/.95047),y=f(R*.2126+G*.7152+B*.0722),z=f((R*.0193+G*.1192+B*.9505)/1.08883);return [116*y-16,500*(x-y),200*(y-z)];}
  const physicalBoxes=[[174, 114, 316, 259], [404, 117, 546, 262], [633, 121, 776, 264], [863, 125, 1005, 267], [1093, 128, 1235, 270], [1322, 132, 1465, 272], [1552, 135, 1694, 275], [1782, 139, 1924, 277], [164, 348, 307, 494], [395, 350, 539, 495], [627, 352, 770, 496], [858, 354, 1002, 496], [1090, 356, 1234, 497], [1322, 358, 1465, 498], [1553, 360, 1697, 499], [1785, 362, 1928, 500], [154, 583, 299, 728], [387, 583, 532, 727], [621, 583, 765, 727], [854, 584, 999, 726], [1087, 584, 1232, 725], [1321, 584, 1465, 725], [1554, 585, 1699, 724], [1787, 585, 1932, 723], [144, 817, 290, 963], [379, 816, 525, 960], [614, 814, 760, 958], [849, 813, 995, 956], [1085, 812, 1231, 953], [1320, 811, 1466, 951], [1555, 809, 1701, 949], [1790, 808, 1936, 946], [134, 1051, 281, 1197], [371, 1049, 518, 1193], [608, 1046, 755, 1189], [845, 1043, 992, 1185], [1082, 1040, 1229, 1181], [1319, 1037, 1466, 1177], [1556, 1034, 1703, 1173], [1793, 1031, 1940, 1169]];
  const palette=swatches.map(([name,hex],i)=>({id:String(i+1).padStart(2,'0'),name,hex,row:Math.floor(i/8)+1,column:i%8+1,rgb:rgb(hex),lab:lab(rgb(hex)),photo:{src:"assets/spark/physical-kit-sample-v2.jpg",width:2059,height:1280,box:physicalBoxes[i]}}));
  const diameter=3;
  const boundary=Array.from({length:64},(_,i)=>[Math.cos(i*Math.PI/32)*1.502,Math.sin(i*Math.PI/32)*1.502]);
  function customSpec(width,height,pitch=3,shape='image',margin=0){
    if(!Number.isFinite(width)||!Number.isFinite(height)||width<12||height<12||width>600||height>600||!Number.isFinite(pitch)||pitch<diameter||pitch>5)throw new Error('Enter a width and height from 12 to 600 mm, with spacing from 3 to 5 mm.');
    if(!['image','rectangle','ellipse','heart'].includes(shape))throw new Error('Invalid pattern shape');
    const cols=Math.floor((width-2*margin-diameter)/pitch)+1,rows=Math.floor((height-2*margin-diameter)/pitch)+1;
    return {width,height,pitch,diameter,margin,cols,rows,offsetX:(width-cols*pitch)/2,offsetY:(height-rows*pitch)/2,shape,custom:true,size:width,n:cols,offset:(width-cols*pitch)/2};
  }
  function gridSpec(size,pitch=3,margin=2){if(![50,80,100].includes(size))throw new Error('Invalid board size or stone spacing');return {...customSpec(size,size,pitch,'rectangle',margin),size,custom:false};}
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
  // CIEDE2000; implementation checked against Sharma/Wu/Dalal's reference pairs.
  // https://hajim.rochester.edu/ece/sites/gsharma/ciede2000/
  function deltaE00(a,b){
    const rad=Math.PI/180,deg=180/Math.PI,C1=Math.hypot(a[1],a[2]),C2=Math.hypot(b[1],b[2]),C=(C1+C2)/2;
    const G=.5*(1-Math.sqrt(C**7/(C**7+25**7))),a1=(1+G)*a[1],a2=(1+G)*b[1],c1=Math.hypot(a1,a[2]),c2=Math.hypot(a2,b[2]);
    const hue=(x,y)=>(Math.atan2(y,x)*deg+360)%360,h1=hue(a1,a[2]),h2=hue(a2,b[2]);
    const dL=b[0]-a[0],dC=c2-c1;let dh=h2-h1;if(!c1||!c2)dh=0;else if(dh>180)dh-=360;else if(dh< -180)dh+=360;
    const dH=2*Math.sqrt(c1*c2)*Math.sin(dh*rad/2),L=(a[0]+b[0])/2,cp=(c1+c2)/2;
    let h;if(!c1||!c2)h=h1+h2;else if(Math.abs(h1-h2)<=180)h=(h1+h2)/2;else h=(h1+h2+(h1+h2<360?360:-360))/2;
    const T=1-.17*Math.cos((h-30)*rad)+.24*Math.cos(2*h*rad)+.32*Math.cos((3*h+6)*rad)-.20*Math.cos((4*h-63)*rad);
    const SL=1+.015*(L-50)**2/Math.sqrt(20+(L-50)**2),SC=1+.045*cp,SH=1+.015*cp*T;
    const RT=-2*Math.sqrt(cp**7/(cp**7+25**7))*Math.sin(60*Math.exp(-(((h-275)/25)**2))*rad);
    return Math.sqrt((dL/SL)**2+(dC/SC)**2+(dH/SH)**2+RT*(dC/SC)*(dH/SH));
  }
  const matchCache=new Map(),darkestL=Math.min(...palette.map(c=>c.lab[0]));
  function nearest(color,darker=false,artwork=false){
    const key=color.join(',')+':'+darker+':'+artwork;if(matchCache.has(key))return matchCache.get(key);
    const value=lab(color);let best=0,min=Infinity;
    const chroma=Math.hypot(value[1],value[2]),hue=Math.atan2(value[2],value[1]);
    palette.forEach((c,i)=>{
      // A recognised outline must not jump to a much lighter drill and merge
      // into the fill just because the limited palette lacks the exact shade.
      if(darker&&c.lab[0]>Math.max(value[0]+3,darkestL))return;
      const targetChroma=Math.hypot(c.lab[1],c.lab[2]);let huePenalty=0;
      if(chroma>12&&targetChroma>12){const angle=Math.abs(hue-Math.atan2(c.lab[2],c.lab[1]));huePenalty=.5*Math.min(angle,Math.PI*2-angle)*180/Math.PI*Math.min(1,(chroma-12)/18);}
      // With only 40 choices, preserve a recognisable colour family as well as
      // perceptual distance: pale green should not become a yellow motif.
      // Photo gradients need conservative saturation; flat artwork instead
      // benefits from hue-aware matches between a handful of distinct fills.
      const d=artwork?deltaE00(value,c.lab)+huePenalty*Math.max(0,Math.min(1,(value[0]-75)/15)):Math.hypot(...value.map((v,k)=>v-c.lab[k]));if(d<min){min=d;best=i;}
    });
    if(matchCache.size>8192)matchCache.clear();matchCache.set(key,best);return best;
  }
  function quantize(rgba,spec,skipBackground=false){const {cols,rows}=spec;if(rgba.length!==cols*rows*4)throw new Error('Sample data does not match the grid');const cells=[],counts=Array(40).fill(0);for(let i=0;i<cols*rows;i++){const j=i*4,alpha=rgba[j+3]/255,color=[rgba[j],rgba[j+1],rgba[j+2]],x=i%cols,y=Math.floor(i/cols);const px=spec.offsetX+(x+.5)*spec.pitch,py=spec.offsetY+(y+.5)*spec.pitch;const blank=alpha<.5||!inside(spec,px,py)||(skipBackground&&color.every(v=>v>=238));if(blank){cells.push(-1);continue;}const index=nearest(color,Boolean(rgba.outlineMask?.[i]),Boolean(rgba.artwork));cells.push(index);counts[index]++;}return {...spec,cells,counts,total:counts.reduce((a,b)=>a+b,0),used:counts.filter(Boolean).length,paletteVersion:'physical-sample-2026-10-13-row-major-40-v2'};}
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
  const api={palette,gridSpec,customSpec,diameter,inside,printTiles,nearest,quantize,outline,deltaE00};root.PatternCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
