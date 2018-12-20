import { storiesOf } from '@storybook/html';
import { withHits } from '../.storybook/decorators';

storiesOf('Refresh', module).add(
  'default',
  withHits(({ search, container, instantsearch }) => {
    const button = document.createElement('button');
    button.addEventListener('click', () => search.refresh());
    button.innerHTML = 'Refresh InstantSearch';
    const searchBoxContainer = document.createElement('div');
    search.addWidget(
      instantsearch.widgets.searchBox({ container: searchBoxContainer })
    );
    container.appendChild(button);
    container.appendChild(searchBoxContainer);
  })
);
