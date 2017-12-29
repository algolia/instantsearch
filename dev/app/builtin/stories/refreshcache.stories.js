/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('RefreshCache');

export default () => {
  stories.add(
    'default',
    wrapWithHits(container => {
      const button = document.createElement('button');
      button.addEventListener('click', () => window.search.clearCache());
      button.innerHTML = 'Refresh cache';
      const searchBoxContainer = document.createElement('div');
      window.search.addWidget(
        instantsearch.widgets.searchBox({ container: searchBoxContainer })
      );
      container.appendChild(button);
      container.appendChild(searchBoxContainer);
    })
  );
};
