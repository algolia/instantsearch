import { storiesOf } from '@storybook/html';
import { html, render } from 'htm/preact';

import { withHits } from '../.storybook/decorators';
import { Highlight } from '../src/helpers/components';

storiesOf('Basics/Autocomplete', module).add(
  'default',
  withHits(({ search, container, instantsearch }) => {
    const instantSearchAutocomplete = document.createElement('div');

    container.appendChild(instantSearchAutocomplete);

    const customAutocomplete = instantsearch.connectors.connectAutocomplete<{
      container: HTMLElement;
    }>((renderOptions) => {
      const { indices, currentRefinement, refine, widgetParams } =
        renderOptions;

      render(
        html`<div>
          <input
            class="ais-SearchBox-input"
            value=${currentRefinement}
            onInput=${(event: any) => {
              refine(event.currentTarget.value);
            }}
          />
          <ul>
            ${indices.map(
              ({ indexName, hits }) => html`
                <li>
                  Index: <strong>${indexName}</strong>
                  <ol>
                    ${hits.map(
                      (hit) =>
                        html`<li>
                          <${Highlight} attribute="title" hit=${hit} />
                        </li>`
                    )}
                  </ol>
                </li>
              `
            )}
          </ul>
        </div>`,
        widgetParams.container
      );
    });

    search.addWidgets([
      instantsearch.widgets
        .index({ indexName: 'instant_search_price_asc' })
        .addWidgets([
          instantsearch.widgets.configure({
            hitsPerPage: 3,
          }),

          customAutocomplete({
            container: instantSearchAutocomplete,
          }),

          instantsearch.widgets
            .index({ indexName: 'instant_search_rating_asc' })
            .addWidgets([
              instantsearch.widgets.configure({
                hitsPerPage: 2,
              }),
            ]),
        ]),
    ]);
  })
);
