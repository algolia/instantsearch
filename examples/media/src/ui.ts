const filtersButtons = [
  ...document.querySelectorAll('[data-action="toggle-filters"]'),
];
const filtersPanels = document.querySelector('#filters');

export function attachEventListeners() {
  filtersButtons.forEach(filtersButton => {
    filtersButton.addEventListener('click', () => {
      if (!filtersPanels) {
        return;
      }

      filtersPanels.classList.toggle('container-filters-panel--hidden');
    });
  });
}
