import { action } from '@storybook/addon-actions';

import { withHits } from '../.storybook/decorators';

import type { Meta, StoryObj } from '@storybook/html';

const meta: Meta = {
  title: 'Metadata/Analytics',
  render: withHits(({ search, container, instantsearch }) => {
    const description = document.createElement('p');
    description.innerText = 'Search for something, look into Action Logger';
    container.appendChild(description);

    search.addWidgets([
      instantsearch.widgets.analytics({
        pushFunction(formattedParameters, state, results) {
          action('pushFunction[formattedParameters]')(formattedParameters);
          action('pushFunction[state]')(state);
          action('pushFunction[results]')(results);
        },
        triggerOnUIInteraction: true,
        pushInitialSearch: false,
      }),
    ]);
  }),
};

export default meta;

export const Default: StoryObj = {};
