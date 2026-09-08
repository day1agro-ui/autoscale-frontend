# AutoScale 5.4 — FULL AI Vehicle Library

## Это тестовая FULL-версия
В архив уже включены изображения автомобилей для проверки архитектуры:

- Honda Vezel RU1 2015 — side/front
- Volkswagen T-Cross 2021 — side/front
- Volkswagen T-Roc 2020 — side/front
- Subaru Levorg 2016 — side/front

## Как работает
Автомобиль → ID из базы → Visual Library → готовое AI-изображение → сцена.

Если изображение отсутствует или не загружается:
AI Registry → SVG fallback.

## Структура

assets/generated/side/
assets/generated/front/
data/visual-library.json
data/image-registry.json

## Важно
Это демонстрационная библиотека для тестирования логики подключения изображений.
Для точного визуального сравнения в будущем каждому автомобилю потребуется отдельное стандартизированное изображение в одном ракурсе и с едиными правилами кадрирования.
