import { createOptimizedPicture } from '../../scripts/aem.js';

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel-hero');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-hero-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-hero-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-hero-slide');
  let realSlideIndex = slideIndex;
  if (slideIndex < 0) {
    realSlideIndex = slides.length - 1;
  } else if (slideIndex >= slides.length) {
    realSlideIndex = 0;
  }
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-hero-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-hero-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const indicator = e.currentTarget.parentElement;
      const slideIndicatorsList = [...indicator.parentElement.children];
      const idx = slideIndicatorsList.indexOf(indicator);
      showSlide(block, idx);
    });
  });

  block.querySelector('.carousel-hero-slide-prev')?.addEventListener('click', () => {
    const idx = parseInt(block.dataset.activeSlide, 10);
    showSlide(block, idx - 1);
  });

  block.querySelector('.carousel-hero-slide-next')?.addEventListener('click', () => {
    const idx = parseInt(block.dataset.activeSlide, 10);
    showSlide(block, idx + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-hero-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, totalSlides) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-hero-slide-${slideIndex}`);
  slide.classList.add('carousel-hero-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    if (colIdx === 0) {
      column.classList.add('carousel-hero-slide-image');
    } else {
      column.classList.add('carousel-hero-slide-content');
    }
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }
  slide.setAttribute('role', 'tabpanel');
  slide.setAttribute('aria-roledescription', 'slide');
  slide.setAttribute('aria-label', `${slideIndex + 1} of ${totalSlides}`);

  return slide;
}

let autoRotateInterval = null;

function stopAutoRotate() {
  if (autoRotateInterval) {
    clearInterval(autoRotateInterval);
    autoRotateInterval = null;
  }
}

function startAutoRotate(block, intervalMs = 5000) {
  stopAutoRotate();
  autoRotateInterval = setInterval(() => {
    const idx = parseInt(block.dataset.activeSlide, 10);
    showSlide(block, idx + 1);
  }, intervalMs);
}

export default function decorate(block) {
  const rows = [...block.children];
  const isSingleSlide = rows.length < 2;

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-hero-slides');
  slidesWrapper.setAttribute('role', 'tablist');

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, rows.length);
    slidesWrapper.append(slide);
  });

  // optimize images
  slidesWrapper.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '2000' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.prepend(slidesWrapper);

  if (!isSingleSlide) {
    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-hero-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class="carousel-hero-slide-prev" aria-label="Previous Slide"></button>
      <button type="button" class="carousel-hero-slide-next" aria-label="Next Slide"></button>
    `;

    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', 'Carousel Slide Controls');
    slideIndicatorsNav.classList.add('carousel-hero-slide-indicators');

    rows.forEach((_, i) => {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-hero-slide-indicator');
      indicator.innerHTML = `<button type="button" aria-label="Show Slide ${i + 1} of ${rows.length}"></button>`;
      slideIndicatorsNav.append(indicator);
    });

    block.append(slideNavButtons);
    block.append(slideIndicatorsNav);

    bindEvents(block);
    startAutoRotate(block);

    block.addEventListener('mouseenter', stopAutoRotate);
    block.addEventListener('mouseleave', () => startAutoRotate(block));
  }

  block.dataset.activeSlide = '0';
}
