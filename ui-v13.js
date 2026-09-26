(function(){
const topCategory=c=>c.startsWith('Főételek /')?'Főételek':c.startsWith('Desszertek /')?'Desszertek':c;
const order=['Alapreceptek','Aperitifek','Előételek','Levesek','Főételek','Köretek','Kenyerek, briósok, sós sütemények','Szószok','Desszertek','Italok','Gyerekreceptek','Gluténmentes'];
const imgs={Alapreceptek:'gougeres.jpg',Aperitifek:'guacamole.jpg',Előételek:'salmon.jpg',Levesek:'pumpkin.jpg',Főételek:'samosas.jpg',Köretek:'zucchini.jpg','Kenyerek, briósok, sós sütemények':'scones.jpg',Szószok:'houmous.jpg',Desszertek:'scones.jpg',Italok:'salmon.jpg',Gyerekreceptek:'pumpkin.jpg',Gluténmentes:'zucchini.jpg'};
function drawCategories(){
 const counts={};recipes.forEach(r=>{const c=topCategory(r.cat);counts[c]=(counts[c]||0)+1});
 const el=document.querySelector('#categoryGrid');if(!el)return;
 el.innerHTML=order.map(c=>'<article class="category-card" data-cat="'+esc(c)+'"><div class="cat-art"><img src="assets/recipes/'+imgs[c]+'" alt="'+esc(c)+'"></div><div class="cat-info"><strong>'+esc(c)+'</strong><small>'+String(counts[c]||0)+' recept</small></div></article>').join('');
 el.querySelectorAll('.category-card').forEach(card=>card.onclick=()=>showTop(card.dataset.cat));
}
function showTop(name){
 const list=recipes.filter(r=>topCategory(r.cat)===name);
 document.querySelector('#count').textContent=list.length+' recept';
 document.querySelector('#sub').textContent=list.length+' recept';
 document.querySelector('#grid').innerHTML=list.map(r=>'<article class="card" data-id="'+r.id+'"><div class="art">'+(r.image?'<img src="'+recipeImg(r)+'" alt="'+esc(r.title)+'">':'<div class="art-placeholder"><span>📖</span><small>Az eredeti recept fotója</small></div>')+'</div><div class="card-body"><button class="heart" data-heart="'+r.id+'">♡</button><h4>'+esc(r.title)+'</h4><div class="meta"><span>👥 '+esc(r.servings||'—')+'</span><span>⏱ '+esc(r.total||'—')+'</span></div></div></article>').join('');
 document.querySelectorAll('.card').forEach(c=>c.onclick=()=>openDetail(c.dataset.id));
 document.querySelector('#grid').scrollIntoView({behavior:'smooth'});
}
drawCategories();
document.querySelector('#allCats')?.addEventListener('click',()=>document.querySelector('#categoryGrid')?.scrollIntoView({behavior:'smooth'}));
document.querySelector('#navHome')?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
document.querySelector('#navRecipes')?.addEventListener('click',()=>document.querySelector('#grid')?.scrollIntoView({behavior:'smooth'}));
document.querySelector('#navCats')?.addEventListener('click',()=>document.querySelector('#categoryGrid')?.scrollIntoView({behavior:'smooth'}));
document.querySelector('#navFav')?.addEventListener('click',()=>{state.cat='Kedvencek';render();document.querySelector('#grid')?.scrollIntoView({behavior:'smooth'})});
})();