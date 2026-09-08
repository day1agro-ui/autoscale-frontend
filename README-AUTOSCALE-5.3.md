# AutoScale 5.3 — Visual Library LIGHT

Стабильная основа: AutoScale 5.2.

## Новая система
Теперь изображения автомобиля ищутся по трёхуровневой цепочке:

1. `Visual Library`
2. `AI Image Registry`
3. `SVG fallback`

## Зачем это нужно
Мы можем постепенно собирать библиотеку подготовленных изображений автомобилей, не меняя код сайта и не ломая стабильное ядро.

## Как добавить изображение

Файл:
`assets/generated/side/honda-vezel-ru1-2015.webp`

Затем в `data/visual-library.json`:

```json
"side": [
  {
    "path": "assets/generated/side/honda-vezel-ru1-2015.webp",
    "active": true,
    "source": "ai"
  }
]
```

Для переднего ракурса используется папка `assets/generated/front/`.

## Важный принцип
LIGHT-архив поставляется без тяжёлых изображений.
Сайт полностью работает даже при пустой библиотеке.
