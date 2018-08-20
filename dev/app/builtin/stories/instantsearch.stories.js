/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import { wrapWithHits } from '../../utils/wrap-with-hits';

const stories = storiesOf('Instantsearch');

export default () => {
  stories.add(
    'With searchfunction that prevent search',
    wrapWithHits(() => {}, {
      searchFunction: helper => {
        const query = helper.state.query;
        if (query === '') {
          return;
        }
        helper.search();
      },
    })
  );
};
