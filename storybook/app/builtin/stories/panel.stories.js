/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('Panel');

export default () => {
  stories.add(
    'with default',
    wrapWithHits(container => {
      window.search.addWidget(
        instantsearch.widgets.panel({
          templates: {
            header: ({ results }) =>
              `Header ${results ? `| ${results.nbHits} results` : ''}`,
            footer: 'Footer',
          },
          hidden: ({ results }) => results.nbHits === 0,
        })(instantsearch.widgets.refinementList)({
          container,
          attribute: 'brand',
        })
      );
    })
  );
};
