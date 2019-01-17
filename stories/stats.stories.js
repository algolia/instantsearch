import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('Stats', module).add(
  'default',
  withHits(({ search, container, instantsearch }) => {
    search.addWidget(instantsearch.widgets.stats({ container }));
  })
);
