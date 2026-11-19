import {
  useConnector,
  connectHitsPerPage,
  historyRouter as history,
  createInsightsMiddleware,
} from 'react-instantsearch';

const routing = { router: history({
  // TODO(instantsearch v5): the default of `cleanUrlOnDispose` is now `false`. This keeps the v4 behavior; remove it to adopt the new default.
  cleanUrlOnDispose: true
}) };
