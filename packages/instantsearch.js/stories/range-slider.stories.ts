import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('Refinements/RangeSlider', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.rangeSlider({
          container,
          attribute: 'price',
        }),
      ]);
    })
  )
  .add(
    'with step',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.rangeSlider({
          container,
          attribute: 'price',
          step: 100,
          pips: false,
        }),
      ]);
    })
  )
  .add(
    'without pips',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.rangeSlider({
          container,
          attribute: 'price',
          pips: false,
        }),
      ]);
    })
  )
  .add(
    'with min boundaries',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.rangeSlider({
          container,
          attribute: 'price',
          min: 36,
        }),
      ]);
    })
  )
  .add(
    'with max boundaries',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.rangeSlider({
          container,
          attribute: 'price',
          max: 36,
        }),
      ]);
    })
  )
  .add(
    'with min and max boundaries',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.rangeSlider({
          container,
          attribute: 'price',
          min: 10,
          max: 500,
        }),
      ]);
    })
  )
  .add(
    'with formatted tooltips',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.rangeSlider({
          container,
          attribute: 'price',
          tooltips: {
            format(value) {
              return `$${Math.round(value).toLocaleString()}`;
            },
          },
        }),
      ]);
    })
  );
