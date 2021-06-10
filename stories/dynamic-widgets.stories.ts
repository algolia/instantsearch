import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('Basics/DynamicWidgets', module).add(
  'default',
  withHits(({ search, container: rootContainer, instantsearch }) => {
    search.addWidgets([
      instantsearch.widgets.EXPERIMENTAL_dynamicWidgets({
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
          container =>
            instantsearch.widgets.menu({ container, attribute: 'categories' }),
          container =>
            instantsearch.widgets.panel({ templates: { header: 'brand' } })(
              instantsearch.widgets.refinementList
            )({
              container,
              attribute: 'brand',
            }),
          container =>
            instantsearch.widgets.panel({ templates: { header: 'hierarchy' } })(
              instantsearch.widgets.hierarchicalMenu
            )({
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
