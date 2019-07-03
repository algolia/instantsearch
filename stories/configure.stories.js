import { storiesOf } from '@storybook/html';
import { withHits, withLifecycle } from '../.storybook/decorators';

storiesOf('Configure', module)
  .add(
    'Force 1 hit per page',
    withHits(({ search, container, instantsearch }) => {
      const description = document.createElement('div');
      description.innerHTML = `
        <p>Search parameters provied to the Configure widget:</p>
        <pre>{ hitsPerPage: 1 }</pre>
      `;

      container.appendChild(description);

      search.addWidget(
        instantsearch.widgets.configure({
          hitsPerPage: 1,
        })
      );
    })
  )
  .add(
    'with add/remove',
    withHits(({ search, container, instantsearch }) => {
      withLifecycle(search, container, () =>
        instantsearch.widgets.configure({
          hitsPerPage: 1,
        })
      );

      const description = document.createElement('div');
      description.innerHTML = `
        <p>Search parameters provied to the Configure widget:</p>
        <pre>{ hitsPerPage: 1 }</pre>
      `;

      container.appendChild(description);
    })
  );
