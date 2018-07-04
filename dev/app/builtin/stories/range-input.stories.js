/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits';

const stories = storiesOf('RangeInput');

export default () => {
  stories
    .add(
      'default',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.rangeInput({
            container,
            attributeName: 'price',
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
            attributeName: 'price',
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
      'collapsible',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.rangeInput({
            container,
            attributeName: 'price',
            collapsible: true,
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
            attributeName: 'price',
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
            attributeName: 'price',
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
            attributeName: 'price',
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
            attributeName: 'price',
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
