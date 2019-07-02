const filtersButtons = [
  ...document.querySelectorAll('[data-action="toggle-filters"]'),
];
const filtersPanels = document.querySelector('#filters');

export function enhanceUi() {
  // Add `id` to the search box input to link it
  // to the magnifier label.
  const searchBoxInput = document.querySelector('.ais-SearchBox-input');

  if (searchBoxInput) {
    searchBoxInput.id = 'search-input';
  }

  // Attach event listeners.
  filtersButtons.forEach(filtersButton => {
    filtersButton.addEventListener('click', () => {
      if (!filtersPanels) {
        return;
      }

      filtersPanels.classList.toggle('container-filters-panel--hidden');
    });
  });
}
