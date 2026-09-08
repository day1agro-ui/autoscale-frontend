const EMBEDDED_CARS = [
 {id:'honda-vezel-ru1-2015',brand:'Honda',model:'Vezel',generation:'RU1',year:2015,market:'Japan',body:'SUV',trim:'X',period:'2013–2021',dimensions:{length:4295,width:1770,height:1605,wheelbase:2610},visual:{silhouette:'honda/vezel-ru1',images:{side:'assets/vehicles/honda/vezel-ru1-2015/side.png',front:'assets/vehicles/honda/vezel-ru1-2015/front.png'}}},
 {id:'volkswagen-t-cross-1gen-2021',brand:'Volkswagen',model:'T-Cross',generation:'1st Generation',year:2021,market:'Japan',body:'SUV',trim:'Base',period:'2019–2024',dimensions:{length:4110,width:1760,height:1584,wheelbase:2551},visual:{silhouette:'volkswagen/t-cross-1gen',images:{side:'assets/vehicles/volkswagen/t-cross-1gen-2021/side.png',front:'assets/vehicles/volkswagen/t-cross-1gen-2021/front.png'}}},
 {id:'volkswagen-t-roc-a1-2020',brand:'Volkswagen',model:'T-Roc',generation:'A1',year:2020,market:'Japan',body:'SUV',trim:'Base',period:'2017–2021',dimensions:{length:4234,width:1819,height:1573,wheelbase:2603},visual:{silhouette:'fallback'}},
 {id:'subaru-levorg-vm-2016',brand:'Subaru',model:'Levorg',generation:'VM',year:2016,market:'Japan',body:'Wagon',trim:'1.6 GT-S',period:'2014–2020',dimensions:{length:4690,width:1780,height:1490,wheelbase:2650},visual:{silhouette:'fallback'}}
];

const state={cars:[],a:null,b:null,view:'side',layout:'stack'};
const $=s=>document.querySelector(s);

async function loadCars(){
  try{
    const r=await fetch('./data/cars.json',{cache:'no-store'});
    if(!r.ok) throw new Error('cars.json not found');
    const d=await r.json();
    state.cars=Array.isArray(d.cars)&&d.cars.length?d.cars:EMBEDDED_CARS;
  }catch(e){
    console.warn('Using embedded vehicle database:',e);
    state.cars=EMBEDDED_CARS;
  }
  state.a=state.cars[0];
  state.b=state.cars[1]||state.cars[0];
  fillSelects();
  render();
}

function fillSelects(){
  ['carA','carB'].forEach((id,i)=>{
    const el=$('#'+id); if(!el) return;
    el.innerHTML='';
    state.cars.forEach(c=>{
      const o=document.createElement('option');
      o.value=c.id;
      o.textContent=`${c.brand} ${c.model} · ${c.generation} · ${c.year}`;
      el.appendChild(o);
    });
    el.value=(i?state.b:state.a).id;
    el.onchange=e=>{
      state[i?'b':'a']=state.cars.find(c=>c.id===e.target.value)||state.cars[0];
      render();
    };
  });
}

function visualPath(c,view){
  if(c.visual?.images?.[view]) return c.visual.images[view];
  const silhouette=c.visual?.silhouette||'fallback';
  const base=silhouette==='fallback'?'assets/silhouettes/fallback':`assets/silhouettes/${silhouette}`;
  return `${base}/${view}.svg`;
}
const VIEW_CONFIG = {
  side:  { primary:'length', secondary:'height', primaryLabel:'Длина', secondaryLabel:'Высота', statusWord:'длиннее' },
  front: { primary:'width',  secondary:'height', primaryLabel:'Ширина', secondaryLabel:'Высота', statusWord:'шире' },
};

function viewDimensions(view){
  const cfg = VIEW_CONFIG[view] || VIEW_CONFIG.side;
  return [cfg.primary, cfg.secondary];
}
function scalePct(value,max,limit){ return Math.max(12,Math.min(limit,value/max*limit)); }

function renderVisual(){
  const a=state.a,b=state.b;
  if(!a||!b) return;

  const cfg = VIEW_CONFIG[state.view] || VIEW_CONFIG.side;
  const primary = cfg.primary;
  const secondary = cfg.secondary;
  const maxPrimary=Math.max(a.dimensions[primary],b.dimensions[primary]);
  const maxSecondary=Math.max(a.dimensions[secondary],b.dimensions[secondary]);

  const stage=$('#stage');
  stage.className='stage '+state.layout;
  stage.dataset.view = state.view;

  const slot=c=>{
    const w=scalePct(c.dimensions[primary],maxPrimary,92);
    const h=scalePct(c.dimensions[secondary],maxSecondary,78);
    const wheelbase = state.view==='side'
      ? `<span class="wheelbase-line">База: ${c.dimensions.wheelbase} мм</span>` : '';

    return `<div class="car-slot">
      <div class="caption">${c.brand} ${c.model}</div>
      <div class="car-scale-box" style="width:${w}%;height:${h}%">
        <img class="car-image"
             src="${visualPath(c,state.view)}"
             alt="${c.brand} ${c.model}"
             onerror="this.onerror=null;this.src='assets/silhouettes/fallback/${state.view}.svg'">
      </div>
      <div class="dimension">
        <span>${cfg.primaryLabel}: ${c.dimensions[primary]} мм</span>
        <span>${cfg.secondaryLabel}: ${c.dimensions[secondary]} мм</span>
        ${wheelbase}
      </div>
    </div>`;
  };

  if(state.layout==='queue'){
    const queueSlot=(c,index)=>{
      const primaryRatio=(c.dimensions[primary]/maxPrimary);
      const secondaryRatio=(c.dimensions[secondary]/maxSecondary);
      const wheelbase = state.view==='side'
        ? `<small>Колёсная база: ${c.dimensions.wheelbase} мм</small>` : '';
      return `<article class="queue-car queue-car-${index}">
        <div class="queue-caption">${c.brand} ${c.model}</div>
        <div class="queue-image-box" style="--primary-ratio:${primaryRatio.toFixed(4)};--secondary-ratio:${secondaryRatio.toFixed(4)}">
          <img class="car-image"
               src="${visualPath(c,state.view)}"
               alt="${c.brand} ${c.model}"
               onerror="this.onerror=null;this.src='assets/silhouettes/fallback/${state.view}.svg'">
        </div>
        <div class="queue-dimension">
          <strong>${cfg.primaryLabel}: ${c.dimensions[primary]} мм</strong>
          <span>${cfg.secondaryLabel}: ${c.dimensions[secondary]} мм</span>
          ${wheelbase}
        </div>
      </article>`;
    };

    stage.innerHTML=`
      <div class="queue-scene">
        <div class="queue-road">
          ${queueSlot(a,'a')}
          <div class="queue-gap" aria-hidden="true">
            <span>→</span>
            <small>сравнение</small>
          </div>
          ${queueSlot(b,'b')}
        </div>
      </div>`;
  }else{
    stage.innerHTML=slot(a)+slot(b);
  }

  const diffPrimary=a.dimensions[primary]-b.dimensions[primary];
  const absPrimary=Math.abs(diffPrimary);
  const winnerPrimary=diffPrimary>0 ? a : diffPrimary<0 ? b : null;
  const diffSecondary=a.dimensions[secondary]-b.dimensions[secondary];
  const absSecondary=Math.abs(diffSecondary);

  const status=$('#visualStatus');
  if(status){
    const primaryText = diffPrimary===0
      ? `${cfg.primaryLabel.toLowerCase()} автомобилей одинаковая`
      : `${winnerPrimary.brand} ${winnerPrimary.model} ${cfg.statusWord} на ${absPrimary} мм (${(absPrimary/Math.min(a.dimensions[primary],b.dimensions[primary])*100).toFixed(1)}%)`;
    const secondaryText = diffSecondary===0
      ? `${cfg.secondaryLabel.toLowerCase()} одинаковая`
      : `разница по параметру «${cfg.secondaryLabel}» — ${absSecondary} мм`;
    const wheelbaseText = state.view==='side'
      ? `<br><small>разница по колёсной базе — ${Math.abs(a.dimensions.wheelbase-b.dimensions.wheelbase)} мм.</small>` : '';
    status.innerHTML = `✓ ${primaryText}.<br><small>${secondaryText}.</small>${wheelbaseText}`;
  }
}
function renderMetrics(){
  if(!state.a||!state.b) return;
  const keys=[['Длина','length'],['Ширина','width'],['Высота','height'],['Колёсная база','wheelbase']];
  $('#metrics').innerHTML=keys.map(([n,k])=>`<div class="metric"><small>${n}</small><strong>${Math.abs(state.a.dimensions[k]-state.b.dimensions[k])} мм</strong><small>${state.a.dimensions[k]>=state.b.dimensions[k]?state.a.model:state.b.model} больше</small></div>`).join('');
  $('#bars').innerHTML=keys.map(([n,k])=>{const av=state.a.dimensions[k],bv=state.b.dimensions[k],m=Math.max(av,bv);return `<div class="bar-row"><header><span>${n}</span><span>${av} / ${bv} мм</span></header><div class="bar"><div class="fill" style="width:${av/m*100}%"></div></div><div class="bar"><div class="fill orange" style="width:${bv/m*100}%"></div></div></div>`}).join('');
  $('#table').innerHTML=`<tr><th>Характеристика</th><th>${state.a.brand} ${state.a.model}</th><th>${state.b.brand} ${state.b.model}</th></tr>`+keys.map(([n,k])=>`<tr><td>${n}</td><td>${state.a.dimensions[k]} мм</td><td>${state.b.dimensions[k]} мм</td></tr>`).join('')+`<tr><td>Год</td><td>${state.a.year}</td><td>${state.b.year}</td></tr><tr><td>Поколение</td><td>${state.a.generation}</td><td>${state.b.generation}</td></tr><tr><td>Рынок</td><td>${state.a.market}</td><td>${state.b.market}</td></tr>`;
  $('#selected').innerHTML=[state.a,state.b].map(c=>`<div class="metric"><strong>${c.brand} ${c.model}</strong><small>Поколение: ${c.generation}</small><small>Год: ${c.year}</small><small>Рынок: ${c.market}</small><small>Комплектация: ${c.trim||'—'}</small><small>Размеры: ${c.dimensions.length} × ${c.dimensions.width} × ${c.dimensions.height} мм</small><small>Колёсная база: ${c.dimensions.wheelbase} мм</small></div>`).join('');
}
function render(){ renderVisual(); renderMetrics(); }

document.addEventListener('click',e=>{
  const v=e.target.dataset.view,l=e.target.dataset.layout;
  if(v){state.view=v;document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x.dataset.view===v));renderVisual();}
  if(l){state.layout=l;document.querySelectorAll('[data-layout]').forEach(x=>x.classList.toggle('active',x.dataset.layout===l));renderVisual();}
  if(e.target.id==='swap'){[state.a,state.b]=[state.b,state.a];fillSelects();render();}
  if(e.target.id==='copy'&&navigator.clipboard){navigator.clipboard.writeText(location.href);e.target.textContent='Ссылка скопирована ✓';setTimeout(()=>e.target.textContent='Скопировать ссылку',1500);}
  if(e.target.id==='share'&&navigator.share){navigator.share({title:'AutoScale comparison',url:location.href});}
});

loadCars();
