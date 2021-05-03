import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';
import {
  refinementList,
  menu,
  panel,
  hierarchicalMenu,
  EXPERIMENTAL_dynamicWidgets,
} from '../src/widgets';

storiesOf('Basics/DynamicWidgets', module).add(
  'default',
  withHits(({ search, container: rootContainer }) => {
    search.addWidgets([
      EXPERIMENTAL_dynamicWidgets({
        transformItems(_attributes, { results }) {
          if (results._state.query === 'dog') {
            return ['categories'];
          }
          if (results._state.query === 'lego') {
            return ['categories', 'brand'];
          }
          return ['brand', 'hierarchicalCategories.lvl0', 'categories'];
        },
        container: rootContainer,
        widgets: [
          container => menu({ container, attribute: 'categories' }),
          container =>
            panel({ templates: { header: 'brand' } })(refinementList)({
              container,
              attribute: 'brand',
            }),
          container =>
            panel({ templates: { header: 'hierarchy' } })(hierarchicalMenu)({
              container,
              attributes: [
                'hierarchicalCategories.lvl0',
                'hierarchicalCategories.lvl1',
                'hierarchicalCategories.lvl2',
              ],
            }),
        ],
      }),
    ]);
  })
);
