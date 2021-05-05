import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('Pagination/Pagination', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.pagination({
          container,
          totalPages: 20,
        }),
      ]);
    })
  )
  .add(
    'with padding',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.pagination({
          container,
          padding: 6,
        }),
      ]);
    })
  )
  .add(
    'without showFirst',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.pagination({
          container,
          showFirst: false,
        }),
      ]);
    })
  )
  .add(
    'without showLast',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.pagination({
          container,
          showLast: false,
        }),
      ]);
    })
  )
  .add(
    'without showPrevious',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.pagination({
          container,
          showPrevious: false,
        }),
      ]);
    })
  )
  .add(
    'without showNext',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.pagination({
          container,
          showNext: false,
        }),
      ]);
    })
  )
  .add(
    'with templates',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.pagination({
          container,
          templates: {
            previous: 'Previous',
            next: 'Next',
            first: 'First',
            last: 'Last',
          },
        }),
      ]);
    })
  );
