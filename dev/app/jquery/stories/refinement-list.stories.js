import { storiesOf } from 'dev-novel';
import { wrapWithHitsAndJquery } from '../../utils/wrap-with-hits';
import * as widgets from '../widgets/index';

const stories = storiesOf('RefinementList');

export default () => {
  stories.add(
    'default',
    wrapWithHitsAndJquery(containerNode => {
      window.search.addWidget(
        widgets.refinementList({
          containerNode,
          attributeName: 'brand',
          operator: 'or',
          limit: 10,
          title: 'Brands',
        })
      );
    })
  );
};
