/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits';

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
      'with highlighted array',
      wrapWithHits(
        container => {
          window.search.addWidget(
            instantsearch.widgets.hits({
              container,
              escapeHits: true,
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
          appId: 'KY4PR9ORUL',
          apiKey: 'a5ca312adab3b79e14054154efa00b37',
          indexName: 'highlight_array',
        }
      )
    );
};
