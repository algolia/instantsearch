import algoliasearch from 'algoliasearch/lite';
import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('Metadata/Stats', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([instantsearch.widgets.stats({ container })]);
    })
  )
  .add(
    'with sorted hits',
    withHits(
      ({ search, container, instantsearch }) => {
        search.addWidgets([instantsearch.widgets.stats({ container })]);
      },
      {
        appId: 'C7RIRJRYR9',
        apiKey: '77af6d5ffb27caa5ff4937099fcb92e8',
        indexName: 'test_Bestbuy_vr_price_asc',
        searchClient: algoliasearch(
          'C7RIRJRYR9',
          '77af6d5ffb27caa5ff4937099fcb92e8'
        ),
      }
    )
  );
