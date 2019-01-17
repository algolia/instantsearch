import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('PoweredBy', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(instantsearch.widgets.poweredBy({ container }));
    })
  )
  .add(
    'with dark theme',
    withHits(({ search, container, instantsearch }) => {
      container.style.backgroundColor = '#282c34';

      search.addWidget(
        instantsearch.widgets.poweredBy({
          container,
          theme: 'dark',
        })
      );
    })
  );
