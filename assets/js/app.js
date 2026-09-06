import {loadCars,unique,findCar,searchCars} from './database.js';
import {renderAll} from './renderer.js';
const $=id=>document.getElementById(id);
const state={cars:[],target:1,view:'side',selections:{1:null,2:null}};
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const opt=(v,t)=>`<option value="${esc(v)}">${esc(t)}</option>`;
function currentFiltered(){return state.cars.filter(c=>c.brand===$('brand').value&&c.model===$('model').value&&c.generation===$('generation').value)}
function selected(){return findCar(state.cars,$('version').value)}
function loadBrands(){const a=unique(state.cars.map(c=>c.brand)).sort();$('brand').innerHTML=a.map(x=>opt(x,x)).join('');loadModels()}
function loadModels(){const a=unique(state.cars.filter(c=>c.brand===$('brand').value).map(c=>c.model)).sort();$('model').innerHTML=a.map(x=>opt(x,x)).join('');loadGenerations()}
function loadGenerations(){const a=unique(state.cars.filter(c=>c.brand===$('brand').value&&c.model===$('model').value).map(c=>c.generation));$('generation').innerHTML=a.map(x=>opt(x,x)).join('');loadVersions()}
function loadVersions(){const a=currentFiltered();$('version').innerHTML=a.map(c=>opt(c.id,`${c.year} · ${c.trim}`)).join('');updateSummary()}
function updateSummary(){const c=selected();$('selectedSummary').innerHTML=c?`<strong>${state.target===1?'Первый':'Второй'} автомобиль:</strong> ${esc(c.brand)} ${esc(c.model)} · ${esc(c.generation)} · ${c.year} · ${esc(c.trim)}`:'Выберите автомобиль.'}
function sync(c){if(!c)return;$('brand').value=c.brand;loadModels();$('model').value=c.model;loadGenerations();$('generation').value=c.generation;loadVersions();$('version').value=c.id;updateSummary()}
function setTarget(n){state.target=n;document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',+b.dataset.target===n));sync(state.selections[n])}
function render(){const a=state.selections[1],b=state.selections[2];if(a&&b)renderAll(a,b,state.view)}
function updateUrl(){const a=state.selections[1],b=state.selections[2];if(a&&b){const u=new URL(location.href);u.searchParams.set('a',a.id);u.searchParams.set('b',b.id);history.replaceState(null,'',u)}}
function apply(){const c=selected();if(c){state.selections[state.target]=c;render();updateUrl();$('shareStatus').textContent='Автомобиль добавлен в сравнение.'}}
function randomCompare(){let i=Math.floor(Math.random()*state.cars.length),j=Math.floor(Math.random()*state.cars.length);while(j===i)j=Math.floor(Math.random()*state.cars.length);state.selections[1]=state.cars[i];state.selections[2]=state.cars[j];setTarget(1);render();updateUrl()}
function showResults(q){const box=$('searchResults');const results=searchCars(state.cars,q);if(!q.trim()){box.innerHTML='';box.classList.remove('show');return}box.innerHTML=results.length?results.map(c=>`<button data-id="${esc(c.id)}"><b>${esc(c.brand)} ${esc(c.model)}</b><span>${esc(c.generation)} · ${c.year} · ${esc(c.trim)}</span></button>`).join(''):'<div class="no-result">Ничего не найдено. Проверьте название автомобиля.</div>';box.classList.add('show');box.querySelectorAll('button').forEach(btn=>btn.onclick=()=>{const c=findCar(state.cars,btn.dataset.id);sync(c);state.selections[state.target]=c;render();updateUrl();$('search').value='';box.innerHTML='';box.classList.remove('show')})}
async function copyLink(){try{await navigator.clipboard.writeText(location.href);$('shareStatus').textContent='✓ Ссылка скопирована в буфер обмена.'}catch{$('shareStatus').textContent='Не удалось скопировать автоматически. Скопируйте адрес из браузера.'}}
async function nativeShare(){const a=state.selections[1],b=state.selections[2];if(navigator.share){try{await navigator.share({title:'AutoScale',text:`Сравнение ${a.brand} ${a.model} и ${b.brand} ${b.model}`,url:location.href})}catch{}}else copyLink()}
async function init(){try{state.cars=await loadCars();$('status').innerHTML=`✓ База подключена · автомобилей: <strong>${state.cars.length}</strong> · архитектура AutoScale 3.0`;const p=new URLSearchParams(location.search);state.selections[1]=findCar(state.cars,p.get('a'))||state.cars[0];state.selections[2]=findCar(state.cars,p.get('b'))||state.cars[2]||state.cars[1];loadBrands();sync(state.selections[1]);render()}catch(e){$('status').textContent='Ошибка загрузки базы: '+e.message}}
$('brand').onchange=loadModels;$('model').onchange=loadGenerations;$('generation').onchange=loadVersions;$('version').onchange=updateSummary;
$('applyBtn').onclick=apply;$('randomBtn').onclick=randomCompare;$('swapBtn').onclick=()=>{[state.selections[1],state.selections[2]]=[state.selections[2],state.selections[1]];sync(state.selections[state.target]);render();updateUrl()};
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>setTarget(+b.dataset.target));$('search').addEventListener('input',e=>showResults(e.target.value));
document.querySelectorAll('.view').forEach(b=>b.onclick=()=>{state.view=b.dataset.view;document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x===b));render()});
$('copyLink').onclick=copyLink;$('nativeShare').onclick=nativeShare;init();
