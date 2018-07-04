import { storiesOf } from 'dev-novel';
import { wrapWithHits } from '../../utils/wrap-with-hits';
import * as widgets from '../widgets/index';

const stories = storiesOf('SearchBox');

export default () => {
  stories
    .add(
      'default',
      wrapWithHits(container => {
        const input = document.createElement('input');
        container.appendChild(input);

        window.search.addWidget(
          widgets.searchBox({
            node: input,
            placeholder: 'Search for products',
          })
        );
      })
    )
    .add(
      'with enter to search',
      wrapWithHits(container => {
        const input = document.createElement('input');
        container.appendChild(input);

        window.search.addWidget(
          widgets.searchBoxReturn({
            node: input,
            placeholder: 'Search for products',
          })
        );
      })
    );
};
