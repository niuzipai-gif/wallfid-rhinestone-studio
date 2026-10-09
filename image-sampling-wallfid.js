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
  function framing(width,height,side,mode='contain',zoom=1,px=50,py=50){
    const scale=(mode==='cover'?Math.max(side/width,side/height):Math.min(side/width,side/height))*zoom;
    const w=width*scale,h=height*scale;
    return {x:(side-w)*px/100,y:(side-h)*py/100,width:w,height:h};
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
  const api={withoutWhite,framing,photo};root.WallfidSampler=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
