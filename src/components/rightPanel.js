/**
 * Right Panel Component
 * Dynamically loads the correct assay configuration panel based on selection.
 */
import { renderMicAssay, initMicAssay, collectMicData } from './assays/micAssay.js';
import { renderDppivAssay, initDppivAssay, collectDppivData } from './assays/dppivAssay.js';
import { renderBiofilmAssay, initBiofilmAssay, collectBiofilmData } from './assays/biofilmAssay.js';
import { renderViabilityAssay, initViabilityAssay, collectViabilityData } from './assays/viabilityAssay.js';
import { renderAntiInflammatoryAssay, initAntiInflammatoryAssay, collectAntiInflammatoryData } from './assays/antiInflammatoryAssay.js';

const ASSAY_RENDERERS = {
  mic: { render: renderMicAssay, init: initMicAssay, collect: collectMicData },
  dppiv: { render: renderDppivAssay, init: initDppivAssay, collect: collectDppivData },
  biofilm: { render: renderBiofilmAssay, init: initBiofilmAssay, collect: collectBiofilmData },
  viability: { render: renderViabilityAssay, init: initViabilityAssay, collect: collectViabilityData },
  'anti-inflammatory': { render: renderAntiInflammatoryAssay, init: initAntiInflammatoryAssay, collect: collectAntiInflammatoryData },
};

let currentActiveAssay = null;

export function renderRightPanel() {
  return `
    <main class="right-panel" id="right-panel">
      <div id="right-panel-content">
        ${renderWelcome()}
      </div>
    </main>
  `;
}

function renderWelcome() {
  return `
    <div class="welcome-state" id="welcome-state">
      <img src="/front_page_image.png" alt="Marbio Research" style="max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;" />
      <h2 class="welcome-state__title">Welcome to Marbio Assay Analyzer</h2>
      <p class="welcome-state__text">
        Select an assay type from the left panel to begin configuring your experiment. 
        Each assay has specific parameters that will appear here.
      </p>
      <p class="welcome-state__text" style="margin-top: 10px;">
        Learn more about <a href="https://en.uit.no/forskning/forskningsgrupper/gruppe?p_document_id=380005" target="_blank" style="color: #646cff; text-decoration: none;">Marbio</a> 
        or visit our <a href="https://www.linkedin.com/company/marbio-uit/about/" target="_blank" style="color: #646cff; text-decoration: none;">LinkedIn page</a>.
      </p>
    </div>
  `;
}

/**
 * Switch the right panel content based on selected assay type.
 */
export function switchAssayPanel(assayId) {
  const container = document.getElementById('right-panel-content');
  if (!container) return;

  currentActiveAssay = assayId;
  const renderer = ASSAY_RENDERERS[assayId];
  if (renderer) {
    container.innerHTML = renderer.render();
    renderer.init();
  } else {
    container.innerHTML = `
      <div class="welcome-state">
        <span class="welcome-state__icon">🚧</span>
        <h2 class="welcome-state__title">Coming Soon</h2>
        <p class="welcome-state__text">
          This assay type is not yet configured. Check back later for updates.
        </p>
      </div>
    `;
  }
}

/**
 * Get data from the currently active assay panel
 */
export function getAssayConfig() {
  if (!currentActiveAssay) return null;
  const renderer = ASSAY_RENDERERS[currentActiveAssay];
  return renderer ? renderer.collect() : null;
}
