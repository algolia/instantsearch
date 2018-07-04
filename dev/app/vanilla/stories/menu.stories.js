import { storiesOf } from 'dev-novel';
import { wrapWithHits } from '../../utils/wrap-with-hits';
import * as widgets from '../widgets/index';

const stories = storiesOf('Menu');

export default () => {
  stories.add(
    'select',
    wrapWithHits(containerNode => {
      window.search.addWidget(
        widgets.selectMenu({
          containerNode,
          attributeName: 'brand',
          limit: 10,
          title: 'Brands',
        })
      );
    })
  );
};
