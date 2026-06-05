/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards block.
 * Source: https://thedropcollective.ca/
 * Selector: .card
 * Model: Blog post card with image, title, excerpt, and read more link.
 */
export default function parse(element, { document }) {
  const cells = [];

  const img = element.querySelector('.card-image img');
  const title = element.querySelector('.card-section h3, .card-section h4, .card-section .post-title');
  const excerpt = element.querySelector('.card-section .post-excerpt, .card-section p');
  const link = element.querySelector('a[href]');

  const imageFrag = document.createDocumentFragment();
  if (img) {
    imageFrag.appendChild(img.cloneNode(true));
  }

  const textFrag = document.createDocumentFragment();
  if (title) {
    if (link) {
      const h = document.createElement(title.tagName);
      const a = document.createElement('a');
      a.setAttribute('href', link.getAttribute('href'));
      a.textContent = title.textContent.trim();
      h.appendChild(a);
      textFrag.appendChild(h);
    } else {
      textFrag.appendChild(title.cloneNode(true));
    }
  }

  if (excerpt && excerpt.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = excerpt.textContent.trim();
    textFrag.appendChild(p);
  }

  if (imageFrag.childNodes.length > 0 || textFrag.childNodes.length > 0) {
    cells.push([imageFrag, textFrag]);
  }

  if (cells.length === 0) {
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards', cells });
  element.replaceWith(block);
}
