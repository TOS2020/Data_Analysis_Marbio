/**
 * Viability Assay Configuration Panel
 * 
 * Premium UI component for cell viability metabolic testing.
 */
import { CONCENTRATION_UNITS } from '../../config/assayTypes.js';
import viabilityIcon from '../../assets/viability.png';
import viabilityBacteriaImg from '../../assets/viability_bacteria.png';
import viabilityInvertebrateImg from '../../assets/viability_invertebrate.png';
import viabilityBio2608Img from '../../assets/viability_bio2608.png';

/**
 * Layout configurations for the 3 Viability Assay plate layouts.
 */
const VIABILITY_LAYOUT_CONFIGS = {
  bacteria: {
    value: 'bacteria',
    label: 'Bacteria samples',
    image: viabilityBacteriaImg,
    diagramTitle: 'Bacteria Samples — 3 Samples × 6 Dilutions (Triplicates) + Controls',
    sampleCount: 18,   // 3 samples × 6 dilutions
    sampleLabels: (plateNumber, layoutSampleCount) => {
      const labels = [];
      for (let s = 1; s <= 3; s++) {
        for (let d = 1; d <= 6; d++) {
          labels.push(`S${s}-${d}`);
        }
      }
      return labels;
    }
  },
  invertebrate: {
    value: 'invertebrate',
    label: 'Invertebrate samples',
    image: viabilityInvertebrateImg,
    diagramTitle: 'Invertebrate Samples — 2 Samples × 8 Dilutions (Triplicates) + Controls',
    sampleCount: 16,   // 2 samples × 8 dilutions
    sampleLabels: (plateNumber, layoutSampleCount) => {
      const labels = [];
      for (let s = 1; s <= 2; s++) {
        for (let d = 1; d <= 8; d++) {
          labels.push(`S${s}-${d}`);
        }
      }
      return labels;
    }
  },
  bio2608: {
    value: 'bio2608',
    label: 'Bio-2608 course',
    image: viabilityBio2608Img,
    diagramTitle: 'Bio-2608 Course — 18 Samples (Single Concentration, Triplicates) + Controls',
    sampleCount: 18,   // 18 samples at single concentration
    sampleLabels: (plateNumber, layoutSampleCount) => {
      const labels = [];
      for (let s = 1; s <= 18; s++) {
        labels.push(`S${s}`);
      }
      return labels;
    }
  }
};

export function renderViabilityAssay() {
  const concentrationOptions = CONCENTRATION_UNITS.map(unit =>
    `<option value="${unit}">${unit}</option>`
  ).join('');

  return `
    <div class="panel-content" id="viability-assay-panel">
      <h2 class="panel-title" style="display: flex; align-items: center; gap: 10px;">
        <img src="${viabilityIcon}" alt="" style="width: 32px; height: 32px; object-fit: contain;" />
        <span class="panel-title__text">Viability Assay Configuration</span>
      </h2>
      <p class="panel-description">
        Configure the Cell Viability assay. Enter your sample concentration parameters, 
        number of plates, and specimen IDs. Dilutions and replicates are mapped to the 96-well grid.
      </p>

      <!-- Target Cell Lines -->
      <div class="panel-section" id="viability-cell-lines-section">
        <h3 class="panel-section__title" style="display: flex; align-items: center; gap: 4px;">
          <span class="panel-section__title-icon" style="position: relative; width: 24px; height: 20px; display: inline-flex; align-items: center; margin-right: 6px;">
            <span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #a5f3fc 20%, #4338ca 70%, #1e1b4b 100%); border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 0 5px rgba(99,102,241,0.6); position: absolute; left: 0; bottom: 0; z-index: 2;"></span>
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #a5f3fc 20%, #6366f1 70%, #312e81 100%); border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 0 4px rgba(99,102,241,0.4); position: absolute; right: 2px; top: 0; z-index: 1;"></span>
          </span>
          Target Cell Lines
        </h3>
        
        <div style="margin-bottom: var(--space-md);">
          <h4 style="font-size: 0.8rem; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--space-sm); font-weight: 600;">Adherent Cells</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, 120px); gap: 8px;">
            ${['A2058', 'HT29', 'MCF7', 'MRC5', 'HepG2', 'SK-BR-3', 'MDA-MB-468'].map(cell => `
              <label class="checkbox-item checkbox-item--compact ${cell === 'HepG2' ? 'checkbox-item--checked' : ''}" style="padding: 6px 10px; gap: 8px;">
                <input type="radio" name="viability-cell-line" class="checkbox-item__input cell-line-radio" data-cell-line="${cell}" ${cell === 'HepG2' ? 'checked' : ''} />
                <span class="checkbox-item__box" style="width: 16px; height: 16px; min-width: 16px; border-radius: 50%;"></span>
                <span class="checkbox-item__label" style="font-size: 0.8rem;"><strong>${cell}</strong></span>
              </label>
            `).join('')}
          </div>
        </div>

        <div>
          <h4 style="font-size: 0.8rem; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--space-sm); font-weight: 600;">Suspension Cells</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, 120px); gap: 8px;">
            ${['Molt-4', 'MV-4-11', 'THP-1', 'Molm-13'].map(cell => `
              <label class="checkbox-item checkbox-item--compact" style="padding: 6px 10px; gap: 8px;">
                <input type="radio" name="viability-cell-line" class="checkbox-item__input cell-line-radio" data-cell-line="${cell}" />
                <span class="checkbox-item__box" style="width: 16px; height: 16px; min-width: 16px; border-radius: 50%;"></span>
                <span class="checkbox-item__label" style="font-size: 0.8rem;"><strong>${cell}</strong></span>
              </label>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Concentration Configuration -->
      <div class="panel-section" id="viability-concentration-section">
        <h3 class="panel-section__title">
          <span class="panel-section__title-icon">💊</span>
          Concentration Parameter
        </h3>
        <div>
          <label class="section__label" for="viability-concentration-unit" style="font-size: 0.8rem; margin-bottom: 4px;">Unit</label>
          <select class="select" id="viability-concentration-unit">
            ${concentrationOptions}
          </select>
        </div>
      </div>

      <!-- Number of Plates Selection -->
      <div class="panel-section" id="viability-plates-config-section">
        <h3 class="panel-section__title">
          <span class="panel-section__title-icon">🔢</span>
          Plate Selection &amp; Layout Scheme
        </h3>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <label class="section__label" style="margin-bottom: 0; min-width: 100px;">Plates count</label>
            <input
              class="input"
              type="number"
              id="viability-plate-count"
              min="1"
              max="10"
              value="1"
              style="width: 100px;"
            />
            <span class="section__hint" style="margin-top: 0;">
              Number of Excel sheets (1 sheet per plate)
            </span>
          </div>
          
          <div style="display: flex; align-items: center; gap: 12px;">
            <label class="section__label" style="margin-bottom: 0; min-width: 100px;">Plate Layout</label>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <label class="checkbox-item checkbox-item--compact checkbox-item--checked" id="viability-layout-bacteria-label" style="padding: 6px 12px; cursor: pointer;">
                <input type="radio" name="viability-layout-type" id="viability-layout-bacteria" value="bacteria" checked style="display: none;" />
                <span class="checkbox-item__label" style="font-size: 0.8rem; font-weight: 600;">Bacteria samples</span>
              </label>
              <label class="checkbox-item checkbox-item--compact" id="viability-layout-invertebrate-label" style="padding: 6px 12px; cursor: pointer;">
                <input type="radio" name="viability-layout-type" id="viability-layout-invertebrate" value="invertebrate" style="display: none;" />
                <span class="checkbox-item__label" style="font-size: 0.8rem; font-weight: 600;">Invertebrate samples</span>
              </label>
              <label class="checkbox-item checkbox-item--compact" id="viability-layout-bio2608-label" style="padding: 6px 12px; cursor: pointer;">
                <input type="radio" name="viability-layout-type" id="viability-layout-bio2608" value="bio2608" style="display: none;" />
                <span class="checkbox-item__label" style="font-size: 0.8rem; font-weight: 600;">Bio-2608 course</span>
              </label>
            </div>
          </div>

          <!-- Layout Diagram Figure -->
          <div style="margin-top: 4px; border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 12px; background: rgba(0,0,0,0.25);">
            <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px;">
              <span>📊</span> <span id="viability-layout-diagram-title">Bacteria Samples — 3 Samples × 6 Dilutions (Triplicates) + Controls</span>
            </div>
            <div style="overflow-x: auto; text-align: center; background: #ffffff; padding: 8px; border-radius: 6px;">
              <img id="viability-layout-image" src="${viabilityBacteriaImg}" alt="Viability Plate Layout Diagram" style="max-width: 100%; height: auto; display: block; margin: 0 auto; border-radius: 4px;" />
            </div>
          </div>
        </div>
      </div>

      <!-- Dynamic Plates Section -->
      <div class="panel-section" id="viability-plates-section">
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
        <div class="plate-grid" id="viability-plate-grid" style="grid-template-columns: 1fr;">
          <!-- Plate tables rendered here dynamically -->
        </div>
      </div>
    </div>
  `;
}

function renderPlateTable(plateNumber, layoutType = 'bacteria') {
  const config = VIABILITY_LAYOUT_CONFIGS[layoutType] || VIABILITY_LAYOUT_CONFIGS.bacteria;
  const sampleCount = config.sampleCount;
  const labels = config.sampleLabels(plateNumber, sampleCount);
  let tableRows = '';
  for (let s = 0; s < sampleCount; s++) {
    const defaultLabel = labels[s] || `S${s + 1}`;
    tableRows += `
      <tr>
        <td style="font-weight: 600; color: var(--color-text-muted); font-size: 0.8rem; text-align: center; width: 100px;">${defaultLabel}</td>
        <td>
          <input
            class="biofilm-grid-input"
            type="text"
            id="viability-plate-${plateNumber}-sample-${s + 1}"
            value="${defaultLabel}"
            placeholder="Sample ID..."
          />
        </td>
      </tr>
    `;
  }

  return `
    <div class="plate-card" id="viability-plate-card-${plateNumber}" style="overflow-x: auto;">
      <div class="plate-card__header">
        <span>Plate ${plateNumber} (${config.label})</span>
      </div>
      <table class="biofilm-table">
        <thead>
          <tr>
            <th style="width: 100px;">Sample</th>
            <th>Sample ID</th>
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
 * Initialize Viability assay panel interactivity.
 */
export function initViabilityAssay() {
  const plateCountInput = document.getElementById('viability-plate-count');
  const plateGrid = document.getElementById('viability-plate-grid');

  // Handle cell line radio toggles to update style class
  const cellLineRadios = document.querySelectorAll('.cell-line-radio');
  cellLineRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      cellLineRadios.forEach(r => {
        const label = r.closest('.checkbox-item');
        if (r.checked) {
          label.classList.add('checkbox-item--checked');
        } else {
          label.classList.remove('checkbox-item--checked');
        }
      });
    });
  });

  // Handle Layout selection radio style toggles + image/title switching
  const layoutRadios = document.getElementsByName('viability-layout-type');
  const layoutLabels = {
    bacteria: document.getElementById('viability-layout-bacteria-label'),
    invertebrate: document.getElementById('viability-layout-invertebrate-label'),
    bio2608: document.getElementById('viability-layout-bio2608-label'),
  };
  const layoutImage = document.getElementById('viability-layout-image');
  const layoutDiagramTitle = document.getElementById('viability-layout-diagram-title');

  // Map layout values to their imported image URLs
  const layoutImages = {
    bacteria: viabilityBacteriaImg,
    invertebrate: viabilityInvertebrateImg,
    bio2608: viabilityBio2608Img,
  };

  const updateLayoutLabels = () => {
    const selectedValue = document.querySelector('input[name="viability-layout-type"]:checked')?.value || 'bacteria';
    // Update checked styles
    Object.entries(layoutLabels).forEach(([key, label]) => {
      if (label) {
        if (key === selectedValue) {
          label.classList.add('checkbox-item--checked');
        } else {
          label.classList.remove('checkbox-item--checked');
        }
      }
    });
    // Update image and diagram title
    if (layoutImage && layoutImages[selectedValue]) {
      layoutImage.src = layoutImages[selectedValue];
    }
    const config = VIABILITY_LAYOUT_CONFIGS[selectedValue];
    if (layoutDiagramTitle && config) {
      layoutDiagramTitle.textContent = config.diagramTitle;
    }
  };

  layoutRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      updateLayoutLabels();
      updatePlates();
    });
  });

  const updatePlates = () => {
    const count = Math.max(1, Math.min(10, parseInt(plateCountInput.value) || 1));
    plateCountInput.value = count;
    const layoutType = document.querySelector('input[name="viability-layout-type"]:checked')?.value || 'bacteria';
    
    // Store current input values so they aren't lost when changing count
    const savedValues = {};
    const inputs = plateGrid.querySelectorAll('.biofilm-grid-input');
    inputs.forEach(input => {
      savedValues[input.id] = input.value;
    });

    // Rebuild tables
    let html = '';
    for (let p = 1; p <= count; p++) {
      html += renderPlateTable(p, layoutType);
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
 * Collect Viability assay configuration data.
 */
export function collectViabilityData() {
  const concentrationUnit = document.getElementById('viability-concentration-unit')?.value || '';
  const maxConcentrationEl = document.getElementById('viability-max-conc');
  const maxConcentration = maxConcentrationEl ? maxConcentrationEl.value : '';
  const plateCount = parseInt(document.getElementById('viability-plate-count').value) || 1;
  const layoutType = document.querySelector('input[name="viability-layout-type"]:checked')?.value || 'bacteria';
  
  const cellLines = [];
  const selectedRadio = document.querySelector('.cell-line-radio:checked');
  if (selectedRadio) {
    cellLines.push(selectedRadio.getAttribute('data-cell-line'));
  }

  const plates = [];
  const config = VIABILITY_LAYOUT_CONFIGS[layoutType] || VIABILITY_LAYOUT_CONFIGS.bacteria;
  const sampleCount = config.sampleCount;

  for (let p = 1; p <= plateCount; p++) {
    const sampleIds = [];
    for (let s = 1; s <= sampleCount; s++) {
      const input = document.getElementById(`viability-plate-${p}-sample-${s}`);
      sampleIds.push(input ? input.value.trim() : '');
    }
    plates.push({ plateNumber: p, sampleIds });
  }

  return {
    concentrationUnit,
    maxConcentration,
    plateCount,
    layoutType,
    cellLines,
    plates
  };
}
