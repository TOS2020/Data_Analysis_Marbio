/**
 * Anti-inflammatory Assay Configuration Panel
 * 
 * Premium UI component for anti-inflammatory marker assays.
 */
import { CONCENTRATION_UNITS } from '../../config/assayTypes.js';
import antiInflammatoryLayoutImg from '../../assets/anti_inflammatory_layout.png';

export function renderAntiInflammatoryAssay() {
  const concentrationOptions = CONCENTRATION_UNITS.map(unit =>
    `<option value="${unit}">${unit}</option>`
  ).join('');

  return `
    <div class="panel-content" id="anti-inflammatory-assay-panel">
      <h2 class="panel-title">
        <span class="panel-title__icon">🔥</span>
        <span class="panel-title__text">Anti-inflammatory Assay Configuration</span>
      </h2>
      <p class="panel-description">
        Configure the Anti-inflammatory assay. Map sample IDs and concentrations across your physical 
        96-well plates. Empty cells will be ignored automatically during processing.
      </p>

      <!-- Target Cell Lines -->
      <div class="panel-section" id="anti-inflammatory-cell-lines-section">
        <h3 class="panel-section__title" style="display: flex; align-items: center; gap: 4px;">
          <span class="panel-section__title-icon" style="position: relative; width: 24px; height: 20px; display: inline-flex; align-items: center; margin-right: 6px;">
            <span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #a5f3fc 20%, #4338ca 70%, #1e1b4b 100%); border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 0 5px rgba(99,102,241,0.6); position: absolute; left: 0; bottom: 0; z-index: 2;"></span>
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #a5f3fc 20%, #6366f1 70%, #312e81 100%); border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 0 4px rgba(99,102,241,0.4); position: absolute; right: 2px; top: 0; z-index: 1;"></span>
          </span>
          Target Cell Line (THP-1)
        </h3>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <div class="checkbox-item checkbox-item--checked" style="cursor: default; flex: 1; min-width: 150px;">
            <span class="checkbox-item__box" style="background: var(--color-success); border-color: var(--color-success);">
              <span style="color: var(--color-bg-primary); font-weight: bold; font-size: 0.8rem;">✓</span>
            </span>
            <span class="checkbox-item__label"><strong>THP-1</strong></span>
            <span class="checkbox-item__sublabel">Human Monocytic Leukemia (Macrophage Model)</span>
          </div>
        </div>
      </div>

      <!-- Concentration Configuration -->
      <div class="panel-section" id="anti-inflammatory-concentration-section">
        <h3 class="panel-section__title">
          <span class="panel-section__title-icon">💊</span>
          Concentration Parameter
        </h3>
        <div>
          <label class="section__label" for="anti-inflammatory-concentration-unit" style="font-size: 0.8rem; margin-bottom: 4px;">Unit</label>
          <select class="select" id="anti-inflammatory-concentration-unit">
            ${concentrationOptions}
          </select>
        </div>
      </div>

      <!-- Number of Plates Selection -->
      <div class="panel-section" id="anti-inflammatory-plates-config-section">
        <h3 class="panel-section__title">
          <span class="panel-section__title-icon">🔢</span>
          Plate Selection
        </h3>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <input
            class="input"
            type="number"
            id="anti-inflammatory-plate-count"
            min="1"
            max="10"
            value="1"
            style="width: 100px;"
          />
          <span class="section__hint" style="margin-top: 0;">
            Number of anti-inflammatory plates to parse
          </span>
        </div>

        <!-- Layout Diagram Figure -->
        <div style="margin-top: 8px; border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 12px; background: rgba(0,0,0,0.25);">
          <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px;">
            <span>📊</span> <span>Microtiter Plate Layout Diagram (32 Samples in Duplicates + Controls &amp; Standard Curve)</span>
          </div>
          <div style="overflow-x: auto; text-align: center; background: #ffffff; padding: 8px; border-radius: 6px;">
            <img src="${antiInflammatoryLayoutImg}" alt="Anti-inflammatory Microtiter Plate Layout" style="max-width: 100%; height: auto; display: block; margin: 0 auto; border-radius: 4px;" />
          </div>
        </div>
      </div>

      <!-- Dynamic Plates Section -->
      <div class="panel-section" id="anti-inflammatory-plates-section">
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
        <div class="plate-grid" id="anti-inflammatory-plate-grid" style="grid-template-columns: 1fr;">
          <!-- Plate tables rendered here dynamically -->
        </div>
      </div>
    </div>
  `;
}

function renderPlateTable(plateNumber) {
  let tableRows = '';
  const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  
  for (let r = 0; r < 8; r++) {
    const s1 = r + 1;       // S1..S8
    const s2 = r + 9;       // S9..S16
    const s3 = r + 17;      // S17..S24
    const s4 = r + 25;      // S25..S32

    tableRows += `
      <tr>
        <td style="font-weight: 600; color: var(--color-text-muted); font-size: 0.8rem; text-align: center;">Row ${rowLetters[r]}</td>
        <td>
          <input
            class="biofilm-grid-input"
            type="text"
            id="anti-inflammatory-plate-${plateNumber}-sample-${s1}"
            value="S${s1}"
            placeholder="S${s1}"
          />
        </td>
        <td>
          <input
            class="biofilm-grid-input"
            type="text"
            id="anti-inflammatory-plate-${plateNumber}-sample-${s2}"
            value="S${s2}"
            placeholder="S${s2}"
          />
        </td>
        <td>
          <input
            class="biofilm-grid-input"
            type="text"
            id="anti-inflammatory-plate-${plateNumber}-sample-${s3}"
            value="S${s3}"
            placeholder="S${s3}"
          />
        </td>
        <td>
          <input
            class="biofilm-grid-input"
            type="text"
            id="anti-inflammatory-plate-${plateNumber}-sample-${s4}"
            value="S${s4}"
            placeholder="S${s4}"
          />
        </td>
      </tr>
    `;
  }

  return `
    <div class="plate-card" id="anti-inflammatory-plate-card-${plateNumber}" style="overflow-x: auto;">
      <div class="plate-card__header">
        <span>Plate ${plateNumber} (32 Samples in Duplicates)</span>
      </div>
      <table class="biofilm-table">
        <thead>
          <tr>
            <th style="width: 70px;">Row</th>
            <th>Cols 1–2 (S1–S8)</th>
            <th>Cols 3–4 (S9–S16)</th>
            <th>Cols 5–6 (S17–S24)</th>
            <th>Cols 7–8 (S25–S32)</th>
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
 * Initialize Anti-inflammatory assay panel interactivity.
 */
export function initAntiInflammatoryAssay() {
  const plateCountInput = document.getElementById('anti-inflammatory-plate-count');
  const plateGrid = document.getElementById('anti-inflammatory-plate-grid');

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
 * Collect Anti-inflammatory assay configuration data.
 */
export function collectAntiInflammatoryData() {
  const concentrationUnit = document.getElementById('anti-inflammatory-concentration-unit')?.value || 'uM';
  const maxConcentrationEl = document.getElementById('anti-inflammatory-max-conc');
  const maxConcentration = maxConcentrationEl ? maxConcentrationEl.value : '';
  const plateCount = parseInt(document.getElementById('anti-inflammatory-plate-count').value) || 1;
  const plates = [];

  for (let p = 1; p <= plateCount; p++) {
    const sampleIds = [];
    for (let s = 1; s <= 32; s++) {
      const input = document.getElementById(`anti-inflammatory-plate-${p}-sample-${s}`);
      sampleIds.push(input ? input.value.trim() : `S${s}`);
    }
    plates.push({ plateNumber: p, sampleIds });
  }

  return {
    concentrationUnit,
    maxConcentration,
    plateCount,
    plates
  };
}
