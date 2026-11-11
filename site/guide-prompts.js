const controls = document.querySelector('.guide-controls');
if (controls) {
  const buttons = new Map(
    Array.from(controls.querySelectorAll('[data-guide-toggle]'), (button) => [button.dataset.guideToggle, button]),
  );
  const definitions = [
    {
      key: 'recommended',
      threshold: 0.3,
      title: 'Would you like to use the recommended setup?',
      detail: 'Cloudflare forwards incoming mail, Gmail is your inbox, and SMTP2GO sends replies. You can change either option with the controls at the top of the guide.',
      accept: 'Show recommended',
      appliedTitle: 'Recommended setup is on',
      appliedDetail: 'The guide now emphasizes the Cloudflare + Gmail + SMTP2GO route. Tables and provider icons stay visible. Both controls remain at the top of the guide.',
    },
    {
      key: 'plain',
      threshold: 0.5,
      title: 'Want shorter, simpler explanations?',
      detail: 'Switch to plain language for the guide. You can change either option with the controls at the top of the guide.',
      accept: 'Use simple language',
      appliedTitle: 'Simple language is on',
      appliedDetail: 'The guide now uses shorter wording while keeping its tables, icons, and steps. Both controls remain at the top of the guide.',
    },
  ];
  const byKey = new Map(definitions.map((definition) => [definition.key, definition]));
  const resolved = new Set();
  const queued = new Set();
  const queue = [];
  let active = null;
  let programmaticToggle = false;
  let isClosing = false;
  let pointerInside = false;
  let focusInside = false;
  let toastTimer;
  let pausedAt;
  let remaining = 0;

  const toast = document.createElement('aside');
  toast.className = 'guide-action-toast';
  toast.id = 'guide-action-toast';
  toast.hidden = true;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.setAttribute('aria-atomic', 'true');
  toast.setAttribute('aria-relevant', 'additions text');
  document.body.append(toast);

  function coachmarkOpen() {
    return Boolean(document.querySelector('[data-guide-coachmark]:not([hidden])'));
  }

  function isEnabled(key) {
    return buttons.get(key)?.getAttribute('aria-pressed') === 'true';
  }

  function setButton(key, enabled) {
    const button = buttons.get(key);
    if (!button || isEnabled(key) === enabled) return false;
    programmaticToggle = true;
    button.click();
    programmaticToggle = false;
    return true;
  }

  function setFocusWithoutScroll(element) {
    try {
      element?.focus({ preventScroll: true });
    } catch {
      element?.focus();
    }
  }

  function clearTimer() {
    clearTimeout(toastTimer);
    toastTimer = undefined;
    pausedAt = undefined;
  }

  function pauseTimer() {
    if (!toastTimer) return;
    remaining = Math.max(0, remaining - (Date.now() - pausedAt));
    clearTimeout(toastTimer);
    toastTimer = undefined;
    pausedAt = undefined;
  }

  function resumeTimer() {
    if (!active || toastTimer || pausedAt || pointerInside || focusInside) return;
    pausedAt = Date.now();
    toastTimer = setTimeout(() => {
      toastTimer = undefined;
      pausedAt = undefined;
      if (active?.view === 'prompt') resolved.add(active.definition.key);
      closeToast(false);
    }, remaining);
  }

  toast.addEventListener('pointerenter', () => {
    pointerInside = true;
    pauseTimer();
  });
  toast.addEventListener('pointerleave', () => {
    pointerInside = false;
    resumeTimer();
  });
  toast.addEventListener('focusin', () => {
    focusInside = true;
    pauseTimer();
  });
  toast.addEventListener('focusout', (event) => {
    if (!toast.contains(event.relatedTarget)) {
      focusInside = false;
      resumeTimer();
    }
  });

  function addAction(label, kind, action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `guide-toast-action guide-toast-action-${kind}`;
    button.textContent = label;
    button.addEventListener('click', action);
    return button;
  }

  function render(title, detail, actions) {
    toast.replaceChildren();
    const mark = document.createElement('span');
    mark.className = 'guide-toast-mark';
    mark.setAttribute('aria-hidden', 'true');
    mark.innerHTML = '<svg viewBox="0 0 20 20" focusable="false"><path d="M10 1.7 12 7l5.4 2-5.4 2-2 5.4L8 11 2.6 9 8 7l2-5.3Z" fill="currentColor"/><path d="m16.3 13.6.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" fill="currentColor"/></svg>';
    const content = document.createElement('div');
    content.className = 'guide-toast-content';
    const heading = document.createElement('strong');
    heading.className = 'guide-toast-title';
    heading.textContent = title;
    const message = document.createElement('p');
    message.className = 'guide-toast-detail';
    message.textContent = detail;
    const actionsRow = document.createElement('div');
    actionsRow.className = 'guide-toast-actions';
    for (const action of actions) actionsRow.append(action);
    content.append(heading, message, actionsRow);
    toast.append(mark, content);
  }

  function armTimer(duration) {
    clearTimer();
    remaining = duration;
    resumeTimer();
  }

  function showApplied(definition) {
    active = { definition, view: 'applied' };
    render(
      definition.appliedTitle,
      definition.appliedDetail,
      [
        addAction('Undo', 'secondary', () => {
          setButton(definition.key, false);
          resolved.add(definition.key);
          closeToast(true);
        }),
        addAction('Dismiss', 'quiet', () => closeToast(true)),
      ],
    );
    toast.hidden = false;
    toast.classList.remove('is-closing');
    toast.classList.add('is-visible');
    armTimer(12000);
    setFocusWithoutScroll(toast.querySelector('.guide-toast-action-secondary'));
  }

  function showPrompt(definition) {
    active = { definition, view: 'prompt' };
    render(
      definition.title,
      definition.detail,
      [
        addAction(definition.accept, 'primary', () => {
          resolved.add(definition.key);
          setButton(definition.key, true);
          showApplied(definition);
        }),
        addAction('Dismiss', 'quiet', () => {
          resolved.add(definition.key);
          closeToast(true);
        }),
      ],
    );
    toast.hidden = false;
    toast.classList.remove('is-closing');
    toast.classList.add('is-visible');
    armTimer(18000);
  }

  function closeToast(restoreControlFocus) {
    if (!active || isClosing) return;
    const previous = active;
    const focusWasInside = toast.contains(document.activeElement);
    clearTimer();
    pointerInside = false;
    focusInside = false;
    active = null;
    isClosing = true;
    toast.classList.remove('is-visible');
    toast.classList.add('is-closing');
    setTimeout(() => {
      isClosing = false;
      if (active) return;
      toast.hidden = true;
      toast.classList.remove('is-closing');
      if (restoreControlFocus && focusWasInside && previous) setFocusWithoutScroll(buttons.get(previous.definition.key));
      showNext();
    }, 180);
  }

  function showNext() {
    if (active || isClosing || coachmarkOpen()) return;
    while (queue.length) {
      const definition = byKey.get(queue.shift());
      queued.delete(definition.key);
      if (!definition || resolved.has(definition.key) || isEnabled(definition.key)) continue;
      showPrompt(definition);
      return;
    }
  }

  function queuePrompt(definition) {
    if (resolved.has(definition.key) || queued.has(definition.key) || isEnabled(definition.key)) {
      if (isEnabled(definition.key)) resolved.add(definition.key);
      return;
    }
    queued.add(definition.key);
    queue.push(definition.key);
    showNext();
  }

  function updateThresholds() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
    for (const definition of definitions) if (progress >= definition.threshold) queuePrompt(definition);
  }

  let scrollFrame = 0;
  function onScroll() {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      updateThresholds();
    });
  }

  for (const [key, button] of buttons) {
    button.addEventListener('click', () => {
      if (programmaticToggle) return;
      resolved.add(key);
      const queuedIndex = queue.indexOf(key);
      if (queuedIndex >= 0) queue.splice(queuedIndex, 1);
      queued.delete(key);
      if (active?.definition.key === key) closeToast(false);
    });
  }

  document.addEventListener('guide:coachmark-dismissed', showNext);
  toast.hidden = true;
  updateThresholds();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
}
