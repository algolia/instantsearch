import { storiesOf } from '@storybook/html';

import { withHits } from '../.storybook/decorators';

storiesOf('Basics/DynamicWidgets', module)
  .add(
    'default',
    withHits(({ search, container: rootContainer, instantsearch }) => {
      const dynamicWidgetsContainer = document.createElement('div');
      const disclaimer = document.createTextNode(
        'try the queries: "dog" or "lego"'
      );
      rootContainer.appendChild(disclaimer);
      rootContainer.appendChild(dynamicWidgetsContainer);

      search.addWidgets([
        instantsearch.widgets.dynamicWidgets({
          container: dynamicWidgetsContainer,
          fallbackWidget: ({ attribute, container }) =>
            instantsearch.widgets.panel<
              typeof instantsearch.widgets.refinementList
            >({
              templates: {
                header(stuff) {
                  return stuff.widgetParams.attribute;
                },
              },
            })(instantsearch.widgets.refinementList)({ attribute, container }),
          widgets: [
            (container) =>
              instantsearch.widgets.menu({
                container,
                attribute: 'categories',
              }),
            (container) =>
              instantsearch.widgets.panel({
                templates: { header: () => 'hierarchy' },
              })(instantsearch.widgets.hierarchicalMenu)({
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
  )
  .add(
    'multiple requests',
    withHits(({ search, container: rootContainer, instantsearch }) => {
      const dynamicWidgetsContainer = document.createElement('div');
      const disclaimer = document.createTextNode(
        'try the queries: "dog" or "lego". Notice how there are two network requests, with a minimal payload each.'
      );
      rootContainer.appendChild(disclaimer);
      rootContainer.appendChild(dynamicWidgetsContainer);

      search.addWidgets([
        instantsearch.widgets.dynamicWidgets({
          container: dynamicWidgetsContainer,
          fallbackWidget: ({ attribute, container }) =>
            instantsearch.widgets.panel<
              typeof instantsearch.widgets.refinementList
            >({
              templates: {
                header(stuff) {
                  return stuff.widgetParams.attribute;
                },
              },
            })(instantsearch.widgets.refinementList)({ attribute, container }),
          widgets: [
            (container) =>
              instantsearch.widgets.menu({
                container,
                attribute: 'categories',
              }),
            (container) =>
              instantsearch.widgets.panel({
                templates: { header: () => 'hierarchy' },
              })(instantsearch.widgets.hierarchicalMenu)({
                container,
                attributes: [
                  'hierarchicalCategories.lvl0',
                  'hierarchicalCategories.lvl1',
                  'hierarchicalCategories.lvl2',
                ],
              }),
          ],
          facets: [],
        }),
      ]);
    })
  );
