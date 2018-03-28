import { storiesOf } from 'dev-novel';

import * as widgets from '../widgets/index.js';
import { wrapWithHitsAndJquery } from '../../utils/wrap-with-hits.js';

const stories = storiesOf('Autocomplete');

export default () => {
  stories.add(
    'default',
    wrapWithHitsAndJquery(containerNode => {
      window.search.addWidget(widgets.autocomplete({ containerNode }));
    })
  );
};
