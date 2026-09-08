# AutoScale 5.0 — AI Image Engine Light

База: стабильная версия AutoScale 4.3.1 LITE.

## Что добавлено

### 1. AI Image Registry
Файл:

`data/image-registry.json`

Хранит будущие ссылки на стандартизированные изображения:

- side
- front

### 2. AI Image Engine
Файл:

`assets/js/ai-image-engine.js`

Функции:

- определение vehicle_id;
- поиск готового изображения;
- fallback при отсутствии изображения;
- подготовленная точка подключения будущего AI API.

## Важно

Эта версия пока НЕ генерирует изображения автоматически на GitHub Pages.

GitHub Pages является статическим хостингом, поэтому реальная генерация должна происходить через отдельный backend/API:

Browser
→ AutoScale backend
→ AI image model
→ image storage
→ registry/database
→ AutoScale scene

## Тестовые автомобили

- Honda Vezel RU1 2015
- Volkswagen T-Cross 2021

## Новая структура

assets/js/ai-image-engine.js
data/image-registry.json

Остальная рабочая логика сайта сохранена.
