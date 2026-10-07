(() => {
  'use strict';
  const number='5519991460922';
  const normalize=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
  const makeWhatsApp=(name,quantity='')=>'https://wa.me/'+number+'?text='+encodeURIComponent(`Olá, Zani! Vi o catálogo no site e gostaria de comprar:\n\nProduto: ${name}${quantity?'\nQuantidade desejada: '+quantity:''}\n\nPode me informar o valor${name==='Filé de peixe panga premium'?' por kg':''} e a disponibilidade?`);
  const toggle=document.querySelector('.mobile-toggle');
  const nav=document.getElementById('main-nav');
  function closeMenu(){toggle?.setAttribute('aria-expanded','false');nav?.classList.remove('is-open');document.querySelector('.catalog-menu')?.removeAttribute('open');}
  toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');nav.classList.toggle('is-open',open);});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
  document.addEventListener('click',event=>{if(!event.target.closest('.site-header'))closeMenu();});
  document.querySelectorAll('.product-card').forEach(card=>{
    const select=card.querySelector('.quantity-choice');
    const input=card.querySelector('.quantity-text');
    const custom=card.querySelector('.custom-quantity');
    const link=card.querySelector('.buy-product');
    const update=()=>{
      const value=select?.value||'';
      if(custom)custom.hidden=value!=='custom';
      const quantity=select?(value==='custom'?input.value.trim():value):input.value.trim();
      link.href=makeWhatsApp(card.dataset.name,quantity);
    };
    select?.addEventListener('change',()=>{update();if(select.value==='custom')input.focus();});
    input?.addEventListener('input',update);
    link.addEventListener('click',update);
  });
  const grid=document.getElementById('catalog-grid');
  if(!grid)return;
  const cards=Array.from(grid.querySelectorAll('.product-card'));
  const search=document.getElementById('product-search');
  const sort=document.getElementById('product-sort');
  const count=document.getElementById('result-count');
  const shown=document.getElementById('shown-count');
  const empty=document.getElementById('empty-state');
  const more=document.getElementById('load-more');
  let limit=12;
  function render(reset=false){
    if(reset)limit=12;
    const query=normalize(search.value);
    const matching=cards.filter(card=>normalize(card.dataset.name).includes(query)).sort((a,b)=>a.dataset.name.localeCompare(b.dataset.name,'pt-BR')*(sort.value==='desc'?-1:1));
    cards.forEach(card=>{card.hidden=true;});
    matching.forEach((card,index)=>{grid.appendChild(card);card.hidden=index>=limit;});
    count.textContent=matching.length+' '+(matching.length===1?'produto':'produtos');
    shown.textContent=matching.length?'Mostrando '+Math.min(limit,matching.length)+' de '+matching.length+' produtos':'';
    empty.hidden=matching.length!==0;
    more.hidden=matching.length<=limit;
  }
  search.addEventListener('input',()=>render(true));
  sort.addEventListener('change',()=>render(true));
  more.addEventListener('click',()=>{const previousLimit=limit;limit+=12;render();const firstNew=Array.from(grid.children).filter(c=>!c.hidden)[previousLimit];if(firstNew){firstNew.setAttribute('tabindex','-1');firstNew.focus({preventScroll:true});}});
  document.getElementById('clear-search').addEventListener('click',()=>{search.value='';render(true);search.focus();});
  render();
})();
