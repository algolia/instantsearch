import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('Analytics', module).add(
  'default',
  withHits(({ search, container, instantsearch }) => {
    const description = document.createElement('p');
    description.innerText = 'Search for something, look into Action Logger';
    container.appendChild(description);

    search.addWidget(
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
