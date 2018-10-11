/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import algoliasearch from 'algoliasearch/lite';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('Hits');

export default () => {
  stories
    .add(
      'default',
      wrapWithHits(container => {
        window.search.addWidget(instantsearch.widgets.hits({ container }));
      })
    )
    .add(
      'with transformed items',
      wrapWithHits(container => {
        window.search.addWidget(
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
      wrapWithHits(container => {
        window.search.addWidget(
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
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.hits({
            container,
            templates: {
              item:
                '{{#helpers.highlight}}{ "attribute": "name", "highlightedTagName": "mark" }{{/helpers.highlight}}',
            },
          })
        );
      })
    )
    .add(
      'with snippet function',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.configure({
            attributesToSnippet: ['name', 'description'],
          })
        );

        window.search.addWidget(
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
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.configure({
            attributesToSnippet: ['name', 'description'],
          })
        );

        window.search.addWidget(
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
    )
    .add(
      'with highlighted array',
      wrapWithHits(
        container => {
          window.search.addWidget(
            instantsearch.widgets.hits({
              container,
              templates: {
                item: `
                  <div class="hit" id="hit-{{objectID}}">
                    <div class="hit-content">
                      <div>
                        <span>{{{_highlightResult.name.value}}}</span>
                        <span>\${{price}}</span>
                        <span>{{rating}} stars</span>
                      </div>
                      <div class="hit-type">
                        {{{_highlightResult.type.value}}}
                      </div>
                      <div class="hit-description">
                        {{{_highlightResult.description.value}}}
                      </div>
                      <div class="hit-tags">
                      {{#_highlightResult.tags}}
                        <span>{{{value}}}</span>
                      {{/_highlightResult.tags}}
                      </div>
                    </div>
                  </div>
                `,
              },
            })
          );
        },
        {
          indexName: 'highlight_array',
          searchClient: algoliasearch(
            'KY4PR9ORUL',
            'a5ca312adab3b79e14054154efa00b37'
          ),
        }
      )
    );
};
