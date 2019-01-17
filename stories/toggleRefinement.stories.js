import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('ToggleRefinement', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.toggleRefinement({
          container,
          attribute: 'free_shipping',
        })
      );
    })
  )
  .add(
    'with label',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.toggleRefinement({
          container,
          attribute: 'free_shipping',
          templates: {
            labelText: 'Free Shipping (toggle single value)',
          },
        })
      );
    })
  )
  .add(
    'with on & off values',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.toggleRefinement({
          container,
          attribute: 'brand',
          on: 'Sony',
          off: 'Canon',
          templates: {
            labelText: 'Canon (not checked) or sony (checked)',
          },
        })
      );
    })
  );
