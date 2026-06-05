/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns block.
 * Source: https://thedropcollective.ca/
 * Selector: .grid-x.align-middle:has(.cell.medium-6)
 * Model: Foundation Grid two-column layout with text content and product image.
 */
export default function parse(element, { document }) {
  const cells = [];
  const columns = element.querySelectorAll(':scope > .cell.medium-6');

  columns.forEach((col) => {
    const frag = document.createDocumentFragment();

    const heading = col.querySelector('h1, h2, h3, h4');
    if (heading) {
      frag.appendChild(heading.cloneNode(true));
    }

    const paragraphs = col.querySelectorAll('.description p, p');
    paragraphs.forEach((p) => {
      if (p.textContent.trim()) {
        frag.appendChild(p.cloneNode(true));
      }
    });

    const img = col.querySelector('img');
    if (img && !heading) {
      frag.appendChild(img.cloneNode(true));
    }

    if (frag.childNodes.length > 0) {
      cells.push(frag);
    }
  });

  if (cells.length === 0) {
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns', cells: [cells] });
  element.replaceWith(block);
}
