/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: thedropcollective cleanup.
 * Removes non-authorable site shell content from thedropcollective.ca pages.
 * All selectors verified against migration-work/cleaned.html.
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove overlays and modals that block parsing
    // Found: <div id="didomi-host" class="didomi-host"> (line 2)
    // Found: <div id="AgeGateModal" class="full reveal without-overlay"> (line 501)
    // Found: <div id="pr_age_gate"> (line 545)
    // Found: <div class="js-off-canvas-overlay is-overlay-fixed"> (line 37)
    WebImporter.DOMUtils.remove(element, [
      '#didomi-host',
      '#AgeGateModal',
      '#pr_age_gate',
      '.js-off-canvas-overlay',
    ]);
  }

  if (hookName === H.after) {
    // Remove non-authorable site chrome
    // Found: <nav class="mobile-off-canvas-menu off-canvas position-right..."> (line 5)
    // Found: <header class="site-header"> (line 40)
    // Found: <footer class="site-footer"> (line 363)
    WebImporter.DOMUtils.remove(element, [
      'nav.mobile-off-canvas-menu',
      'header.site-header',
      'footer.site-footer',
      'noscript',
      'link',
    ]);
  }
}
