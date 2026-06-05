/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselParser from './parsers/carousel.js';
import cardsParser from './parsers/cards.js';
import columnsParser from './parsers/columns.js';
import formParser from './parsers/form.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/thedropcollective-cleanup.js';

// PARSER REGISTRY
const parsers = {
  'carousel': carouselParser,
  'cards': cardsParser,
  'columns': columnsParser,
  'form': formParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
];

// PAGE TEMPLATES CONFIGURATION
const PAGE_TEMPLATES = {
  templates: [
    {
      name: 'category-landing',
      urls: [
        'https://thedropcollective.ca/',
        'https://thedropcollective.ca/distilleries/',
        'https://thedropcollective.ca/mezcal/',
        'https://thedropcollective.ca/tequilas/',
        'https://thedropcollective.ca/ultra-prestige-limited-edition/',
        'https://thedropcollective.ca/whiskies/',
        'https://thedropcollective.ca/redbreast-at-tiff/',
        'https://thedropcollective.ca/redbreast-at-tiff/coming-soon/'
      ],
      blocks: [
        { name: 'carousel', instances: ['.orbit'] },
        { name: 'columns', instances: ['.grid-x.align-middle:has(.cell.medium-6)'] },
        { name: 'cards', instances: ['.card'] },
      ],
    },
    {
      name: 'blog-listing',
      urls: ['https://thedropcollective.ca/blog/'],
      blocks: [
        { name: 'cards', instances: ['.card'] },
      ],
    },
    {
      name: 'content-landing',
      urls: [
        'https://thedropcollective.ca/contests/',
        'https://thedropcollective.ca/craft/',
        'https://thedropcollective.ca/rye-explorations/',
        'https://thedropcollective.ca/redbreast-at-tiff/closed/'
      ],
      blocks: [
        { name: 'carousel', instances: ['.orbit'] },
        { name: 'cards', instances: ['.card'] },
      ],
    },
    {
      name: 'contest-entry',
      urls: ['https://thedropcollective.ca/contests/mb/'],
      blocks: [
        { name: 'form', instances: ['form', '.wpcf7', '.gform_wrapper'] },
      ],
    },
    {
      name: 'contest-single',
      urls: ['https://thedropcollective.ca/contests/ot/'],
      blocks: [
        { name: 'form', instances: ['form', '.wpcf7', '.gform_wrapper'] },
      ],
    },
    {
      name: 'survey-page',
      urls: [
        'https://thedropcollective.ca/member-survey/',
        'https://thedropcollective.ca/member-survey/closed/',
        'https://thedropcollective.ca/member-survey/coming-soon/'
      ],
      blocks: [
        { name: 'form', instances: ['form', '.wpcf7', '.gform_wrapper'] },
      ],
    },
    {
      name: 'contest-campaign',
      urls: [
        'https://thedropcollective.ca/rabbit-hole-kentucky-contest/',
        'https://thedropcollective.ca/rabbit-hole-kentucky-contest/closed/',
        'https://thedropcollective.ca/rabbit-hole-kentucky-contest/coming-soon/'
      ],
      blocks: [
        { name: 'form', instances: ['form', '.wpcf7', '.gform_wrapper'] },
      ],
    },
    {
      name: 'signup-page',
      urls: ['https://thedropcollective.ca/sign-up/'],
      blocks: [
        { name: 'form', instances: ['form', '.wpcf7', '.gform_wrapper'] },
      ],
    },
  ],
};

/**
 * Find matching template for the given URL
 */
function findTemplateByUrl(url) {
  const normalizedUrl = url.replace(/\/$/, '');
  for (const template of PAGE_TEMPLATES.templates) {
    for (const templateUrl of template.urls) {
      if (normalizedUrl === templateUrl.replace(/\/$/, '')) {
        return template;
      }
    }
  }
  return null;
}

/**
 * Find all blocks on the page based on the template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  if (!template || !template.blocks) return pageBlocks;

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
          });
        });
      } catch (e) {
        console.warn(`Invalid selector for ${blockDef.name}: ${selector}`);
      }
    });
  });

  return pageBlocks;
}

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, payload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. Execute beforeTransform (remove overlays, modals, consent)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find matching template and parse blocks
    const template = findTemplateByUrl(params.originalURL || url);
    if (template) {
      const pageBlocks = findBlocksOnPage(document, template);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name}:`, e);
          }
        }
      });
    }

    // 3. Execute afterTransform (remove site chrome)
    executeTransformers('afterTransform', main, payload);

    // 4. Apply WebImporter built-in rules
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 5. Generate sanitized document path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL || url).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: template ? template.name : 'default-content',
      },
    }];
  },
};
