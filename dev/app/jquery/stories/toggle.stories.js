import { storiesOf } from 'dev-novel';
import { wrapWithHitsAndJquery } from '../../utils/wrap-with-hits';
import * as widgets from '../widgets/index';

const stories = storiesOf('Toggle');

export default () => {
  stories.add(
    'default',
    wrapWithHitsAndJquery(containerNode => {
      window.search.addWidget(
        widgets.toggle({
          containerNode,
          attributeName: 'free_shipping',
          label: 'Free Shipping (toggle single value)',
          title: 'Free Shipping',
        })
      );
    })
  );
};
