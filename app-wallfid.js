(function(){
  'use strict';
  const $=id=>document.getElementById(id),{palette,gridSpec,customSpec,quantize,printTiles}=PatternCore;
  const state={size:80,view:'drills',highlight:null,source:null,pattern:null,sourceName:'Cat example',zoom:1,compare:false,pending:false,mode:'board',prepared:null};
  let toastTimer;
  function toast(text){$('toast').textContent=text;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4000);}
  function makeExample(type){const c=document.createElement('canvas');c.width=c.height=600;const g=c.getContext('2d');g.fillStyle='#fffdf5';g.fillRect(0,0,600,600);const oval=(x,y,rx,ry,color)=>{g.fillStyle=color;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill();};const polygon=(pts,color)=>{g.fillStyle=color;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();};if(type==='cat'){oval(300,472,119,45,'#dccde6');polygon([[153,244],[145,90],[275,187]],'#ae896a');polygon([[325,187],[455,90],[447,244]],'#ae896a');polygon([[173,195],[169,128],[231,181]],'#e9a6b6');polygon([[369,181],[432,128],[427,195]],'#e9a6b6');oval(300,294,174,150,'#eab68e');oval(300,353,114,86,'#fffdf5');oval(230,284,20,26,'#302a2c');oval(370,284,20,26,'#302a2c');oval(224,276,6,8,'#fffdf5');oval(364,276,6,8,'#fffdf5');oval(200,340,27,15,'#e9a6b6');oval(400,340,27,15,'#e9a6b6');polygon([[284,331],[316,331],[300,349]],'#805e49');g.strokeStyle='#805e49';g.lineWidth=8;g.lineCap='round';g.beginPath();g.moveTo(300,349);g.lineTo(300,366);g.quadraticCurveTo(276,387,262,365);g.moveTo(300,366);g.quadraticCurveTo(324,387,338,365);g.stroke();polygon([[291,165],[309,165],[307,212],[293,212]],'#ae896a');polygon([[250,174],[266,169],[270,213],[257,220]],'#ae896a');polygon([[334,169],[350,174],[343,220],[330,213]],'#ae896a');}else if(type==='flower'){g.clearRect(0,0,600,600);g.strokeStyle='#2c774b';g.lineWidth=52;g.lineCap='round';g.beginPath();g.moveTo(300,295);g.lineTo(300,492);g.stroke();oval(248,419,52,23,'#2c774b');oval(352,453,52,23,'#1d9d44');for(let i=0;i<8;i++){const a=i*Math.PI/4;oval(300+Math.cos(a)*85,250+Math.sin(a)*85,46,46,'#f29db5');}oval(300,250,54,54,'#f5c853');}else if(type==='initial'){g.clearRect(0,0,600,600);g.fillStyle='#7139af';g.font='bold 440px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(($('initialInput').value||'A').toUpperCase(),300,330);}else{g.clearRect(0,0,600,600);g.fillStyle='#ef6ba9';g.beginPath();g.moveTo(300,470);g.bezierCurveTo(85,333,93,120,237,135);g.bezierCurveTo(276,138,300,172,300,196);g.bezierCurveTo(300,172,324,138,363,135);g.bezierCurveTo(507,120,515,333,300,470);g.fill();oval(227,233,22,36,'#f5ced0');}return c;}
  let preparedOriginal=null,preparedKey='';
  function prepareSource(){
    const key=[$('skipBackground').checked,$('focusSubject').checked].join(':');
    if(state.prepared&&preparedOriginal===state.source&&preparedKey===key)return state.prepared;
    const source=state.source,w=source.naturalWidth||source.width,h=source.naturalHeight||source.height,scale=Math.min(1,1400/Math.max(w,h));
    const full=document.createElement('canvas');full.width=Math.max(1,Math.round(w*scale));full.height=Math.max(1,Math.round(h*scale));const g=full.getContext('2d',{willReadFrequently:true});g.drawImage(source,0,0,full.width,full.height);
    const pixels=g.getImageData(0,0,full.width,full.height),subject=WallfidSampler.subject(pixels.data,full.width,full.height,$('skipBackground').checked,$('focusSubject').checked);
    pixels.data.set(subject.rgba);g.putImageData(pixels,0,0);const trimmed=document.createElement('canvas');trimmed.width=subject.width;trimmed.height=subject.height;
    trimmed.getContext('2d').drawImage(full,subject.x,subject.y,subject.width,subject.height,0,0,subject.width,subject.height);
    preparedOriginal=state.source;preparedKey=key;state.prepared=trimmed;return trimmed;
  }
  function currentSpec(){return state.mode==='board'?gridSpec(state.size,Number($('pitch').value)):customSpec(Number($('customWidth').value),Number($('customHeight').value),Number($('pitch').value),$('customShape').value);}
  function fitDimensions(changed='width'){
    if(state.mode!=='custom'||!$('matchAspect').checked)return;
    const source=prepareSource(),ratio=source.width/source.height;
    let w=Number($('customWidth').value),h=Number($('customHeight').value);
    if(!Number.isFinite(w)||!Number.isFinite(h)||w<12||h<12||w>600||h>600)return;
    if(changed==='height'){w=Math.round(h*ratio);}else{h=Math.round(w/ratio);}
    if(h>600){h=600;w=Math.round(h*ratio);}if(w>600){w=600;h=Math.round(w/ratio);}
    $('customWidth').value=Math.max(12,w);$('customHeight').value=Math.max(12,h);
  }
  function updateSizeNote(){
    try{const p=currentSpec();$('sizeEstimate').textContent=p.cols+' × '+p.rows+' grid · 3 mm stones';}catch(e){$('sizeEstimate').textContent=e.message;}
  }
  function crop(target,source=prepareSource()){
    let spec;try{spec=currentSpec();}catch(e){spec=state.pattern||gridSpec(state.size);}
    if(target===$('cropPreview'))target.width=Math.max(4,Math.round(160*spec.width/Math.max(spec.width,spec.height)));
    target.height=Math.max(1,Math.round(target.width*spec.height/spec.width));
    const g=target.getContext('2d');g.clearRect(0,0,target.width,target.height);
    const frame=WallfidSampler.framing(source.width,source.height,target.width,$('framingMode').value,Number($('cropZoom').value),Number($('cropX').value),Number($('cropY').value),target.height);
    g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(source,frame.x,frame.y,frame.width,frame.height);
  }
  function updateCrop(){crop($('cropPreview'));$('zoomValue').value=Number($('cropZoom').value).toFixed(1)+'×';markPending();}
  function markPending(){state.pending=true;$('printArea').replaceChildren();$('pendingBadge').hidden=false;$('exportPng').disabled=$('printButton').disabled=$('exportCsv').disabled=true;}
  function resetCrop(){['cropX','cropY'].forEach(id=>$(id).value=50);$('cropZoom').value=1;updateCrop();}
  function sampleForPattern(spec){
    const large=document.createElement('canvas'),side=Math.min(1600,Math.max(620,Math.max(spec.cols,spec.rows)*8));large.width=Math.max(4,Math.round(side*spec.width/Math.max(spec.width,spec.height)));crop(large);
    return WallfidSampler.sample(large.getContext('2d').getImageData(0,0,large.width,large.height).data,large.width,large.height,spec,{enhance:$('enhancePhoto').checked,outlines:$('preserveOutlines').checked});
  }
  function generate(){try{if(!$('initialSetting').hidden&&!/^[A-Za-z]$/.test($('initialInput').value)){throw new Error('Please choose one letter from A to Z.');}const spec=currentSpec();state.pattern=quantize(sampleForPattern(spec),spec,false);state.highlight=null;state.pending=false;state.compare=false;$('compareButton').setAttribute('aria-pressed','false');$('compareButton').textContent='Original image';$('pendingBadge').hidden=true;$('exportPng').disabled=$('printButton').disabled=$('exportCsv').disabled=state.pattern.total===0;$('gridStat').textContent=spec.cols+' × '+spec.rows;$('totalStat').textContent=state.pattern.total.toLocaleString();$('colorStat').textContent=state.pattern.used;$('stageSize').textContent=spec.width+' × '+spec.height+' mm';$('materialCount').textContent=state.pattern.used+(state.pattern.used===1?' colour in this pattern':' colours in this pattern');$('previewTip').textContent=state.pattern.total?'Choose a number to find its stones in the pattern.':'No stones in this pattern. Try another image or turn off white-area filtering.';crop($('cropPreview'));$('stageKind').textContent=spec.custom?'CUSTOM PATTERN':'ACRYLIC BOARD';$('stageHeading').textContent=spec.custom?'YOUR CUSTOM PATTERN':'YOUR ACRYLIC CANVAS';
    $('detailNote').textContent=spec.cols<60?'Small patterns simplify photo details. Try a larger custom size for more detail.':'Larger patterns preserve more detail. Colours are limited to your 40-colour kit.';
    renderList();render();return true;}catch(e){toast(e.message);return false;}}
  function selectColour(i){state.highlight=state.highlight===i?null:i;state.compare=false;$('compareButton').setAttribute('aria-pressed','false');$('compareButton').textContent='Original image';renderList();render();}
  function renderBox(){const box=$('boxGrid');box.replaceChildren();palette.forEach((colour,i)=>{const count=state.pattern.counts[i],button=document.createElement('button');button.className='box-cell'+(!count?' unused':'')+(state.highlight===i?' active':'');const photo=document.createElement('span');photo.className='compartment-photo';const picture=document.createElement('img');picture.src='assets/spark/kit-reference.webp';picture.alt='';picture.loading='lazy';picture.style.cssText='width:929%;left:-'+((42+(colour.column-1)*149)/135*100)+'%;top:-'+((37+(colour.row-1)*143)/135*100)+'%;';photo.append(picture);const number=document.createElement('span');number.className='compartment-number';number.textContent=Number(colour.id);button.append(photo,number);button.style.setProperty('--stone-colour',colour.hex);button.setAttribute('aria-pressed',String(state.highlight===i));button.setAttribute('aria-label','Number '+Number(colour.id)+', row '+colour.row+', column '+colour.column+', '+count+' stones');button.title=colour.name+' · row '+colour.row+', column '+colour.column;button.addEventListener('click',()=>selectColour(i));box.append(button);});if(state.highlight===null){$('boxPosition').textContent='Choose a number to locate its compartment.';}else{const c=palette[state.highlight],count=state.pattern.counts[state.highlight];$('boxPosition').textContent='No. '+Number(c.id)+' · Row '+c.row+', column '+c.column+' · '+(count?count+' stones needed':'Not used in this pattern');$('previewTip').textContent=count?'Showing number '+Number(c.id)+'. Select it again to show all colours.':'Number '+Number(c.id)+' is not used in this pattern.';}}
  function renderList(){const list=$('colorList');list.replaceChildren();state.pattern.counts.forEach((count,i)=>{if(!count)return;const color=palette[i],button=document.createElement('button');button.className='color-row'+(state.highlight===i?' active':'');button.setAttribute('aria-label','Number '+Number(color.id)+', row '+color.row+', column '+color.column+', '+count+' stones');button.setAttribute('aria-pressed',String(state.highlight===i));button.innerHTML='<span class="color-swatch" style="background:'+color.hex+'"></span><span class="color-info"><strong>No. '+Number(color.id)+'</strong><small>Row '+color.row+' · Column '+color.column+'</small></span><span class="color-amount">'+count+'<small>stones</small></span>';button.addEventListener('click',()=>selectColour(i));list.append(button);});if(!state.pattern.total){const p=document.createElement('p');p.className='hint';p.textContent='No colours needed.';list.append(p);}$('clearHighlight').disabled=state.highlight===null;if(state.highlight===null)$('previewTip').textContent=state.pattern.total?'Choose a number to find its stones in the pattern.':'No stones in this pattern. Try another image or turn off white-area filtering.';renderBox();}
  function drawFacet(g,px,py,step,hex){
    const radius=step*.5,inner=radius*.52;
    const ring=Array.from({length:8},(_,j)=>{const a=-Math.PI/2+j*Math.PI/4;return [px+Math.cos(a)*radius,py+Math.sin(a)*radius];});
    const centre=Array.from({length:8},(_,j)=>{const a=-Math.PI/2+j*Math.PI/4;return [px+Math.cos(a)*inner,py+Math.sin(a)*inner];});
    const poly=points=>{g.beginPath();points.forEach(([x,y],j)=>j?g.lineTo(x,y):g.moveTo(x,y));g.closePath();};
    g.save();g.shadowColor='#33292335';g.shadowBlur=step*.05;g.shadowOffsetY=step*.035;g.fillStyle=hex;poly(ring);g.fill();g.shadowColor='transparent';
    for(let j=0;j<8;j++){const next=(j+1)%8;poly([ring[j],ring[next],centre[next],centre[j]]);g.fillStyle=j<3?['#ffffff85','#ffffff4a','#ffffff18'][j]:j<6?['#0000002c','#00000048','#00000022'][j-3]:'#ffffff42';g.fill();g.strokeStyle='#ffffff12';g.lineWidth=step*.008;g.stroke();}
    poly(centre);g.fillStyle='#ffffff1c';g.fill();g.strokeStyle='#ffffff40';g.lineWidth=step*.012;g.stroke();
    g.fillStyle='#ffffffbc';g.beginPath();g.arc(px-radius*.34,py-radius*.52,step*.028,0,Math.PI*2);g.fill();g.restore();
  }
  function drawPattern(canvas,pattern,view,highlight=null,grid=false){
    canvas.height=Math.max(1,Math.round(canvas.width*pattern.height/pattern.width));
    const g=canvas.getContext('2d'),W=canvas.width,H=canvas.height,unit=W/pattern.width,step=pattern.pitch*unit,ox=pattern.offsetX*unit,oy=pattern.offsetY*unit;
    g.clearRect(0,0,W,H);g.fillStyle='#ffffff';g.fillRect(0,0,W,H);
    pattern.cells.forEach((i,k)=>{
      const x=k%pattern.cols,y=Math.floor(k/pattern.cols),px=ox+(x+.5)*step,py=oy+(y+.5)*step;
      if(i<0){if(view==='numbers'){g.strokeStyle='#ede8ef';g.lineWidth=.5;g.strokeRect(px-step/2,py-step/2,step,step);}return;}
      const color=palette[i];g.globalAlpha=highlight!==null&&highlight!==i?.15:1;
      if(view==='drills'){drawFacet(g,px,py,pattern.diameter*unit,color.hex);}
      else{g.fillStyle=view==='numbers'?color.hex+'35':color.hex;g.fillRect(px-step/2,py-step/2,step,step);if(view==='numbers'){g.strokeStyle='#bdb5ac';g.lineWidth=.6;g.strokeRect(px-step/2,py-step/2,step,step);g.fillStyle='#332e2b';g.font='600 '+step*.44+'px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(String(Number(color.id)),px,py);}}
      g.globalAlpha=1;
    });
    if(grid){g.strokeStyle='#77634f70';g.lineWidth=W/650;
      for(let x=0;x<=pattern.cols;x+=5){g.beginPath();g.moveTo(ox+x*step,oy);g.lineTo(ox+x*step,oy+pattern.rows*step);g.stroke();}
      for(let y=0;y<=pattern.rows;y+=5){g.beginPath();g.moveTo(ox,oy+y*step);g.lineTo(ox+pattern.cols*step,oy+y*step);g.stroke();}
    }
    // Sharp-corner board, or a neutral rectangular extent for a custom silhouette.
    g.strokeStyle=pattern.custom?'#c9bddd':'#a89db7';g.lineWidth=unit*.15;g.strokeRect(unit*.15,unit*.15,W-unit*.3,H-unit*.3);
  }
  function render(){
    const p=state.pattern,c=$('patternCanvas'),side=state.view==='numbers'?Math.min(4000,Math.max(840,Math.max(p.cols,p.rows)*28)):840;c.width=Math.max(4,Math.round(side*p.width/Math.max(p.width,p.height)));c.height=Math.round(c.width*p.height/p.width);
    $('canvasScroll').style.setProperty('--pattern-ratio',p.width/p.height);
    if(state.compare){const g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);g.drawImage(appliedSource,0,0,c.width,c.height);return;}
    drawPattern(c,p,state.view,state.highlight,$('showGrid').checked);
    c.setAttribute('aria-label',p.rows+' rows × '+p.cols+' columns — '+(state.view==='numbers'?'numbered pattern':'stone preview')+(state.highlight===null?'':', highlighting number '+Number(palette[state.highlight].id)));
  }
  const appliedSource=document.createElement('canvas');appliedSource.width=appliedSource.height=840;
  function generateApplied(){const ok=generate();if(ok){appliedSource.width=$('patternCanvas').width;crop(appliedSource);updateFramingNote();}return ok;}
  let busy=false;
  const paint=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  function updateFramingNote(){
    if(!$('framingNote'))return;
    $('framingNote').textContent=$('framingMode').value==='contain'?'Whole image kept. Empty edges need no stones.':'Board filled. Check the crop before making.';
  }
  async function processingStep(text){if($('processingStage'))$('processingStage').textContent=text;await paint();}
  function setBusy(value){
    busy=value;if(!$('processingOverlay'))return;
    $('processingOverlay').hidden=!value;$('workspace').setAttribute('aria-busy',String(value));
    [$('workspace'),document.querySelector('.site-header'),document.querySelector('.mobile-action-bar'),document.querySelector('.mobile-steps')].filter(Boolean).forEach(el=>el.inert=value);
    document.dispatchEvent(new CustomEvent('wallfid:busy',{detail:{busy:value}}));
  }
  function useExample(type){if(busy)return;if($('framingMode'))$('framingMode').value='contain';if($('enhancePhoto'))$('enhancePhoto').checked=false;$('skipBackground').checked=false;$('initialSetting').hidden=type!=='initial';state.source=makeExample(type);state.sourceName={cat:'Cat example',flower:'Flower example',heart:'Heart example',initial:'Initial '+($('initialInput').value||'A').toUpperCase()+' example'}[type];$('fileStatus').textContent='Image: '+state.sourceName;document.querySelectorAll('[data-example]').forEach(b=>b.classList.toggle('active',b.dataset.example===type));resetCrop();generateApplied();}
  async function loadImage(file){
    if(!file||busy)return;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)){toast('Please choose a JPG, PNG or WebP image.');$('imageInput').value='';return;}
    if(file.size>10*1024*1024){toast('This image is over 10 MB. Please choose a smaller file.');$('imageInput').value='';return;}
    const url=URL.createObjectURL(file),img=new Image();let ready=false;
    setBusy(true);$('toast').hidden=true;
    try{
      await processingStep('Reading your image…');
      await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url;});
      if(img.naturalWidth*img.naturalHeight>24000000)throw new Error('Please resize this image to fewer than 24 million pixels.');
      await processingStep('Keeping your picture in proportion…');
      $('initialSetting').hidden=true;state.source=img;state.sourceName=file.name;
      if($('framingMode'))$('framingMode').value='contain';if($('enhancePhoto'))$('enhancePhoto').checked=true;
      // Remove only edge-connected white paper; keep enclosed white subject details.
      $('skipBackground').checked=true;state.prepared=null;fitDimensions();
      $('fileStatus').textContent='Image: '+file.name;
      document.querySelectorAll('[data-example]').forEach(b=>b.classList.remove('active'));
      resetCrop();zoom(1);
      await processingStep('Matching your 40 colours and numbers…');
      ready=generateApplied();
      if(ready)await processingStep('Your pattern is ready.');
    }catch(e){toast(e instanceof Error&&e.message==='Please resize this image to fewer than 24 million pixels.'?e.message:'We could not read this image. Please try another file.');}
    finally{URL.revokeObjectURL(url);$('imageInput').value='';setBusy(false);}
    if(ready){document.dispatchEvent(new CustomEvent('wallfid:pattern-ready'));toast('Your image has been converted on your device.');}
  }
  let exportUrl=null;
  function download(blob,name,preview=null){if(exportUrl)URL.revokeObjectURL(exportUrl);exportUrl=URL.createObjectURL(blob);$('saveExport').href=exportUrl;$('saveExport').download=name;$('exportTitle').textContent=preview?'Your numbered pattern is ready':'Your quantities are ready';$('exportDescription').textContent=preview?'Check the numbers and quantities, then save to your device.':'The CSV includes compartment numbers, row and column, quantities and stock status.';$('exportPreview').hidden=!preview;if(preview)$('exportPreview').src=preview;else $('exportPreview').removeAttribute('src');$('exportDialog').showModal();}
  function exportPng(){
    if(state.pending||!state.pattern.total)return;
    const p=state.pattern,chart=document.createElement('canvas'),longSide=Math.min(4000,Math.max(1260,Math.max(p.cols,p.rows)*22));chart.width=Math.max(24,Math.round(longSide*p.width/Math.max(p.width,p.height)));drawPattern(chart,p,'numbers',null,true);
    const c=document.createElement('canvas');c.width=Math.max(1400,chart.width+140);c.height=chart.height+400+Math.ceil(p.used/4)*42;
    const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.fillStyle='#291f3c';g.font='bold 34px sans-serif';g.fillText('WALLFID · RHINESTONE STUDIO · Numbered pattern',70,66);g.font='22px sans-serif';
    g.fillText(p.width+' × '+p.height+' mm | '+p.cols+' × '+p.rows+' grid | '+p.total+' stones | 3 mm diameter',70,110);g.drawImage(chart,70,145);
    const base=chart.height+200;g.font='21px sans-serif';g.fillText('Compartment numbers & quantities — check against your physical kit',70,base);let row=0;
    p.counts.forEach((count,i)=>{if(!count)return;const colour=palette[i],x=70+(row%4)*((c.width-140)/4),y=base+50+Math.floor(row/4)*42;g.fillStyle=colour.hex;g.fillRect(x,y-17,20,20);g.fillStyle='#291f3c';g.font='17px sans-serif';g.fillText('No. '+Number(colour.id)+' · R'+colour.row+' C'+colour.column+' · '+count,x+30,y);row++;});
    g.font='18px sans-serif';g.fillText('For viewing. Use Print template at 100% for placement and measure the 50 mm scale line.',70,c.height-35);
    c.toBlob(blob=>{if(blob)download(blob,'wallfid-pattern-'+p.width+'x'+p.height+'mm.png',c.toDataURL('image/png'));},'image/png');
  }
  function preparePrint(){
    const p=state.pattern,root=$('printArea');root.replaceChildren();
    const tiles=printTiles(p);let firstImage=null;
    tiles.forEach((tile,index)=>{
      const sheet=document.createElement('section');sheet.className='print-sheet';
      const h=document.createElement('h1');h.textContent='WALLFID · RHINESTONE STUDIO · Placement template';
      const info=document.createElement('p');info.textContent=p.width+' × '+p.height+' mm | '+p.cols+' × '+p.rows+' grid | '+p.total+' stones | 3 mm diameter';
      const position=document.createElement('p');position.textContent='Tile '+(index+1)+' / '+tiles.length+' · Rows '+(tile.row+1)+'–'+(tile.row+tile.rows)+' · Columns '+(tile.col+1)+'–'+(tile.col+tile.cols);
      const note=document.createElement('p');note.textContent='Print at 100%. Join tiles edge to edge using row and column numbers. Measure the scale line.';
      const cells=[];for(let y=tile.row;y<tile.row+tile.rows;y++)for(let x=tile.col;x<tile.col+tile.cols;x++)cells.push(p.cells[y*p.cols+x]);
      const x0=tile.col?p.offsetX+tile.col*p.pitch:0,y0=tile.row?p.offsetY+tile.row*p.pitch:0;
      const x1=tile.col+tile.cols===p.cols?p.width:p.offsetX+(tile.col+tile.cols)*p.pitch,y1=tile.row+tile.rows===p.rows?p.height:p.offsetY+(tile.row+tile.rows)*p.pitch;
      const part=tiles.length===1?p:{...p,cells,cols:tile.cols,rows:tile.rows,width:x1-x0,height:y1-y0,offsetX:p.offsetX+tile.col*p.pitch-x0,offsetY:p.offsetY+tile.row*p.pitch-y0};
      const c=document.createElement('canvas');c.width=Math.round(part.width*12);drawPattern(c,part,'numbers',null,true);
      const img=document.createElement('img');img.className='print-board';img.src=c.toDataURL('image/png');img.style.width=part.width+'mm';img.style.height=part.height+'mm';img.alt='Actual-size numbered placement pattern';firstImage=firstImage||img;
      const scale=document.createElement('div');scale.className='print-scale';const label=document.createElement('p');label.textContent='Scale line: 50 mm. Measure before making.';
      sheet.append(h,info,position,note,img,scale,label);root.append(sheet);
    });
    const legend=document.createElement('section');legend.className='print-sheet print-legend';const h=document.createElement('h1');h.textContent='Compartment numbers & quantities — check against your physical kit';const colours=document.createElement('div');colours.className='print-colors';
    p.counts.forEach((count,i)=>{if(!count)return;const colour=palette[i],item=document.createElement('span'),swatch=document.createElement('i');swatch.style.background=colour.hex;item.append(swatch,document.createTextNode('No. '+Number(colour.id)+' · R'+colour.row+' C'+colour.column+': '+count));colours.append(item);});
    const footer=document.createElement('p');footer.textContent='3 mm round stones. Supplied acrylic boards have square corners. Colours are photo estimates; check your kit.';
    legend.append(h,colours,footer);root.append(legend);return firstImage;
  }
  function setMode(mode){
    state.mode=mode;$('boardSettings').hidden=mode!=='board';$('customSettings').hidden=mode!=='custom';
    document.querySelectorAll('[data-pattern-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.patternMode===mode)));
    fitDimensions();updateSizeNote();updateCrop();
  }
  document.querySelectorAll('[data-pattern-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.patternMode)));
  ['customWidth','customHeight'].forEach(id=>$(id).addEventListener('change',()=>{fitDimensions(id==='customHeight'?'height':'width');updateSizeNote();updateCrop();}));
  $('matchAspect').addEventListener('change',()=>{fitDimensions();updateSizeNote();updateCrop();});$('customShape').addEventListener('change',markPending);
  ['skipBackground','focusSubject'].forEach(id=>$(id).addEventListener('change',()=>{state.prepared=null;fitDimensions();updateSizeNote();updateCrop();}));
  $('preserveOutlines').addEventListener('change',markPending);
  $('pitch').addEventListener('input',()=>{updateSizeNote();markPending();});
  document.querySelectorAll('[data-custom-preset]').forEach(b=>b.addEventListener('click',()=>{$('customWidth').value=b.dataset.customPreset;fitDimensions();updateSizeNote();updateCrop();}));

  document.querySelectorAll('[data-size]').forEach(b=>b.addEventListener('click',()=>{state.size=Number(b.dataset.size);setMode('board');document.querySelectorAll('[data-size]').forEach(el=>{const active=el===b;el.classList.toggle('selected',active);el.setAttribute('aria-pressed',String(active));});markPending();}));
  document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{state.view=b.dataset.view;if(state.view==='numbers'&&window.matchMedia('(max-width:900px)').matches){zoom(Math.max(1,state.pattern.cols*26/Math.max(200,$('canvasScroll').clientWidth)));}state.compare=false;$('compareButton').setAttribute('aria-pressed','false');$('compareButton').textContent='Original image';document.querySelectorAll('[data-view]').forEach(el=>{const active=el===b;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));});render();}));
  document.querySelectorAll('[data-example]').forEach(b=>b.addEventListener('click',()=>useExample(b.dataset.example)));
  if($('framingMode'))$('framingMode').addEventListener('change',()=>{resetCrop();updateFramingNote();});if($('enhancePhoto'))$('enhancePhoto').addEventListener('change',markPending);
  ['cropZoom','cropX','cropY'].forEach(id=>$(id).addEventListener('input',updateCrop));['skipBackground','pitch'].forEach(id=>$(id).addEventListener('input',markPending));$('resetCrop').addEventListener('click',resetCrop);$('generateButton').addEventListener('click',async()=>{if(busy)return;setBusy(true);try{await processingStep('Matching your 40 colours and numbers…');if(generateApplied()){document.dispatchEvent(new CustomEvent('wallfid:pattern-ready'));toast('Pattern and quantities updated.');}}finally{setBusy(false);}});$('showGrid').addEventListener('change',render);$('clearHighlight').addEventListener('click',()=>{state.highlight=null;renderList();render();});$('compareButton').addEventListener('click',()=>{state.compare=!state.compare;$('compareButton').setAttribute('aria-pressed',String(state.compare));$('compareButton').textContent=state.compare?'Back to pattern':'Original image';render();});
  function zoom(value){state.zoom=Math.max(1,Math.min(20,value));$('canvasScroll').classList.toggle('zoomed',state.zoom>1);$('canvasScroll').style.setProperty('--zoom-width',state.zoom*100+'%');$('viewZoomLabel').textContent=Math.round(state.zoom*100)+'%';$('zoomOut').disabled=state.zoom===1;$('zoomIn').disabled=state.zoom===20;}$('zoomIn').addEventListener('click',()=>zoom(state.zoom*1.5));$('zoomOut').addEventListener('click',()=>zoom(state.zoom/1.5));$('zoomReset').addEventListener('click',()=>zoom(1));
  $('imageInput').addEventListener('change',e=>loadImage(e.target.files[0]));$('dropZone').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('imageInput').click();}});['dragenter','dragover'].forEach(type=>$('dropZone').addEventListener(type,e=>{e.preventDefault();$('dropZone').classList.add('dragover');}));['dragleave','drop'].forEach(type=>$('dropZone').addEventListener(type,e=>{e.preventDefault();$('dropZone').classList.remove('dragover');if(type==='drop')loadImage(e.dataTransfer.files[0]);}));
  $('exportPng').addEventListener('click',exportPng);$('closeExport').addEventListener('click',()=>$('exportDialog').close());$('exportCsv').addEventListener('click',()=>{if(state.pending||!state.pattern.total)return;const csvCell=v=>'\"'+String(v).replaceAll('\"','\"\"')+'\"';const tr=v=>window.WallfidI18n?WallfidI18n.translate(v):v;const rows=[['Palette version','Pattern width mm','Pattern height mm','Stone diameter mm','Spacing mm','Pattern shape','Number','Row','Column','Photo description','Quantity','Stock status'].map(v=>csvCell(tr(v))).join(',')];state.pattern.counts.forEach((count,i)=>{if(count)rows.push([state.pattern.paletteVersion,state.pattern.width,state.pattern.height,state.pattern.diameter,state.pattern.pitch,state.pattern.shape,Number(palette[i].id),palette[i].row,palette[i].column,tr(palette[i].name),count,tr('Not entered')].map(csvCell).join(','));});download(new Blob(['\ufeff'+rows.join('\r\n')],{type:'text/csv;charset=utf-8'}),'wallfid-quantities-photo-estimates.csv');});$('printButton').addEventListener('click',async()=>{if(state.pending||!state.pattern.total)return;const img=preparePrint();await Promise.all(Array.from($('printArea').querySelectorAll('img')).map(img=>img.decode()));window.print();});$('helpButton').addEventListener('click',()=>$('helpDialog').showModal());$('fullGuideButton').addEventListener('click',()=>$('helpDialog').showModal());$('closeHelp').addEventListener('click',()=>$('helpDialog').close());
  window.addEventListener('beforeprint',()=>{if(state.pattern&&!state.pending){if(!$('printArea').querySelector('img'))preparePrint();}else{const notice=document.createElement('p');notice.textContent='Changes have not been applied. Return to the workspace and select Create pattern before printing.';$('printArea').replaceChildren(notice);}});useExample('flower');zoom(1);updateSizeNote();
  document.querySelectorAll('[data-starter]').forEach(button=>button.addEventListener('click',()=>{
    if(button.dataset.starter==='initial')$('initialInput').value='A';
    const selectedSize=document.querySelector('[data-size="'+button.dataset.board+'"]');selectedSize.click();useExample(button.dataset.starter);
    $('workspace').scrollIntoView({behavior:'auto',block:'start'});$('workspace').focus({preventScroll:true});
  }));
  [['flowerIdea','flower',80],['heartIdea','heart',50],['initialIdea','initial',100]].forEach(([id,type,size])=>{
    const spec=gridSpec(size,3),source=makeExample(type),sample=document.createElement('canvas');sample.width=sample.height=spec.n;const context=sample.getContext('2d');context.drawImage(source,0,0,spec.n,spec.n);const pattern=quantize(context.getImageData(0,0,spec.n,spec.n).data,spec,false);drawPattern($(id),pattern,'drills');
  });
  $('initialInput').addEventListener('input',()=>{const letter=$('initialInput').value.toUpperCase();if(/^[A-Z]$/.test(letter)){useExample('initial');}else{markPending();if(letter)toast('Please choose one letter from A to Z.');}});

})();
