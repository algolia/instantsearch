import { storiesOf } from '@storybook/html';
import { action } from '@storybook/addon-actions';
import { withHits } from '../.storybook/decorators';
import { analytics } from '../src/widgets';

storiesOf('Metadata/Analytics', module).add(
  'default',
  withHits(({ search, container }) => {
    const description = document.createElement('p');
    description.innerText = 'Search for something, look into Action Logger';
    container.appendChild(description);

    search.addWidgets([
      analytics({
        pushFunction(formattedParameters, state, results) {
          action('pushFunction[formattedParameters]')(formattedParameters);
          action('pushFunction[state]')(state);
          action('pushFunction[results]')(results);
        },
        triggerOnUIInteraction: true,
        pushInitialSearch: false,
      }),
    ]);
  })
);
