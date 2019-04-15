import { storiesOf } from '@storybook/html';
import { action } from '@storybook/addon-actions';
import { withHits } from '../.storybook/decorators';
import insights from '../src/helpers/insights';

storiesOf('InfiniteHits', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.infiniteHits({
          container,
          templates: {
            item: '{{name}}',
          },
        })
      );
    })
  )
  .add(
    'with custom css classes',
    withHits(({ search, container, instantsearch }) => {
      const style = window.document.createElement('style');
      window.document.head.appendChild(style);
      style.sheet.insertRule(
        '.button button{border: 1px solid black; background: #fff;}'
      );

      search.addWidget(
        instantsearch.widgets.infiniteHits({
          container,
          cssClasses: {
            loadMore: 'button',
          },
          templates: {
            item: '{{name}}',
          },
        })
      );
    })
  )
  .add(
    'with custom "showMoreText" template',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.infiniteHits({
          container,
          templates: {
            item: '{{name}}',
            showMoreText: 'Load more',
          },
        })
      );
    })
  )
  .add(
    'with transformed items',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.infiniteHits({
          container,
          templates: {
            item: '{{name}}',
          },
          transformItems: items =>
            items.map(item => ({
              ...item,
              name: `${item.name} (transformed)`,
            })),
        })
      );
    })
  )
  .add(
    'with insights helper',
    withHits(
      ({ search, container, instantsearch }) => {
        search.addWidget(
          instantsearch.widgets.configure({
            attributesToSnippet: ['name', 'description'],
            clickAnalytics: true,
          })
        );

        search.addWidget(
          instantsearch.widgets.infiniteHits({
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
          })
        );
      },
      {
        insightsClient: (method, payload) =>
          action(`[InsightsClient] sent "${method}" with payload`)(payload),
      }
    )
  );
