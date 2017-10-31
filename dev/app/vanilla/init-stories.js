import { storiesOf } from 'dev-novel';
import { wrapWithHits } from '../utils/wrap-with-hits.js';
import * as widgets from './widgets/index.js';
import initClearAllStories from './stories/clear-all.stories';
import initHitsStories from './stories/hits.stories';
import initMenuStories from './stories/menu.stories';
import initRefinementListStories from './stories/refinement-list.stories';

export default () => {
  initClearAllStories();
  initHitsStories();
  initMenuStories();
  initRefinementListStories();

  storiesOf('SearchBox')
    .add(
      'default',
      wrapWithHits(container => {
        const input = document.createElement('input');
        container.appendChild(input);

        window.search.addWidget(
          widgets.searchBox({
            node: input,
            placeholder: 'Search for products',
          })
        );
      })
    )
    .add(
      'with enter to search',
      wrapWithHits(container => {
        const input = document.createElement('input');
        container.appendChild(input);

        window.search.addWidget(
          widgets.searchBoxReturn({
            node: input,
            placeholder: 'Search for products',
          })
        );
      })
    );
};
