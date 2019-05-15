import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('Panel', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      const brandList = instantsearch.widgets.panel({
        templates: {
          header: 'Brand',
          footer: ({ results }) => {
            return results ? `${results.nbHits} results` : '';
          },
        },
      })(instantsearch.widgets.refinementList);

      search.addWidget(
        brandList({
          container,
          attribute: 'brand',
        })
      );
    })
  )
  .add(
    'with range input',
    withHits(({ search, container, instantsearch }) => {
      const priceList = instantsearch.widgets.panel({
        templates: {
          header: 'Price',
          footer: 'Footer',
        },
      })(instantsearch.widgets.rangeInput);

      search.addWidget(
        priceList({
          container,
          attribute: 'price',
        })
      );
    })
  )
  .add(
    'with range slider',
    withHits(({ search, container, instantsearch }) => {
      const priceSlider = instantsearch.widgets.panel({
        templates: {
          header: 'Price',
          footer: 'Footer',
        },
      })(instantsearch.widgets.rangeSlider);

      search.addWidget(
        priceSlider({
          container,
          attribute: 'price',
          tooltips: {
            format(rawValue) {
              return `$${Math.round(rawValue).toLocaleString()}`;
            },
          },
        })
      );
    })
  )

  .add(
    'with hidden',
    withHits(({ search, container, instantsearch }) => {
      const priceList = instantsearch.widgets.panel({
        templates: {
          header: 'Price',
          footer: 'The panel is hidden when there are no results.',
        },
        hidden: ({ results }) => results.nbHits === 0,
      })(instantsearch.widgets.rangeInput);

      search.addWidget(
        priceList({
          container,
          attribute: 'price',
        })
      );
    })
  )
  .add(
    'with collapsed',
    withHits(({ search, container, instantsearch }) => {
      const brandList = instantsearch.widgets.panel({
        collapsed: options => {
          return !((options && options.state && options.state.query) || '');
        },
        templates: {
          header: 'Brand (collapsible)',
          footer: 'The panel collapses on empty query until controlled',
        },
      })(instantsearch.widgets.refinementList);

      search.addWidget(
        brandList({
          container,
          attribute: 'brand',
        })
      );
    })
  )
  .add(
    'with collapsed and custom templates',
    withHits(({ search, container, instantsearch }) => {
      const brandList = instantsearch.widgets.panel({
        collapsed: options => {
          return !((options && options.state && options.state.query) || '');
        },
        templates: {
          header: 'Collapsible panel',
          footer: 'The panel collapses on empty query until controlled',
          collapseButtonText: ({ collapsed }) => (collapsed ? 'More' : 'Less'),
        },
      })(instantsearch.widgets.refinementList);

      search.addWidget(
        brandList({
          container,
          attribute: 'brand',
        })
      );
    })
  );
