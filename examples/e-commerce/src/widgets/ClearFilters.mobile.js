import { connectClearRefinements } from 'instantsearch.js/es/connectors';

const resultsContainer = document.querySelector('.container-results');

const clearFiltersMobile = connectClearRefinements(
  ({ refine, widgetParams }, isFirstRender) => {
    const { container } = widgetParams;
    const containerNode = document.querySelector(container);

    if (isFirstRender) {
      const wrapper = document.createElement('div');
      wrapper.classList.add('ais-ClearRefinements');
      const button = document.createElement('button');
      button.classList.add('ais-ClearRefinements-button');
      button.textContent = 'Reset filters';

      button.addEventListener('click', () => {
        refine();

        document.body.classList.remove('filtering');
        resultsContainer.scrollIntoView();
      });

      wrapper.appendChild(button);
      containerNode.appendChild(wrapper);
    }
  }
);

const clearFilters = clearFiltersMobile({
  container: '[data-widget="clear-filters-mobile"]',
});

export default clearFilters;
