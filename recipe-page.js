(()=>{
const recipes=window.CompanionRecipes||[],acc=window.CompanionAccessoryInfo||{};const id=new URLSearchParams(location.search).get('id');const r=recipes.find(x=>x.id===id);const main=document.querySelector('#main');
function esc(s){return String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]))}
const pos={steam:'0% 0%',mixer:'50% 0%',beater:'100% 0%',kneading:'0% 100%',ultrablade:'50% 100%',fondxl:'100% 100%'};const sprite=id=>'<span class="acc-sprite" style="background-position:'+(pos[id]||'0% 0%')+'"></span>';
if(!r){main.innerHTML='<div class="section"><div class="source"><h2>A recept nem található.</h2></div></div>';throw new Error('recipe missing')}
document.title='Companion XL • '+r.title;document.querySelector('#back').onclick=()=>history.back();
if(r.sourceOnly){main.innerHTML='<section class="section"><div class="source"><div style="font-size:46px">📖</div><h1>'+esc(r.title)+'</h1><p>Ez a recept már szerepel a Companion XL teljes katalógusában. A részletes magyar hozzávalók és elkészítés feltöltése folyamatban van.</p></div></section>';return}
const favs=JSON.parse(localStorage.getItem('companion-favs')||'[]');const isFav=favs.includes(r.id);
main.innerHTML='<section class="hero"><div class="cover">'+(r.image?'<img src="assets/recipes/'+r.image+'" alt="'+esc(r.title)+'">':'')+'</div><div class="pad"><div class="titleRow"><div><h1>'+esc(r.title)+'</h1><button class="start-cook" id="startCook">▶ Főzés indítása</button></div><button class="fav" id="fav">'+(isFav?'♥':'♡')+'</button></div><div class="tags"><span class="tag">'+esc(r.cat)+'</span><span class="tag">👥 '+esc(r.servings||'—')+'</span><span class="tag">⏱ '+esc(r.total||'—')+'</span></div></div></section><section class="section"><h2>Companion tartozékok</h2><div class="accs">'+(r.accessories||[]).map(id=>'<div class="acc">'+sprite(id)+'<b>'+esc(acc[id]?.name||id)+'</b></div>').join('')+'</div></section><div class="layout"><section class="section"><h2>Hozzávalók</h2><ul class="ingredients">'+(r.ingredients||[]).map(x=>'<li>'+(x[0]?'<b>'+esc(x[0])+'</b> ':'')+esc(x[1])+'</li>').join('')+'</ul></section><section class="section"><h2>Elkészítés</h2><ol class="steps">'+(r.steps||[]).map((s,i)=>'<li>'+(r.stepAccessories?.[i]?'<div class="acc" style="display:inline-flex;margin-bottom:7px">'+sprite(r.stepAccessories[i])+'<b>'+esc(acc[r.stepAccessories[i]]?.name||'')+'</b></div><br>':'')+esc(s)+'</li>').join('')+'</ol>'+(r.program?'<div class="program"><b>Companion-beállítások</b><br>'+r.program.map(esc).join('<br>')+'</div>':'')+(r.note?'<div class="program"><b>Tipp</b><br>'+esc(r.note)+'</div>':'')+'</section></div>
document.querySelector('#fav').onclick=()=>{const next=new Set(JSON.parse(localStorage.getItem('companion-favs')||'[]'));next.has(r.id)?next.delete(r.id):next.add(r.id);localStorage.setItem('companion-favs',JSON.stringify([...next]));document.querySelector('#fav').textContent=next.has(r.id)?'♥':'♡'};

// --- Vezetett főzés mód ---
const cookStyle=document.createElement('style');
cookStyle.textContent=`
.start-cook{display:inline-flex;align-items:center;gap:7px;margin-top:13px;border:0;border-radius:14px;background:var(--green);color:#fff;padding:12px 15px;font-size:14px;font-weight:800;cursor:pointer;box-shadow:0 7px 18px rgba(47,111,78,.18)}
.start-cook:hover{filter:brightness(.97)}
.cook-screen{position:fixed;inset:0;z-index:200;background:#102017;color:#fff;display:none;flex-direction:column}
.cook-screen.show{display:flex}
.cook-top{display:flex;align-items:center;justify-content:space-between;padding:15px 18px;border-bottom:1px solid rgba(255,255,255,.1)}
.cook-top-title{font-weight:800;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:10px}
.cook-close{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:#fff;border-radius:12px;width:40px;height:40px;font-size:18px;cursor:pointer}
.cook-body{flex:1;display:flex;align-items:center;justify-content:center;overflow:auto;padding:24px 18px}
.cook-card{width:min(700px,100%);text-align:center}
.cook-count{font-size:13px;color:rgba(255,255,255,.62);font-weight:700}
.cook-step-title{font-size:30px;line-height:1.12;margin:9px 0 20px}
.cook-text{font-size:18px;line-height:1.65;color:rgba(255,255,255,.92);margin:0 auto;max-width:650px;white-space:pre-wrap}
.cook-tool{display:flex;justify-content:center;align-items:center;gap:10px;margin:24px 0 20px}
.cook-tool .acc-sprite{width:58px;height:50px;border-radius:12px;background-color:#fff}
.cook-program{margin:0 auto 22px;max-width:650px;padding:11px 13px;border-radius:13px;background:rgba(255,255,255,.08);color:rgba(255,255,255,.72);font-size:12px;line-height:1.5}
.cook-progress{height:7px;background:rgba(255,255,255,.12);border-radius:99px;overflow:hidden;margin:25px 0}
.cook-progress span{display:block;height:100%;width:0;background:#fff;border-radius:99px;transition:width .2s}
.cook-actions{display:flex;gap:9px}
.cook-actions button{flex:1;border:0;border-radius:14px;padding:14px;font-weight:800;font-size:14px;cursor:pointer}
.cook-prev{background:rgba(255,255,255,.1);color:#fff}
.cook-next{background:#fff;color:#153b27}
`;
document.head.appendChild(cookStyle);

const cook=document.createElement('div');
cook.className='cook-screen';
cook.innerHTML='<div class="cook-top"><div class="cook-top-title">'+esc(r.title)+'</div><button class="cook-close" aria-label="Bezárás">✕</button></div><div class="cook-body"><div class="cook-card"><div class="cook-count"></div><div class="cook-step-title"></div><p class="cook-text"></p><div class="cook-tool"></div><div class="cook-program"></div><div class="cook-progress"><span></span></div><div class="cook-actions"><button class="cook-prev">Előző</button><button class="cook-next">Következő</button></div></div></div>';
document.body.appendChild(cook);

let cookStep=0;
const cookCount=cook.querySelector('.cook-count');
const cookTitle=cook.querySelector('.cook-step-title');
const cookText=cook.querySelector('.cook-text');
const cookTool=cook.querySelector('.cook-tool');
const cookProgram=cook.querySelector('.cook-program');
const cookBar=cook.querySelector('.cook-progress span');
const prevBtn=cook.querySelector('.cook-prev');
const nextBtn=cook.querySelector('.cook-next');

function renderCook(){
 const total=(r.steps||[]).length;
 cookCount.textContent='Lépés '+(cookStep+1)+' / '+total;
 cookTitle.textContent='Lépés '+(cookStep+1);
 cookText.textContent=r.steps[cookStep]||'';
 const aid=r.stepAccessories?.[cookStep]||r.accessories?.[0];
 cookTool.innerHTML=aid?'<div>'+sprite(aid)+'</div><b>'+esc(acc[aid]?.name||aid)+'</b>':'';
 cookProgram.innerHTML=r.program?.[cookStep]?'<b>Companion-beállítás</b><br>'+esc(r.program[cookStep]):'';
 cookProgram.style.display=r.program?.[cookStep]?'block':'none';
 cookBar.style.width=((cookStep+1)/Math.max(total,1)*100)+'%';
 prevBtn.disabled=cookStep===0;
 prevBtn.style.opacity=cookStep===0?'.4':'1';
 nextBtn.textContent=cookStep===total-1?'Kész':'Következő';
}
function openCook(){
 if(!(r.steps||[]).length)return;
 cookStep=0;
 renderCook();
 cook.classList.add('show');
 document.body.style.overflow='hidden';
}
function closeCook(){
 cook.classList.remove('show');
 document.body.style.overflow='';
}
document.querySelector('#startCook').onclick=openCook;
cook.querySelector('.cook-close').onclick=closeCook;
prevBtn.onclick=()=>{if(cookStep>0){cookStep--;renderCook()}};
nextBtn.onclick=()=>{if(cookStep<(r.steps.length-1)){cookStep++;renderCook()}else closeCook()};
document.addEventListener('keydown',e=>{
 if(!cook.classList.contains('show'))return;
 if(e.key==='Escape')closeCook();
 if(e.key==='ArrowLeft'&&cookStep>0){cookStep--;renderCook()}
 if(e.key==='ArrowRight'&&cookStep<r.steps.length-1){cookStep++;renderCook()}
});

})();