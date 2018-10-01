import { storiesOf } from 'dev-novel';
import { wrapWithHitsAndJquery } from '../../utils/wrap-with-hits.js';
import * as widgets from '../widgets/index.js';

const stories = storiesOf('NumericMenu');

export default () => {
  stories.add(
    'default',
    wrapWithHitsAndJquery(containerNode => {
      window.search.addWidget(
        widgets.numericMenu({
          containerNode,
          attribute: 'price',
          operator: 'or',
          items: [
            { name: 'All' },
            { end: 4, name: 'less than 4' },
            { start: 4, end: 4, name: '4' },
            { start: 5, end: 10, name: 'between 5 and 10' },
            { start: 10, name: 'more than 10' },
          ],
        })
      );
    })
  );
};
