(function(){
try{
  const input=document.querySelector('#q');
  const box=document.querySelector('#liveResults');
  if(!input || !box) return;

  const source=window.CompanionRecipes || window.catalog || [];
  const norm=value=>String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLowerCase();

  const searchText=r=>norm([
    r.title,
    r.cat,
    ...(r.ingredients || []).flatMap(x=>Array.isArray(x) ? x : [x]),
    ...(r.steps || [])
  ].join(' '));

  const escapeHtml=value=>String(value ?? '').replace(/[&<>"']/g, ch=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));

  const render=()=>{
    const q=norm(input.value.trim());

    if(!q){
      box.classList.remove('show');
      box.innerHTML='';
      return;
    }

    const hits=source.filter(r=>searchText(r).includes(q)).slice(0,10);

    if(!hits.length){
      box.innerHTML='<div class="live-empty">Nincs találat.</div>';
    } else {
      box.innerHTML=hits.map(r=>{
        const ingredients=(r.ingredients || [])
          .slice(0,3)
          .map(x=>Array.isArray(x) ? x[1] : x)
          .join(', ');

        return '<button class="live-item" type="button" data-id="'+
          escapeHtml(r.id)+
          '"><span class="live-thumb">'+
          (r.image
            ? '<img src="assets/recipes/'+escapeHtml(r.image)+'" alt="">'
            : '<span>📖</span>')+
          '</span><span class="live-copy"><span class="live-title">'+
          escapeHtml(r.title)+
          '</span><span class="live-meta">'+
          escapeHtml(r.cat || '')+
          (ingredients ? ' · '+escapeHtml(ingredients) : '')+
          '</span></span></button>';
      }).join('');
    }

    box.classList.add('show');

    box.querySelectorAll('.live-item').forEach(item=>{
      item.addEventListener('click',()=>{
        location.href='recipe.html?id='+encodeURIComponent(item.dataset.id);
      });
    });
  };

  input.addEventListener('input',render);
  input.addEventListener('focus',render);

  document.addEventListener('click',event=>{
    if(!event.target.closest('.search-wrap')){
      box.classList.remove('show');
    }
  });

  window.CompanionLiveSearch={render};
} catch(error){
  console.error('Companion live search error:',error);
}
})();