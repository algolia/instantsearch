import { storiesOf } from 'dev-novel';
import { wrapWithHitsAndJquery } from '../../utils/wrap-with-hits.js';
import * as widgets from '../widgets/index.js';

const stories = storiesOf('SortBy');

export default () => {
  stories.add(
    'default',
    wrapWithHitsAndJquery(containerNode => {
      window.search.addWidget(
        widgets.sortBy({
          containerNode,
          items: [
            { value: 'instant_search', label: 'Most relevant' },
            { value: 'instant_search_price_asc', label: 'Lowest price' },
            { value: 'instant_search_price_desc', label: 'Highest price' },
          ],
        })
      );
    })
  );
};
