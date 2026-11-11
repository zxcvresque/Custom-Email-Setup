import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { build } from 'esbuild';
import MarkdownIt from 'markdown-it';
import octicons from '@primer/octicons';

const md = new MarkdownIt({ html: true, linkify: true });
const readme = await readFile('README.md', 'utf8');
const repository = 'https://github.com/zxcvresque/Custom-Email-Setup';
const tokens = md.parse(readme, {});
const chapters = [];
for (let i = 0; i < tokens.length; i++) {
  if (tokens[i].type !== 'heading_open' || tokens[i].tag !== 'h2') continue;
  const title = tokens[i + 1].content;
  if (title === 'Preview the website locally') break;
  const end = tokens.findIndex((token, index) =>
    index > i && token.type === 'heading_open' && token.tag === 'h2');
  chapters.push({
    title,
    id: title.toLowerCase().replace(/[^a-z0-9 ]/g, '').replaceAll(' ', '-'),
    body: md.renderer.render(tokens.slice(i + 3, end < 0 ? undefined : end), md.options, {}),
  });
}

const svg = (name) => octicons[name].toSVG({ 'aria-hidden': 'true', width: 16, height: 16 });
const flow = (href, label) => `<a class="flow" href="${href}"><span class="flow-fill"></span>
  <span class="flow-in">${svg('arrow-right')}</span><span class="flow-label">${label}</span>
  <span class="flow-out">${svg('arrow-right')}</span></a>`;
const checklist = `<details class="checklist-panel" open>
  <summary class="checklist-summary">${svg('checklist')}<span>Setup checklist</span><span class="checklist-count" hidden></span></summary>
  <fieldset class="setup-checklist" aria-label="Setup tasks">
  ${[
    ['domain', 'connect-your-domain', 'I own a domain and can change its DNS'],
    ['inbox', 'route-incoming-mail', 'I can access my destination inbox'],
    ['relay', 'set-up-the-smtp-relay', 'I have an account with an SMTP relay'],
    ['send', 'send-from-your-inbox', 'I can send from my custom address'],
    ['test', 'test-both-directions', 'I tested sending and receiving'],
  ].map(([key, section, label]) => `<label class="checklist-item" data-check-section="${section}">
    <input type="checkbox" data-check="${key}">
    <span class="check-box" aria-hidden="true">${svg('check')}</span><span class="check-label">${label}</span>
  </label>`).join('')}
  </fieldset>
</details>`;
const nav = chapters.map(({ title, id }) => `<li><a href="#${id}">${md.utils.escapeHtml(title)}</a></li>`).join('');
const sections = chapters.map(({ title, id, body }) => {
  const steps = ['connect-your-domain', 'route-incoming-mail', 'set-up-the-smtp-relay', 'send-from-your-inbox', 'add-dmarc', 'test-both-directions', 'add-a-profile-picture'];
  const step = steps.indexOf(id) + 1;
  const content = body
    .replaceAll('<table>', '<div class="table-wrap" role="region" aria-label="Scrollable table" tabindex="0"><table>')
    .replaceAll('</table>', '</table></div>');
  return `<section class="chapter" id="${id}" aria-labelledby="${id}-title">
    <header class="chapter-head">${step ? `<span class="step" aria-label="Step ${step}">${String(step).padStart(2, '0')}</span>` : ''}
      <h2 id="${id}-title">${md.utils.escapeHtml(title)}</h2></header>
    ${content}${id === 'how-it-works' ? checklist : ''}</section>`;
}).join('');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Set up email at your own domain with free forwarding, an SMTP relay, and the inbox you already use.">
  <meta name="color-scheme" content="light dark">
  <title>Custom Email Setup | Zxcvresque</title>
  <script>try { const theme = localStorage.getItem('email-guide-theme'); if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme; } catch {}</script>
  <link rel="stylesheet" href="./guide.css">
  <link rel="stylesheet" href="./checklist.css">
  <script defer src="./guide.js"></script>
</head>
<body id="top">
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
    <article aria-label="Custom email setup guide">${sections}</article>
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
