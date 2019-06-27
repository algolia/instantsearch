import { storiesOf } from '@storybook/html';
import { withHits, withLifecycle } from '../.storybook/decorators';

storiesOf('HitsPerPage', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.hitsPerPage({
          container,
          items: [
            { value: 3, label: '3 per page' },
            { value: 4, label: '4 per page' },
            { value: 5, label: '5 per page' },
            { value: 10, label: '10 per page' },
          ],
        })
      );
    })
  )
  .add(
    'with default hitPerPage to 5',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.hitsPerPage({
          container,
          items: [
            { value: 3, label: '3 per page' },
            { value: 5, label: '5 per page', default: true },
            { value: 10, label: '10 per page' },
          ],
        })
      );
    })
  )
  .add(
    'with transformed items',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.hitsPerPage({
          container,
          items: [
            { value: 3, label: '3 per page', default: true },
            { value: 5, label: '5 per page' },
            { value: 10, label: '10 per page' },
          ],
          transformItems: items =>
            items.map(item => ({
              ...item,
              label: `${item.label} (transformed)`,
            })),
        })
      );
    })
  )
  .add(
    'with add/remove',
    withHits(({ search, container, instantsearch }) => {
      withLifecycle(search, container, node =>
        instantsearch.widgets.hitsPerPage({
          container: node,
          items: [
            { value: 3, label: '3 per page', default: true },
            { value: 5, label: '5 per page' },
            { value: 10, label: '10 per page' },
          ],
        })
      );
    })
  );
