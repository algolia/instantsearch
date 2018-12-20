/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../instantsearch';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('Refresh');

export default () => {
  stories.add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      const button = document.createElement('button');
      button.addEventListener('click', () => search.refresh());
      button.innerHTML = 'Refresh InstantSearch';
      const searchBoxContainer = document.createElement('div');
      search.addWidget(
        instantsearch.widgets.searchBox({ container: searchBoxContainer })
      );
      container.appendChild(button);
      container.appendChild(searchBoxContainer);
    })
  );
};
