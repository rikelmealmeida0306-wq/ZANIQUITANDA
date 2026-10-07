import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const {products,categories}=JSON.parse(fs.readFileSync('catalog.json','utf8'));
const routes=['','categorias','hortifruti',...categories.map(c=>c.id),'nossa-historia','contato'];
const decode=s=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const errors=[];
let links=0,missingImages=new Set();
for(const route of routes){
 const file=path.join('dist',route,'index.html');
 assert(fs.existsSync(file),'Missing route '+route);
 const html=fs.readFileSync(file,'utf8');
 assert(html.includes('lang="pt-BR"'));
 assert(html.includes('<meta name="description"'));
 assert(html.includes('<title>')&&!html.includes('Starter'));
 const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(ids.length,new Set(ids).size,'Duplicate HTML IDs: '+route);
 for(const m of html.matchAll(/\ssrc="([^"]+)"/g)){
  if(m[1].startsWith('/')){const local='dist'+m[1];if(!fs.existsSync(local))missingImages.add(m[1]);else if(m[1].endsWith('.webp')){const bytes=fs.readFileSync(local);if(bytes.length<12||bytes.subarray(0,4).toString()!=='RIFF'||bytes.subarray(8,12).toString()!=='WEBP')missingImages.add(m[1]);}}
 }
 for(const m of html.matchAll(/href="([^"]+)"/g)){
  const href=decode(m[1]);
  if(href.startsWith('/')){
   const clean=href.split('#')[0]||'/';
   assert(fs.existsSync('dist'+clean)||fs.existsSync(path.join('dist',clean,'index.html')),'Missing local link '+href+' in '+route);
  }
  if(href.startsWith('https://wa.me/')){assert.equal(new URL(href).pathname,'/5519991460922');links++;}
 }
 const cardHtml=[...html.matchAll(/<article class="product-card"[\s\S]*?<\/article>/g)];
 for(const [card] of cardHtml){
  const id=card.match(/data-id="([^"]+)"/)[1];
  const p=products.find(p=>p.id===id);
  assert(p,'Unrecognized product '+id);
  assert.equal(decode(card.match(/data-name="([^"]+)"/)[1]),p.name);
  const href=decode(card.match(/class="btn btn-green buy-product" href="([^"]+)"/)[1]);
  assert(new URL(href).searchParams.get('text').includes('Produto: '+p.name));
  assert(card.includes(p.image));
  assert(card.includes(decode(p.description)));
 }
 if(categories.some(c=>c.id===route)){
  const expected=products.filter(p=>p.category===route||p.additionalCategories.includes(route));
  assert.equal(cardHtml.length,expected.length,'Category count '+route);
 }
}
assert.equal(products.length,181);
assert.equal(new Set(products.map(p=>p.id)).size,181);
assert.equal(new Set(products.map(p=>p.image)).size,181);
assert.equal(products.filter(p=>p.name==='Shiitake').length,1);
assert(products.find(p=>p.name==='Shiitake').additionalCategories.includes('linha-japonesa'));
assert(!products.some(p=>'price' in p||'stock' in p));
class Element{
 constructor(attrs={}){Object.assign(this,attrs);this.events={};this.hidden=false;this.value=this.value||'';this.classList={remove(){},toggle(){}};}
 addEventListener(type,fn){this.events[type]=fn;}
 fire(type){this.events[type]?.({target:this});}
 setAttribute(key,value){this[key]=value;}
 getAttribute(key){return this[key];}
 removeAttribute(key){delete this[key];}
 focus(){}
}
const makeCard=p=>{
 const c=new Element({dataset:{name:p.name,id:p.id},fields:{}});
 c.fields['.quantity-choice']=p.quantityOptions.length?new Element():null;
 c.fields['.quantity-text']=new Element();
 c.fields['.custom-quantity']=p.quantityOptions.length?new Element():null;
 c.fields['.buy-product']=new Element();
 c.querySelector=s=>c.fields[s]||null;
 return c;
};
const testProducts=['file-de-peixe-panga-premium','alecrim','ovos-brancos','maca-gala','maca-verde'].map(id=>products.find(p=>p.id===id));
const cards=testProducts.map(makeCard);
const els=Object.fromEntries(['product-search','product-sort','result-count','shown-count','empty-state','load-more','clear-search'].map(id=>[id,new Element()]));
els['product-sort'].value='asc';
const grid=new Element({children:[...cards]});
grid.querySelectorAll=()=>cards;
grid.appendChild=c=>{grid.children=grid.children.filter(x=>x!==c);grid.children.push(c);};
els['catalog-grid']=grid;
const document={querySelector:()=>null,querySelectorAll:selector=>selector==='.product-card'?cards:[],getElementById:id=>els[id]||null,addEventListener(){}};
vm.runInNewContext(fs.readFileSync('dist/app.js','utf8'),{document,console});
const panga=cards[0];
panga.fields['.quantity-choice'].value='1 kg';panga.fields['.quantity-choice'].fire('change');
assert(new URL(panga.fields['.buy-product'].href).searchParams.get('text').includes('Quantidade desejada: 1 kg'));
assert(new URL(panga.fields['.buy-product'].href).searchParams.get('text').includes('valor por kg'));
panga.fields['.quantity-choice'].value='custom';panga.fields['.quantity-choice'].fire('change');panga.fields['.quantity-text'].value='750 g';panga.fields['.quantity-text'].fire('input');
assert.equal(panga.fields['.custom-quantity'].hidden,false);
assert(new URL(panga.fields['.buy-product'].href).searchParams.get('text').includes('Quantidade desejada: 750 g'));
panga.fields['.quantity-choice'].value='';panga.fields['.quantity-choice'].fire('change');
assert(!new URL(panga.fields['.buy-product'].href).searchParams.get('text').includes('Quantidade desejada:'));
const eggs=cards[2];eggs.fields['.quantity-text'].value='Uma bandeja, qual a quantidade?';eggs.fields['.quantity-text'].fire('input');assert(new URL(eggs.fields['.buy-product'].href).searchParams.get('text').includes('Uma bandeja, qual a quantidade?'));
els['product-search'].value='MACA';els['product-search'].fire('input');assert.equal(els['result-count'].textContent,'2 produtos');assert.equal(cards.filter(c=>!c.hidden).length,2);
els['product-search'].value='zzz';els['product-search'].fire('input');assert.equal(els['empty-state'].hidden,false);
els['clear-search'].fire('click');assert.equal(els['result-count'].textContent,'5 produtos');
els['product-sort'].value='desc';els['product-sort'].fire('change');assert.equal(grid.children[0].dataset.name,'Ovos brancos');
console.log(JSON.stringify({routes:routes.length,products:products.length,whatsappLinks:links,interactionChecks:'passed',missingImages:missingImages.size}));
if(missingImages.size){if(process.argv.includes('--allow-pending-images'))console.log('Images awaiting generation: '+missingImages.size);else throw new Error('Missing '+missingImages.size+' required product images.');}
