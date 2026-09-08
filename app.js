let cars=[], selectedA="honda-vezel-ru1-2015", selectedB="vw-tcross-2021", view="side", layout="stack";
const $=s=>document.querySelector(s);
const params=new URLSearchParams(location.search);
selectedA=params.get("a")||selectedA; selectedB=params.get("b")||selectedB;

async function init(){
  cars=await fetch("data/cars.json").then(r=>r.json()).catch(()=>[]);
  if(!cars.length){document.body.innerHTML="<h1>Не удалось загрузить data/cars.json</h1>";return}
  fillSelects(); bind(); render();
}
function title(c){return `${c.brand} ${c.model} · ${c.generation} · ${c.year}`}
function fillSelect(select, filter=""){
  const current=select.id==="carA"?selectedA:selectedB;
  const q=filter.toLowerCase();
  select.innerHTML=cars.filter(c=>title(c).toLowerCase().includes(q))
    .map(c=>`<option value="${c.id}" ${c.id===current?"selected":""}>${title(c)}</option>`).join("");
}
function fillSelects(){fillSelect($("#carA"));fillSelect($("#carB"))}
function get(id){return cars.find(c=>c.id===id)}
function info(c){return `${c.market} · ${c.trim} · ${c.yearFrom}–${c.yearTo}`}
function bind(){
  $("#carA").onchange=e=>{selectedA=e.target.value;render()};
  $("#carB").onchange=e=>{selectedB=e.target.value;render()};
  $("#searchA").oninput=e=>fillSelect($("#carA"),e.target.value);
  $("#searchB").oninput=e=>fillSelect($("#carB"),e.target.value);
  $("#swapBtn").onclick=()=>{[selectedA,selectedB]=[selectedB,selectedA];fillSelects();render()};
  document.querySelectorAll("#viewTabs button").forEach(b=>b.onclick=()=>{view=b.dataset.view;setActive("#viewTabs",b);render()});
  document.querySelectorAll("#layoutTabs button").forEach(b=>b.onclick=()=>{layout=b.dataset.layout;setActive("#layoutTabs",b);render()});
  $("#copyBtn").onclick=copyLink; $("#nativeShareBtn").onclick=share;
}
function setActive(parent,b){document.querySelectorAll(parent+" button").forEach(x=>x.classList.remove("active"));b.classList.add("active")}
function value(c,key){return c[key]}
function stage(c,index,max){
  const dim=view==="side"?"length":view==="front"?"width":"length";
  const secondary=view==="side"?"height":view==="front"?"height":"width";
  const ratio=Math.max(.55,value(c,dim)/max);
  const ratio2=Math.max(.5,value(c,secondary)/Math.max(...[get(selectedA)[secondary],get(selectedB)[secondary]]));
  const color=index===0?"#83a9d0":"#ff9b73";
  return `<div class="car-stage"><span class="label">${c.brand} ${c.model}</span>
  <div class="shape ${view}" style="width:${view==='top'?42:ratio*78}%;height:${view==='top'?ratio*76:ratio2*52}%;background:${color}">
  ${view==="side"?'<i class="wheel w1"></i><i class="wheel w2"></i>':""}</div>
  <span class="measure">${value(c,dim)} мм</span></div>`;
}
function render(){
 const a=get(selectedA),b=get(selectedB); if(!a||!b)return;
 $("#infoA").textContent=info(a);$("#infoB").textContent=info(b);
 const key=view==="side"?"length":view==="front"?"width":"length";
 const max=Math.max(a[key],b[key]);
 $("#visual").className="visual "+layout;
 $("#visual").innerHTML=stage(a,0,max)+stage(b,1,max);
 const diff=a.length-b.length, abs=Math.abs(diff), pct=(abs/(diff>=0?b.length:a.length)*100).toFixed(1);
 $("#winner").textContent=diff===0?"✓ Автомобили одинаковой длины":`✓ ${diff>0?a.brand+" "+a.model:b.brand+" "+b.model} длиннее на ${abs} мм (${pct}%).`;
 const metrics=[["Длина","length"],["Ширина","width"],["Высота","height"],["Колёсная база","wheelbase"]];
 $("#diffGrid").innerHTML=metrics.map(([n,k])=>{let d=a[k]-b[k],p=Math.abs(d)/(d>=0?b[k]:a[k])*100;return `<div class="diff"><small>${n}</small><strong>${Math.abs(d)} мм</strong><small>${d===0?"Одинаково":(d>0?a.brand:b.brand)+" больше · "+p.toFixed(1)+"%"}</small></div>`}).join("");
 $("#bars").innerHTML=metrics.map(([n,k])=>{let m=Math.max(a[k],b[k]);return `<div class="bar-row"><div class="bar-head"><b>${n}</b><span>${a[k]} / ${b[k]} мм</span></div><div class="bar-track"><div class="bar-a" style="width:${a[k]/m*100}%"></div><div class="bar-b" style="width:${b[k]/m*100}%"></div></div></div>`}).join("");
 $("#table").innerHTML=`<thead><tr><th>Характеристика</th><th>${a.brand} ${a.model}</th><th>${b.brand} ${b.model}</th></tr></thead><tbody>`+
 metrics.map(([n,k])=>`<tr><td>${n}</td><td>${a[k]} мм</td><td>${b[k]} мм</td></tr>`).join("")+
 `<tr><td>Год</td><td>${a.year}</td><td>${b.year}</td></tr><tr><td>Поколение</td><td>${a.generation}</td><td>${b.generation}</td></tr><tr><td>Рынок</td><td>${a.market}</td><td>${b.market}</td></tr></tbody>`;
 $("#details").innerHTML=[a,b].map(c=>`<article class="detail"><h3>${c.brand} ${c.model}</h3><p>Поколение: ${c.generation}</p><p>Год: ${c.year}</p><p>Рынок: ${c.market}</p><p>Комплектация: ${c.trim}</p><p>Размеры: ${c.length} × ${c.width} × ${c.height} мм</p><p>Колёсная база: ${c.wheelbase} мм</p></article>`).join("");
 updateUrl();
}
function url(){return location.origin+location.pathname+"?a="+encodeURIComponent(selectedA)+"&b="+encodeURIComponent(selectedB)}
function updateUrl(){history.replaceState({}, "", "?a="+encodeURIComponent(selectedA)+"&b="+encodeURIComponent(selectedB))}
async function copyLink(){try{await navigator.clipboard.writeText(url());$("#shareStatus").textContent="Ссылка скопирована ✓"}catch(e){$("#shareStatus").textContent=url()}}
async function share(){if(navigator.share)await navigator.share({title:"AutoScale comparison",text:"Сравнение автомобилей",url:url()});else copyLink()}
init();