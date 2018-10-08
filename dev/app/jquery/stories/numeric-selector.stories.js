import { storiesOf } from 'dev-novel';
import { wrapWithHitsAndJquery } from '../../utils/wrap-with-hits.js';
import * as widgets from '../widgets/index.js';

const stories = storiesOf('NumericSelector');

export default () => {
  stories.add(
    'default',
    wrapWithHitsAndJquery(containerNode => {
      window.search.addWidget(
        widgets.numericSelector({
          containerNode,
          operator: '>=',
          attribute: 'popularity',
          options: [
            { label: 'Default', value: 0 },
            { label: 'Top 10', value: 9991 },
            { label: 'Top 100', value: 9901 },
            { label: 'Top 500', value: 9501 },
          ],
        })
      );
    })
  );
};
