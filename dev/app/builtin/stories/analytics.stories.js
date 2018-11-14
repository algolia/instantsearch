/* eslint-disable import/default */

import { action, storiesOf } from 'dev-novel';
import instantsearch from '../../instantsearch';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('Analytics');

export default () => {
  stories.add(
    'default',
    wrapWithHits(container => {
      const description = document.createElement('p');
      description.innerText = 'Search for something, look into Action Logger';
      container.appendChild(description);

      window.search.addWidget(
        instantsearch.widgets.analytics({
          pushFunction(formattedParameters, state, results) {
            action('pushFunction[formattedParameters]')(formattedParameters);
            action('pushFunction[state]')(state);
            action('pushFunction[results]')(results);
          },
          triggerOnUIInteraction: true,
          pushInitialSearch: false,
        })
      );
    })
  );
};
