import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('RatingMenu', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.ratingMenu({
          container,
          attribute: 'rating',
          max: 5,
        })
      );
    })
  )
  .add(
    'with disabled item',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.ratingMenu({
          container,
          attribute: 'rating',
          max: 7,
        })
      );
    })
  );
