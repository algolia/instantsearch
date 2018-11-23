/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('RangeSlider');

export default () => {
  stories
    .add(
      'default',
      wrapWithHits(container => {
        window.search.addWidget(
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
          })
        );
      })
    )
    .add(
      'disabled',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.rangeSlider({
            container,
            attribute: 'price',
            templates: {
              header: 'Price',
            },
            min: 100,
            max: 50,
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
      'with step',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.rangeSlider({
            container,
            attribute: 'price',
            step: 500,
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
      'without pips',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.rangeSlider({
            container,
            attribute: 'price',
            pips: false,
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
      'with 0 as first pit',
      wrapWithHits(container => {
        window.search.addWidget(
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
          })
        );
      })
    )
    .add(
      'with min boundaries',
      wrapWithHits(container => {
        window.search.addWidget(
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
          })
        );
      })
    )
    .add(
      'with max boundaries',
      wrapWithHits(container => {
        window.search.addWidget(
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
          })
        );
      })
    )
    .add(
      'with min / max boundaries',
      wrapWithHits(container => {
        window.search.addWidget(
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
          })
        );
      })
    );
};
