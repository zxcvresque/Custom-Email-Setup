import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { build } from 'esbuild';
import MarkdownIt from 'markdown-it';
import octicons from '@primer/octicons';

const md = new MarkdownIt({ html: true, linkify: true });
const guide = await readFile('site/guide.md', 'utf8');
const repository = 'https://github.com/zxcvresque/Custom-Email-Setup';
const publicUrl = 'https://zxcvresque.github.io/Custom-Email-Setup/';
const pageTitle = 'Free Custom Email Setup for Your Domain | Zxcvresque';
const description = 'Learn how to set up a custom domain email address with free forwarding, a free SMTP relay, and the inbox you already use.';
const tokens = md.parse(guide, {});
const plainTokens = md.parse(await readFile('site/plain-guide.md', 'utf8'), {});
const chapters = [];
for (let i = 0; i < tokens.length; i++) {
  if (tokens[i].type !== 'heading_open' || tokens[i].tag !== 'h2') continue;
  const title = tokens[i + 1].content;
  const end = tokens.findIndex((token, index) =>
    index > i && token.type === 'heading_open' && token.tag === 'h2');
  chapters.push({
    title,
    id: title.toLowerCase().replace(/[^a-z0-9 ]/g, '').replaceAll(' ', '-'),
    body: md.renderer.render(tokens.slice(i + 3, end < 0 ? undefined : end), md.options, {}),
  });
}

const plainSections = new Map();
for (let i = 0; i < plainTokens.length; i++) {
  if (plainTokens[i].type !== 'heading_open' || plainTokens[i].tag !== 'h2') continue;
  const title = plainTokens[i + 1].content;
  const end = plainTokens.findIndex((token, index) => index > i && token.type === 'heading_open' && token.tag === 'h2');
  plainSections.set(title, md.renderer.render(plainTokens.slice(i + 3, end < 0 ? undefined : end), md.options, {}));
}
if (chapters.some(({ title }) => !plainSections.has(title))) throw new Error('A plain-language section is missing.');

function recommendedBody(title, body) {
  if (title === 'Free SMTP relay plans') {
    return body
      .replace('The guide uses ', 'The recommended route uses ')
      .replace('This guide uses ', 'The recommended route uses ')
      .replace('Compare these free options if you need a different allowance.', 'Cloudflare forwards incoming mail and Gmail is the inbox. Other free relay options remain below.')
      .replace('The table lists other free options too.', 'Cloudflare forwards incoming mail and Gmail is the inbox. Other free relay options remain in the table below.');
  }
  if (title === 'Send from your inbox') {
    return body.replace(
      /<p>(?:Client support varies\.|Some email apps support these settings too\.)[\s\S]*?<\/p>/,
      '<p>Recommended: use Gmail on the web with SMTP2GO. Other email clients can use these settings if they support an external SMTP server.</p>',
    );
  }
  if (title === 'How it works') {
    return body.replace(
      'Your destination inbox. Use an email client that supports external SMTP to send from your custom address.',
      'Your inbox. This guide uses Gmail, Cloudflare forwarding, and SMTP2GO for replies.',
    ).replace(
      'Your inbox. Gmail is used in this guide to send from your custom address.',
      'Your inbox. Recommended: read mail in Gmail, with Cloudflare forwarding and SMTP2GO for replies.',
    );
  }
  return body;
}

function structureSignature(html) {
  return Array.from(html.matchAll(/<[^>]+>/g), ([tag]) => tag.replace(/\s+/g, ' ').trim()).join('');
}

const svg = (name) => octicons[name].toSVG({ 'aria-hidden': 'true', width: 16, height: 16 });
const flow = (href, label) => `<a class="flow" href="${href}"><span class="flow-fill"></span>
  <span class="flow-in">${svg('arrow-right')}</span><span class="flow-label">${label}</span>
  <span class="flow-out">${svg('arrow-right')}</span></a>`;
const checklist = `<details class="checklist-panel" open>
  <summary class="checklist-summary">${svg('checklist')}<span>Setup checklist</span><span class="checklist-count" hidden></span></summary>
  <fieldset class="setup-checklist" aria-label="Setup tasks">
  ${[
    ['domain', 'connect-your-domain', 'I own a domain and can change its DNS', 'Have your registrar login ready.'],
    ['inbox', 'route-incoming-mail', 'I can access my destination inbox', 'Open the inbox that will receive forwarded mail.'],
    ['relay', 'set-up-the-smtp-relay', 'I have an account with an SMTP relay', 'Sign in to the relay dashboard.'],
    ['send', 'send-from-your-inbox', 'I can send from my custom address', 'Check that your custom address appears in the From menu.'],
    ['test', 'test-both-directions', 'I tested sending and receiving', 'Send a test message in each direction.'],
  ].map(([key, section, label, hint]) => `<div class="checklist-item" data-check-section="${section}">
    <label class="checklist-check">
      <input type="checkbox" data-check="${key}">
      <span class="check-box" aria-hidden="true">${svg('check')}</span><span class="check-label">${label}</span>
    </label>
    <a class="checklist-jump" href="#${section}" aria-label="Go to ${chapters.find((chapter) => chapter.id === section).title}">${svg('arrow-right')}</a>
    <span class="checklist-hint">${hint}</span>
  </div>`).join('')}
  </fieldset>
</details>`;
const nav = chapters.map(({ title, id }) => `<li><a href="#${id}">${md.utils.escapeHtml(title)}</a></li>`).join('');
const sections = chapters.map(({ title, id, body }) => {
  const steps = ['connect-your-domain', 'route-incoming-mail', 'set-up-the-smtp-relay', 'send-from-your-inbox', 'add-dmarc', 'test-both-directions', 'add-a-profile-picture'];
  const step = steps.indexOf(id) + 1;
  const wrapTables = (content) => content
    .replaceAll('<table>', '<div class="table-wrap" role="region" aria-label="Scrollable table" tabindex="0"><table>')
    .replaceAll('</table>', '</table></div>');
  const plain = plainSections.get(title);
  const variants = [
    ['full', body], ['recommended', recommendedBody(title, body)],
    ['plain', plain], ['recommended-plain', recommendedBody(title, plain)],
  ];
  const expectedStructure = structureSignature(body);
  for (const [mode, content] of variants) {
    if (structureSignature(content) !== expectedStructure) {
      throw new Error(`The ${mode} version of “${title}” changes the guide structure.`);
    }
  }
  const renderedVariants = variants.map(([mode, content]) =>
    `<div class="guide-copy" data-guide-variant="${mode}"${mode === 'full' ? '' : ' hidden'}>${wrapTables(content)}</div>`).join('');
  return `<section class="chapter" id="${id}" aria-labelledby="${id}-title">
    <header class="chapter-head">${step ? `<span class="step" aria-label="Step ${step}">${String(step).padStart(2, '0')}</span>` : ''}
      <h2 id="${id}-title">${md.utils.escapeHtml(title)}</h2></header>
    ${renderedVariants}${id === 'how-it-works' ? checklist : ''}</section>`;
}).join('');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${description}">
  <link rel="canonical" href="${publicUrl}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${publicUrl}">
  <meta name="color-scheme" content="light dark">
  <title>${pageTitle}</title>
  <script>try { const theme = localStorage.getItem('email-guide-theme'); if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme; } catch {}</script>
  <link rel="stylesheet" href="./guide.css">
  <link rel="stylesheet" href="./checklist.css">
  <link rel="stylesheet" href="./guide-coachmark.css">
  <link rel="stylesheet" href="./guide-prompts.css">
  <script defer src="./guide.js"></script>
</head>
<body id="top">
<svg class="filter-defs" aria-hidden="true" focusable="false" width="0" height="0">
  <defs>
    <filter id="guide-electric-displacement" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency=".035 .08" numOctaves="2" seed="7" result="electric-noise">
        <animate id="guide-electric-noise-animation" attributeName="baseFrequency" values=".025 .06;.065 .11;.03 .07;.055 .09;.025 .06" dur="850ms" begin="indefinite" fill="freeze"></animate>
      </feTurbulence>
      <feDisplacementMap in="SourceGraphic" in2="electric-noise" scale="7" xChannelSelector="R" yChannelSelector="G"></feDisplacementMap>
    </filter>
  </defs>
</svg>
<a class="skip" href="#guide">Skip to guide</a>
<header class="topbar">
  <div class="shell topbar-inner">
    <div class="site-brand">
      <a class="site-name" href="#top">${svg('mail')}<span>Custom Email Setup</span></a>
      <span class="site-star">
        <a href="${repository}" aria-label="Star this repository on GitHub" aria-describedby="star-tip">${svg('star')}</a>
        <span id="star-tip" role="tooltip">Star it if you liked it or it helped you</span>
      </span>
    </div>
    <nav class="top-links" aria-label="Main navigation">
      <a href="#guide">Guide</a><a href="#free-smtp-relay-plans">Free plans</a><a href="#troubleshooting">Troubleshooting</a>
    </nav>
    <div class="appearance" role="group" aria-label="Appearance" hidden>
      <span class="appearance-thumb" aria-hidden="true"></span>
      <button type="button" data-mode="system" aria-label="System appearance" title="System">${svg('device-desktop')}</button>
      <button type="button" data-mode="light" aria-label="Light appearance" title="Light">${svg('sun')}</button>
      <button type="button" data-mode="dark" aria-label="Dark appearance" title="Dark">${svg('moon')}</button>
    </div>
  </div>
</header>
<main>
  <section class="hero shell" aria-labelledby="hero-title">
    <div class="metal-frame" id="metal" aria-hidden="true"></div>
    <div class="hero-copy">
      <a class="byline" href="https://github.com/zxcvresque">${svg('mark-github')} By Zxcvresque</a>
      <h1 id="hero-title">Email at your own domain.</h1>
      <p>Send and receive custom domain email from your existing inbox, with free forwarding and an SMTP relay.</p>
      <div class="hero-actions">${flow('#guide', 'Start the guide')}<a class="repo" href="${repository}">View repository ${svg('arrow-up-right')}</a></div>
    </div>
    <button type="button" class="motion-toggle" aria-label="Pause hero animation" title="Pause animation" hidden><span>${svg('pause')}</span><span>${svg('play')}</span></button>
  </section>
  <div class="shell guide-layout" id="guide">
    <aside class="guide-rail">
      <nav class="desktop-contents" aria-label="Guide contents"><p>On this page</p><ol>${nav}</ol></nav>
      <details class="mobile-contents"><summary>On this page</summary><nav aria-label="Guide contents"><ol>${nav}</ol></nav></details>
    </aside>
    <article aria-label="Custom email setup guide">
      <div class="guide-controls" role="group" aria-label="Guide options" hidden>
        <button type="button" data-guide-toggle="recommended" aria-pressed="false" aria-describedby="recommended-tip" title="Highlights the Cloudflare + Gmail + SMTP2GO route.">
          <span>Recommended setup only</span>
          <span class="provider-route" aria-label="Cloudflare, Gmail, and SMTP2GO">
            <span><img src="assets/cloudflare.png" alt="" height="14"> Cloudflare</span><span aria-hidden="true">+</span>
            <span><img src="assets/gmail.png" alt="" height="14"> Gmail</span><span aria-hidden="true">+</span>
            <span><img src="assets/smtp2go.png" alt="" height="14"> SMTP2GO</span>
          </span>
        </button>
        <button type="button" data-guide-toggle="plain" aria-pressed="false" aria-describedby="plain-tip" title="Uses shorter wording while keeping the same tables, icons, and setup steps.">
          <span>Simple language</span>
        </button>
        <span class="guide-control-tip" id="recommended-tip" role="tooltip">Cloudflare forwards mail, Gmail is your inbox, and SMTP2GO sends replies. The comparison tables stay visible.</span>
        <span class="guide-control-tip" id="plain-tip" role="tooltip">Uses shorter wording while keeping the same tables, icons, and setup steps.</span>
      </div>
      ${sections}</article>
  </div>
</main>
<footer class="shell footer">
  <a href="${repository}">${svg('mark-github')} Custom Email Setup on GitHub</a>
  <a class="dot-fill" href="#top"><span class="dot-fill-label">Back to top</span><span class="dot-fill-arrow">${svg('arrow-up')}</span></a>
</footer>
</body>
</html>`;

await mkdir('dist/assets', { recursive: true });
const assets = new Set([...html.matchAll(/src="assets\/([^"]+)"/g)].map((match) => match[1]));
await Promise.all([
  ...Array.from(assets, (asset) => copyFile(`assets/${asset}`, `dist/assets/${asset}`)),
  copyFile('node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2', 'dist/assets/geist.woff2'),
  copyFile('site/guide.css', 'dist/guide.css'),
  copyFile('site/checklist.css', 'dist/checklist.css'),
  copyFile('site/guide-coachmark.css', 'dist/guide-coachmark.css'),
  copyFile('site/guide-prompts.css', 'dist/guide-prompts.css'),
  writeFile('dist/index.html', html),
  build({ entryPoints: ['site/guide.jsx'], outfile: 'dist/guide.js', bundle: true,
    format: 'iife', minify: true, jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' } }),
]);
const licenses = await Promise.all([
  'node_modules/@paper-design/shaders/LICENSE',
  'node_modules/@paper-design/shaders/NOTICE',
  'node_modules/@fontsource-variable/geist/LICENSE',
].map(async (path) => `\n${path}\n\n${await readFile(path, 'utf8')}`));
await writeFile('dist/third-party-notices.txt', licenses.join('\n'));
