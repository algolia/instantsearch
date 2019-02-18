import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('ClickAnalytics', module).add(
  'basic',
  withHits(({ search, container, instantsearch }) => {
    search.addWidgets([
      instantsearch.widgets.configure({
        clickAnalytics: true,
      }),
      instantsearch.widgets.hits({
        container,
        templates: {
          item: ({ analytics: { clickedObjectIDsAfterSearch }, ...item }) =>
            `
              <h3> ${item.name} </h3> 
              <div>
                 <button ${clickedObjectIDsAfterSearch('Add to basket')}>
                  Add to basket
                </button>
              </div>
              `,
        },
      }),
    ]);
  })
);
