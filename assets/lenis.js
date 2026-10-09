class ScrollBar extends HTMLElement {
  constructor() {
    super();

    this.hideScrollbarTimeout = null;

    this.initScrollbar();
  }

  connectedCallback() {
    this.showScrollbarTemporarily();
    this.setupResizeHandler();
    this.setupAnchorLinks();
  }

  showScrollbarTemporarily() {
    document.documentElement.classList.add('show-scrollbar');
    clearTimeout(this.hideScrollbarTimeout);
    this.hideScrollbarTimeout = setTimeout(() => {
      document.documentElement.classList.remove('show-scrollbar');
    }, 100);
  }

  initScrollbar() {
    let start = null;

    const inner = this.querySelector('.inner');
    const thumb = this.querySelector('.thumb');

    let innerHeight = inner.offsetHeight;
    let thumbHeight = thumb.offsetHeight;

    const mapRange = (value, inMin, inMax, outMin, outMax) => {
      return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    };

    const updateThumbPosition = () => {
      const scroll = inner.scrollTop;
      const limit = inner.scrollHeight - inner.clientHeight;
      const progress = scroll / limit;
      const maxThumbMove = innerHeight - thumbHeight;
      thumb.style.transform = `translate3d(0, ${progress * maxThumbMove}px, 0)`;
    };

    const updateDimensions = () => {
      innerHeight = inner.offsetHeight;
      thumbHeight = thumb.offsetHeight;
      updateThumbPosition();
    };

    window.addEventListener('resize', updateDimensions);
    inner.addEventListener('scroll', updateThumbPosition);

    const onPointerMove = (e) => {
      if (!start) return;
      e.preventDefault();
      const thumbY = e.clientY - start;
      const maxThumbMove = innerHeight - thumbHeight;
      const clampedThumbY = Math.max(0, Math.min(thumbY, maxThumbMove));
      const scroll = mapRange(clampedThumbY, 0, maxThumbMove, 0, inner.scrollHeight - inner.clientHeight);
      inner.scrollTop = scroll;
    };

    const onPointerDown = (e) => {
      start = e.clientY - thumb.getBoundingClientRect().top;
      thumb.classList.add('grabbing');
    };

    const onPointerUp = () => {
      start = null;
      thumb.classList.remove('grabbing');
    };

    thumb.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    updateThumbPosition();
  }

  setupResizeHandler() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.initScrollbar();
      }, 150);
    });
  }

  setupAnchorLinks() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }
}

customElements.define('scroll-bar', ScrollBar);