/**
 * Header Component
 * Renders the top bar with Marbio logo and app title.
 */
export function renderHeader() {
  return `
    <header class="header" id="app-header">
      <img src="/marbio-logo.png" alt="Marbio" class="header__logo header__logo--invert" id="header-logo" />
      <h1 class="header__title" id="header-title">Marbio Assay Analyzer</h1>
      <span class="header__subtitle">Laboratory Analysis Platform</span>
    </header>
  `;
}
