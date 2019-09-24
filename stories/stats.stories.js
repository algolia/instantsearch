import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('Stats', module).add(
  'default',
  withHits(({ search, container, instantsearch }) => {
    search.addWidgets([instantsearch.widgets.stats({ container })]);
  })
);
