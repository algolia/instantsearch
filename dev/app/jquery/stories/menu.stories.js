import { storiesOf } from 'dev-novel';
import { wrapWithHitsAndJquery } from '../../utils/wrap-with-hits.js';
import * as widgets from '../widgets/index.js';

const stories = storiesOf('Menu');

export default () => {
  stories
    .add(
      'default',
      wrapWithHitsAndJquery(containerNode => {
        window.search.addWidget(
          widgets.menu({
            containerNode,
            attribute: 'categories',
            limit: 3,
          })
        );
      })
    )
    .add(
      'with show more',
      wrapWithHitsAndJquery(containerNode => {
        window.search.addWidget(
          widgets.showMoreMenu({
            containerNode,
            attribute: 'categories',
            limit: 3,
            showMoreLimit: 10,
          })
        );
      })
    );
};
