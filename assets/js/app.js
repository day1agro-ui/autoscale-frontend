
const $=id=>document.getElementById(id);
const labels={length:"Длина",width:"Ширина",height:"Высота",wheelbase:"Колёсная база"};
const state={cars:[],target:1,selections:{1:null,2:null}};

function unique(a){return [...new Set(a.filter(Boolean))]}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function currentBrand(){return $("brand").value}
function currentModel(){return $("model").value}
function currentGeneration(){return $("generation").value}
function filtered(){return state.cars.filter(c=>c.brand===currentBrand()&&c.model===currentModel()&&c.generation===currentGeneration())}
function selected(){return state.cars.find(c=>c.id===$("version").value)||null}
function opt(v,t){return `<option value="${esc(v)}">${esc(t)}</option>`}

function loadBrands(){const a=unique(state.cars.map(c=>c.brand)).sort();$("brand").innerHTML=a.map(x=>opt(x,x)).join("");loadModels()}
function loadModels(){const a=unique(state.cars.filter(c=>c.brand===currentBrand()).map(c=>c.model)).sort();$("model").innerHTML=a.map(x=>opt(x,x)).join("");loadGenerations()}
function loadGenerations(){const a=unique(state.cars.filter(c=>c.brand===currentBrand()&&c.model===currentModel()).map(c=>c.generation));$("generation").innerHTML=a.map(x=>opt(x,x)).join("");loadVersions()}
function loadVersions(){const a=filtered();$("version").innerHTML=a.map(c=>opt(c.id,`${c.trim} · ${c.year}`)).join("");updateSummary()}
function updateSummary(){const c=selected();$("selectedSummary").innerHTML=c?`<strong>${state.target===1?"Первый":"Второй"} автомобиль:</strong> ${esc(c.brand)} ${esc(c.model)} · ${esc(c.generation)} · ${c.year}`:"Выберите автомобиль."}
function sync(c){if(!c)return;$("brand").value=c.brand;loadModels();$("model").value=c.model;loadGenerations();$("generation").value=c.generation;loadVersions();$("version").value=c.id;updateSummary()}
function setTarget(n){state.target=n;document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",+b.dataset.target===n));sync(state.selections[n])}
function apply(){const c=selected();if(c){state.selections[state.target]=c;render();updateUrl()}}
function carCard(c,n){const maxL=Math.max(...state.cars.map(x=>x.length));const maxH=Math.max(...state.cars.map(x=>x.height));const w=Math.max(48,Math.min(88,c.length/maxL*82));const h=Math.max(60,Math.min(110,c.height/maxH*100));return `<article class="car-card"><div class="car-head"><h3>${esc(c.brand)} ${esc(c.model)}</h3><div class="car-meta">${esc(c.generation)} · ${esc(c.years)}<br>${esc(c.trim)}</div></div><div class="car-visual"><div class="car-shape ${n===2?"orange-car":""}" style="width:${w}%;height:${h}px"></div><div class="dims"><span>${c.height} мм</span><span>${c.wheelbase} мм</span><span>${c.length} мм</span></div></div></article>`}
function about(c){return `<article class="car-card"><div class="car-head"><h3>${esc(c.brand)} ${esc(c.model)}</h3><div class="car-meta">Поколение: ${esc(c.generation)}<br>Год: ${c.year}<br>Версия: ${esc(c.trim)}<br>Кузов: ${esc(c.body)}<br>Размеры: ${c.length} × ${c.width} × ${c.height} мм<br>Колёсная база: ${c.wheelbase} мм</div></div></article>`}
function render(){
 const a=state.selections[1],b=state.selections[2]; if(!a||!b)return;
 $("carCards").innerHTML=carCard(a,1)+carCard(b,2);$("about").innerHTML=about(a)+about(b);
 const keys=["length","width","height","wheelbase"];
 $("diffGrid").innerHTML=keys.map(k=>{const d=Math.abs(a[k]-b[k]);const w=a[k]===b[k]?"Одинаково":a[k]>b[k]?`${a.brand} ${a.model}`:`${b.brand} ${b.model}`;return `<div class="diff"><span>${labels[k]}</span><b>${d} мм</b><small>${w==="Одинаково"?w:`Больше: ${esc(w)}`}</small></div>`}).join("");
 $("bars").innerHTML=keys.map(k=>{const m=Math.max(a[k],b[k]);return `<div class="barline"><b>${labels[k]}</b><div><div class="track"><div class="bar" style="width:${a[k]/m*100}%"></div></div><small>${a[k]} мм</small></div><div><div class="track"><div class="bar b" style="width:${b[k]/m*100}%"></div></div><small>${b[k]} мм</small></div></div>`}).join("");
 $("specTable").innerHTML=`<thead><tr><th>Характеристика</th><th>${esc(a.brand)} ${esc(a.model)}</th><th>${esc(b.brand)} ${esc(b.model)}</th></tr></thead><tbody>${keys.map(k=>`<tr><td>${labels[k]}</td><td>${a[k]} мм</td><td>${b[k]} мм</td></tr>`).join("")}<tr><td>Год</td><td>${a.year}</td><td>${b.year}</td></tr><tr><td>Поколение</td><td>${esc(a.generation)}</td><td>${esc(b.generation)}</td></tr><tr><td>Двигатель</td><td>${esc(a.engine)}</td><td>${esc(b.engine)}</td></tr><tr><td>Привод</td><td>${esc(a.drive)}</td><td>${esc(b.drive)}</td></tr></tbody>`;
 const maxL=Math.max(a.length,b.length),maxH=Math.max(a.height,b.height);
 $("combined").innerHTML=`<div class="scale-car blue" style="left:8%;width:${Math.max(28,a.length/maxL*44)}%;height:${Math.max(48,a.height/maxH*82)}px"></div><div class="scale-car orange" style="right:8%;width:${Math.max(28,b.length/maxL*44)}%;height:${Math.max(48,b.height/maxH*82)}px"></div>`;
 const longer=a.length===b.length?"автомобили одинаковой длины":a.length>b.length?`${a.brand} ${a.model} длиннее`:`${b.brand} ${b.model} длиннее`;
 $("verdict").textContent=`✓ ${longer}. Разница по длине: ${Math.abs(a.length-b.length)} мм.`;
}
function updateUrl(){const a=state.selections[1],b=state.selections[2];if(a&&b){history.replaceState(null,"",`${location.pathname}?a=${encodeURIComponent(a.id)}&b=${encodeURIComponent(b.id)}`)}}
function randomCompare(){let i=Math.floor(Math.random()*state.cars.length),j=Math.floor(Math.random()*state.cars.length);while(j===i)j=Math.floor(Math.random()*state.cars.length);state.selections[1]=state.cars[i];state.selections[2]=state.cars[j];setTarget(1);render();updateUrl()}
function search(q){q=q.trim().toLowerCase();if(!q)return;const c=state.cars.find(x=>`${x.brand} ${x.model} ${x.generation} ${x.year} ${x.trim}`.toLowerCase().includes(q));if(c){sync(c);state.selections[state.target]=c;render();updateUrl()}}
async function copyLink(){try{await navigator.clipboard.writeText(location.href);$("shareStatus").textContent="Ссылка скопирована"}catch{$("shareStatus").textContent="Не удалось скопировать ссылку"}}
async function nativeShare(){const a=state.selections[1],b=state.selections[2];const data={title:"AutoScale",text:`Сравнение ${a.brand} ${a.model} и ${b.brand} ${b.model}`,url:location.href};if(navigator.share){try{await navigator.share(data)}catch{}}else copyLink()}

async function init(){
 const r=await fetch("cars.json");state.cars=await r.json();$("status").innerHTML=`✓ Локальная база подключена · автомобилей: <strong>${state.cars.length}</strong>`;
 const p=new URLSearchParams(location.search),a=state.cars.find(c=>c.id===p.get("a")),b=state.cars.find(c=>c.id===p.get("b"));
 state.selections[1]=a||state.cars[0];state.selections[2]=b||state.cars[2]||state.cars[1];
 loadBrands();sync(state.selections[1]);render();
}
$("brand").addEventListener("change",loadModels);$("model").addEventListener("change",loadGenerations);$("generation").addEventListener("change",loadVersions);$("version").addEventListener("change",updateSummary);
$("applyBtn").onclick=apply;$("randomBtn").onclick=randomCompare;$("swapBtn").onclick=()=>{[state.selections[1],state.selections[2]]=[state.selections[2],state.selections[1]];sync(state.selections[state.target]);render();updateUrl()};
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>setTarget(+b.dataset.target));let timer;$("search").addEventListener("input",e=>{clearTimeout(timer);timer=setTimeout(()=>search(e.target.value),250)});
$("copyLink").onclick=copyLink;$("nativeShare").onclick=nativeShare;init();
