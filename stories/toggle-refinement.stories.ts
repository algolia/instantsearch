import { storiesOf } from '@storybook/html';
import { withHits, withLifecycle } from '../.storybook/decorators';

storiesOf('Refinements/ToggleRefinement', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.toggleRefinement({
          container,
          attribute: 'free_shipping',
        }),
      ]);
    })
  )
  .add(
    'with label',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.toggleRefinement({
          container,
          attribute: 'free_shipping',
          templates: {
            labelText: 'Free Shipping (toggle single value)',
          },
        }),
      ]);
    })
  )
  .add(
    'with on & off values',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.toggleRefinement({
          container,
          attribute: 'brand',
          on: 'Sony',
          off: 'Canon',
          templates: {
            labelText: 'Canon (not checked) or sony (checked)',
          },
        }),
      ]);
    })
  )
  .add(
    'with add/remove',
    withHits(({ search, container, instantsearch }) => {
      withLifecycle(search, container, node =>
        instantsearch.widgets.toggleRefinement({
          container: node,
          attribute: 'free_shipping',
          templates: {
            labelText: 'Free Shipping (toggle single value)',
          },
        })
      );
    })
  );
