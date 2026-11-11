const controls = document.querySelector('.guide-controls');
const buttons = Array.from(controls.querySelectorAll('button'));
const chapters = Array.from(document.querySelectorAll('.chapter'));
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const state = { recommended: false, plain: false };
let generation = 0;
const cleanups = new Set();
const electricTimers = new WeakMap();
const variantAnchorSelector = 'p, li, h3, .table-wrap, pre, details';
const visibleAnchorSelector = '.chapter-head, .guide-copy:not([hidden]) p, .guide-copy:not([hidden]) li, .guide-copy:not([hidden]) h3, .guide-copy:not([hidden]) .table-wrap, .guide-copy:not([hidden]) pre, .guide-copy:not([hidden]) details';

function captureScrollAnchor() {
  const headerBottom = document.querySelector('.topbar')?.getBoundingClientRect().bottom ?? 0;
  const targetY = headerBottom + 12;
  const visible = Array.from(document.querySelectorAll(visibleAnchorSelector), (element) => ({
    element,
    rect: element.getBoundingClientRect(),
  })).filter(({ rect }) => rect.height > 0 && rect.bottom > targetY && rect.top < innerHeight);
  if (!visible.length) return null;
  visible.sort((a, b) => Math.abs(a.rect.top - targetY) - Math.abs(b.rect.top - targetY));
  const { element, rect } = visible[0];
  const section = element.closest('.chapter');
  if (!section) return null;
  if (element.classList.contains('chapter-head')) return { section, heading: true, top: rect.top };
  const copy = element.closest('.guide-copy');
  if (!copy) return { section, heading: true, top: section.querySelector('.chapter-head').getBoundingClientRect().top };
  const index = Array.from(copy.querySelectorAll(variantAnchorSelector)).indexOf(element);
  return { section, index, top: rect.top };
}

function restoreScrollAnchor(anchor) {
  if (!anchor) return;
  requestAnimationFrame(() => {
    const element = anchor.heading
      ? anchor.section.querySelector('.chapter-head')
      : anchor.section.querySelector('.guide-copy:not([hidden])')?.querySelectorAll(variantAnchorSelector)[anchor.index];
    if (!element) return;
    const delta = element.getBoundingClientRect().top - anchor.top;
    if (Math.abs(delta) < 1) return;
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(window.scrollX, Math.max(0, window.scrollY + delta));
    root.style.scrollBehavior = previousBehavior;
  });
}

function animateElectricNoise() {
  if (reduce.matches) return;
  const turbulence = document.getElementById('guide-electric-noise-animation');
  if (!turbulence?.beginElement) return;
  try {
    turbulence.beginElement();
  } catch {
    // The conic sweep remains as a fallback if SVG animation is unavailable.
  }
}

function pulseElectric(button) {
  controls.classList.remove('first-visit');
  clearTimeout(electricTimers.get(button));
  button.classList.remove('electric');
  // Restart the one-shot border sweep when the same control is toggled again.
  void button.offsetWidth;
  button.classList.add('electric');
  animateElectricNoise();
  electricTimers.set(button, setTimeout(() => button.classList.remove('electric'), reduce.matches ? 700 : 950));
}

function stopAnimations() {
  for (const cleanup of cleanups) cleanup();
  cleanups.clear();
}

function reveal(section, version) {
  const copy = section.querySelector('.guide-copy:not([hidden])');
  if (!copy || copy.dataset.pending !== String(version)) return;
  delete copy.dataset.pending;
  if (reduce.matches) return;
  const walker = document.createTreeWalker(copy, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue.trim() || node.parentElement.closest('code, pre, summary, button, [aria-hidden="true"]')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const original = node.nodeValue;
    const parent = node.parentNode;
    const wrapper = document.createElement('span');
    const accessible = document.createElement('span');
    const visual = document.createElement('span');
    accessible.className = 'visually-hidden';
    accessible.textContent = original;
    visual.setAttribute('aria-hidden', 'true');
    wrapper.append(accessible, visual);
    parent.replaceChild(wrapper, node);
    let tick = 0;
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const timer = setInterval(() => {
      tick++;
      const revealed = Math.floor(original.length * tick / 7);
      visual.textContent = Array.from(original, (char, index) =>
        index < revealed || /\s/.test(char) ? char : alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
      if (tick >= 7) cleanup();
    }, 45);
    function cleanup() {
      clearInterval(timer);
      if (wrapper.isConnected) wrapper.replaceWith(node);
      cleanups.delete(cleanup);
    }
    cleanups.add(cleanup);
  }
}

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) if (entry.isIntersecting) reveal(entry.target, generation);
}, { rootMargin: '0px' });
for (const section of chapters) observer.observe(section);

function updateView(anchor) {
  generation++;
  stopAnimations();
  const variant = state.recommended ? (state.plain ? 'recommended-plain' : 'recommended') : (state.plain ? 'plain' : 'full');
  for (const section of chapters) {
    for (const copy of section.querySelectorAll('.guide-copy')) {
      copy.hidden = copy.dataset.guideVariant !== variant;
      if (!copy.hidden) copy.dataset.pending = String(generation);
      else delete copy.dataset.pending;
    }
    const rect = section.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < innerHeight) reveal(section, generation);
  }
  for (const button of buttons) button.setAttribute('aria-pressed', String(state[button.dataset.guideToggle]));
  restoreScrollAnchor(anchor);
}

controls.hidden = false;
controls.classList.add('first-visit');
animateElectricNoise();
setTimeout(() => controls.classList.remove('first-visit'), reduce.matches ? 1500 : 2700);
for (const button of buttons) button.addEventListener('click', () => {
  const anchor = captureScrollAnchor();
  state[button.dataset.guideToggle] = !state[button.dataset.guideToggle];
  updateView(anchor);
  pulseElectric(button);
});
reduce.addEventListener('change', () => { if (reduce.matches) stopAnimations(); });
