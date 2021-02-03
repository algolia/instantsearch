import algoliasearch from 'algoliasearch/lite';
import { CallEnum } from '@algolia/transporter';
import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';
import smartSort from '../src/widgets/smart-sort/smart-sort';

const searchOptions = {
  appId: 'C7RIRJRYR9',
  apiKey: '77af6d5ffb27caa5ff4937099fcb92e8',
  indexName: 'test_Bestbuy_vr_price_asc',
  searchClient: algoliasearch(
    'C7RIRJRYR9',
    '77af6d5ffb27caa5ff4937099fcb92e8',
    {
      hosts: [
        {
          protocol: 'https', // or 'http'
          url: 'c7rirjryr9-3.algolianet.com',
          accept: CallEnum.Read, // CallEnum.Any or CallEnum.Write
        },
      ],
    }
  ),
};

storiesOf('Sorting/SmartSort', module)
  .add(
    'default',
    withHits(({ search, container }) => {
      search.addWidgets([
        smartSort({
          container,
          cssClasses: {
            root: 'my-SmartSort',
          },
          templates: {
            default: ({ isSmartSorted }) =>
              isSmartSorted ? 'See all results' : 'See relevant results',
          },
        }),
      ]);
    }, searchOptions)
  )
  .add(
    'explicit value',
    withHits(({ search, container }) => {
      search.addWidgets([
        smartSort({
          container,
          relevancyStrictness: 50,
          templates: {
            default: ({ isSmartSorted }) =>
              isSmartSorted ? 'See all results' : 'See relevant results',
          },
        }),
      ]);
    }, searchOptions)
  );
