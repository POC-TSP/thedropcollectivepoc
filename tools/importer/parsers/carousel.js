/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel block.
 * Source: https://thedropcollective.ca/
 * Selector: .orbit
 * Model: Foundation Orbit carousel with slides containing image, heading, text, and CTA.
 */
export default function parse(element, { document }) {
  const slides = element.querySelectorAll('.orbit-slide');
  const cells = [];

  slides.forEach((slide) => {
    const img = slide.querySelector('img.show-for-large, img:not(.hide-for-large)');
    const caption = slide.querySelector('.orbit-caption, figcaption');
    const heading = caption ? caption.querySelector('h1, h2, h3, h4') : slide.querySelector('h1, h2, h3, h4');
    const paragraphs = caption ? caption.querySelectorAll('p') : slide.querySelectorAll('.description p, p');
    const cta = caption ? caption.querySelector('a.button, a') : slide.querySelector('a.button, a');

    const content = document.createDocumentFragment();

    if (img) {
      const imgEl = img.cloneNode(true);
      content.appendChild(imgEl);
    }

    if (heading) {
      content.appendChild(heading.cloneNode(true));
    }

    paragraphs.forEach((p) => {
      if (p.textContent.trim() && !p.querySelector('a.button')) {
        content.appendChild(p.cloneNode(true));
      }
    });

    if (cta && cta.textContent.trim()) {
      const p = document.createElement('p');
      p.appendChild(cta.cloneNode(true));
      content.appendChild(p);
    }

    if (content.childNodes.length > 0) {
      cells.push([content]);
    }
  });

  if (cells.length === 0) {
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Carousel', cells });
  element.replaceWith(block);
}
