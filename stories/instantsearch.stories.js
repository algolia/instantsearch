import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('Instantsearch', module).add(
  'With searchfunction that prevent search',
  withHits(() => {}, {
    searchFunction: helper => {
      const query = helper.state.query;

      if (query === '') {
        return;
      }

      helper.search();
    },
  })
);
