(() => {
  'use strict';
  const root = document.getElementById('making');
  if (!root || !window.WallfidTutorial) return;
  const disclosure = root.querySelector('details');
  const mobile = matchMedia('(max-width:900px)');
  const dialog = document.getElementById('tutorialPhotoDialog');
  let selected = 0, trigger = null;
  function copy() { return window.WallfidTutorial[document.documentElement.lang] || window.WallfidTutorial.en; }
  function update() {
    const data = copy();
    root.lang = window.WallfidTutorial[document.documentElement.lang] ? document.documentElement.lang : 'en-GB';
    root.querySelectorAll('[data-tutorial]').forEach(el => el.textContent = data[el.dataset.tutorial]);
    root.querySelectorAll('[data-tutorial-step]').forEach(el => {
      const i = Number(el.dataset.tutorialStep), step = data.steps[i];
      el.querySelector('h3 b').textContent = step[0];
      el.querySelector('p').textContent = step[1];
      el.querySelector('img').alt = step[2];
      el.querySelector('button').setAttribute('aria-label', `${i+1}. ${step[0]} — ${data.expand}`);
    });
    root.querySelector('[data-guide-pdf]').href = root.lang.startsWith('zh') ? 'assets/tutorial/WALLFID-hands-on-ZH.pdf' : 'assets/tutorial/WALLFID-hands-on-EN.pdf';
    dialog.lang = root.lang;
    dialog.querySelector('button').setAttribute('aria-label', data.close);
    if (dialog.open) showPhoto(selected, false);
  }
  function responsive() { disclosure.open = !mobile.matches; }
  function showPhoto(index, open = true) {
    selected = index;
    const data = copy(), img = dialog.querySelector('img');
    img.src = `assets/tutorial/step-${String(index+1).padStart(2,'0')}.webp`;
    img.alt = data.steps[index][2];
    dialog.querySelector('p').textContent = `${index+1}. ${data.steps[index][0]} — ${data.steps[index][1]}`;
    if (open) dialog.showModal();
  }
  root.querySelectorAll('.tutorial-photo').forEach((button,index) => button.addEventListener('click',()=>{trigger=button;showPhoto(index);}));
  dialog.querySelector('button').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>trigger?.focus({preventScroll:true}));
  dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
  document.querySelectorAll('a[href="#making"]').forEach(a=>a.addEventListener('click',()=>disclosure.open=true));
  mobile.addEventListener('change',responsive);
  new MutationObserver(update).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  responsive(); update();
  if(location.hash==='#making') disclosure.open=true;
})();
