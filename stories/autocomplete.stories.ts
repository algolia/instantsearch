import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('Autocomplete', module).add(
  'default',
  withHits(({ search, container, instantsearch }) => {
    const instantSearchRatingAscSearchBox = document.createElement('div');
    const instantSearchAutocomplete = document.createElement('div');

    container.appendChild(instantSearchRatingAscSearchBox);
    container.appendChild(instantSearchAutocomplete);

    const customAutocomplete = instantsearch.connectors.connectAutocomplete(
      renderOptions => {
        const { indices, widgetParams } = renderOptions;

        widgetParams.container.innerHTML = indices
          .map(
            ({ index, hits }) => `
<li>
  Index: <strong>${index}</strong>
  <ol>
    ${hits
      .map(
        hit => `<li>${instantsearch.highlight({ attribute: 'name', hit })}</li>`
      )
      .join('')}
  </ol>
</li>
`
          )
          .join('');
      }
    );

    search.addWidgets([
      instantsearch.widgets
        .index({ indexName: 'instant_search_price_asc' })
        .addWidgets([
          instantsearch.widgets.configure({
            hitsPerPage: 3,
          }),

          instantsearch.widgets.searchBox({
            container: instantSearchRatingAscSearchBox,
            placeholder: 'Search in the autocomplete list',
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
