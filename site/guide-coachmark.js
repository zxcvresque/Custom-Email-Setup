const controls = document.querySelector('.guide-controls');

if (controls && controls.querySelectorAll('button[data-guide-toggle]').length >= 2) {
  const coachmark = document.createElement('aside');
  coachmark.className = 'guide-coachmark';
  coachmark.dataset.guideCoachmark = '';
  coachmark.id = 'guide-reading-modes';
  coachmark.setAttribute('role', 'status');
  coachmark.setAttribute('aria-label', 'Guide reading options');
  coachmark.innerHTML = `
    <p>Read the guide in two ways: follow the recommended setup, or switch on simpler wording. Use the buttons at the top to change modes.</p>
    <button type="button" class="guide-coachmark-dismiss">Got it</button>
  `;

  const dismiss = () => {
    if (coachmark.hidden) return;
    coachmark.hidden = true;
    controls.classList.remove('guide-coachmark-highlight');
    document.dispatchEvent(new CustomEvent('guide:coachmark-dismissed'));
  };

  controls.append(coachmark);
  controls.classList.add('guide-coachmark-highlight');
  coachmark.querySelector('.guide-coachmark-dismiss').addEventListener('click', dismiss);
  controls.querySelectorAll('button[data-guide-toggle]').forEach((button) => button.addEventListener('click', dismiss, { once: true }));

  // Clear the intro before the later scroll-triggered prompts become eligible.
  let scrollFrame = 0;
  document.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      const scrollable = document.documentElement.scrollHeight - innerHeight;
      if (scrollable > 0 && scrollY / scrollable >= 0.12) dismiss();
    });
  }, { passive: true });

  // The parent toast controller can close this before presenting a prompt.
  window.customEmailGuideCoachmark = { dismiss, isOpen: () => !coachmark.hidden };
}
