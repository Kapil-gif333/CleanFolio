#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json'), 'utf8'));
const examples = require('./project-data.js');

function slugify(value) {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
function diagramBlock(name, info, x, width = 138) {
  return `<g class="part" data-part data-name="${escapeHtml(name)}" data-info="${escapeHtml(info)}"><rect x="${x}" y="99" width="${width}" height="66" rx="3"/><text x="${x + width / 2}" y="137" text-anchor="middle">${escapeHtml(name)}</text></g>`;
}
function defaultProject(title, category) {
  return {
    title, category, summary: 'Describe what this build does in one clear sentence.', board: '[ BOARD NAME ]', core: '[ THE MAIN IDEA ]',
    status: 'Prototype', year: new Date().getFullYear(), story: 'Explain the problem this build solves, who it is for, and how the finished system behaves.',
    challenge: 'Describe one design decision that mattered: a constraint, a failure, or a trade-off you worked through.',
    learned: 'Write down the most useful technical lesson from this build, including what you would repeat next time.',
    next: 'Add the next experiment or improvement you would like to try.', codeNote: 'Replace this small example with a useful, tested excerpt from your firmware.',
    filename: 'main.ino', code: 'void setup() {\n  // Initialize your hardware here.\n}\n\nvoid loop() {\n  // Read, decide, and act.\n}\n',
    parts: [['U1', '[ Microcontroller ]', '1', '[ Board and voltage ]'], ['S1', '[ Sensor ]', '1', '[ Model and pin ]'], ['M1', '[ Output device ]', '1', '[ Rating or driver ]']],
    components: [{ name: '[ Sensor ]', info: 'Reads an input. Add its signal pin and power rail.' }, { name: '[ Board ]', info: 'Controller. Add the board pin mapping and supply voltage.' }, { name: '[ Output ]', info: 'Actuator or display. Note any required driver stage.' }],
    wires: ['M 210 132 H 266', 'M 404 132 H 460']
  };
}
function renderDiagram(project) {
  const points = [72, 322, 572];
  const nodes = project.components.map((part, i) => diagramBlock(part.name, part.info, points[i], i === 1 ? 156 : 138)).join('');
  const lines = project.wires.map((wire) => `<path class="wire" d="${wire}"/>`).join('');
  return `<svg class="circuit-svg" viewBox="0 0 782 260" role="img" aria-label="${escapeHtml(project.title)} circuit diagram"><text class="svg-label" x="20" y="40">POWER / SIGNAL FLOW</text>${lines}${nodes}<text class="svg-label" x="72" y="202">INPUT</text><text class="svg-label" x="322" y="202">PROCESS</text><text class="svg-label" x="572" y="202">OUTPUT</text></svg>`;
}
function photoSlots(slug, title) {
  return [1, 2, 3].map((number) => {
    const index = String(number).padStart(2, '0');
    const image = findPhoto(slug, index);
    const media = image
      ? `<img class="project-photo-image" src="../assets/projects/${image}" alt="${escapeHtml(title)}, build photo ${Number(index)}. Replace this with a description of the image." loading="lazy" decoding="async"/>`
      : `<div class="photo-slot-media"><span class="photo-placeholder-mark" aria-hidden="true">${index}</span><span class="photo-placeholder-label">ADD A BUILD PHOTO</span></div>`;
    return `<figure class="photo-slot${image ? ' has-photo' : ''}" data-photo-slot="${index}">${media}<figcaption><span>BUILD PHOTO ${index}</span><code>assets/projects/${slug}-${index}.webp</code></figcaption></figure>`;
  }).join('\n          ');
}
function findPhoto(slug, index) {
  const directory = path.join(root, 'assets', 'projects');
  for (const extension of ['webp', 'jpg', 'jpeg', 'png']) {
    const filename = `${slug}-${index}.${extension}`;
    if (fs.existsSync(path.join(directory, filename))) return filename;
  }
  return null;
}
function renderProject(project, index) {
  const slug = slugify(project.title);
  const filename = path.join(root, 'projects', `${slug}.html`);
  const base = config.url.replace(/\/?$/, '/');
  const data = {
    TITLE: project.title, DESCRIPTION: project.summary, AUTHOR: config.author, SITE_NAME: config.name, GITHUB: config.github,
    CANONICAL: `${base}projects/${slug}.html`, OG_IMAGE: `${base}assets/og-image.svg`, SLUG: slug,
    CATEGORY: project.category.toUpperCase(), INDEX: String(index).padStart(2, '0'), BOARD: project.board, CORE: project.core,
    STATUS: project.status, YEAR: project.year, SUMMARY: project.summary, STORY: project.story, CHALLENGE: project.challenge,
    DIAGRAM: `<svg class="project-overview" viewBox="0 0 680 300" role="img" aria-label="Illustrated overview of ${escapeHtml(project.title)}"><path d="M112 220 207 168 324 196 447 102 565 132" fill="none" stroke="var(--copper)" stroke-width="2" stroke-dasharray="5 7"/><path d="M112 220V96l95-53 117 28v125M324 71l123-45 118 26v107" fill="none" stroke="var(--line)" stroke-width="1"/><circle cx="112" cy="220" r="7" fill="var(--copper)"/><circle cx="324" cy="196" r="7" fill="var(--copper)"/><circle cx="565" cy="132" r="7" fill="var(--copper)"/><text x="90" y="250" fill="var(--muted)" font-size="11" font-family="monospace">SENSE</text><text x="296" y="226" fill="var(--muted)" font-size="11" font-family="monospace">THINK</text><text x="537" y="162" fill="var(--muted)" font-size="11" font-family="monospace">ACT</text></svg>`,
    CIRCUIT: renderDiagram(project), PHOTO_SLOTS: photoSlots(slug, project.title),
    PARTS: project.parts.map(([ref, part, qty, note]) => `<tr><td>${escapeHtml(ref)}</td><td>${escapeHtml(part)}</td><td>${escapeHtml(qty)}</td><td>${escapeHtml(note)}</td></tr>`).join('\n          '),
    CODE_NOTE: project.codeNote, FILENAME: project.filename, CODE: escapeHtml(project.code), LEARNED: project.learned, NEXT: project.next,
    EMAIL: config.email, ENCODED_TITLE: encodeURIComponent(project.title),
    SCHEMA: JSON.stringify({ '@context': 'https://schema.org', '@type': 'CreativeWork', name: project.title, description: project.summary, author: { '@type': 'Person', name: config.author }, url: `${base}projects/${slug}.html` })
  };
  let html = fs.readFileSync(path.join(root, 'templates', 'project.html'), 'utf8');
  for (const [key, value] of Object.entries(data)) html = html.replaceAll(`{{${key}}}`, String(value));
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  fs.writeFileSync(filename, html);
  return { slug, project };
}
function addHomeRow({ slug, project }, index) {
  const file = path.join(root, 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  if (html.includes(`./projects/${slug}.html`)) return;
  const category = project.category.toLowerCase().replace(/[^a-z0-9 -]/g, '');
  const image = findPhoto(slug, '01');
  const thumb = image ? `<img class="thumbnail-photo" src="./assets/projects/${image}" alt="" loading="lazy"/>` : '<span class="thumb-placeholder"></span>';
  const row = `        <a class="project-row" href="./projects/${slug}.html" data-category="${escapeHtml(category)}"><span class="row-id">${String(index).padStart(2, '0')}</span><span class="row-thumb thumb-custom" data-photo-thumb="${slug}" aria-hidden="true">${thumb}</span><span class="row-main"><span class="row-title">${escapeHtml(project.title)}</span><span class="row-desc">${escapeHtml(project.summary)}</span></span><span class="row-tags"><span>${escapeHtml(project.category.toUpperCase())}</span></span><span class="row-year">${escapeHtml(project.year)}</span><span class="row-arrow" aria-hidden="true">↗</span></a>\n`;
  if (!html.includes('<!-- PROJECT ROWS END -->')) throw new Error('Project list marker not found in index.html');
  const next = html.replace('<!-- PROJECT ROWS END -->', `${row}        <!-- PROJECT ROWS END -->`);
  const count = (next.match(/class="project-row"/g) || []).length;
  const withCounts = next
    .replace(/(data-filter="all"[^>]*>All <span>)\d+(<\/span>)/, `$1${String(count).padStart(2, '0')}$2`)
    .replace(/(<span id="project-count">)\d+(<\/span>)/, `$1${String(count).padStart(2, '0')}$2`);
  fs.writeFileSync(file, withCounts);
}
function buildSitemap() {
  const base = config.url.replace(/\/?$/, '/');
  const pages = ['index.html', ...fs.readdirSync(path.join(root, 'projects')).filter((name) => name.endsWith('.html')).sort().map((name) => `projects/${name}`)];
  const entries = pages.map((page) => `  <url><loc>${base}${page === 'index.html' ? '' : page}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>`).join('\n');
  fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`);
  fs.writeFileSync(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${base}sitemap.xml\n`);
}

const title = process.argv.slice(2).join(' ').trim();
if (process.argv.includes('--examples')) {
  examples.forEach((project, i) => {
    const result = renderProject(project, i + 1);
    addHomeRow(result, i + 4);
    console.log(`Created projects/${result.slug}.html`);
  });
  buildSitemap();
} else if (!title) {
  console.error('Usage: node scripts/new-project.js "Project title"');
  console.error('       node scripts/new-project.js --examples');
  process.exitCode = 1;
} else {
  const project = defaultProject(title, process.argv[3] || 'Embedded');
  const result = renderProject(project, fs.readdirSync(path.join(root, 'projects')).filter((name) => name.endsWith('.html')).length + 1);
  addHomeRow(result, fs.readdirSync(path.join(root, 'projects')).filter((name) => name.endsWith('.html')).length);
  buildSitemap();
  console.log(`Created projects/${result.slug}.html`);
}

module.exports = { buildSitemap };
