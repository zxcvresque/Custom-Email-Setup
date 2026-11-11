const panel = document.querySelector('.checklist-panel');
const items = Array.from(panel.querySelectorAll('.checklist-item'));
const count = panel.querySelector('.checklist-count');
const chapters = Array.from(document.querySelectorAll('.chapter'));
const guide = document.getElementById('guide');
const storageKey = 'email-guide-checklist';
const desktop = matchMedia('(min-width: 1024px)');
const roomForOpenPanel = matchMedia('(min-width: 1180px)');
const celebrationViewport = matchMedia('(min-width: 1024px) and (pointer: fine)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let readingLine = 0;
let readingObserver;
let activeSection;
let allDone = false;
let lastPointer;

try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (Array.isArray(saved)) {
    for (const item of items) {
      const input = item.querySelector('input');
      input.checked = saved.includes(input.dataset.check);
    }
  }
} catch {
  // The checklist is usable for the current visit when storage is unavailable.
}

function updateChecklist() {
  const completed = [];
  let hasSuggestion = false;
  for (const item of items) {
    const input = item.querySelector('input');
    if (input.checked) completed.push(input.dataset.check);
    const suggested = !input.checked && item.dataset.checkSection === activeSection;
    item.toggleAttribute('data-suggested', suggested);
    hasSuggestion ||= suggested;
  }
  count.textContent = `${completed.length} of ${items.length}`;
  panel.toggleAttribute('data-has-suggestion', hasSuggestion);
  allDone = completed.length === items.length;
  return completed;
}

panel.addEventListener('click', (event) => {
  if (!event.target.matches('.checklist-item input[type="checkbox"]')) return;
  lastPointer = event.detail > 0
    ? { input: event.target, x: event.clientX, y: event.clientY }
    : undefined;
});

function celebrateCompletion(origin) {
  if (!celebrationViewport.matches || reducedMotion.matches || !('CanvasRenderingContext2D' in window)) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'checklist-celebration';
  canvas.setAttribute('aria-hidden', 'true');
  const context = canvas.getContext('2d');
  if (!context) return;
  document.body.append(canvas);

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const pieces = [];
  const colors = ['#ffffff', '#b8e4fa', '#74c7f5', '#a4e7c2', '#f4d58b', '#f5a8c4'];
  const shapes = ['rect', 'strip', 'circle', 'triangle'];
  const startX = Math.max(20, Math.min(width - 20, origin.x));
  const startY = Math.max(20, Math.min(height - 20, origin.y));
  const total = 84;
  for (let index = 0; index < total; index++) {
    const angle = (-Math.PI / 2) + (Math.random() - 0.5) * 1.9;
    const speed = 3.5 + Math.random() * 6.5;
    const size = 5 + Math.random() * 8;
    pieces.push({
      x: startX + (Math.random() - 0.5) * 14,
      y: startY + (Math.random() - 0.5) * 14,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      size,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.24,
      flutter: Math.random() * 0.08,
      life: 95 + Math.floor(Math.random() * 55),
      age: 0,
    });
  }

  let frame;
  function draw() {
    context.clearRect(0, 0, width, height);
    for (const piece of pieces) {
      if (piece.age >= piece.life) continue;
      piece.age++;
      piece.vy += 0.13;
      piece.vx *= 0.994;
      piece.vx += Math.sin(piece.age * 0.09) * piece.flutter;
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.rotation += piece.spin;
      const remaining = 1 - piece.age / piece.life;
      context.save();
      context.globalAlpha = Math.min(1, remaining * 4);
      context.fillStyle = piece.color;
      context.translate(piece.x, piece.y);
      context.rotate(piece.rotation);
      if (piece.shape === 'circle') {
        context.beginPath();
        context.ellipse(0, 0, piece.size * 0.5, piece.size * 0.36, 0, 0, Math.PI * 2);
        context.fill();
      } else if (piece.shape === 'triangle') {
        context.beginPath();
        context.moveTo(0, -piece.size * 0.6);
        context.lineTo(piece.size * 0.5, piece.size * 0.5);
        context.lineTo(-piece.size * 0.5, piece.size * 0.5);
        context.closePath();
        context.fill();
      } else {
        context.fillRect(-piece.size * 0.35, -piece.size * 0.5, piece.shape === 'strip' ? piece.size * 0.24 : piece.size * 0.7, piece.size);
      }
      context.restore();
    }

    if (pieces.some((piece) => piece.age < piece.life)) frame = requestAnimationFrame(draw);
    else canvas.remove();
  }

  frame = requestAnimationFrame(draw);
  window.setTimeout(() => {
    cancelAnimationFrame(frame);
    canvas.remove();
  }, 4500);
}

panel.addEventListener('change', (event) => {
  event.target.closest('.checklist-item')?.classList.add('interacted');
  const wasAllDone = allDone;
  const completed = updateChecklist();
  if (!wasAllDone && completed.length === items.length) {
    const checkbox = event.target.closest('input[type="checkbox"]');
    const rect = checkbox?.getBoundingClientRect();
    const origin = lastPointer?.input === checkbox
      ? lastPointer
      : (rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : { x: innerWidth / 2, y: innerHeight / 2 });
    lastPointer = undefined;
    celebrateCompletion(origin);
  }
  try {
    localStorage.setItem(storageKey, JSON.stringify(completed));
  } catch {
    // The selection is still available during this visit.
  }
});

function updateReadingPosition() {
  const guideStarted = guide.getBoundingClientRect().top <= readingLine;
  panel.toggleAttribute('data-guide-started', guideStarted);
  activeSection = chapters.findLast((chapter) => chapter.getBoundingClientRect().top <= readingLine)?.id;
  updateChecklist();
}

function observeReadingPosition() {
  readingObserver?.disconnect();
  const height = document.documentElement.clientHeight;
  readingLine = Math.max(1, Math.min(220, Math.round(height * 0.35)));
  // Observe a one-pixel strip so entering and leaving a section updates its hint.
  readingObserver = new IntersectionObserver(updateReadingPosition, {
    rootMargin: `-${readingLine - 1}px 0px -${height - readingLine}px 0px`,
  });
  readingObserver.observe(guide);
  for (const chapter of chapters) readingObserver.observe(chapter);
  updateReadingPosition();
}

function setDefaultPanelPosition() {
  panel.open = !desktop.matches || roomForOpenPanel.matches;
}

count.hidden = false;
updateChecklist();
if ('IntersectionObserver' in window) {
  panel.classList.add('is-floating');
  setDefaultPanelPosition();
  desktop.addEventListener('change', setDefaultPanelPosition);
  roomForOpenPanel.addEventListener('change', setDefaultPanelPosition);
  window.addEventListener('resize', observeReadingPosition);
  observeReadingPosition();
}
