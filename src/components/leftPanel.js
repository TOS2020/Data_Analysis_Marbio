/**
 * Left Panel Component
 * Contains: assay date, file upload, assay type selector, export path, and submit button.
 */
import * as XLSX from 'xlsx';
import { ASSAY_TYPES, PLATE_READERS } from '../config/assayTypes.js';

export function renderLeftPanel() {
  const today = new Date().toISOString().split('T')[0];

  const assayRadioCards = ASSAY_TYPES.map((assay) => `
    <label class="radio-card" id="radio-card-${assay.id}" for="assay-${assay.id}">
      <input
        class="radio-card__input"
        type="radio"
        name="assay-type"
        id="assay-${assay.id}"
        value="${assay.id}"
      />
      <span class="radio-card__indicator"></span>
      <span class="radio-card__icon">
        ${typeof assay.icon === 'string' && (assay.icon.includes('/') || assay.icon.includes('.') || assay.icon.startsWith('data:')) 
          ? `<img src="${assay.icon}" alt="" style="width: 32px; height: 32px; object-fit: contain; border-radius: 4px;" />` 
          : assay.icon}
      </span>
      <span class="radio-card__content">
        <span class="radio-card__name">${assay.name}</span>
        <span class="radio-card__desc">${assay.description}</span>
      </span>
    </label>
  `).join('');

  const plateReaderRadioCards = PLATE_READERS.map((reader) => `
    <label class="radio-card radio-card--compact" id="radio-card-${reader.id}" for="reader-${reader.id}">
      <input
        class="radio-card__input"
        type="radio"
        name="plate-reader"
        id="reader-${reader.id}"
        value="${reader.id}"
      />
      <span class="radio-card__indicator"></span>
      <span class="radio-card__icon">${reader.icon}</span>
      <span class="radio-card__content">
        <span class="radio-card__name">${reader.name}</span>
      </span>
    </label>
  `).join('');

  return `
    <aside class="left-panel" id="left-panel">

      <!-- Assay Date -->
      <div class="section">
        <label class="section__label" for="assay-date">📅 Assay Date</label>
        <div class="date-input-container">
          <input
            class="input input--date-text"
            type="text"
            id="assay-date-text"
            placeholder="MM/DD/YYYY"
            value="${new Date().toLocaleDateString('en-US')}"
          />
          <button class="date-picker-trigger" id="date-picker-trigger" type="button" title="Open Calendar">
            🗓️
          </button>
          <input
            type="date"
            id="assay-date-hidden"
            class="hidden-date-input"
            value="${today}"
          />
        </div>
      </div>

      <!-- Investigator -->
      <div class="section">
        <label class="section__label" for="investigator">👤 Investigator</label>
        <input
          class="input"
          type="text"
          id="investigator"
          placeholder="Enter name..."
        />
      </div>

      <!-- File Upload -->
      <div class="section">
        <label class="section__label">📂 Select File</label>
        <div class="file-upload" id="file-upload-zone">
          <input
            class="file-upload__input"
            type="file"
            id="file-input"
            accept=".xlsx,.xls"
          />
          <span class="file-upload__icon">📄</span>
          <span class="file-upload__text">
            <strong>Browse</strong> or drag & drop<br/>
            .xlsx, .xls
          </span>
          <span class="file-upload__filename" id="file-name"></span>
        </div>
      </div>

      <!-- Assay Type Selection -->
      <div class="section">
        <span class="section__label">🔬 Assay Type</span>
        <div class="radio-group" id="assay-type-group">
          ${assayRadioCards}
        </div>
      </div>

      <!-- Plate Reader Selection -->
      <div class="section">
        <span class="section__label">📟 Plate Reader</span>
        <div class="radio-group" id="plate-reader-group">
          ${plateReaderRadioCards}
        </div>
      </div>

      <div class="divider"></div>

      <!-- Export Path -->
      <div class="section">
        <label class="section__label">💾 Export / Save Results</label>
        <button class="btn btn--secondary btn--full btn--sm" id="export-path-btn" type="button">
          <span class="btn__icon">📁</span>
          Choose export folder...
        </button>
        <p class="section__hint" id="export-path-display">No export path selected</p>
      </div>

      <!-- Submit -->
      <button class="btn btn--primary btn--full" id="submit-btn" type="button">
        <span class="btn__icon">🚀</span>
        Submit &amp; Analyze
      </button>

    </aside>
  `;
}

// IndexedDB Helpers for persisting File Handles
function getDB(key) {
  return new Promise((resolve) => {
    const request = indexedDB.open("MarbioDB", 1);
    request.onupgradeneeded = () => {
      try {
        request.result.createObjectStore("store");
      } catch (e) {}
    };
    request.onsuccess = () => {
      try {
        const db = request.result;
        if (!db.objectStoreNames.contains("store")) {
          // If store is somehow missing, trigger upgrade by incrementing version next time, or just resolve
          resolve(null);
          return;
        }
        const tx = db.transaction("store", "readonly");
        const store = tx.objectStore("store");
        const getReq = store.get(key);
        getReq.onsuccess = () => resolve(getReq.result);
        getReq.onerror = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    };
    request.onerror = () => resolve(null);
  });
}

function setDB(key, value) {
  return new Promise((resolve) => {
    const request = indexedDB.open("MarbioDB", 1);
    request.onupgradeneeded = () => {
      try {
        request.result.createObjectStore("store");
      } catch (e) {}
    };
    request.onsuccess = () => {
      try {
        const db = request.result;
        const tx = db.transaction("store", "readwrite");
        const store = tx.objectStore("store");
        store.put(value, key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    };
    request.onerror = () => resolve(false);
  });
}

let exportDirectoryHandle = null;

/**
 * Initialize left panel event listeners.
 */
export function initLeftPanel(onAssayTypeChange, onSubmit) {
  // Assay Radio selection
  const assayCards = document.querySelectorAll('#assay-type-group .radio-card');
  assayCards.forEach(card => {
    card.addEventListener('click', () => {
      assayCards.forEach(c => c.classList.remove('radio-card--selected'));
      card.classList.add('radio-card--selected');
      const input = card.querySelector('.radio-card__input');
      input.checked = true;
      const val = input.value;

      onAssayTypeChange(val);

      // Show popup message box for inactive assays
      if (val === 'anti-inflammatory' || val === 'dppiv') {
        showModal('Coming soon!', 'This assay module is currently under development.');
      }
    });
  });

  // Plate Reader Radio selection
  const readerCards = document.querySelectorAll('#plate-reader-group .radio-card');
  readerCards.forEach(card => {
    card.addEventListener('click', () => {
      readerCards.forEach(c => c.classList.remove('radio-card--selected'));
      card.classList.add('radio-card--selected');
      const input = card.querySelector('.radio-card__input');
      input.checked = true;
    });
  });

  // Select first plate reader by default
  const firstReader = readerCards[0];
  if (firstReader) {
    firstReader.click();
  }

  // Date picker logic
  const dateText = document.getElementById('assay-date-text');
  const dateHidden = document.getElementById('assay-date-hidden');
  const dateTrigger = document.getElementById('date-picker-trigger');

  dateTrigger.addEventListener('click', () => {
    // Standard DOM method to open the date picker
    if (dateHidden.showPicker) {
      dateHidden.showPicker();
    } else {
      dateHidden.click();
    }
  });

  dateHidden.addEventListener('change', (e) => {
    const date = new Date(e.target.value);
    if (!isNaN(date)) {
      dateText.value = date.toLocaleDateString('en-US');
    }
  });

  // Sync text manual entry back to hidden input if valid
  dateText.addEventListener('change', () => {
    const date = new Date(dateText.value);
    if (!isNaN(date)) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      dateHidden.value = `${yyyy}-${mm}-${dd}`;
    }
  });

  // File upload
  const fileInput = document.getElementById('file-input');
  const fileNameDisplay = document.getElementById('file-name');
  const uploadZone = document.getElementById('file-upload-zone');

  const processUploadedFile = (file) => {
    if (!file) {
      fileNameDisplay.textContent = '';
      uploadZone.classList.remove('file-upload--active');
      return;
    }
    const validExtensions = ['.xlsx', '.xls'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (!validExtensions.includes(fileExt)) {
      showToast('Please select a valid Excel file (.xlsx, .xls).');
      fileInput.value = '';
      fileNameDisplay.textContent = '';
      uploadZone.classList.remove('file-upload--active');
      return;
    }
    fileNameDisplay.textContent = `✅ ${file.name}`;
    uploadZone.classList.add('file-upload--active');

    // Inspect sheet count and auto-sync plate count inputs
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'array', bookSheets: true });
        const sheetCount = wb.SheetNames ? wb.SheetNames.length : 1;

        // Auto-sync Viability plate count
        const viabilityPlateCount = document.getElementById('viability-plate-count');
        if (viabilityPlateCount) {
          viabilityPlateCount.value = sheetCount;
          viabilityPlateCount.dispatchEvent(new Event('input'));
        }

        // Auto-sync Biofilm plate count
        const biofilmPlateCount = document.getElementById('biofilm-plate-count');
        if (biofilmPlateCount) {
          biofilmPlateCount.value = sheetCount;
          biofilmPlateCount.dispatchEvent(new Event('input'));
        }

        // Auto-sync DPP-IV plate count
        const dppivPlateCount = document.getElementById('dppiv-plate-count');
        if (dppivPlateCount) {
          dppivPlateCount.value = sheetCount;
          dppivPlateCount.dispatchEvent(new Event('input'));
        }

        showToast(`📄 File loaded: ${sheetCount} sheet(s) detected.`);
      } catch (err) {
        console.warn('Could not inspect workbook sheet count:', err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  fileInput.addEventListener('change', (e) => {
    processUploadedFile(e.target.files[0]);
  });

  // Drag and drop
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('file-upload--active');
  });

  uploadZone.addEventListener('dragleave', () => {
    if (!fileInput.files.length) {
      uploadZone.classList.remove('file-upload--active');
    }
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      fileInput.files = e.dataTransfer.files;
      processUploadedFile(file);
    }
  });

  // Export path button
  const exportPathBtn = document.getElementById('export-path-btn');
  const exportPathDisplay = document.getElementById('export-path-display');

  // Load persisted export directory handle/path
  if ('showDirectoryPicker' in window) {
    getDB('exportDirectoryHandle').then((handle) => {
      if (handle) {
        exportDirectoryHandle = handle;
        exportPathDisplay.textContent = `📁 ${handle.name}`;
        exportPathBtn.textContent = '✅ Folder selected — Change';
        exportPathBtn.dataset.exportPath = handle.name;
      }
    });
  } else {
    getDB('exportPathFallback').then((path) => {
      if (path) {
        exportPathDisplay.textContent = `📁 ${path}`;
        exportPathBtn.textContent = '✅ Path selected — Change';
        exportPathBtn.dataset.exportPath = path;
      }
    });
  }

  exportPathBtn.addEventListener('click', async () => {
    // Try modern File System Access API first (supported in Chrome/Edge)
    if ('showDirectoryPicker' in window) {
      try {
        const handle = await window.showDirectoryPicker();
        exportDirectoryHandle = handle; // Store the actual handle
        await setDB('exportDirectoryHandle', handle); // Persist to DB
        exportPathDisplay.textContent = `📁 ${handle.name}`;
        exportPathBtn.textContent = '✅ Folder selected — Change';
        exportPathBtn.dataset.exportPath = handle.name;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error picking directory:', err);
        }
      }
    } else {
      // Fallback for Firefox/Safari
      const path = prompt('Enter the folder path where results should be saved:', 'C:\\Results');
      if (path) {
        await setDB('exportPathFallback', path); // Persist fallback
        exportPathDisplay.textContent = `📁 ${path}`;
        exportPathBtn.textContent = '✅ Path selected — Change';
        exportPathBtn.dataset.exportPath = path;
      }
    }
  });

  // Submit button
  const submitBtn = document.getElementById('submit-btn');
  submitBtn.addEventListener('click', () => {
    if (onSubmit) onSubmit();
  });
}

/**
 * Collect all form data from the left panel.
 */
export function collectFormData() {
  const assayDate = document.getElementById('assay-date-text').value;
  const investigator = document.getElementById('investigator').value;
  const fileInput = document.getElementById('file-input');
  const file = fileInput.files[0] || null;
  const assayType = document.querySelector('input[name="assay-type"]:checked');
  const plateReader = document.querySelector('input[name="plate-reader"]:checked');
  const exportPath = document.getElementById('export-path-btn').dataset.exportPath || '';

  if (!assayDate) {
    showToast('Please enter an assay date.');
    return null;
  }
  if (!investigator) {
    showToast('Please enter the investigator name.');
    return null;
  }
  if (!file) {
    showToast('Please select a data file.');
    return null;
  }
  const validExtensions = ['.xlsx', '.xls'];
  const fileExt = '.' + file.name.split('.').pop().toLowerCase();
  if (!validExtensions.includes(fileExt)) {
    showToast('Please select a valid Excel file (.xlsx, .xls).');
    return null;
  }
  if (!assayType) {
    showToast('Please select an assay type.');
    return null;
  }
  if (!plateReader) {
    showToast('Please select a plate reader.');
    return null;
  }

  return {
    assayDate,
    investigator,
    fileName: file.name,
    file,
    assayType: assayType.value,
    plateReader: plateReader.value,
    exportPath,
    exportHandle: exportDirectoryHandle, // Pass the handle for direct writing
  };
}

/**
 * Show a modal popup message box centered on the screen.
 */
export function showModal(title, message = '') {
  const existing = document.querySelector('.modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-box__icon">🚧</div>
      <div class="modal-box__title">${title}</div>
      ${message ? `<div class="modal-box__message">${message}</div>` : ''}
      <button class="modal-box__btn" id="modal-ok-btn">OK</button>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => {
    overlay.remove();
  };

  overlay.querySelector('#modal-ok-btn').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
}

/**
 * Show a toast notification.
 */
export function showToast(message) {
  // Remove any existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 3000);
}
