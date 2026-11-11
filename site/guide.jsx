import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { LiquidMetal, liquidMetalPresets } from '@paper-design/shaders-react';
import './checklist.js';
import './guide-options.js';

const root = document.documentElement;
const systemDark = matchMedia('(prefers-color-scheme: dark)');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const panel = document.getElementById('metal');
const motionToggle = document.querySelector('.motion-toggle');
const appearance = document.querySelector('.appearance');
const switches = Array.from(appearance.querySelectorAll('[data-mode]'));
const modes = switches.map((control) => control.dataset.mode);
let visible = true;
let paused = false;
let shader;
let themeTransition;

function isDark(mode) {
  return mode === 'dark' || (mode === 'system' && systemDark.matches);
}

function updateAppearance() {
  const mode = root.dataset.theme || 'system';
  appearance.style.setProperty('--mode', modes.indexOf(mode));
  for (const control of switches) {
    control.setAttribute('aria-pressed', String(control.dataset.mode === mode));
  }
  motionToggle.hidden = !shader || reduceMotion.matches;
  motionToggle.setAttribute('aria-pressed', String(paused));
  motionToggle.title = paused ? 'Resume animation' : 'Pause animation';
  if (shader) {
    shader.render(
      <LiquidMetal
        {...liquidMetalPresets[0]}
        shape="metaballs"
        colorBack="#00000000"
        colorTint="#ffffff"
        repetition={2.2}
        softness={0.13}
        shiftRed={0.08}
        shiftBlue={0.13}
        distortion={0.08}
        contour={0.54}
        angle={40}
        speed={paused || reduceMotion.matches || !visible || document.hidden ? 0 : 0.54}
        scale={1.02}
        offsetY={-0.09}
        frame={2800}
        fit="contain"
        maxPixelCount={750000}
        style={{ width: '100%', height: '100%' }}
      />,
    );
  }
}

function setAppearance(control) {
  const mode = control.dataset.mode;
  const previous = root.dataset.theme || 'system';
  if (previous === mode) return;
  const apply = () => {
    if (mode === 'system') delete root.dataset.theme;
    else root.dataset.theme = mode;
    try {
      localStorage.setItem('email-guide-theme', mode);
    } catch {
      // The page also works when browser storage is disabled.
    }
    updateAppearance();
  };

  themeTransition?.skipTransition();
  if (!document.startViewTransition || reduceMotion.matches || isDark(previous) === isDark(mode)) {
    apply();
    return;
  }
  const bounds = control.getBoundingClientRect();
  const x = bounds.left + bounds.width / 2;
  const y = bounds.top + bounds.height / 2;
  const distance = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  root.style.setProperty('--theme-x', x + 'px');
  root.style.setProperty('--theme-y', y + 'px');
  root.style.setProperty('--theme-distance', Math.ceil(distance) + 'px');
  root.classList.add('theme-transition');
  const transition = document.startViewTransition(() => flushSync(apply));
  themeTransition = transition;
  const cleanUp = () => {
    if (themeTransition === transition) {
      root.classList.remove('theme-transition');
      themeTransition = undefined;
    }
  };
  transition.finished.then(cleanUp, cleanUp);
}

// The selected theme is stored locally and follows the system by default.
appearance.hidden = false;
for (const control of switches) {
  control.addEventListener('click', () => setAppearance(control));
}
systemDark.addEventListener('change', updateAppearance);
reduceMotion.addEventListener('change', updateAppearance);
document.addEventListener('visibilitychange', updateAppearance);
motionToggle.addEventListener('click', () => {
  paused = !paused;
  updateAppearance();
});
try {
  if (window.WebGL2RenderingContext) {
    shader = createRoot(panel, { onUncaughtError: () => { panel.replaceChildren(); shader = undefined; updateAppearance(); } });
  }
} catch {
  // The CSS fallback remains visible when WebGL isn't available.
}
updateAppearance();

const shaderObserver = new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
  updateAppearance();
});
shaderObserver.observe(panel);

const contentsLists = Array.from(document.querySelectorAll('.guide-rail ol'));
const chapters = Array.from(document.querySelectorAll('.chapter'));
const topNav = document.querySelector('.top-links');
const topLinks = Array.from(topNav.querySelectorAll('a'));
function selectNav(hash) {
  const index = Math.max(0, topLinks.findIndex((link) => link.hash === hash));
  topNav.style.setProperty('--nav-index', index);
  for (const [i, link] of topLinks.entries()) {
    if (i === index) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}

selectNav(location.hash);
window.addEventListener('hashchange', () => selectNav(location.hash));
function updateContentsSpotlight() {
  const active = chapters.findLast((chapter) => chapter.getBoundingClientRect().top < 150);
  for (const list of contentsLists) {
    let current;
    for (const link of list.querySelectorAll('a')) {
      if (link.hash === '#' + active?.id) {
        link.setAttribute('aria-current', 'location');
        current = link;
      } else {
        link.removeAttribute('aria-current');
      }
    }
    const visible = current && list.getClientRects().length > 0;
    if (visible) {
      const bounds = current.getBoundingClientRect();
      const top = bounds.top - list.getBoundingClientRect().top;
      list.style.setProperty('--spotlight-top', `${top + 5}px`);
      list.style.setProperty('--spotlight-height', `${bounds.height - 10}px`);
    }
    list.toggleAttribute('data-spotlight', Boolean(visible));
  }
}
const contentsObserver = new IntersectionObserver(updateContentsSpotlight, { rootMargin: '-145px 0px -40% 0px' });
for (const chapter of chapters) contentsObserver.observe(chapter);
const contentsResize = new ResizeObserver(updateContentsSpotlight);
for (const list of contentsLists) contentsResize.observe(list);
const mobileContents = document.querySelector('.mobile-contents');
mobileContents.addEventListener('click', (event) => {
  if (event.target.closest('a')) mobileContents.open = false;
});
