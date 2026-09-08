/* AutoScale 5.3 — Visual Library Core
   Static, lightweight and GitHub Pages compatible.

   Priority:
   1. Visual Library image
   2. AI Image Registry
   3. SVG fallback

   The library can contain multiple candidate images per vehicle/view.
   The first active candidate is used.
*/
(function () {
  const LIBRARY_URL = 'data/visual-library.json';
  let library = {};
  let loaded = false;

  async function load() {
    try {
      const response = await fetch(LIBRARY_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error('Visual library unavailable');
      const data = await response.json();
      library = data.vehicles || {};
    } catch (error) {
      console.warn('AutoScale Visual Library unavailable.', error);
      library = {};
    } finally {
      loaded = true;
      window.dispatchEvent(new CustomEvent('autoscale:visual-library-ready'));
    }
    return library;
  }

  function getId(car) {
    return String(car?.image_id || car?.id || '');
  }

  function normalizeCandidate(candidate) {
    if (typeof candidate === 'string') {
      return { path: candidate, active: true, source: 'library' };
    }
    if (!candidate || !candidate.path) return null;
    return {
      path: candidate.path,
      active: candidate.active !== false,
      source: candidate.source || 'library',
      width: candidate.width || null,
      height: candidate.height || null,
      updatedAt: candidate.updatedAt || null
    };
  }

  function getCandidates(car, view) {
    const id = getId(car);
    const entry = library[id];
    if (!entry || !entry.images || !Array.isArray(entry.images[view])) return [];
    return entry.images[view]
      .map(normalizeCandidate)
      .filter(Boolean)
      .filter(item => item.active);
  }

  function resolve(car, view) {
    const candidates = getCandidates(car, view);
    if (candidates.length) {
      return {
        type: 'library',
        url: candidates[0].path,
        meta: candidates[0],
        vehicleId: getId(car)
      };
    }

    const ai = window.AutoScaleAIImageEngine;
    if (ai) {
      const resolved = ai.resolveImage(car, view);
      if (resolved?.url) return resolved;
    }

    return null;
  }

  function status(car, view) {
    const candidates = getCandidates(car, view);
    if (candidates.length) return 'library';

    const ai = window.AutoScaleAIImageEngine;
    if (ai) {
      const resolved = ai.resolveImage(car, view);
      if (resolved?.type === 'generated') return 'generated';
    }
    return 'fallback';
  }

  window.AutoScaleVisualLibrary = {
    load,
    resolve,
    status,
    getCandidates,
    isLoaded: () => loaded
  };

  load();
})();