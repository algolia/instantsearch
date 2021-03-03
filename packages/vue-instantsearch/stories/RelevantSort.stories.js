import algoliasearch from 'algoliasearch/lite';
import { storiesOf } from '@storybook/vue';
import { previewWrapper } from './utils';

storiesOf('ais-relevant-sort', module)
  .addDecorator(
    previewWrapper({
      searchClient: algoliasearch(
        'C7RIRJRYR9',
        '77af6d5ffb27caa5ff4937099fcb92e8'
      ),
      indexName: 'test_Bestbuy_vr_price_asc',
    })
  )
  .add('default', () => ({
    template: '<ais-relevant-sort></ais-relevant-sort>',
  }))
  .add('with custom text', () => ({
    template: `
      <ais-relevant-sort>
        <template slot="text" slot-scope="{ isRelevantSorted }">
          {{ isRelevantSorted
               ? 'We removed some search results to show you the most relevant ones'
               : 'Currently showing all results' }}
        </template>
      </ais-relevant-sort>
    `,
  }));
