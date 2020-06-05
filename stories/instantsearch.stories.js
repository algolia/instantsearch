import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('Basics/InstantSearch', module)
  .add(
    'with searchFunction to prevent search',
    withHits(() => {}, {
      searchFunction: helper => {
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
  );
