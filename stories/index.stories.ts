import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

type IndexWidgetParams = {
  indexName: string;
  indexId?: string;
};

const index = (widgetParams: IndexWidgetParams) => ({
  addWidgets(...args: any[]) {
    console.log(widgetParams);
    console.log(...args);
    console.log('--');
  },
});

storiesOf('Index', module).add(
  'with two indices',
  withHits(({ search, container, instantsearch }) => {
    const instantSearchHits = document.createElement('div');
    const bestbuyHits = document.createElement('div');

    container.appendChild(instantSearchHits);
    container.appendChild(bestbuyHits);

    search.addWidgets([
      instantsearch.widgets.configure({
        hitsPerPage: 4,
      }),

      // index({ indexName: 'instant_search' }).addWidgets([
      //   instantsearch.widgets.hits({
      //     container: instantSearchHits,
      //   }),
      // ]),

      // index({ indexName: 'bestbuy' }).addWidgets([
      //   instantsearch.widgets.hits({
      //     container: bestbuyHits,
      //   }),
      // ]),
    ]);
  })
);
