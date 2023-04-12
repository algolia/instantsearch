import { storiesOf } from '@storybook/html';

import { withHits } from '../.storybook/decorators';

storiesOf('Basics/InstantSearch', module)
  .add(
    'with searchFunction to prevent search',
    withHits(() => {}, {
      searchFunction: (helper) => {
        const query = helper.state.query;

        if (query === '') {
          return;
        }

        helper.search();
      },
    })
  )
  .add(
    'with initialUiState',
    withHits(() => {}, {
      initialUiState: {
        instant_search: {
          refinementList: {
            brand: ['Apple'],
          },
        },
      },
    })
  )
  .add(
    'with refresh to reload',
    withHits(({ search, container, instantsearch }) => {
      const button = document.createElement('button');
      button.addEventListener('click', () => search.refresh());
      button.innerHTML = 'Refresh InstantSearch';
      const searchBoxContainer = document.createElement('div');

      search.addWidgets([
        instantsearch.widgets.searchBox({ container: searchBoxContainer }),
      ]);

      container.appendChild(button);
      container.appendChild(searchBoxContainer);
    })
  )
  .add(
    'Without a root indexName',
    withHits(
      ({ container, instantsearch, search }) => {
        const index1Container = document.createElement('fieldset');
        index1Container.appendChild(
          document.createElement('legend')
        ).innerText = 'Index 1';
        container.appendChild(index1Container);

        const index2Container = document.createElement('fieldset');
        index2Container.appendChild(
          document.createElement('legend')
        ).innerText = 'Index 2';
        container.appendChild(index2Container);

        search.addWidgets([
          instantsearch.widgets
            .index({
              indexName: 'instant_search_movies',
            })
            .addWidgets([
              instantsearch.widgets.searchBox({
                container: index1Container.appendChild(
                  document.createElement('div')
                ),
              }),
              instantsearch.widgets.hits({
                container: index1Container.appendChild(
                  document.createElement('div')
                ),
                templates: {
                  item: (hit, { html, components }) => html`
                    <div>
                      <div>
                        <strong>name</strong>:${' '}
                        ${components.Highlight({ hit, attribute: 'title' })}
                      </div>
                    </div>
                  `,
                },
              }),
            ]),
          instantsearch.widgets
            .index({
              indexName: 'instant_search',
            })
            .addWidgets([
              instantsearch.widgets.searchBox({
                container: index2Container.appendChild(
                  document.createElement('div')
                ),
              }),
              instantsearch.widgets.hits({
                container: index2Container.appendChild(
                  document.createElement('div')
                ),
                templates: {
                  item: (hit, { html, components }) => html`
                    <div>
                      <div>
                        <strong>name</strong>:${' '}
                        ${components.Highlight({ hit, attribute: 'name' })}
                      </div>
                      <div>
                        <strong>description</strong>:${' '}
                        ${components.Snippet({ hit, attribute: 'description' })}
                      </div>
                    </div>
                  `,
                },
              }),
            ]),
        ]);
      },
      {
        // In a real application, you can skip the indexName, withHits just has default values set
        indexName: '',
        playground: ({ instantsearch, search, rightPanel }) => {
          search.addWidgets([
            instantsearch.widgets.hits({
              container: rightPanel.appendChild(document.createElement('div')),
            }),
          ]);
        },
      }
    )
  );
