import {useRouterHistory} from 'react-router';
import {createHistory} from 'history';
import qs from 'qs';

export default useRouterHistory(createHistory)({
  parseQueryString: qs.parse,
  stringifyQuery: qs.stringify,
});
