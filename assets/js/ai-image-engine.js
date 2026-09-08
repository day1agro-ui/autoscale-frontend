/* AutoScale AI Image Engine v1.0
   Safe client-side image resolver.
   It does NOT generate images in the browser.
   Generation is delegated to a future backend/API endpoint.
*/
(function () {
  const ENGINE = {
    registryUrl: "data/image-registry.json",
    fallback: "assets/silhouettes"
  };

  let registry = {};

  async function loadRegistry() {
    try {
      const r = await fetch(ENGINE.registryUrl, { cache: "no-store" });
      if (!r.ok) throw new Error("registry unavailable");
      registry = await r.json();
    } catch (e) {
      registry = {};
    }
    return registry;
  }

  function slug(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[()]/g, "")
      .replace(/[^a-z0-9а-яё]+/gi, "-")
      .replace(/^-+|-+$/g, "");
  }

  function getVehicleId(car) {
    if (!car) return "";
    if (car.image_id) return car.image_id;
    return [car.make || car.brand, car.model, car.generation, car.year]
      .filter(Boolean)
      .map(slug)
      .join("-");
  }

  function resolveImage(car, view) {
    const id = getVehicleId(car);
    const entry = registry[id];
    if (entry && entry[view]) {
      return { type: "ai", url: entry[view], vehicleId: id };
    }
    return { type: "fallback", url: null, vehicleId: id };
  }

  async function requestGeneration(car, view) {
    // Future integration point:
    // POST /api/generate-vehicle-image
    // { vehicle: car, view: "side" | "front" }
    return {
      queued: true,
      vehicleId: getVehicleId(car),
      view,
      message: "AI generation endpoint is not connected yet"
    };
  }

  window.AutoScaleAIImageEngine = {
    loadRegistry,
    getVehicleId,
    resolveImage,
    requestGeneration
  };

  loadRegistry();
})();