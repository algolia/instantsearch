import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('InstantSearch', module)
  .add(
    'with searchfunction to prevent search',
    withHits(() => {}, {
      searchFunction: helper => {
        const query = helper.state.query;

        if (query === '') {
          return;
        }

        helper.search();
      },
    })
  )
  .add(
    'with initialUiState',
    withHits(() => {}, {
      initialUiState: {
        // eslint-disable-next-line @typescript-eslint/camelcase
        instant_search: {
          refinementList: {
            brand: ['Apple'],
          },
        },
      },
    })
  );
