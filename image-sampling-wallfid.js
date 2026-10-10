/* White-background removal before cell colour averaging. */
(function(root){
  function withoutWhite(rgba,width,n){
    const sums=Array.from({length:n*n},()=>[0,0,0,0,0,0]);
    for(let y=0;y<width;y++)for(let x=0;x<width;x++){
      const j=(y*width+x)*4,k=Math.floor(y*n/width)*n+Math.floor(x*n/width),s=sums[k];s[5]++;
      const r=rgba[j],g=rgba[j+1],b=rgba[j+2],a=rgba[j+3]/255;
      if(a<.5||(r>=238&&g>=238&&b>=238))continue;
      const weight=(1-(r+g+b)/(3*255))*a;
      s[0]+=r*weight;s[1]+=g*weight;s[2]+=b*weight;s[3]+=weight;s[4]+=a;
    }
    const out=new Uint8ClampedArray(n*n*4);
    sums.forEach((s,i)=>{if(s[4]/s[5]<.08||!s[3])return;for(let c=0;c<3;c++)out[i*4+c]=s[c]/s[3];out[i*4+3]=255;});
    return out;
  }
  // Draw the whole source without stretching; uncovered board areas stay transparent.
  function framing(width,height,side,mode='contain',zoom=1,px=50,py=50,targetHeight=side){
    const scale=(mode==='cover'?Math.max(side/width,targetHeight/height):Math.min(side/width,targetHeight/height))*zoom;
    const w=width*scale,h=height*scale;
    return {x:(side-w)*px/100,y:(targetHeight-h)*py/100,width:w,height:h};
  }
  // Alpha-aware cell sampling. Brightness-weighted colour keeps small lights from
  // disappearing into dark surroundings; it never adds pixels or palette colours.
  function photo(rgba,width,n,enhance=false){
    const sums=Array.from({length:n*n},()=>Array(10).fill(0));let light=0,alpha=0;
    for(let y=0;y<width;y++)for(let x=0;x<width;x++){
      const j=(y*width+x)*4,k=Math.floor(y*n/width)*n+Math.floor(x*n/width),s=sums[k],a=rgba[j+3]/255;
      s[9]++;if(!a)continue;
      const r=rgba[j],g=rgba[j+1],b=rgba[j+2],v=Math.max(r,g,b),weight=(.08+(v/255)**2)*a;
      s[0]+=r*a;s[1]+=g*a;s[2]+=b*a;s[3]+=a;
      s[4]+=r*weight;s[5]+=g*weight;s[6]+=b*weight;s[7]+=weight;
      light+=(.2126*r+.7152*g+.0722*b)*a;alpha+=a;
    }
    const dark=alpha&&light/alpha<75,out=new Uint8ClampedArray(n*n*4);
    sums.forEach((s,i)=>{
      // A partial border cell is retained only if most of it contains the image.
      if(!s[3]||s[3]/s[9]<.5)return;
      let c=[0,1,2].map(k=>s[k]/s[3]);
      if(enhance&&dark){
        c=c.map((v,k)=>v*.25+s[k+4]/s[7]*.75);
        const max=Math.max(...c),min=Math.min(...c),sat=max?(max-min)/max:0;
        // Lift coloured shadows more than neutral sky; preserve hue and pure black.
        const gamma=sat>.28?.55:.85,gain=max?255*(max/255)**gamma/max:1;
        c=c.map(v=>v*gain);
      }
      for(let k=0;k<3;k++)out[i*4+k]=c[k];out[i*4+3]=255;
    });return out;
  }
  function subject(rgba,width,height,remove=true,trim=true){
    const out=new Uint8ClampedArray(rgba),seen=new Uint8Array(width*height),queue=new Int32Array(width*height);let head=0,tail=0;
    const background=k=>{const j=k*4;return out[j+3]<128||(Math.min(out[j],out[j+1],out[j+2])>=238&&Math.max(out[j],out[j+1],out[j+2])-Math.min(out[j],out[j+1],out[j+2])<18);};
    const visit=k=>{if(!seen[k]&&background(k)){seen[k]=1;queue[tail++]=k;}};
    if(remove){
      for(let x=0;x<width;x++){visit(x);visit((height-1)*width+x);}for(let y=0;y<height;y++){visit(y*width);visit(y*width+width-1);}
      while(head<tail){const k=queue[head++],x=k%width,y=Math.floor(k/width);out[k*4+3]=0;if(x)visit(k-1);if(x<width-1)visit(k+1);if(y)visit(k-width);if(y<height-1)visit(k+width);}
    }
    let left=width,top=height,right=-1,bottom=-1;
    for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(out[(y*width+x)*4+3]>=128){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
    if(!trim||right<left)return {rgba:out,x:0,y:0,width,height,removed:tail};
    const pad=Math.ceil(Math.max(right-left,bottom-top)*.012);left=Math.max(0,left-pad);top=Math.max(0,top-pad);right=Math.min(width-1,right+pad);bottom=Math.min(height-1,bottom+pad);
    return {rgba:out,x:left,y:top,width:right-left+1,height:bottom-top+1,removed:tail};
  }
  function sample(rgba,width,height,spec,{enhance=false,outlines=true,smart=false}={}){
    const {cols,rows}=spec,out=new Uint8ClampedArray(cols*rows*4);let light=0,alpha=0;
    for(let j=0;j<rgba.length;j+=4){const a=rgba[j+3]/255;light+=(.2126*rgba[j]+.7152*rgba[j+1]+.0722*rgba[j+2])*a;alpha+=a;}
    const dark=alpha&&light/alpha<75;
    for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
      const x0=Math.max(0,Math.floor((spec.offsetX+col*spec.pitch)/spec.width*width)),x1=Math.min(width,Math.ceil((spec.offsetX+(col+1)*spec.pitch)/spec.width*width));
      const y0=Math.max(0,Math.floor((spec.offsetY+row*spec.pitch)/spec.height*height)),y1=Math.min(height,Math.ceil((spec.offsetY+(row+1)*spec.pitch)/spec.height*height));
      const sums=Array(3).fill(0),bright=Array(3).fill(0),ink=Array(3).fill(0),bins=smart?new Map():null;let aSum=0,bWeight=0,inkA=0,paper=0,minLum=255,maxLum=0;
      let inkLeft=x1,inkRight=x0,inkTop=y1,inkBottom=y0;
      for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
        const j=(y*width+x)*4,a=rgba[j+3]/255;if(!a)continue;
        const c=[rgba[j],rgba[j+1],rgba[j+2]],lum=.2126*c[0]+.7152*c[1]+.0722*c[2],weight=(.08+(Math.max(...c)/255)**2)*a;
        aSum+=a;bWeight+=weight;for(let i=0;i<3;i++){sums[i]+=c[i]*a;bright[i]+=c[i]*weight;}
        if(lum<105){inkA+=a;for(let i=0;i<3;i++)ink[i]+=c[i]*a;inkLeft=Math.min(inkLeft,x);inkRight=Math.max(inkRight,x);inkTop=Math.min(inkTop,y);inkBottom=Math.max(inkBottom,y);}if(Math.min(...c)>205)paper+=a;
        if(smart){minLum=Math.min(minLum,lum);maxLum=Math.max(maxLum,lum);const key=(c[0]>>5)*64+(c[1]>>5)*8+(c[2]>>5),bin=bins.get(key)||[0,0,0,0];bin[3]+=a;for(let i=0;i<3;i++)bin[i]+=c[i]*a;bins.set(key,bin);}
      }
      const area=(x1-x0)*(y1-y0),coverage=aSum/area;
      // A continuous ink stroke can occupy much less than 35% of a cell.
      // Retain a crossed cell, not every speck: require both coverage and span.
      const crossed=smart&&outlines&&inkA/area>=.045&&Math.max((inkRight-inkLeft+1)/(x1-x0),(inkBottom-inkTop+1)/(y1-y0))>=.55;
      if(!aSum||(coverage<.35&&!crossed))continue;
      let c=sums.map(v=>v/aSum);
      if(crossed&&coverage<.35)c=ink.map(v=>v/inkA);
      else if(smart&&!dark&&maxLum-minLum>35){
        // Prefer a substantial source colour over a muddy average of opposing
        // colours. Every result is still matched against the same 40 kit IDs.
        let best=null;for(const bin of bins.values())if(!best||bin[3]>best[3])best=bin;
        if(best&&best[3]/aSum>.45)c=c.map((v,i)=>v*.18+best[i]/best[3]*.82);
      }
      // Preserve dark printed strokes against white subject areas; do not erase the white tile itself.
      if(outlines&&!dark&&inkA/aSum>=(smart?.06:.10)&&paper/aSum>=.42)c=ink.map(v=>v/inkA);
      if(enhance&&dark){c=c.map((v,i)=>v*.25+bright[i]/bWeight*.75);const max=Math.max(...c),sat=max?(max-Math.min(...c))/max:0,gamma=sat>.28?.55:.85,gain=max?255*(max/255)**gamma/max:1;c=c.map(v=>v*gain);}
      const k=(row*cols+col)*4;for(let i=0;i<3;i++)out[k+i]=c[i];out[k+3]=255;
    }return out;
  }
  const api={withoutWhite,framing,photo,subject,sample};root.WallfidSampler=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
