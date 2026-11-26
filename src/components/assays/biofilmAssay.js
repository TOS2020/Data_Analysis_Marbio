/**
 * Biofilm Assay Configuration Panel
 * 
 * Allows the user to:
 * - Configure the fixed strains (S. epidermidis targeting, S. haemolyticus negative control)
 * - Select concentration units
 * - Specify number of plates
 * - Input a 3x8 grid of sample IDs for each plate
 */
import { CONCENTRATION_UNITS } from '../../config/assayTypes.js';

export function renderBiofilmAssay() {
  const concentrationOptions = CONCENTRATION_UNITS.map(unit =>
    `<option value="${unit}">${unit}</option>`
  ).join('');

  return `
    <div class="panel-content" id="biofilm-assay-panel">
      <h2 class="panel-title">
        <span class="panel-title__icon">🧫</span>
        <span class="panel-title__text">Biofilm Assay Configuration</span>
      </h2>
      <p class="panel-description">
        Configure the Biofilm Inhibition assay. Specify the number of plates and enter sample IDs
        in the 3x8 triplicate grid for each plate. Empty cells will be skipped during processing.
      </p>

      <!-- Fixed Bacterial Strains Information -->
      <div class="panel-section" id="biofilm-strains-section">
        <h3 class="panel-section__title" style="display: flex; align-items: center; gap: 4px;">
          <span class="panel-section__title-icon" style="position: relative; width: 24px; height: 20px; display: inline-flex; align-items: center; margin-right: 6px;">
            <!-- Left: Light green rod with mesh glow -->
            <span style="display: inline-block; width: 4px; height: 12px; border-radius: 2px; background: #4ade80; border: 0.5px solid rgba(255,255,255,0.4); box-shadow: 0 0 6px rgba(74, 222, 128, 0.8), 0 0 12px rgba(74, 222, 128, 0.4); position: absolute; left: 0px; top: 4px; transform: rotate(-15deg);"></span>
            <!-- Middle: Yellow flagellated rod -->
            <span style="display: inline-block; width: 5px; height: 11px; border-radius: 2.5px; background: #facc15; border: 0.5px solid rgba(255,255,255,0.4); box-shadow: 0 0 6px rgba(250, 204, 21, 0.8); position: absolute; left: 8px; top: 3px; transform: rotate(15deg);">
              <span style="position: absolute; left: 1px; bottom: -6px; width: 1px; height: 6px; background: rgba(250, 204, 21, 0.7); transform: rotate(10deg);"></span>
              <span style="position: absolute; left: 3px; bottom: -6px; width: 1px; height: 6px; background: rgba(250, 204, 21, 0.7); transform: rotate(-10deg);"></span>
            </span>
            <!-- Right: Pink bacilli group -->
            <span style="display: inline-block; width: 3px; height: 9px; border-radius: 1.5px; background: #ec4899; border: 0.5px solid rgba(255,255,255,0.3); box-shadow: 0 0 4px rgba(236, 72, 153, 0.7); position: absolute; right: 2px; top: 3px; transform: rotate(-30deg);"></span>
            <span style="display: inline-block; width: 3px; height: 9px; border-radius: 1.5px; background: #ec4899; border: 0.5px solid rgba(255,255,255,0.3); box-shadow: 0 0 4px rgba(236, 72, 153, 0.7); position: absolute; right: -1px; top: 7px; transform: rotate(45deg);"></span>
          </span>
          Bacterial Strains (Fixed)
        </h3>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="checkbox-item checkbox-item--checked" style="cursor: default;">
            <span class="checkbox-item__box" style="background: var(--color-success); border-color: var(--color-success);">
              <span style="color: var(--color-bg-primary); font-weight: bold; font-size: 0.8rem;">✓</span>
            </span>
            <span class="checkbox-item__label"><em>S. epidermidis</em></span>
            <span class="checkbox-item__sublabel" style="color: var(--color-accent); font-weight: 500;">Targeting Biofilm Strain</span>
          </div>
          <div class="checkbox-item checkbox-item--checked" style="cursor: default; opacity: 0.85;">
            <span class="checkbox-item__box" style="background: var(--color-text-muted); border-color: var(--color-text-muted);">
              <span style="color: var(--color-bg-primary); font-weight: bold; font-size: 0.8rem;">✓</span>
            </span>
            <span class="checkbox-item__label" style="color: var(--color-text-secondary);"><em>S. haemolyticus</em></span>
            <span class="checkbox-item__sublabel">Negative Control Strain</span>
          </div>
        </div>
      </div>

      <!-- Concentration Unit -->
      <div class="panel-section" id="biofilm-concentration-section">
        <h3 class="panel-section__title">
          <span class="panel-section__title-icon">💊</span>
          Concentration Unit
        </h3>
        <select class="select" id="biofilm-concentration-unit">
          ${concentrationOptions}
        </select>
      </div>

      <!-- Number of Plates Selection -->
      <div class="panel-section" id="biofilm-plates-config-section">
        <h3 class="panel-section__title">
          <span class="panel-section__title-icon">🔢</span>
          Number of Plates
        </h3>
        <div style="display: flex; align-items: center; gap: 12px;">
          <input
            class="input"
            type="number"
            id="biofilm-plate-count"
            min="1"
            max="10"
            value="1"
            style="width: 100px;"
          />
          <span class="section__hint" style="margin-top: 0;">
            Specify the number of physical 96-well plates to analyze
          </span>
        </div>
      </div>

      <!-- Dynamic Plates Section -->
      <div class="panel-section" id="biofilm-plates-section">
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
          Plate Configuration &amp; Sample IDs
        </h3>
        <div style="margin-bottom: 20px;">
          <img src="/biofilm_layout.png" alt="Biofilm Plate Layout" style="max-width: 100%; height: auto; border-radius: 4px; border: 1px solid rgba(255, 255, 255, 0.1);" />
        </div>
        <div class="plate-grid" id="biofilm-plate-grid" style="grid-template-columns: 1fr;">
          <!-- Plate tables will be rendered here dynamically -->
        </div>
      </div>
    </div>
  `;
}

function renderPlateTable(plateNumber) {
  let tableRows = '';
  
  for (let rowIdx = 1; rowIdx <= 8; rowIdx++) {
    tableRows += `
      <tr>
        <td style="font-weight: 600; color: var(--color-text-muted); font-size: 0.8rem; text-align: center;">Row ${rowIdx}</td>
        <td>
          <input
            class="biofilm-grid-input"
            type="text"
            id="biofilm-plate-${plateNumber}-row-${rowIdx}-col-1"
            placeholder="Sample ID..."
          />
        </td>
        <td>
          <input
            class="biofilm-grid-input"
            type="text"
            id="biofilm-plate-${plateNumber}-row-${rowIdx}-col-2"
            placeholder="Sample ID..."
          />
        </td>
        <td>
          <input
            class="biofilm-grid-input"
            type="text"
            id="biofilm-plate-${plateNumber}-row-${rowIdx}-col-3"
            placeholder="Sample ID..."
          />
        </td>
      </tr>
    `;
  }

  return `
    <div class="plate-card" id="biofilm-plate-card-${plateNumber}" style="overflow-x: auto;">
      <div class="plate-card__header">
        <span>Plate ${plateNumber} (S. epidermidis)</span>
      </div>
      <table class="biofilm-table">
        <thead>
          <tr>
            <th style="width: 80px;">Dilution</th>
            <th>Series 1</th>
            <th>Series 2</th>
            <th>Series 3</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Initialize Biofilm assay panel interactivity.
 */
export function initBiofilmAssay() {
  const plateCountInput = document.getElementById('biofilm-plate-count');
  const plateGrid = document.getElementById('biofilm-plate-grid');

  const updatePlates = () => {
    const count = Math.max(1, Math.min(10, parseInt(plateCountInput.value) || 1));
    plateCountInput.value = count;
    
    // Store current input values so they aren't lost when changing count
    const savedValues = {};
    const inputs = plateGrid.querySelectorAll('.biofilm-grid-input');
    inputs.forEach(input => {
      savedValues[input.id] = input.value;
    });

    // Rebuild tables
    let html = '';
    for (let p = 1; p <= count; p++) {
      html += renderPlateTable(p);
    }
    plateGrid.innerHTML = html;

    // Restore saved values
    const newInputs = plateGrid.querySelectorAll('.biofilm-grid-input');
    newInputs.forEach(input => {
      if (savedValues[input.id] !== undefined) {
        input.value = savedValues[input.id];
      }
    });
  };

  plateCountInput.addEventListener('change', updatePlates);
  plateCountInput.addEventListener('input', updatePlates);

  // Initial build
  updatePlates();
}

/**
 * Collect Biofilm assay configuration data.
 */
export function collectBiofilmData() {
  const concentrationUnit = document.getElementById('biofilm-concentration-unit').value;
  const plateCount = parseInt(document.getElementById('biofilm-plate-count').value) || 1;
  const plates = [];

  for (let p = 1; p <= plateCount; p++) {
    const grid = [];
    for (let r = 1; r <= 8; r++) {
      const rowSamples = [];
      for (let c = 1; c <= 3; c++) {
        const input = document.getElementById(`biofilm-plate-${p}-row-${r}-col-${c}`);
        rowSamples.push(input ? input.value.trim() : '');
      }
      grid.push(rowSamples); // 8 rows, each with 3 values
    }
    plates.push({ plateNumber: p, grid });
  }

  return {
    concentrationUnit,
    plateCount,
    plates
  };
}
