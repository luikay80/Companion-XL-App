(function(){
  var main=document.getElementById('main');

  function esc(s){
    return String(s==null?'':s).replace(/[&<>"']/g,function(m){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
    });
  }

  try{
    var recipes=window.CompanionRecipes || [];
    var accessories=window.CompanionAccessoryInfo || {};
    var params=new URLSearchParams(window.location.search);
    var id=params.get('id');
    var recipe=null;
    var i;

    for(i=0;i<recipes.length;i++){
      if(String(recipes[i].id)===String(id)){
        recipe=recipes[i];
        break;
      }
    }

    if(!main) throw new Error('A #main elem nem található.');
    if(!recipe){
      main.innerHTML='<section class="section"><div class="source"><h2>A recept nem található.</h2><p>Azonosító: '+esc(id)+'</p></div></section>';
      return;
    }

    document.title='Companion XL • '+recipe.title;

    var back=document.getElementById('back');
    if(back) back.onclick=function(){history.back();};

    if(recipe.sourceOnly){
      main.innerHTML='<section class="section"><div class="source"><div style="font-size:46px">📖</div><h1>'+esc(recipe.title)+'</h1><p>Ez a recept már szerepel a Companion XL katalógusában. A teljes magyar recept még nincs feltöltve.</p></div></section>';
      return;
    }

    var favs=[];
    try{favs=JSON.parse(localStorage.getItem('companion-favs')||'[]');}catch(e){favs=[];}
    var isFav=favs.indexOf(recipe.id)!==-1;

    var positions={
      steam:'0% 0%',
      mixer:'50% 0%',
      beater:'100% 0%',
      kneading:'0% 100%',
      ultrablade:'50% 100%',
      fondxl:'100% 100%'
    };

    function sprite(aid){
      return '<span class="acc-sprite" style="background-position:'+(positions[aid]||'0% 0%')+'"></span>';
    }

    var ingredientHtml='';
    (recipe.ingredients||[]).forEach(function(x){
      var amount=Array.isArray(x)?x[0]:'';
      var name=Array.isArray(x)?x[1]:x;
      ingredientHtml+='<li>'+(amount?'<b>'+esc(amount)+'</b> ':'')+esc(name)+'</li>';
    });

    var stepHtml='';
    (recipe.steps||[]).forEach(function(step,index){
      var aid=recipe.stepAccessories&&recipe.stepAccessories[index];
      stepHtml+='<li><span class="step-num">'+(index+1)+'</span><div class="step-content">';
      if(aid){
        stepHtml+='<div class="step-acc">'+sprite(aid)+'<span>'+esc(accessories[aid]?accessories[aid].name:aid)+'</span></div>';
      }
      stepHtml+='<div class="step-text">'+esc(String(step).replace(/^\s*\d+\.\s*/,''))+'</div></div></li>';
    });

    var accessoryHtml='';
    (recipe.accessories||[]).forEach(function(aid){
      accessoryHtml+='<div class="acc">'+sprite(aid)+'<b>'+esc(accessories[aid]?accessories[aid].name:aid)+'</b></div>';
    });

    main.innerHTML=
      '<section class="hero">'+
        (recipe.image?'<div class="cover"><img src="assets/recipes/'+esc(recipe.image)+'" alt="'+esc(recipe.title)+'"></div>':'')+
        '<div class="pad"><div class="titleRow"><div>'+
          '<h1>'+esc(recipe.title)+'</h1>'+
          '<button class="start-cook" id="startCook" type="button">▶ Főzés indítása</button>'+
        '</div><button class="fav" id="fav" type="button">'+(isFav?'♥':'♡')+'</button></div>'+
        '<div class="tags">'+
          '<span class="tag">'+esc(recipe.cat||'')+'</span>'+
          '<span class="tag">👥 '+esc(recipe.servings||'—')+'</span>'+
          '<span class="tag">⏱ '+esc(recipe.total||'—')+'</span>'+
        '</div></div>'+
      '</section>'+
      '<section class="section"><h2>Companion tartozékok</h2><div class="accs">'+accessoryHtml+'</div></section>'+
      '<div class="layout">'+
        '<section class="section"><h2>Hozzávalók</h2><ul class="ingredients">'+ingredientHtml+'</ul></section>'+
        '<section class="section"><h2>Elkészítés</h2><ol class="steps">'+stepHtml+'</ol>'+
          (recipe.program?'<div class="program"><b>Companion-beállítások</b><br>'+recipe.program.map(esc).join('<br>')+'</div>':'')+
          (recipe.note?'<div class="program"><b>Tipp</b><br>'+esc(recipe.note)+'</div>':'')+
        '</section>'+
      '</div>';

    document.getElementById('fav').onclick=function(){
      var next=[];
      try{next=JSON.parse(localStorage.getItem('companion-favs')||'[]');}catch(e){next=[];}
      var p=next.indexOf(recipe.id);
      if(p===-1) next.push(recipe.id); else next.splice(p,1);
      localStorage.setItem('companion-favs',JSON.stringify(next));
      document.getElementById('fav').textContent=next.indexOf(recipe.id)!==-1?'♥':'♡';
    };

    var style=document.createElement('style');
    style.textContent=
      '.start-cook{display:inline-flex;align-items:center;gap:7px;margin-top:13px;border:0;border-radius:14px;background:var(--green);color:#fff;padding:12px 15px;font-size:14px;font-weight:800;cursor:pointer;box-shadow:0 7px 18px rgba(47,111,78,.18)}'+
      '.cook-screen{position:fixed;inset:0;z-index:200;background:#102017;color:#fff;display:none;flex-direction:column}'+
      '.cook-screen.show{display:flex}'+
      '.cook-top{display:flex;align-items:center;justify-content:space-between;padding:15px 18px;border-bottom:1px solid rgba(255,255,255,.1)}'+
      '.cook-top-title{font-weight:800;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:10px}'+
      '.cook-close{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:#fff;border-radius:12px;width:40px;height:40px;font-size:18px;cursor:pointer}'+
      '.cook-body{flex:1;display:flex;align-items:center;justify-content:center;overflow:auto;padding:24px 18px}'+
      '.cook-card{width:min(700px,100%);text-align:center}'+
      '.cook-count{font-size:13px;color:rgba(255,255,255,.62);font-weight:700}'+
      '.cook-step-title{font-size:30px;line-height:1.12;margin:9px 0 20px}'+
      '.cook-text{font-size:18px;line-height:1.65;color:rgba(255,255,255,.92);margin:0 auto;max-width:650px;white-space:pre-wrap}'+
      '.cook-tool{display:flex;justify-content:center;align-items:center;gap:10px;margin:24px 0 20px}'+
      '.cook-tool .acc-sprite{width:58px;height:50px;border-radius:12px;background-color:#fff}'+
      '.cook-program{margin:0 auto 22px;max-width:650px;padding:11px 13px;border-radius:13px;background:rgba(255,255,255,.08);color:rgba(255,255,255,.72);font-size:12px;line-height:1.5}'+
      '.cook-progress{height:7px;background:rgba(255,255,255,.12);border-radius:99px;overflow:hidden;margin:25px 0}'+
      '.cook-progress span{display:block;height:100%;width:0;background:#fff;border-radius:99px}'+
      '.cook-actions{display:flex;gap:9px}'+
      '.cook-actions button{flex:1;border:0;border-radius:14px;padding:14px;font-weight:800;font-size:14px;cursor:pointer}'+
      '.cook-prev{background:rgba(255,255,255,.1);color:#fff}'+
      '.cook-next{background:#fff;color:#153b27}'+
      '@media(max-width:560px){.cook-step-title{font-size:24px}.cook-text{font-size:16px;line-height:1.55}.cook-body{padding:20px 15px}}';
    document.head.appendChild(style);

    var cook=document.createElement('div');
    cook.className='cook-screen';
    cook.innerHTML=
      '<div class="cook-top"><div class="cook-top-title">'+esc(recipe.title)+'</div><button class="cook-close" type="button">✕</button></div>'+
      '<div class="cook-body"><div class="cook-card">'+
        '<div class="cook-count"></div>'+
        '<div class="cook-step-title"></div>'+
        '<p class="cook-text"></p>'+
        '<div class="cook-tool"></div>'+
        '<div class="cook-program"></div>'+
        '<div class="cook-progress"><span></span></div>'+
        '<div class="cook-actions"><button class="cook-prev" type="button">Előző</button><button class="cook-next" type="button">Következő</button></div>'+
      '</div></div>';
    document.body.appendChild(cook);

    var step=0;
    var countEl=cook.querySelector('.cook-count');
    var stepTitle=cook.querySelector('.cook-step-title');
    var textEl=cook.querySelector('.cook-text');
    var toolEl=cook.querySelector('.cook-tool');
    var programEl=cook.querySelector('.cook-program');
    var bar=cook.querySelector('.cook-progress span');
    var prev=cook.querySelector('.cook-prev');
    var next=cook.querySelector('.cook-next');

    function renderCook(){
      var total=(recipe.steps||[]).length;
      countEl.textContent='Lépés '+(step+1)+' / '+total;
      stepTitle.textContent='Lépés '+(step+1);
      textEl.textContent=recipe.steps[step]||'';
      var aid=recipe.stepAccessories&&recipe.stepAccessories[step];
      if(!aid && recipe.accessories&&recipe.accessories.length) aid=recipe.accessories[0];
      toolEl.innerHTML=aid?'<span>'+sprite(aid)+'</span><b>'+esc(accessories[aid]?accessories[aid].name:aid)+'</b>':'';
      if(recipe.program&&recipe.program[step]){
        programEl.innerHTML='<b>Companion-beállítás</b><br>'+esc(recipe.program[step]);
        programEl.style.display='block';
      }else{
        programEl.innerHTML='';
        programEl.style.display='none';
      }
      bar.style.width=((step+1)/Math.max(total,1)*100)+'%';
      prev.disabled=step===0;
      prev.style.opacity=step===0?'.4':'1';
      next.textContent=step===total-1?'Kész':'Következő';
    }

    function closeCook(){
      cook.classList.remove('show');
      document.body.style.overflow='';
    }

    document.getElementById('startCook').onclick=function(){
      if(!recipe.steps || !recipe.steps.length) return;
      step=0;
      renderCook();
      cook.classList.add('show');
      document.body.style.overflow='hidden';
    };

    cook.querySelector('.cook-close').onclick=closeCook;
    prev.onclick=function(){if(step>0){step--;renderCook();}};
    next.onclick=function(){if(step<recipe.steps.length-1){step++;renderCook();}else{closeCook();}};

  }catch(error){
    if(main){
      main.innerHTML='<section class="section"><div class="source"><h2>Hiba történt a recept betöltésekor.</h2><p>'+esc(error&&error.message?error.message:String(error))+'</p></div></section>';
    }
    console.error('Companion XL recipe page:',error);
  }
})();