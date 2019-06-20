const filtersButtons = [
  ...document.querySelectorAll('[data-action="open-overlay"]'),
];
const closeOverlayButtons = [
  ...document.querySelectorAll('[data-action="close-overlay"]'),
];
const resultsContainer = document.querySelector('.container-results');

function openFilters() {
  document.body.classList.add('filtering');
  window.scrollTo(0, 0);
  window.addEventListener('keyup', onKeyUp);
}

function closeFilters() {
  document.body.classList.remove('filtering');
  resultsContainer.scrollIntoView();
  window.removeEventListener('keyup', onKeyUp);
}

function onKeyUp(event) {
  if (event.key !== 'Escape') {
    return;
  }

  closeFilters();
}

export function attachEventListeners() {
  filtersButtons.forEach(button => {
    button.addEventListener('click', openFilters);
  });

  closeOverlayButtons.forEach(button => {
    button.addEventListener('click', closeFilters);
  });
}
