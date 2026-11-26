/**
 * MIC Assay Configuration Panel
 * 
 * Allows the user to:
 * - Select bacterial strains (checkboxes)
 * - Configure multiple sets (5 plates per set)
 * - Choose concentration units
 */
import { BACTERIAL_STRAINS, CONCENTRATION_UNITS } from '../../config/assayTypes.js';
import micLayoutImg from '../../assets/mic_layout.png';

const SAMPLES_PER_SET = 5;

export function renderMicAssay() {
  const strainCheckboxes = BACTERIAL_STRAINS.map(strain => `
    <label class="checkbox-item" id="strain-item-${strain.id}" for="strain-${strain.id}">
      <input
        class="checkbox-item__input"
        type="checkbox"
        id="strain-${strain.id}"
        name="bacterial-strain"
        value="${strain.id}"
        checked
      />
      <span class="checkbox-item__box"></span>
      <span class="checkbox-item__label"><em>${strain.name}</em></span>
      <span class="checkbox-item__sublabel">${strain.fullName}</span>
    </label>
  `).join('');

  const concentrationOptions = CONCENTRATION_UNITS.map(unit =>
    `<option value="${unit}">${unit}</option>`
  ).join('');

  return `
    <div class="panel-content" id="mic-assay-panel">
      <h2 class="panel-title">
        <span class="panel-title__icon">🦠</span>
        <span class="panel-title__text">MIC Assay Configuration</span>
      </h2>
      <p class="panel-description">
        Configure the Minimum Inhibitory Concentration (MIC) assay. Select bacterial strains, 
        specify the number of plate sets (5 plates each), and enter sample IDs.
      </p>

      <!-- Bacterial Strains -->
      <div class="panel-section" id="mic-strains-section">
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
          Bacterial Strains
        </h3>
        <div class="checkbox-group" id="strain-checkbox-group">
          ${strainCheckboxes}
        </div>
      </div>

      <!-- Concentration Unit -->
      <div class="panel-section" id="mic-concentration-section">
        <h3 class="panel-section__title">
          <span class="panel-section__title-icon">💊</span>
          Concentration Unit
        </h3>
        <select class="select" id="concentration-unit">
          ${concentrationOptions}
        </select>
      </div>

      <!-- Sets Configuration -->
      <div class="panel-section" id="mic-sets-config-section">
        <h3 class="panel-section__title">
          <span class="panel-section__title-icon">🔢</span>
          Plate Set Configuration
        </h3>
        <div style="margin-bottom: 20px;">
          <img src="${micLayoutImg}" alt="MIC Plate Layout" style="max-width: 100%; height: auto; border-radius: 4px; border: 1px solid rgba(255, 255, 255, 0.1);" />
        </div>
        <div class="input-group">
          <label class="input-label" for="mic-set-count">
            Number of Sets (1 set = <span id="mic-plates-per-set-label">5</span> plates)
          </label>
          <input 
            type="number" 
            id="mic-set-count" 
            class="input-field" 
            min="1" 
            max="10" 
            value="1"
          />
        </div>
      </div>

      <!-- Dynamic Set Grid -->
      <div class="panel-section" id="mic-sets-section">
        <div class="plate-grid" id="mic-set-grid">
          <!-- Sets will be rendered here dynamically -->
        </div>
      </div>
    </div>
  `;
}

/**
 * Render a single MIC set card
 */
function renderSetCard(setIndex) {
  const sampleInputs = Array.from({ length: SAMPLES_PER_SET }, (_, i) => `
    <div class="sample-row">
      <span class="sample-row__label">S${i + 1}</span>
      <input
        class="sample-row__input"
        type="text"
        id="mic-set-${setIndex}-sample-${i + 1}"
        placeholder="Sample ID..."
      />
    </div>
  `).join('');

  return `
    <div class="plate-card" id="mic-set-card-${setIndex}">
      <div class="plate-card__header">Set ${setIndex}</div>
      <div class="plate-card__samples">
        ${sampleInputs}
      </div>
    </div>
  `;
}

/**
 * Update the grid of sets based on input count
 */
function updateSetGrid() {
  const grid = document.getElementById('mic-set-grid');
  const count = parseInt(document.getElementById('mic-set-count').value) || 1;
  
  let html = '';
  for (let i = 1; i <= count; i++) {
    html += renderSetCard(i);
  }
  grid.innerHTML = html;
}

/**
 * Update the dynamic labels for MIC assay
 */
function updateMicLabels() {
  const checkedStrains = document.querySelectorAll('input[name="bacterial-strain"]:checked');
  const label = document.getElementById('mic-plates-per-set-label');
  if (label) {
    label.textContent = checkedStrains.length;
  }
}

/**
 * Initialize MIC assay panel interactivity.
 */
export function initMicAssay() {
  // Checkbox toggle styling and logic
  const checkboxInputs = document.querySelectorAll('input[name="bacterial-strain"]');
  
  checkboxInputs.forEach(input => {
    const item = input.closest('.checkbox-item');
    
    // Initial state
    if (input.checked) {
      item.classList.add('checkbox-item--checked');
    }

    // Listen for the change event on the input
    input.addEventListener('change', () => {
      if (input.checked) {
        item.classList.add('checkbox-item--checked');
      } else {
        item.classList.remove('checkbox-item--checked');
      }
      updateMicLabels();
    });
  });

  // Handle dynamic set rendering
  const setCountInput = document.getElementById('mic-set-count');
  if (setCountInput) {
    setCountInput.addEventListener('input', updateSetGrid);
    updateSetGrid(); // Initial render
  }

  // Initial label update
  updateMicLabels();
}

/**
 * Collect MIC assay configuration data.
 */
export function collectMicData() {
  const selectedStrains = [];
  document.querySelectorAll('input[name="bacterial-strain"]:checked').forEach(cb => {
    selectedStrains.push(cb.value);
  });

  const concentrationUnit = document.getElementById('concentration-unit').value;
  const setCount = parseInt(document.getElementById('mic-set-count').value) || 1;

  const sets = [];
  for (let s = 1; s <= setCount; s++) {
    const samples = [];
    for (let i = 1; i <= SAMPLES_PER_SET; i++) {
      const sampleId = document.getElementById(`mic-set-${s}-sample-${i}`).value;
      samples.push(sampleId);
    }
    sets.push({ setIndex: s, samples });
  }

  return { 
    selectedStrains, 
    concentrationUnit, 
    setCount,
    platesPerSet: selectedStrains.length,
    sets 
  };
}

