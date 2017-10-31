import { storiesOf } from 'dev-novel';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';
import * as widgets from '../widgets/index.js';

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
