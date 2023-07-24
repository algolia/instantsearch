import { storiesOf } from '@storybook/vue';
import algoliasearch from 'algoliasearch/lite';

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
        <template v-slot:text="{ isRelevantSorted }">
          <template v-if="isRelevantSorted">
            We removed some search results to show you the most relevant ones
          </template>
          <template>
            Currently showing all results
          </template>
        </template>
        <template v-slot:button="{ isRelevantSorted }">
          <template v-if="isRelevantSorted">
            See all results
          </template>
          <template>
            See relevant results
          </template>
        </template>
      </ais-relevant-sort>
    `,
  }));
