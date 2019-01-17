import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('Panel', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.panel({
          templates: {
            header: ({ results }) =>
              `Header ${results ? `| ${results.nbHits} results` : ''}`,
            footer: 'Footer',
          },
          hidden: ({ results }) => results.nbHits === 0,
        })(instantsearch.widgets.refinementList)({
          container,
          attribute: 'brand',
        })
      );
    })
  )
  .add(
    'with ratingMenu',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.panel({
          templates: {
            header: ({ results }) =>
              `Header ${results ? `| ${results.nbHits} results` : ''}`,
            footer: 'Footer',
          },
          hidden: ({ results }) => results.nbHits === 0,
        })(instantsearch.widgets.ratingMenu)({
          container,
          attribute: 'price',
        })
      );
    })
  )
  .add(
    'with menu',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.panel({
          templates: {
            header: ({ results }) =>
              `Header ${results ? `| ${results.nbHits} results` : ''}`,
            footer: 'Footer',
          },
          hidden: ({ results }) => results.nbHits === 0,
        })(instantsearch.widgets.menu)({
          container,
          attribute: 'brand',
        })
      );
    })
  );
