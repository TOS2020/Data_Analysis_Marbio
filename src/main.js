/**
 * Marbio Assay Analyzer — Main Entry Point
 * Initializes the application layout and event wiring.
 */
import './styles/index.css';
import { renderHeader } from './components/header.js';
import { renderLeftPanel, initLeftPanel, collectFormData, showToast } from './components/leftPanel.js';
import { renderRightPanel, switchAssayPanel, getAssayConfig } from './components/rightPanel.js';
import { analyzeData } from './services/analysisService.js';

function init() {
  const app = document.getElementById('app');

  // Render the full layout
  app.innerHTML = `
    ${renderHeader()}
    <div class="main-content" id="main-content">
      ${renderLeftPanel()}
      ${renderRightPanel()}
    </div>
  `;

  // Initialize event listeners
  initLeftPanel(
    (assayId) => {
      switchAssayPanel(assayId);
    },
    async () => {
      // On Submit
      const leftPanelData = collectFormData();
      const rightPanelData = getAssayConfig();

      if (!leftPanelData || !rightPanelData) return;

      try {
        showToast('🔄 Analyzing data... Please wait.');
        
        const blob = await analyzeData(leftPanelData, rightPanelData);
        // Sanitize the date (MM/DD/YYYY → M_DD_YYYY) to avoid invalid filename characters
        const safeDate = leftPanelData.assayDate.replace(/\//g, '_');
        const fileName = `Analysis_${leftPanelData.assayType.toUpperCase()}_${safeDate}.xlsx`;

        // Case A: Direct write to selected folder (File System Access API)
        if (leftPanelData.exportHandle) {
          try {
            // Re-request write permission (it may have expired)
            const permissionStatus = await leftPanelData.exportHandle.requestPermission({ mode: 'readwrite' });
            if (permissionStatus !== 'granted') {
              throw new Error('Write permission was denied for the selected folder.');
            }

            const fileHandle = await leftPanelData.exportHandle.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            showToast(`✅ Analysis complete! Saved to 📁 ${leftPanelData.exportHandle.name}/${fileName}`);
            return; // Success, exit
          } catch (err) {
            console.error('Failed to write directly to folder:', err);
            showToast(`⚠️ Could not save to folder: ${err.message}. Falling back to browser download.`);
            // Continue to fallback...
          }
        }
        
        // Case B: Standard browser download (Fallback)
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showToast('✅ Analysis complete! Your file is downloading.');
      } catch (error) {
        console.error('Analysis error:', error);
        showToast(`❌ Error: ${error.message}`);
      }
    }
  );
}

// Boot
document.addEventListener('DOMContentLoaded', init);
