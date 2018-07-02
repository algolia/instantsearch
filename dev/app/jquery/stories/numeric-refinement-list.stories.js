import { storiesOf } from 'dev-novel';
import { wrapWithHitsAndJquery } from '../../utils/wrap-with-hits';
import * as widgets from '../widgets/index';

const stories = storiesOf('NumericRefinementList');

export default () => {
  stories.add(
    'default',
    wrapWithHitsAndJquery(containerNode => {
      window.search.addWidget(
        widgets.numericRefinementList({
          containerNode,
          attributeName: 'price',
          operator: 'or',
          options: [
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
