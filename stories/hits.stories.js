import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('Hits', module)
  .add(
    'default',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(instantsearch.widgets.hits({ container }));
    })
  )
  .add(
    'with transformed items',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.hits({
          container,
          transformItems: items =>
            items.map(item => ({
              ...item,
              name: `${item.name} (transformed)`,
            })),
        })
      );
    })
  )
  .add(
    'with highlight function',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.hits({
          container,
          templates: {
            item(hit) {
              return instantsearch.highlight({
                attribute: 'name',
                hit,
              });
            },
          },
        })
      );
    })
  )
  .add(
    'with highlight helper',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.hits({
          container,
          templates: {
            item:
              '{{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}',
          },
        })
      );
    })
  )
  .add(
    'with snippet function',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.configure({
          attributesToSnippet: ['name', 'description'],
        })
      );

      search.addWidget(
        instantsearch.widgets.hits({
          container,
          templates: {
            item(hit) {
              return `
                  <h4>${instantsearch.snippet({
                    attribute: 'name',
                    hit,
                  })}</h4>
                  <p>${instantsearch.snippet({
                    attribute: 'description',
                    hit,
                  })}</p>
                `;
            },
          },
        })
      );
    })
  )
  .add(
    'with snippet helper',
    withHits(({ search, container, instantsearch }) => {
      search.addWidget(
        instantsearch.widgets.configure({
          attributesToSnippet: ['name', 'description'],
        })
      );

      search.addWidget(
        instantsearch.widgets.hits({
          container,
          templates: {
            item: `
                <h4>{{#helpers.snippet}}{ "attribute": "name", "highlightedTagName": "mark" }{{/helpers.snippet}}</h4>
                <p>{{#helpers.snippet}}{ "attribute": "description", "highlightedTagName": "mark" }{{/helpers.snippet}}</p>`,
          },
        })
      );
    })
  );
