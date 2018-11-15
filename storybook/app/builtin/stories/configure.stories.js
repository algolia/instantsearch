/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';

import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('Configure');

export default () => {
  stories.add(
    'Force 1 hit per page',
    wrapWithHits(container => {
      const description = document.createElement('div');
      description.innerHTML = `
        <p>Search parameters provied to the Configure widget:</p>
        <pre>{ hitsPerPage: 1 }</pre>
      `;

      container.appendChild(description);

      window.search.addWidget(
        instantsearch.widgets.configure({
          hitsPerPage: 1,
        })
      );
    })
  );
};
