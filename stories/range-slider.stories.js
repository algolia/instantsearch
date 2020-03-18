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
  )
  .add(
    'with histogram',
    withHits(
      ({ search, container, instantsearch }) => {
        window.search = search;
        const histogramContainer = document.createElement('div');
        const sliderContainer = document.createElement('div');
        container.appendChild(histogramContainer);
        container.appendChild(sliderContainer);

        const style = window.document.createElement('style');
        // WebKit hack :(
        style.appendChild(document.createTextNode(''));
        window.document.head.appendChild(style);

        [
          // TODO: put in IS.css
          `.ais-Histogram {
          color: #3a4570;
        }`,
          // counteract slider style
          `.ais-Histogram {
          margin-bottom: -43px;
        }`,
          `.rheostat-tooltip {
          background: white;
          border-radius: .5em;
          padding: .2em
        }`,
        ].forEach((rule, i) => style.sheet.insertRule(rule, i));

        search.addWidgets([
          instantsearch.widgets.configure({
            facets: ['price'],
            // TODO: remove this when the empty query works
            filters: 'free_shipping:true OR free_shipping:false',
          }),
          instantsearch.widgets.histogram({
            container: histogramContainer,
            attribute: 'price',
          }),
          instantsearch.widgets.rangeSlider({
            attribute: 'price',
            container: sliderContainer,
          }),
        ]);
      },
      {
        appId: 'Q5A73H2SWE',
        apiKey: 'a1dc90c5a5ca2096cc44de8e00629127',
        indexName: 'instant_search',
      }
    )
  );
