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
  const api={withoutWhite};root.WallfidSampler=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
