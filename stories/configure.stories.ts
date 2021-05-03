import { storiesOf } from '@storybook/html';
import { withHits, withLifecycle } from '../.storybook/decorators';
import { configure } from '../src/widgets';

storiesOf('Basics/Configure', module)
  .add(
    'Force 1 hit per page',
    withHits(({ search, container }) => {
      const description = document.createElement('div');
      description.innerHTML = `
        <p>Search parameters provided to the Configure widget:</p>
        <pre>{ hitsPerPage: 1 }</pre>
      `;

      container.appendChild(description);

      search.addWidgets([
        configure({
          hitsPerPage: 1,
        }),
      ]);
    })
  )
  .add(
    'with add/remove',
    withHits(({ search, container }) => {
      withLifecycle(search, container, () =>
        configure({
          hitsPerPage: 1,
        })
      );

      const description = document.createElement('div');
      description.innerHTML = `
        <p>Search parameters provided to the Configure widget:</p>
        <pre>{ hitsPerPage: 1 }</pre>
      `;

      container.appendChild(description);
    })
  );
