import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('MenuSelect', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.menuSelect({
          container,
          attribute: 'categories',
        })
      );
    })
  )
  .add(
    'with custom item template',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.menuSelect({
          container,
          attribute: 'categories',
          limit: 10,
          templates: {
            item: '{{label}}',
          },
        })
      );
    })
  )
  .add(
    'with custom default option template',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.menuSelect({
          container,
          attribute: 'categories',
          limit: 10,
          templates: {
            defaultOption: 'Default choice',
          },
        })
      );
    })
  );
