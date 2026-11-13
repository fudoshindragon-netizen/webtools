/**
 * MicroVenture Labs — Focus & Flow (focus-flow.html) entry.
 * Renders digital templates, art collections, and free creator resources.
 */
import { TEMPLATES, JOURNALS, ART_COLLECTIONS, CREATOR_FREE } from './data.js';
import { renderProductCards, renderFreeCards } from './render.js';

document.addEventListener('DOMContentLoaded', () => {
  renderProductCards('templates-grid', TEMPLATES);
  renderProductCards('journals-grid', JOURNALS);
  renderProductCards('art-grid', ART_COLLECTIONS);
  renderFreeCards('creator-free-grid', CREATOR_FREE);
});
