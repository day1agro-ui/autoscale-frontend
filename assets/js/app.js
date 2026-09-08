
const state={cars:[],a:null,b:null,view:"side",layout:"stack"};
const $=s=>document.querySelector(s);

async function loadCars(){
 const r=await fetch("data/cars.json"); const d=await r.json();
 state.cars=d.cars; state.a=state.cars[0]; state.b=state.cars[1];
 fillSelects(); render();
}
function fillSelects(){
 ["carA","carB"].forEach((id,i)=>{
  const el=$("#"+id); el.innerHTML="";
  state.cars.forEach(c=>{const o=document.createElement("option");o.value=c.id;o.textContent=`${c.brand} ${c.model} · ${c.generation} · ${c.year}`;el.appendChild(o)});
  el.value=(i?state.b:state.a).id;
  el.onchange=e=>{state[i?"b":"a"]=state.cars.find(c=>c.id===e.target.value);render()}
 });
}
function visualPath(c,view){
 if(c.visual?.images?.[view]) return c.visual.images[view];
 const base=c.visual?.silhouette==="fallback"?"assets/silhouettes/fallback":`assets/silhouettes/${c.visual?.silhouette||"fallback"}`;
 return `${base}/${view}.svg`;
}
function pct(n,max){return Math.max(20,Math.min(92,n/max*92))}
function renderVisual(){
 const a=state.a,b=state.b, max=Math.max(a.dimensions.length,b.dimensions.length);
 const stage=$("#stage");stage.className="stage "+(state.layout==="overlay"?"overlay":"");
 const slot=(c,i)=>`<div class="car-slot"><div class="caption">${c.brand} ${c.model}</div><img class="car-image" style="width:${pct(c.dimensions.length,max)}%" src="${visualPath(c,state.view)}" onerror="this.src='assets/silhouettes/fallback/${state.view}.svg'"><div class="dimension">${c.dimensions.length} мм</div></div>`;
 stage.innerHTML=slot(a,0)+slot(b,1);
 $("#visualStatus").textContent=`✓ ${a.brand} ${a.model} длиннее на ${Math.abs(a.dimensions.length-b.dimensions.length)} мм.`;
}
function renderMetrics(){
 const keys=[["Длина","length"],["Ширина","width"],["Высота","height"],["Колёсная база","wheelbase"]];
 $("#metrics").innerHTML=keys.map(([n,k])=>`<div class="metric"><small>${n}</small><strong>${Math.abs(state.a.dimensions[k]-state.b.dimensions[k])} мм</strong><small>${state.a.dimensions[k]>=state.b.dimensions[k]?state.a.model:state.b.model} больше</small></div>`).join("");
 $("#bars").innerHTML=keys.map(([n,k])=>{let av=state.a.dimensions[k],bv=state.b.dimensions[k],m=Math.max(av,bv);return `<div class="bar-row"><header><span>${n}</span><span>${av} / ${bv} мм</span></header><div class="bar"><div class="fill" style="width:${av/m*100}%"></div></div><div class="bar"><div class="fill orange" style="width:${bv/m*100}%"></div></div></div>`}).join("");
 $("#table").innerHTML=`<tr><th>Характеристика</th><th>${state.a.brand} ${state.a.model}</th><th>${state.b.brand} ${state.b.model}</th></tr>`+keys.map(([n,k])=>`<tr><td>${n}</td><td>${state.a.dimensions[k]} мм</td><td>${state.b.dimensions[k]} мм</td></tr>`).join("")+`<tr><td>Год</td><td>${state.a.year}</td><td>${state.b.year}</td></tr><tr><td>Рынок</td><td>${state.a.market}</td><td>${state.b.market}</td></tr>`;
 $("#selected").innerHTML=[state.a,state.b].map(c=>`<div class="metric"><strong>${c.brand} ${c.model}</strong><small>Поколение: ${c.generation}</small><small>Год: ${c.year}</small><small>Рынок: ${c.market}</small><small>Размеры: ${c.dimensions.length} × ${c.dimensions.width} × ${c.dimensions.height} мм</small><small>Колёсная база: ${c.dimensions.wheelbase} мм</small></div>`).join("");
}
function render(){renderVisual();renderMetrics()}
document.addEventListener("click",e=>{
 const v=e.target.dataset.view,l=e.target.dataset.layout;
 if(v){state.view=v;document.querySelectorAll("[data-view]").forEach(x=>x.classList.toggle("active",x===e.target));renderVisual()}
 if(l){state.layout=l;document.querySelectorAll("[data-layout]").forEach(x=>x.classList.toggle("active",x===e.target));renderVisual()}
 if(e.target.id==="swap"){[state.a,state.b]=[state.b,state.a];fillSelects();render()}
 if(e.target.id==="copy"){navigator.clipboard?.writeText(location.href);e.target.textContent="Ссылка скопирована ✓";setTimeout(()=>e.target.textContent="Скопировать ссылку",1500)}
 if(e.target.id==="share"&&navigator.share){navigator.share({title:"AutoScale comparison",url:location.href})}
});
loadCars();
