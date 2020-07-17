import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';
import { connectAutocomplete } from '../src/connectors';
import { configure } from '../src/widgets';

storiesOf('Basics/Autocomplete', module).add(
  'default',
  withHits(({ search, container, instantsearch }) => {
    const instantSearchAutocomplete = document.createElement('div');

    container.appendChild(instantSearchAutocomplete);

    const customAutocomplete = connectAutocomplete<{ container: HTMLElement }>(
      (renderOptions, isFirstRender) => {
        const {
          indices,
          currentRefinement,
          refine,
          widgetParams,
        } = renderOptions;

        if (isFirstRender) {
          const input = document.createElement('input');
          input.classList.add('ais-SearchBox-input');
          const list = document.createElement('ul');

          input.addEventListener('input', (event: any) => {
            refine(event.currentTarget.value);
          });

          widgetParams.container.appendChild(input);
          widgetParams.container.appendChild(list);
        }

        widgetParams.container.querySelector(
          'input'
        )!.value = currentRefinement;
        widgetParams.container.querySelector('ul')!.innerHTML = indices
          .map(
            ({ indexName, hits }) => `
<li>
  Index: <strong>${indexName}</strong>
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
          configure({
            hitsPerPage: 3,
          }),

          customAutocomplete({
            container: instantSearchAutocomplete,
          }),

          instantsearch.widgets
            .index({ indexName: 'instant_search_rating_asc' })
            .addWidgets([
              configure({
                hitsPerPage: 2,
              }),
            ]),
        ]),
    ]);
  })
);
