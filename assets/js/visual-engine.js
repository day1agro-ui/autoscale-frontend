// AutoScale 4.3 Visual Engine
// Отдельный модуль-заготовка для будущего расширения.
// Текущая загрузка SVG реализована в app.js для простого статического деплоя.
window.AutoScaleVisualEngine = {
  version: "4.3",
  resolveSilhouette(car, view) {
    const key = car.visual?.silhouette || "fallback";
    const base = key === "fallback" ? "assets/silhouettes/fallback" : `assets/silhouettes/${key}`;
    return `${base}/${view}.svg`;
  }
};
