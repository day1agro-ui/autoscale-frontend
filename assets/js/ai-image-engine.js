/* AutoScale 5.2 — AI Image Auto Resolver
   Static, free and GitHub Pages compatible.
   Images are NOT generated in the browser.
   The registry decides whether to use a prepared AI image or SVG fallback.
*/
(function () {
  const ENGINE = {
    registryUrl: "data/image-registry.json",
    fallbackBase: "assets/silhouettes"
  };

  let registry = {};
  let ready = false;

  async function loadRegistry() {
    try {
      const r = await fetch(ENGINE.registryUrl, { cache: "no-store" });
      if (!r.ok) throw new Error("registry unavailable");
      const data = await r.json();
      registry = data.vehicles || data || {};
    } catch (e) {
      console.warn("AutoScale image registry unavailable, using SVG fallback.", e);
      registry = {};
    } finally {
      ready = true;
      window.dispatchEvent(new CustomEvent("autoscale:image-registry-ready"));
    }
    return registry;
  }

  function getVehicleId(car) {
    return String(car?.image_id || car?.id || "");
  }

  function fallbackPath(car, view) {
    const silhouette = car?.visual?.silhouette || "fallback";
    const base = silhouette === "fallback"
      ? `${ENGINE.fallbackBase}/fallback`
      : `${ENGINE.fallbackBase}/${silhouette}`;
    return `${base}/${view}.svg`;
  }

  function resolveImage(car, view) {
    const id = getVehicleId(car);
    const entry = registry[id];
    const candidate = entry && entry[view];

    if (candidate) {
      return {
        type: "generated",
        url: candidate,
        vehicleId: id,
        ready
      };
    }

    return {
      type: "fallback",
      url: fallbackPath(car, view),
      vehicleId: id,
      ready
    };
  }

  function isReady() {
    return ready;
  }

  window.AutoScaleAIImageEngine = {
    loadRegistry,
    resolveImage,
    fallbackPath,
    getVehicleId,
    isReady
  };

  loadRegistry();
})();
