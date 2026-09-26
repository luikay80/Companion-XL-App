(()=>{
  const recipes=window.CompanionRecipes||[];
  const acc=window.CompanionAccessoryInfo||{};
  const id=new URLSearchParams(location.search).get('id');
  const r=recipes.find(x=>x.id===id);
  const main=document.getElementById('main');

  const esc=(s)=>String(s??'').replace(/[&<>"']/g,(m)=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));

  const pos={
    steam:'0% 0%', mixer:'50% 0%', beater:'100% 0%',
    kneading:'0% 100%', ultrablade:'50% 100%', fondxl:'100% 100%'
  };

  const sprite=(aid)=>{
    return '<span class="acc-sprite" style="background-position:'+
      (pos[aid]||'0% 0%')+
      '"></span>';
  };

  if(!r){
    main.innerHTML='<section class="section"><div class="source"><h2>A recept nem található.</h2></div></section>';
    return;
  }

  document.title='Companion XL • '+r.title;
  const back=document.getElementById('back');
  if(back) back.onclick=()=>history.back();

  if(r.sourceOnly){
    main.innerHTML=
      '<section class="section"><div class="source">'+
      '<div style="font-size:46px">📖</div>'+
      '<h1>'+esc(r.title)+'</h1>'+
      '<p>Ez a recept már szerepel a Companion XL teljes katalógusában. A részletes magyar recept feltöltése még folyamatban van.</p>'+
      '</div></section>';
    return;
  }

  const favs=new Set(JSON.parse(localStorage.getItem('companion-favs')||'[]'));
  const isFav=favs.has(r.id);

  const ingredients=(r.ingredients||[]).map((x)=>{
    const amount=Array.isArray(x)?x[0]:'';
    const name=Array.isArray(x)?x[1]:x;
    return '<li>'+(amount?'<b>'+esc(amount)+'</b> ':'')+esc(name)+'</li>';
  }).join('');

  const steps=(r.steps||[]).map((step,i)=>{
    const aid=r.stepAccessories&&r.stepAccessories[i];
    return '<li>'+
      '<span class="step-num">'+(i+1)+'</span>'+
      '<div class="step-content">'+
      (aid?'<div class="step-acc">'+sprite(aid)+'<span>'+esc(acc[aid]?.name||aid)+'</span></div>':'')+
      '<div class="step-text">'+esc(String(step).replace(/^\s*\d+\.\s*/,''))+'</div>'+
      '</div></li>';
  }).join('');

  main.innerHTML=
    '<section class="hero">'+
      (r.image?'<div class="cover"><img src="assets/recipes/'+esc(r.image)+'" alt="'+esc(r.title)+'"></div>':'')+
      '<div class="pad"><div class="titleRow"><div>'+
        '<h1>'+esc(r.title)+'</h1>'+
        '<button class="start-cook" id="startCook">▶ Főzés indítása</button>'+
      '</div><button class="fav" id="fav">'+(isFav?'♥':'♡')+'</button></div>'+
      '<div class="tags">'+
        '<span class="tag">'+esc(r.cat||'')+'</span>'+
        '<span class="tag">👥 '+esc(r.servings||'—')+'</span>'+
        '<span class="tag">⏱ '+esc(r.total||'—')+'</span>'+
      '</div></div>'+
    '</section>'+
    '<section class="section"><h2>Companion tartozékok</h2><div class="accs">'+
      (r.accessories||[]).map(aid=>'<div class="acc">'+sprite(aid)+'<b>'+esc(acc[aid]?.name||aid)+'</b></div>').join('')+
    '</div></section>'+
    '<div class="layout">'+
      '<section class="section"><h2>Hozzávalók</h2><ul class="ingredients">'+ingredients+'</ul></section>'+
      '<section class="section"><h2>Elkészítés</h2><ol class="steps">'+steps+'</ol>'+
        (r.program?'<div class="program"><b>Companion-beállítások</b><br>'+r.program.map(esc).join('<br>')+'</div>':'')+
        (r.note?'<div class="program"><b>Tipp</b><br>'+esc(r.note)+'</div>':'')+
      '</section>'+
    '</div>';

  document.getElementById('fav').onclick=()=>{
    const next=new Set(JSON.parse(localStorage.getItem('companion-favs')||'[]'));
    if(next.has(r.id)) next.delete(r.id); else next.add(r.id);
    localStorage.setItem('companion-favs',JSON.stringify([...next]));
    document.getElementById('fav').textContent=next.has(r.id)?'♥':'♡';
  };

  const style=document.createElement('style');
  style.textContent=[
    '.start-cook{display:inline-flex;align-items:center;gap:7px;margin-top:13px;border:0;border-radius:14px;background:var(--green);color:#fff;padding:12px 15px;font-size:14px;font-weight:800;cursor:pointer}',
    '.cook-screen{position:fixed;inset:0;z-index:200;background:#102017;color:#fff;display:none;flex-direction:column}',
    '.cook-screen.show{display:flex}',
    '.cook-top{display:flex;align-items:center;justify-content:space-between;padding:15px 18px;border-bottom:1px solid rgba(255,255,255,.1)}',
    '.cook-top-title{font-weight:800;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:10px}',
    '.cook-close{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:#fff;border-radius:12px;width:40px;height:40px;font-size:18px;cursor:pointer}',
    '.cook-body{flex:1;display:flex;align-items:center;justify-content:center;overflow:auto;padding:24px 18px}',
    '.cook-card{width:min(700px,100%);text-align:center}',
    '.cook-count{font-size:13px;color:rgba(255,255,255,.62);font-weight:700}',
    '.cook-step-title{font-size:30px;line-height:1.12;margin:9px 0 20px}',
    '.cook-text{font-size:18px;line-height:1.65;color:rgba(255,255,255,.92);margin:0 auto;max-width:650px;white-space:pre-wrap}',
    '.cook-tool{display:flex;justify-content:center;align-items:center;gap:10px;margin:24px 0 20px}',
    '.cook-tool .acc-sprite{width:58px;height:50px;border-radius:12px;background-color:#fff}',
    '.cook-program{margin:0 auto 22px;max-width:650px;padding:11px 13px;border-radius:13px;background:rgba(255,255,255,.08);color:rgba(255,255,255,.72);font-size:12px;line-height:1.5}',
    '.cook-progress{height:7px;background:rgba(255,255,255,.12);border-radius:99px;overflow:hidden;margin:25px 0}',
    '.cook-progress span{display:block;height:100%;width:0;background:#fff;border-radius:99px;transition:width .2s}',
    '.cook-actions{display:flex;gap:9px}',
    '.cook-actions button{flex:1;border:0;border-radius:14px;padding:14px;font-weight:800;font-size:14px;cursor:pointer}',
    '.cook-prev{background:rgba(255,255,255,.1);color:#fff}',
    '.cook-next{background:#fff;color:#153b27}',
    '@media(max-width:560px){.cook-step-title{font-size:24px}.cook-text{font-size:16px;line-height:1.55}.cook-body{padding:20px 15px}}'
  ].join('');
  document.head.appendChild(style);

  const cook=document.createElement('div');
  cook.className='cook-screen';
  cook.innerHTML=
    '<div class="cook-top"><div class="cook-top-title">'+esc(r.title)+'</div>'+
    '<button class="cook-close">✕</button></div>'+
    '<div class="cook-body"><div class="cook-card">'+
    '<div class="cook-count"></div>'+
    '<div class="cook-step-title"></div>'+
    '<p class="cook-text"></p>'+
    '<div class="cook-tool"></div>'+
    '<div class="cook-program"></div>'+
    '<div class="cook-progress"><span></span></div>'+
    '<div class="cook-actions"><button class="cook-prev">Előző</button><button class="cook-next">Következő</button></div>'+
    '</div></div>';
  document.body.appendChild(cook);

  let step=0;
  const countEl=cook.querySelector('.cook-count');
  const titleEl=cook.querySelector('.cook-step-title');
  const textEl=cook.querySelector('.cook-text');
  const toolEl=cook.querySelector('.cook-tool');
  const programEl=cook.querySelector('.cook-program');
  const bar=cook.querySelector('.cook-progress span');
  const prev=cook.querySelector('.cook-prev');
  const next=cook.querySelector('.cook-next');

  const renderCook=()=>{
    const total=(r.steps||[]).length;
    countEl.textContent='Lépés '+(step+1)+' / '+total;
    titleEl.textContent='Lépés '+(step+1);
    textEl.textContent=r.steps[step]||'';
    const aid=r.stepAccessories&&r.stepAccessories[step] || (r.accessories||[])[0];
    toolEl.innerHTML=aid?'<span>'+sprite(aid)+'</span><b>'+esc(acc[aid]?.name||aid)+'</b>':'';
    if(r.program&&r.program[step]){
      programEl.innerHTML='<b>Companion-beállítás</b><br>'+esc(r.program[step]);
      programEl.style.display='block';
    }else{
      programEl.innerHTML='';
      programEl.style.display='none';
    }
    bar.style.width=((step+1)/Math.max(total,1)*100)+'%';
    prev.disabled=step===0;
    prev.style.opacity=step===0?'.4':'1';
    next.textContent=step===total-1?'Kész':'Következő';
  };

  document.getElementById('startCook').onclick=()=>{
    if(!(r.steps||[]).length)return;
    step=0;
    renderCook();
    cook.classList.add('show');
    document.body.style.overflow='hidden';
  };

  const closeCook=()=>{
    cook.classList.remove('show');
    document.body.style.overflow='';
  };

  cook.querySelector('.cook-close').onclick=closeCook;
  prev.onclick=()=>{if(step>0){step--;renderCook();}};
  next.onclick=()=>{if(step<(r.steps.length-1)){step++;renderCook();}else closeCook();};
  document.addEventListener('keydown',(e)=>{
    if(!cook.classList.contains('show'))return;
    if(e.key==='Escape')closeCook();
    if(e.key==='ArrowLeft'&&step>0){step--;renderCook();}
    if(e.key==='ArrowRight'&&step<r.steps.length-1){step++;renderCook();}
  });
})();