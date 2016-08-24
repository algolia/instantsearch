import InstantSearch from './core/InstantSearch';
import createConnector from './core/createConnector';

import Hits from './widgets/Hits';
import HitsPerPage from './widgets/HitsPerPage';
import SearchBox from './widgets/SearchBox';
import Pagination from './widgets/Pagination';
import RefinementList from './widgets/RefinementList';
import Menu from './widgets/Menu';
import HierarchicalMenu from './widgets/HierarchicalMenu';
import NumericRefinementList from './widgets/NumericRefinementList';
import Range from './widgets/Range';
import CurrentFilters from './widgets/CurrentFilters';
import Toggle from './widgets/Toggle';
import SortBy from './widgets/SortBy';
import Loading from './widgets/Loading';
import EmptyQuery from './widgets/EmptyQuery';
import NoResults from './widgets/NoResults';
import Stats from './widgets/Stats';
import Error from './widgets/Error';
import ScrollTo from './widgets/ScrollTo';

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
