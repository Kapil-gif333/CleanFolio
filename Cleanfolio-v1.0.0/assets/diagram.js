const tooltip = document.querySelector('.diagram-tooltip');
if (tooltip) {
  const parts = document.querySelectorAll('.circuit-svg [data-part]');
  const showPart = (part) => {
    parts.forEach((item) => item.classList.toggle('is-active', item === part));
    const name = document.createElement('strong');
    name.textContent = part.dataset.name;
    tooltip.replaceChildren(name, document.createTextNode(`  ${part.dataset.info}`));
  };
  parts.forEach((part) => {
    part.setAttribute('tabindex', '0');
    part.setAttribute('role', 'img');
    part.setAttribute('aria-label', `${part.dataset.name}. ${part.dataset.info}`);
    part.addEventListener('mouseenter', () => showPart(part));
    part.addEventListener('focus', () => showPart(part));
    part.addEventListener('click', () => showPart(part));
  });
}
