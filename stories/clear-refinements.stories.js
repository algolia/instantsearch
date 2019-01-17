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
        searchParameters: {
          disjunctiveFacetsRefinements: { brand: ['Apple'] },
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
    'with query only (via excludedAttributes)',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.clearRefinements({
          container,
          excludedAttributes: [],
          templates: {
            resetLabel: 'Clear refinements and query',
          },
        })
      );
    })
  )
  .add(
    'with refinements and query',
    withHits(
      ({ search, container, instantsearch }) => {
        const clearRefinementsContainer = document.createElement('div');
        container.appendChild(clearRefinementsContainer);
        const refinementListContainer = document.createElement('div');
        container.appendChild(refinementListContainer);
        const numericMenuContainer = document.createElement('div');
        container.appendChild(numericMenuContainer);

        search.addWidget(
          instantsearch.widgets.clearRefinements({
            container: clearRefinementsContainer,
            excludedAttributes: [],
            templates: {
              resetLabel: 'Clear refinements and query',
            },
          })
        );

        search.addWidget(
          instantsearch.widgets.refinementList({
            container: refinementListContainer,
            attribute: 'brand',
          })
        );

        search.addWidget(
          instantsearch.widgets.numericMenu({
            container: numericMenuContainer,
            attribute: 'price',
            items: [
              { label: 'All' },
              { end: 10, label: '≤ $10' },
              { start: 10, end: 100, label: '$10–$100' },
              { start: 100, end: 500, label: '$100–$500' },
              { start: 500, label: '≥ $500' },
            ],
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
    'with nothing to clear',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.clearRefinements({
          container,
        })
      );
    })
  )
  .add(
    'with brands excluded (via transformItems)',
    withHits(
      ({ search, container, instantsearch }) => {
        const clearRefinementsContainer = document.createElement('div');
        container.appendChild(clearRefinementsContainer);
        const refinementListContainer = document.createElement('div');
        container.appendChild(refinementListContainer);
        const numericMenuContainer = document.createElement('div');
        container.appendChild(numericMenuContainer);

        search.addWidget(
          instantsearch.widgets.clearRefinements({
            container: clearRefinementsContainer,
            excludedAttributes: [],
            transformItems: items =>
              items.filter(attribute => attribute !== 'brand'),
          })
        );

        search.addWidget(
          instantsearch.widgets.refinementList({
            container: refinementListContainer,
            attribute: 'brand',
          })
        );

        search.addWidget(
          instantsearch.widgets.numericMenu({
            container: numericMenuContainer,
            attribute: 'price',
            items: [
              { label: 'All' },
              { end: 10, label: '≤ $10' },
              { start: 10, end: 100, label: '$10–$100' },
              { start: 100, end: 500, label: '$100–$500' },
              { start: 500, label: '≥ $500' },
            ],
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
