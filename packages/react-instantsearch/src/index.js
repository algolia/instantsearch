import InstantSearch from './core/InstantSearch';
import createConnector from './core/createConnector';

import Hits from './widgets/Hits/index.js';
import HitsPerPage from './widgets/HitsPerPage/index.js';
import SearchBox from './widgets/SearchBox/index.js';
import Pagination from './widgets/Pagination/index.js';
import RefinementList from './widgets/RefinementList/index.js';
import Menu from './widgets/Menu/index.js';
import HierarchicalMenu from './widgets/HierarchicalMenu/index.js';
import NumericRefinementList from './widgets/NumericRefinementList/index.js';
import Range from './widgets/Range/index.js';
import CurrentFilters from './widgets/CurrentFilters/index.js';
import Toggle from './widgets/Toggle/index.js';
import SortBy from './widgets/SortBy/index.js';
import Loading from './widgets/Loading/index.js';
import EmptyQuery from './widgets/EmptyQuery/index.js';
import NoResults from './widgets/NoResults/index.js';
import Stats from './widgets/Stats/index.js';
import Error from './widgets/Error/index.js';
import ScrollTo from './widgets/ScrollTo/index.js';

// Doing `export {default as Thing} from 'thing'` causes warnings with
// react-hot-loader.
export {
  InstantSearch,
  createConnector,

  Hits,
  HitsPerPage,
  SearchBox,
  Pagination,
  RefinementList,
  Menu,
  HierarchicalMenu,
  NumericRefinementList,
  Range,
  CurrentFilters,
  Toggle,
  SortBy,
  Loading,
  EmptyQuery,
  NoResults,
  Stats,
  Error,
  ScrollTo,
};
