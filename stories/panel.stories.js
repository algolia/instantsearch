import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('Panel', module).add(
  'with default',
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
);
