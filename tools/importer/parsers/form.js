/* eslint-disable */
/* global WebImporter */

/**
 * Parser for form block.
 * Source: https://thedropcollective.ca/contests/mb/
 * Selector: form, .wpcf7, .gform_wrapper
 * Model: WordPress form (CF7 or Gravity Forms) converted to EDS Form block reference.
 */
export default function parse(element, { document }) {
  const cells = [];

  const formEl = element.tagName === 'FORM' ? element : element.querySelector('form');
  if (!formEl) {
    return;
  }

  const fields = formEl.querySelectorAll('input:not([type="hidden"]):not([type="submit"]), textarea, select');
  const submitBtn = formEl.querySelector('input[type="submit"], button[type="submit"], .submit');

  const frag = document.createDocumentFragment();

  fields.forEach((field) => {
    const label = formEl.querySelector(`label[for="${field.id}"]`);
    const p = document.createElement('p');
    const labelText = label ? label.textContent.trim() : (field.getAttribute('placeholder') || field.getAttribute('name') || '');
    const fieldType = field.tagName === 'TEXTAREA' ? 'textarea' : (field.getAttribute('type') || 'text');
    p.textContent = `${labelText} (${fieldType})`;
    frag.appendChild(p);
  });

  if (submitBtn) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = submitBtn.value || submitBtn.textContent || 'Submit';
    p.appendChild(strong);
    frag.appendChild(p);
  }

  if (frag.childNodes.length > 0) {
    cells.push([frag]);
  }

  if (cells.length === 0) {
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Form', cells });
  element.replaceWith(block);
}
