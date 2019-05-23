import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('ClearRefinements', module)
  .add(
    'default',
    withHits(
      ({ search, container, instantsearch }) => {
        const addWidgetButton = document.createElement('button');
        addWidgetButton.textContent = 'Add widget';

        const removeWidgetButton = document.createElement('button');
        removeWidgetButton.textContent = 'Remove widget';

        const widgetContainer = document.createElement('div');
        widgetContainer.style.marginTop = '10px';

        container.appendChild(addWidgetButton);
        container.appendChild(removeWidgetButton);
        container.appendChild(widgetContainer);

        const widget = instantsearch.widgets.sortBy({
          container: widgetContainer,
          items: [
            { value: 'instant_search', label: 'Most relevant' },
            { value: 'instant_search_price_asc', label: 'Lowest price' },
            { value: 'instant_search_price_desc', label: 'Highest price' },
          ],
        });

        search.addWidget(
          instantsearch.widgets.configure({
            hitsPerPage: 5,
          })
        );

        addWidgetButton.addEventListener('click', () => {
          search.addWidget(widget);
        });

        removeWidgetButton.addEventListener('click', () => {
          search.removeWidget(widget);
        });
      },
      {
        searchParameters: {
          // disjunctiveFacetsRefinements: { brand: ['Apple'] },
          disjunctiveFacets: ['brand'],
        },
      }
    )
  )
  .add(
    'with query only (via includedAttributes)',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.clearRefinements({
          container,
          includedAttributes: ['query'],
          templates: {
            resetLabel: 'Clear query',
          },
        })
      );
    })
  )
  .add(
    'with refinements and query (via excludedAttributes)',
    withHits(
      ({ search, container, instantsearch }) => {
        search.addWidget(
          instantsearch.widgets.clearRefinements({
            container,
            excludedAttributes: [],
            templates: {
              resetLabel: 'Clear refinements and query',
            },
          })
        );
      },
      {
        searchParameters: {
          disjunctiveFacetsRefinements: { brand: ['Apple'] },
          disjunctiveFacets: ['brand'],
        },
      }
    )
  )
  .add(
    'with brands excluded (via transformItems)',
    withHits(
      ({ search, container, instantsearch }) => {
        const clearRefinementsContainer = document.createElement('div');
        container.appendChild(clearRefinementsContainer);

        search.addWidget(
          instantsearch.widgets.clearRefinements({
            container: clearRefinementsContainer,
            excludedAttributes: [],
            transformItems: items =>
              items.filter(attribute => attribute !== 'brand'),
          })
        );
      },
      {
        searchParameters: {
          disjunctiveFacetsRefinements: { brand: ['Apple'] },
          disjunctiveFacets: ['brand'],
        },
      }
    )
  );
