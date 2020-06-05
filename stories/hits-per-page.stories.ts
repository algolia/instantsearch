import { storiesOf } from '@storybook/html';
import { withHits, withLifecycle } from '../.storybook/decorators';
import { hitsPerPage } from '../src/widgets';

storiesOf('Pagination/HitsPerPage', module)
  .add(
    'default',
    withHits(({ search, container }) => {
      search.addWidgets([
        hitsPerPage({
          container,
          items: [
            { value: 3, label: '3 per page', default: true },
            { value: 5, label: '5 per page' },
            { value: 10, label: '10 per page' },
          ],
        }),
      ]);
    })
  )
  .add(
    'with transformed items',
    withHits(({ search, container }) => {
      search.addWidgets([
        hitsPerPage({
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
        }),
      ]);
    })
  )
  .add(
    'with add/remove',
    withHits(({ search, container }) => {
      withLifecycle(search, container, node =>
        hitsPerPage({
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
