/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('RangeInput');

export default () => {
  stories
    .add(
      'default',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.rangeInput({
            container,
            attribute: 'price',
          })
        );
      })
    )
    .add(
      'disabled',
      wrapWithHits(container => {
        window.search.addWidget(
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
      wrapWithHits(container => {
        window.search.addWidget(
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
      wrapWithHits(container => {
        window.search.addWidget(
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
      wrapWithHits(container => {
        window.search.addWidget(
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
      wrapWithHits(container => {
        window.search.addWidget(
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
      wrapWithHits(container => {
        window.search.addWidget(
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
};
