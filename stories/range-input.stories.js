import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('RangeInput', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.rangeInput({
          container,
          attribute: 'price',
        })
      );
    })
  )
  .add(
    'disabled',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.rangeInput({
          container,
          attribute: 'price',
          min: 500,
          max: 0,
        })
      );
    })
  )
  .add(
    'with floating number',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.rangeInput({
          container,
          attribute: 'price',
          precision: 2,
        })
      );
    })
  )
  .add(
    'with min boundary',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.rangeInput({
          container,
          attribute: 'price',
          min: 10,
        })
      );
    })
  )
  .add(
    'with max boundary',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.rangeInput({
          container,
          attribute: 'price',
          max: 500,
        })
      );
    })
  )
  .add(
    'with min & max boundaries',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.rangeInput({
          container,
          attribute: 'price',
          min: 10,
          max: 500,
        })
      );
    })
  )
  .add(
    'with templates',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.rangeInput({
          container,
          attribute: 'price',
          min: 10,
          max: 500,
          templates: {
            separatorText: '→',
            submitText: 'Refine',
          },
        })
      );
    })
  );
