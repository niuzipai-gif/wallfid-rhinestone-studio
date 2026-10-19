(function(){
  'use strict';
  const $=id=>document.getElementById(id),phone=window.matchMedia('(max-width:900px)');
  const stages=['setup','preview','materials'];let current='setup';
  const workspace=$('workspace'),next=$('mobileNext'),back=$('mobileBack');
  const upload=$('imageUpload'),uploadHome=document.createComment('image-upload-home');
  upload.before(uploadHome);
  const initial=$('initialSetting'),initialHome=document.createComment('initial-setting-home');
  initial.before(initialHome);
  function refresh(){
    const pending=!$('pendingBadge').hidden;
    next.textContent=current==='setup'?(pending?'Update my pattern →':'See my pattern →'):current==='preview'?'Find my colours →':'Save numbered pattern ↓';
    next.disabled=workspace.getAttribute('aria-busy')==='true'||(current==='materials'&&$('exportPng').disabled);
    back.hidden=current==='setup';
    $('mobileShowColour').disabled=$('clearHighlight').disabled;
    $('mobileColourNotice').textContent=$('clearHighlight').disabled?'Choose a colour below to find its compartment.':$('boxPosition').textContent;
  }
  function show(stage,scroll=true){
    if(!stages.includes(stage))return;
    if(stage!=='setup'&&!$('pendingBadge').hidden){$('generateButton').click();if(!$('pendingBadge').hidden){stage='setup';}}
    current=stage;workspace.dataset.mobilePanel=stage;
    document.querySelectorAll('[data-mobile-step]').forEach(b=>{if(b.dataset.mobileStep===stage)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
    refresh();
    if(phone.matches&&scroll){workspace.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});const panel=workspace.querySelector('.'+({setup:'settings',preview:'preview',materials:'materials'}[stage]));panel.setAttribute('tabindex','-1');panel.focus({preventScroll:true});}
  }
  document.querySelectorAll('[data-mobile-step]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.mobileStep)));
  next.addEventListener('click',()=>{if(current==='materials'){$('exportPng').click();return;}if(current==='setup'&&!$('pendingBadge').hidden){$('generateButton').click();if(!$('pendingBadge').hidden)return;}show(stages[stages.indexOf(current)+1]);});
  back.addEventListener('click',()=>show(stages[Math.max(0,stages.indexOf(current)-1)]));
  document.addEventListener('wallfid:busy',refresh);
  document.addEventListener('wallfid:pattern-ready',()=>{show('preview');if(!phone.matches){$('patternCanvas').scrollIntoView({block:'center'});}});
  $('adjustPicture').addEventListener('click',()=>{show('setup',false);$('imageOptions').open=true;$('cropOptions').open=true;$('framingMode').scrollIntoView({block:'center'});$('framingMode').focus({preventScroll:true});});
  $('mobileHelp').addEventListener('click',()=>$('helpDialog').showModal());
  // Show the panel before measuring it for the selected colour's number-chart zoom.
  $('mobileShowColour').addEventListener('click',()=>{show('preview');$('workspace').querySelector('[data-view="numbers"]').click();});
  $('colorList').addEventListener('click',refresh);
  $('boxGrid').addEventListener('click',refresh);
  $('clearHighlight').addEventListener('click',refresh);
  function adapt(){
    if(phone.matches){
      document.querySelector('.pattern-type').after(upload);
      upload.append(initial);
      $('boxDisclosure').open=false;$('exampleOptions').open=false;$('imageOptions').open=false;
    }else{
      uploadHome.after(upload);
      initialHome.after(initial);
      $('boxDisclosure').open=true;$('cropOptions').open=true;$('exampleOptions').open=true;$('imageOptions').open=true;
    }
    refresh();
  }
  phone.addEventListener('change',adapt);
  new MutationObserver(refresh).observe($('pendingBadge'),{attributes:true,attributeFilter:['hidden']});
  new MutationObserver(refresh).observe($('totalStat'),{childList:true});
  document.querySelectorAll('a[href="#workspace"]').forEach(a=>a.addEventListener('click',()=>{if(phone.matches)show('setup',false);}));
  document.querySelectorAll('[data-starter]').forEach(b=>b.addEventListener('click',()=>{if(phone.matches)show('preview');}));
  adapt();show('setup',false);
})();
