import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('Metadata/PoweredBy', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      search.addWidgets([instantsearch.widgets.poweredBy({ container })]);
    })
  )
  .add(
    'with dark theme',
    withHits(({ search, container, instantsearch }) => {
      container.style.backgroundColor = '#282c34';

      search.addWidgets([
        instantsearch.widgets.poweredBy({
          container,
          theme: 'dark',
        }),
      ]);
    })
  );
