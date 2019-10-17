import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';
import index from '../src/widgets/index/index';
import relatedItems from '../src/widgets/related-items/related-items';

storiesOf('Results|RelatedItems', module).add(
  'default',
  withHits(({ search, container }) => {
    search.addWidgets([
      index({ indexName: 'instant_search' }).addWidgets([
        relatedItems({
          container,
          objectID: '5477500',
          limit: 5,
          relatedAttributes: {
            brand: [
              {
                value: 'Samsung',
                score: 1,
              },
            ],
            price: [
              {
                value: '1000',
                operator: '>=',
              },
            ],
          },
        }),
      ]),
    ]);
  })
);
