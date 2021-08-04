import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('Basics/DynamicWidgets', module).add(
  'default',
  withHits(({ search, container: rootContainer, instantsearch }) => {
    const dynamicWidgetsContainer = document.createElement('div');
    const disclaimer = document.createTextNode(
      'try the queries: "dog" or "lego"'
    );
    rootContainer.appendChild(disclaimer);
    rootContainer.appendChild(dynamicWidgetsContainer);

    search.addWidgets([
      instantsearch.widgets.EXPERIMENTAL_dynamicWidgets({
        container: dynamicWidgetsContainer,
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
