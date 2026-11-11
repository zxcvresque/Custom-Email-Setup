const panel = document.querySelector('.checklist-panel');
const items = Array.from(panel.querySelectorAll('.checklist-item'));
const count = panel.querySelector('.checklist-count');
const chapters = Array.from(document.querySelectorAll('.chapter'));
const guide = document.getElementById('guide');
const storageKey = 'email-guide-checklist';
const desktop = matchMedia('(min-width: 1024px)');
const roomForOpenPanel = matchMedia('(min-width: 1180px)');
let readingLine = 0;
let readingObserver;
let activeSection;

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
  return completed;
}

panel.addEventListener('change', (event) => {
  event.target.closest('.checklist-item')?.classList.add('interacted');
  const completed = updateChecklist();
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
