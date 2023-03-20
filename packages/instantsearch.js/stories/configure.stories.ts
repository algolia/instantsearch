import { withHits, withLifecycle } from '../.storybook/decorators';

import type { Meta, StoryObj } from '@storybook/html';

const meta: Meta = {
  title: 'Basics/Configure',
};

export default meta;

export const Force1HitPerPage: StoryObj = {
  render: withHits(({ search, container, instantsearch }) => {
    const description = document.createElement('div');
    description.innerHTML = `
      <p>Search parameters provided to the Configure widget:</p>
      <pre>{ hitsPerPage: 1 }</pre>
    `;

    container.appendChild(description);

    search.addWidgets([
      instantsearch.widgets.configure({
        hitsPerPage: 1,
      }),
    ]);
  }),
};

export const WithAddRemove: StoryObj = {
  render: withHits(({ search, container, instantsearch }) => {
    withLifecycle(search, container, () =>
      instantsearch.widgets.configure({
        hitsPerPage: 1,
      })
    );

    const description = document.createElement('div');
    description.innerHTML = `
      <p>Search parameters provided to the Configure widget:</p>
      <pre>{ hitsPerPage: 1 }</pre>
    `;

    container.appendChild(description);
  }),
};
