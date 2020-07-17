import { storiesOf } from '@storybook/html';
import { action } from '@storybook/addon-actions';
import { withHits } from '../.storybook/decorators';
import insights from '../src/helpers/insights';
import { infiniteHits, configure } from '../src/widgets';
import { createInfiniteHitsSessionStorageCache } from '../src/lib/infiniteHitsCache';

storiesOf('Results/InfiniteHits', module)
  .add(
    'default',
    withHits(({ search, container }) => {
      search.addWidgets([
        infiniteHits({
          container,
          templates: {
            item: '{{name}}',
          },
        }),
      ]);
    })
  )
  .add(
    'with custom "showMoreText" template',
    withHits(({ search, container }) => {
      search.addWidgets([
        infiniteHits({
          container,
          templates: {
            item: '{{name}}',
            showMoreText: 'Load more',
          },
        }),
      ]);
    })
  )
  .add(
    'with transformed items',
    withHits(({ search, container }) => {
      search.addWidgets([
        infiniteHits({
          container,
          templates: {
            item: '{{name}}',
          },
          transformItems: items =>
            items.map(item => ({
              ...item,
              name: `${item.name} (transformed)`,
            })),
        }),
      ]);
    })
  )
  .add(
    'with insights helper',
    withHits(
      ({ search, container }) => {
        search.addWidgets([
          configure({
            attributesToSnippet: ['name', 'description'],
            clickAnalytics: true,
          }),
        ]);

        search.addWidgets([
          infiniteHits({
            container,
            templates: {
              item: item => `
          <h4>${item.name}</h4>
          <button
            ${insights('clickedObjectIDsAfterSearch', {
              objectIDs: [item.objectID],
              eventName: 'Add to cart',
            })} >Add to cart</button>
          `,
            },
          }),
        ]);
      },
      {
        insightsClient: (method, payload) =>
          action(`[InsightsClient] sent "${method}" with payload`)(payload),
      }
    )
  )
  .add(
    'with previous button enabled',
    withHits(
      ({ search, container }) => {
        search.addWidgets([
          infiniteHits({
            container,
            showPrevious: true,
            templates: {
              item: '{{name}}',
            },
          }),
        ]);
      },
      {
        initialUiState: {
          instant_search: {
            page: 3,
          },
        },
      }
    )
  )
  .add(
    'with sessionStorage cache enabled',
    withHits(({ search, container }) => {
      search.addWidgets([
        configure({
          hitsPerPage: 24,
        }),
        infiniteHits({
          container,
          templates: {
            item: hit => `
              <p>#${hit.__position} ${hit.name}</p>
              <a href="https://google.com">Details</a>
            `,
          },
          cache: createInfiniteHitsSessionStorageCache(),
        }),
      ]);
    })
  );
