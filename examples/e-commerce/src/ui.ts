const filtersButtons = Array.prototype.slice.call(
  document.querySelectorAll('[data-action="open-overlay"]')
);
const closeOverlayButtons = Array.prototype.slice.call(
  document.querySelectorAll('[data-action="close-overlay"]')
);
const header = document.querySelector('#header');
const resultsContainer = document.querySelector('.container-results');

function openFilters() {
  document.body.classList.add('filtering');
  window.scrollTo(0, 0);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('click', onClick);
}

function closeFilters() {
  document.body.classList.remove('filtering');
  resultsContainer!.scrollIntoView();
  window.removeEventListener('keyup', onKeyUp);
  window.removeEventListener('click', onClick);
}

function onKeyUp(event: KeyboardEvent) {
  if (event.key !== 'Escape') {
    return;
  }

  closeFilters();
}

function onClick(event: MouseEvent) {
  if (event.target !== header) {
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
