import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('Refinements|RangeSlider', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.rangeSlider({
          container,
          attribute: 'price',
          templates: {
            header: 'Price',
          },
          tooltips: {
            format(rawValue) {
              return `$${Math.round(rawValue).toLocaleString()}`;
            },
          },
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
          step: 500,
          tooltips: {
            format(rawValue) {
              return `$${Math.round(rawValue).toLocaleString()}`;
            },
          },
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
          tooltips: {
            format(rawValue) {
              return `$${Math.round(rawValue).toLocaleString()}`;
            },
          },
        }),
      ]);
    })
  )
  .add(
    'with 0 as first pit',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.rangeSlider({
          container,
          attribute: 'price',
          templates: {
            header: 'Price',
          },
          min: 0,
          tooltips: {
            format(rawValue) {
              return `$${Math.round(rawValue).toLocaleString()}`;
            },
          },
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
          templates: {
            header: 'Price',
          },
          min: 36,
          tooltips: {
            format(rawValue) {
              return `$${Math.round(rawValue).toLocaleString()}`;
            },
          },
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
          templates: {
            header: 'Price',
          },
          max: 36,
          tooltips: {
            format(rawValue) {
              return `$${Math.round(rawValue).toLocaleString()}`;
            },
          },
        }),
      ]);
    })
  )
  .add(
    'with min / max boundaries',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([
        instantsearch.widgets.rangeSlider({
          container,
          attribute: 'price',
          templates: {
            header: 'Price',
          },
          min: 10,
          max: 500,
          tooltips: {
            format(rawValue) {
              return `$${Math.round(rawValue).toLocaleString()}`;
            },
          },
        }),
      ]);
    })
  );
