import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

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
  );
