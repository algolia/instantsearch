import { storiesOf } from 'dev-novel';
import { wrapWithHitsAndJquery } from '../../utils/wrap-with-hits.js';
import * as widgets from '../widgets/index.js';

const stories = storiesOf('ToggleRefinement');

export default () => {
  stories.add(
    'default',
    wrapWithHitsAndJquery(containerNode => {
      window.search.addWidget(
        widgets.toggleRefinement({
          containerNode,
          attribute: 'free_shipping',
          title: 'Free Shipping',
        })
      );
    })
  );
};
