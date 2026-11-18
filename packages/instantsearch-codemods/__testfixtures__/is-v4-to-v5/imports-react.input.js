import { useConnector } from 'react-instantsearch';
import connectHitsPerPage from 'instantsearch.js/es/connectors/hits-per-page/connectHitsPerPage';
import { history } from 'instantsearch.js/es/lib/routers';
import { createInsightsMiddleware } from 'instantsearch.js/es/middlewares';

const routing = { router: history() };
