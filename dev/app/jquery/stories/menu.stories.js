import { storiesOf } from 'dev-novel';
import { wrapWithHitsAndJquery } from '../../utils/wrap-with-hits';
import * as widgets from '../widgets/index';

const stories = storiesOf('Menu');

export default () => {
  stories
    .add(
      'default',
      wrapWithHitsAndJquery(containerNode => {
        window.search.addWidget(
          widgets.menu({
            containerNode,
            attributeName: 'categories',
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
            attributeName: 'categories',
            limit: 3,
            showMoreLimit: 10,
          })
        );
      })
    );
};
