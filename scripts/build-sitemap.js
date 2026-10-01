#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json'), 'utf8'));
const base = config.url.replace(/\/?$/, '/');
const projectDir = path.join(root, 'projects');
const pages = ['index.html', ...fs.readdirSync(projectDir).filter((file) => file.endsWith('.html')).sort().map((file) => `projects/${file}`)];
const lastmod = new Date().toISOString().slice(0, 10);
const urls = pages.map((page) => `  <url><loc>${base}${page === 'index.html' ? '' : page}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n');
fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
fs.writeFileSync(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${base}sitemap.xml\n`);
console.log(`Updated sitemap.xml and robots.txt for ${pages.length} pages.`);
