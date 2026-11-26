/**
 * DPP-IV Assay Configuration Panel
 * 
 * Allows the user to:
 * - Specify number of plates (auto-detected from Excel sheets or manual)
 * - Input 6 sample IDs per plate
 */
import { DPPIV_SAMPLES_PER_PLATE } from '../../config/assayTypes.js';
import dppivLayoutImg from '../../assets/dppiv_layout.png';

export function renderDppivAssay() {
  return `
    <div class="panel-content" id="dppiv-assay-panel">
      <h2 class="panel-title">
        <span class="panel-title__icon">🧪</span>
        <span class="panel-title__text">DPP-IV Assay Configuration</span>
      </h2>
      <p class="panel-description">
        Configure the Dipeptidyl peptidase-IV (DPP-IV) inhibition assay. 
        Specify the number of plates and enter sample IDs for each plate 
        (${DPPIV_SAMPLES_PER_PLATE} samples per plate). The number of plates will 
        match the number of sheets in your uploaded Excel file.
      </p>

      <!-- Number of Plates -->
      <div class="panel-section" id="dppiv-plates-count-section">
        <h3 class="panel-section__title">
          <span class="panel-section__title-icon">🔢</span>
          Number of Plates
        </h3>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <input
            class="input"
            type="number"
            id="dppiv-plate-count"
            min="1"
            max="20"
            value="1"
            style="width: 100px;"
          />
          <span class="section__hint" style="margin-top: 0;">
            Will auto-detect from uploaded Excel sheets
          </span>
        </div>

        <!-- Layout Diagram Figure -->
        <div style="margin-top: 8px; border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 12px; background: rgba(0,0,0,0.25);">
          <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px;">
            <span>📊</span> <span>Microtiter Plate Layout Diagram (6 Samples &times; 4 Dilutions + Standard Curve &amp; Controls)</span>
          </div>
          <div style="overflow-x: auto; text-align: center; background: #ffffff; padding: 8px; border-radius: 6px;">
            <img src="${dppivLayoutImg}" alt="DPP-IV Microtiter Plate Layout" style="max-width: 100%; height: auto; display: block; margin: 0 auto; border-radius: 4px;" />
          </div>
        </div>
      </div>

      <!-- Plate Samples -->
      <div class="panel-section" id="dppiv-plates-section">
        <h3 class="panel-section__title" style="display: flex; align-items: center; gap: 8px;">
          <span class="panel-section__title-icon" style="display: inline-flex; gap: 1.5px; align-items: stretch; height: 16px; width: 22px;">
            <span style="width: 2px; background: currentColor; opacity: 0.95;"></span>
            <span style="width: 1px; background: currentColor; opacity: 0.95;"></span>
            <span style="width: 3px; background: currentColor; opacity: 0.95;"></span>
            <span style="width: 1px; background: currentColor; opacity: 0.95;"></span>
            <span style="width: 2px; background: currentColor; opacity: 0.95;"></span>
            <span style="width: 1px; background: currentColor; opacity: 0.95;"></span>
            <span style="width: 3px; background: currentColor; opacity: 0.95;"></span>
            <span style="width: 1px; background: currentColor; opacity: 0.95;"></span>
            <span style="width: 2px; background: currentColor; opacity: 0.95;"></span>
          </span>
          Sample IDs
        </h3>
        <div class="plate-grid" id="dppiv-plate-grid">
          ${renderDppivPlate(1)}
        </div>
      </div>
    </div>
  `;
}

function renderDppivPlate(plateNumber) {
  const sampleRows = Array.from({ length: DPPIV_SAMPLES_PER_PLATE }, (_, j) => `
    <div class="sample-row">
      <span class="sample-row__label">${j + 1}</span>
      <input
        class="sample-row__input"
        type="text"
        id="dppiv-plate-${plateNumber}-sample-${j + 1}"
        placeholder="Sample ID ${j + 1}"
      />
    </div>
  `).join('');

  return `
    <div class="plate-card" id="dppiv-plate-card-${plateNumber}">
      <div class="plate-card__header">Plate ${plateNumber}</div>
      <div class="plate-card__samples">
        ${sampleRows}
      </div>
    </div>
  `;
}

/**
 * Initialize DPP-IV assay panel interactivity.
 */
export function initDppivAssay() {
  const plateCountInput = document.getElementById('dppiv-plate-count');
  const plateGrid = document.getElementById('dppiv-plate-grid');

  plateCountInput.addEventListener('change', () => {
    const count = Math.max(1, Math.min(20, parseInt(plateCountInput.value) || 1));
    plateCountInput.value = count;
    rebuildPlates(count, plateGrid);
  });

  plateCountInput.addEventListener('input', () => {
    const count = Math.max(1, Math.min(20, parseInt(plateCountInput.value) || 1));
    rebuildPlates(count, plateGrid);
  });
}

function rebuildPlates(count, container) {
  const plates = Array.from({ length: count }, (_, i) => renderDppivPlate(i + 1)).join('');
  container.innerHTML = plates;
}

/**
 * Collect DPP-IV assay configuration data.
 */
export function collectDppivData() {
  const plateCount = parseInt(document.getElementById('dppiv-plate-count').value) || 1;
  const plates = [];

  for (let p = 1; p <= plateCount; p++) {
    const samples = [];
    for (let s = 1; s <= DPPIV_SAMPLES_PER_PLATE; s++) {
      const input = document.getElementById(`dppiv-plate-${p}-sample-${s}`);
      samples.push(input ? input.value : '');
    }
    plates.push({ plate: p, samples });
  }

  return { plateCount, plates };
}
