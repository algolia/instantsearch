import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';
import smartSort from '../src/widgets/smart-sort/smart-sort';

const searchOptions = {
  appId: 'C7RIRJRYR9',
  apiKey: '77af6d5ffb27caa5ff4937099fcb92e8',
  indexName: 'test_Bestbuy_vr_price_asc',
};

storiesOf('Sorting/SmartSort', module).add(
  'default',
  withHits(({ search, container }) => {
    search.addWidgets([
      smartSort({
        container,
        cssClasses: {
          root: 'my-SmartSort',
        },
      }),
    ]);
  }, searchOptions)
);
