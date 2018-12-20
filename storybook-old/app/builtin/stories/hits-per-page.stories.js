/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../instantsearch';
import { wrapWithHits } from '../../utils/wrap-with-hits';

const stories = storiesOf('HitsPerPage');

export default () => {
  stories
    .add(
      'default',
      withHits(({ search, container, instantsearch }) => {
        search.addWidget(
          instantsearch.widgets.hitsPerPage({
            container,
            items: [
              { value: 3, label: '3 per page' },
              { value: 5, label: '5 per page' },
              { value: 10, label: '10 per page' },
            ],
          })
        );
      })
    )
    .add(
      'with default hitPerPage to 5',
      withHits(({ search, container, instantsearch }) => {
        search.addWidget(
          instantsearch.widgets.hitsPerPage({
            container,
            items: [
              { value: 3, label: '3 per page' },
              { value: 5, label: '5 per page', default: true },
              { value: 10, label: '10 per page' },
            ],
          })
        );
      })
    )
    .add(
      'with transformed items',
      withHits(({ search, container, instantsearch }) => {
        search.addWidget(
          instantsearch.widgets.hitsPerPage({
            container,
            items: [
              { value: 3, label: '3 per page' },
              { value: 5, label: '5 per page' },
              { value: 10, label: '10 per page' },
            ],
            transformItems: items =>
              items.map(item => ({
                ...item,
                label: `${item.label} (transformed)`,
              })),
          })
        );
      })
    );
};
