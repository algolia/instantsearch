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
            { label: 'All' },
            { end: 4, label: 'less than 4' },
            { start: 4, end: 4, label: '4' },
            { start: 5, end: 10, label: 'between 5 and 10' },
            { start: 10, label: 'more than 10' },
          ],
        })
      );
    })
  );
};
