export async function loadCars(){
  const response=await fetch('./data/cars.json',{cache:'no-store'});
  if(!response.ok) throw new Error('Не удалось загрузить базу автомобилей');
  return response.json();
}
export const unique=a=>[...new Set(a.filter(Boolean))];
export function findCar(cars,id){return cars.find(c=>c.id===id)||null}
export function searchableText(c){return [c.brand,c.model,c.generation,c.year,c.years,c.trim,c.body].join(' ').toLowerCase()}
export function searchCars(cars,query){
  const q=query.trim().toLowerCase(); if(!q) return [];
  const words=q.split(/\s+/).filter(Boolean);
  return cars.filter(c=>{const text=searchableText(c);return words.every(w=>text.includes(w))}).slice(0,8);
}
