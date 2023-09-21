import { storiesOf } from '@storybook/html';

import { withHits } from '../.storybook/decorators';

const searchOptions = {
  appId: 'C7RIRJRYR9',
  apiKey: '77af6d5ffb27caa5ff4937099fcb92e8',
  indexName: 'test_Bestbuy_vr_price_asc',
};

storiesOf('Sorting/RelevantSort', module).add(
  'default',
  withHits(({ search, container, instantsearch }) => {
    search.addWidgets([
      instantsearch.widgets.relevantSort({
        container,
        cssClasses: {
          root: 'my-RelevantSort',
        },
      }),
    ]);
  }, searchOptions)
);
