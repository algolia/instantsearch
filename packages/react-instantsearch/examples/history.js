import {useRouterHistory} from 'react-router';
import {createHistory} from 'history';
import qs from 'qs';

function alphabeticalSort(a, b) {
  if (a > b) {
    return 1;
  }
  if (a === b) {
    return 0;
  }
  return -1;
}

export default useRouterHistory(createHistory)({
  parseQueryString: qs.parse,
  stringifyQuery: q => qs.stringify(q, {sort: alphabeticalSort}),
});
