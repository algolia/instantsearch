import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('ClearRefinements', module)
  .add(
    'default',
    withHits(
      ({ search, container, instantsearch }) => {
        search.addWidget(
          instantsearch.widgets.clearRefinements({
            container,
          })
        );
      },
      {
        initialUiState: {
          instant_search: {
            refinementList: {
              brand: ['Apple'],
            },
          },
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
        initialUiState: {
          instant_search: {
            refinementList: {
              brand: ['Apple'],
            },
          },
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
        initialUiState: {
          instant_search: {
            refinementList: {
              brand: ['Apple'],
            },
          },
        },
      }
    )
  );
