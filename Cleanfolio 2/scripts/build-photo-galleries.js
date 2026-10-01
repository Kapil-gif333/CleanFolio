#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const projectDir = path.join(root, 'projects');
const photoDir = path.join(root, 'assets', 'projects');
const extensions = ['webp', 'jpg', 'jpeg', 'png'];

function findPhoto(slug, index) {
  for (const extension of extensions) {
    const filename = `${slug}-${index}.${extension}`;
    if (fs.existsSync(path.join(photoDir, filename))) return filename;
  }
  return null;
}
function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
function slots(slug, title) {
  return [1, 2, 3].map((number) => {
    const index = String(number).padStart(2, '0');
    const file = findPhoto(slug, index);
    const media = file
      ? `<img class="project-photo-image" src="../assets/projects/${file}" alt="${escapeHtml(title)}, build photo ${number}. Replace this with a description of the image." loading="lazy" decoding="async"/>`
      : `<div class="photo-slot-media"><span class="photo-placeholder-mark" aria-hidden="true">${index}</span><span class="photo-placeholder-label">ADD A BUILD PHOTO</span></div>`;
    return `<figure class="photo-slot${file ? ' has-photo' : ''}" data-photo-slot="${index}">${media}<figcaption><span>BUILD PHOTO ${index}</span><code>assets/projects/${slug}-${index}.webp</code></figcaption></figure>`;
  }).join('\n          ');
}
function refreshProjectPage(file) {
  const slug = path.basename(file, '.html');
  const absolute = path.join(projectDir, file);
  const html = fs.readFileSync(absolute, 'utf8');
  const titleMatch = html.match(/data-project-title="([^"]*)"/);
  if (!titleMatch) return 0;
  const title = titleMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  const pattern = /(<!-- PHOTO SLOTS START -->)[\s\S]*?(<!-- PHOTO SLOTS END -->)/;
  if (!pattern.test(html)) return 0;
  const updated = html.replace(pattern, `$1${slots(slug, title)}$2`);
  fs.writeFileSync(absolute, updated);
  return (updated.match(/class="photo-slot has-photo"/g) || []).length;
}
function refreshHomeThumbnails() {
  const file = path.join(root, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/data-photo-thumb="([a-z0-9-]+)"/g)) {
    const slug = match[1];
    const photo = findPhoto(slug, '01');
    const pattern = new RegExp(`(<span class="row-thumb [^"]*" data-photo-thumb="${slug}" aria-hidden="true">)(?:<span class="thumb-placeholder"><\\/span>|<img class="thumbnail-photo"[^>]*>)<\\/span>`);
    const replacement = photo
      ? `$1<img class="thumbnail-photo" src="./assets/projects/${photo}" alt="" loading="lazy"/>${'</span>'}`
      : '$1<span class="thumb-placeholder"></span></span>';
    html = html.replace(pattern, replacement);
  }
  fs.writeFileSync(file, html);
}

const pages = fs.readdirSync(projectDir).filter((file) => file.endsWith('.html'));
const imageCount = pages.reduce((sum, file) => sum + refreshProjectPage(file), 0);
refreshHomeThumbnails();
console.log(`Updated photo galleries for ${pages.length} project pages (${imageCount} photos found).`);
