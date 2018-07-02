import { storiesOf } from 'dev-novel';
import { wrapWithHitsAndJquery } from '../../utils/wrap-with-hits';
import * as widgets from '../widgets/index';

const stories = storiesOf('SortBySelector');

export default () => {
  stories.add(
    'default',
    wrapWithHitsAndJquery(containerNode => {
      window.search.addWidget(
        widgets.sortBySelector({
          containerNode,
          indices: [
            { name: 'instant_search', label: 'Most relevant' },
            { name: 'instant_search_price_asc', label: 'Lowest price' },
            { name: 'instant_search_price_desc', label: 'Highest price' },
          ],
        })
      );
    })
  );
};
