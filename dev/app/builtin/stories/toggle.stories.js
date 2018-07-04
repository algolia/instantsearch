/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits';

const stories = storiesOf('Toggle');

export default () => {
  stories
    .add(
      'default',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.toggle({
            container,
            attributeName: 'free_shipping',
            label: 'Free Shipping (toggle single value)',
            templates: {
              header: 'Shipping',
            },
          })
        );
      })
    )
    .add(
      'with on & off values',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.toggle({
            container,
            attributeName: 'brand',
            label: 'Canon (not checked) or sony (checked)',
            values: {
              on: 'Sony',
              off: 'Canon',
            },
            templates: {
              header: 'Google or amazon (toggle two values)',
            },
          })
        );
      })
    );
};
