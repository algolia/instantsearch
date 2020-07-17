import { connectClearRefinements } from 'instantsearch.js/es/connectors';

const resultsContainer = document.querySelector('.container-results');

type ClearRefinementsWidgetParams = {
  container: string;
};

const clearRefinements = connectClearRefinements<ClearRefinementsWidgetParams>(
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
        resultsContainer!.scrollIntoView();
      });

      wrapper.appendChild(button);
      containerNode!.appendChild(wrapper);
    }
  }
);

export const clearFiltersMobile = clearRefinements({
  container: '[data-widget="clear-filters-mobile"]',
});
