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
            templates: {
              header: 'Range input',
            },
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
            templates: {
              header: 'Range input',
            },
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
            templates: {
              header: 'Range input',
            },
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
            templates: {
              header: 'Range input',
            },
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
            templates: {
              header: 'Range input',
            },
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
            templates: {
              header: 'Range input',
            },
          })
        );
      })
    );
};
