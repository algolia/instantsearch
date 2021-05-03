import { storiesOf } from '@storybook/html';
import { withHits, withLifecycle } from '../.storybook/decorators';

storiesOf('Refinements/MenuSelect', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.menuSelect({
          container,
          attribute: 'categories',
        }),
      ]);
    })
  )
  .add(
    'with custom item template',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.menuSelect({
          container,
          attribute: 'categories',
          limit: 10,
          templates: {
            item: '{{label}}',
          },
        }),
      ]);
    })
  )
  .add(
    'with custom default option template',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.menuSelect({
          container,
          attribute: 'categories',
          limit: 10,
          templates: {
            defaultOption: 'Default choice',
          },
        }),
      ]);
    })
  )
  .add(
    'with add/remove',
    withHits(({ search, container, instantsearch }) => {
      withLifecycle(search, container, node =>
        instantsearch.widgets.menuSelect({
          container: node,
          attribute: 'categories',
        })
      );
    })
  );
