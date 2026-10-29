/**
 * MicroVenture Labs — Study Hub (index.html) entry.
 * Renders paid study product cards and free study tools.
 */
import { STUDY_PRODUCTS, FREE_STUDY_APPS, FREE_STUDY_RESOURCES } from './data.js';
import { renderProductCards, renderStudyAppCards, renderFreeCards } from './render.js';

document.addEventListener('DOMContentLoaded', () => {
  renderProductCards('study-products-grid', STUDY_PRODUCTS);
  renderStudyAppCards('free-apps-grid', FREE_STUDY_APPS);
  renderFreeCards('free-resources-grid', FREE_STUDY_RESOURCES);
});
