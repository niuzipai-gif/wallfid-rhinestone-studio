(function(){
 'use strict';
 const root=document.documentElement,reduced=window.matchMedia('(prefers-reduced-motion:reduce)'),phone=window.matchMedia('(max-width:900px)');
 const workspace=document.getElementById('workspace'),stages=['setup','preview','materials'];
 const active=new Map(),closing=new Map();
 let lastStage=workspace.dataset.mobilePanel;
 function animate(el,frames,duration=220){
  if(!el||reduced.matches||document.hidden||typeof el.animate!=='function'||!el.getClientRects().length)return null;
  active.get(el)?.cancel();
  const a=el.animate(frames,{duration,easing:'cubic-bezier(.22,1,.36,1)'});active.set(el,a);
  const clear=()=>{if(active.get(el)===a)active.delete(el);};
  a.finished.then(clear,clear);return a;
 }
 function arrive(el,direction=1){return animate(el,[{opacity:0,transform:'translate3d('+direction*10+'px,6px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],240);}
 // Native dialog semantics and focus restoration remain in charge after a short exit.
 document.querySelectorAll('dialog').forEach(dialog=>{
  if(dialog.id==='tutorialPhotoDialog')return;
  const close=dialog.close.bind(dialog);
  dialog.close=function(value){
   if(!dialog.open||closing.has(dialog))return;
   if(reduced.matches||document.hidden){close(value);return;}
   const a=animate(dialog,[{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(6px) scale(.99)'}],130);
   if(!a){close(value);return;}
   closing.set(dialog,()=>close(value));
   const finish=()=>{const end=closing.get(dialog);if(end){closing.delete(dialog);end();}};
   a.finished.then(finish,finish);
  };
  dialog.addEventListener('cancel',e=>{if(!reduced.matches){e.preventDefault();dialog.close();}});
 });
 const panels={setup:'.settings',preview:'.preview',materials:'.materials'};
 const observer=new MutationObserver(records=>{
  // A rapid Back/Next sequence animates only the final, current panel.
  const stage=workspace.dataset.mobilePanel;
  if(stage!==lastStage){const direction=stages.indexOf(stage)<stages.indexOf(lastStage)?-1:1;lastStage=stage;if(phone.matches)arrive(workspace.querySelector(panels[stage]),direction);}
  const targets=new Set(records.map(r=>r.target));
  targets.forEach(el=>{
   if(el.tagName==='DIALOG'&&el.id!=='tutorialPhotoDialog'&&el.open&&!closing.has(el))animate(el,[{opacity:0,transform:'translateY(12px) scale(.98)'},{opacity:1,transform:'translateY(0) scale(1)'}],220);
   if(['customSettings','boardSettings','initialSetting'].includes(el.id)&&!el.hidden)arrive(el);
   if(el.id==='processingOverlay'&&!el.hidden)animate(el,[{opacity:0},{opacity:1}],160);
   if(el.id==='toast'&&!el.hidden)animate(el,[{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],180);
  });
 });
 observer.observe(workspace,{attributes:true,subtree:true,attributeFilter:['hidden','data-mobile-panel']});
 document.querySelectorAll('dialog').forEach(d=>observer.observe(d,{attributes:true,attributeFilter:['open']}));
 observer.observe(document.getElementById('processingOverlay'),{attributes:true,attributeFilter:['hidden']});
 observer.observe(document.getElementById('toast'),{attributes:true,attributeFilter:['hidden']});
 document.querySelectorAll('details').forEach(details=>details.addEventListener('toggle',()=>{if(details.open)Array.from(details.children).filter(el=>el.tagName!=='SUMMARY').forEach(el=>animate(el,[{opacity:0,transform:'translateY(-4px)'},{opacity:1,transform:'translateY(0)'}],200));}));
 document.addEventListener('click',e=>{
  const button=e.target.closest?.('[data-view],#compareButton');
  if(button&&!button.disabled)animate(document.getElementById('patternCanvas'),[{opacity:.65},{opacity:1}],170);
 });
 document.addEventListener('wallfid:pattern-ready',()=>animate(document.getElementById('canvasStage'),[{opacity:.65},{opacity:1}],220));
 const artwork=document.querySelectorAll('[data-motion-art]');
 artwork.forEach(el=>{const image=el.querySelector('.artwork-sprite-source');if(image)el.style.setProperty('--art-sprite','url("'+image.src+'")');});
 if(typeof IntersectionObserver!=='undefined'){
  const visibility=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('is-in-view',entry.isIntersecting)),{threshold:.15});
  artwork.forEach(el=>visibility.observe(el));
  const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){animate(entry.target,[{opacity:.5,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],320);reveal.unobserve(entry.target);}}),{threshold:.15});
  document.querySelectorAll('.idea-item,.making-grid article,.workspace-intro,.section-heading').forEach(el=>reveal.observe(el));
 }else artwork.forEach(el=>el.classList.add('is-in-view'));
 function sync(){
  root.classList.toggle('motion-ready',!reduced.matches);root.classList.toggle('motion-suspended',document.hidden);
  if(reduced.matches||document.hidden){active.forEach(a=>a.cancel());active.clear();}
 }
 reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);sync();
})();
