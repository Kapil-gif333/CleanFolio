const root = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');
let savedTheme;
try { savedTheme = localStorage.getItem('cleanfolio-theme'); } catch { savedTheme = null; }
if (savedTheme ? savedTheme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('theme-dark');
themeButton?.setAttribute('aria-label', root.classList.contains('theme-dark') ? 'Switch to light theme' : 'Switch to dark theme');
themeButton?.addEventListener('click', () => {
  const isDark = root.classList.toggle('theme-dark');
  try { localStorage.setItem('cleanfolio-theme', isDark ? 'dark' : 'light'); } catch { /* Theme still changes for this page view. */ }
  themeButton.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
});

const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
  mobileNav.hidden = open;
});
mobileNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  mobileNav.hidden = true;
}));

const filters = document.querySelectorAll('.filter-button');
const projects = [...document.querySelectorAll('.project-row')];
filters.forEach((filter) => filter.addEventListener('click', () => {
  filters.forEach((button) => {
    const active = button === filter;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  const category = filter.dataset.filter;
  let visible = 0;
  projects.forEach((project) => {
    const show = category === 'all' || project.dataset.category.split(' ').includes(category);
    project.hidden = !show;
    if (show) visible++;
  });
  const count = document.querySelector('#project-count');
  if (count) count.textContent = String(visible).padStart(2, '0');
}));

document.querySelectorAll('.copy-code').forEach((button) => button.addEventListener('click', async () => {
  const code = button.closest('.code-block').querySelector('code').textContent;
  try {
    await navigator.clipboard.writeText(code);
    button.textContent = 'COPIED';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(button.closest('.code-block').querySelector('code'));
    const selection = getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    button.textContent = 'SELECTED';
  }
  setTimeout(() => { button.textContent = 'COPY CODE'; }, 1700);
}));

document.querySelectorAll('[data-year]').forEach((element) => element.textContent = String(new Date().getFullYear()));
