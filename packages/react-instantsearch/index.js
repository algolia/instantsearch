import InstantSearch from './src/core/InstantSearch';
import createConnector from './src/core/createConnector';

import Hits from './src/widgets/Hits/index.js';
import HitsPerPage from './src/widgets/HitsPerPage/index.js';
import SearchBox from './src/widgets/SearchBox/index.js';
import Pagination from './src/widgets/Pagination/index.js';
import RefinementList from './src/widgets/RefinementList/index.js';
import Menu from './src/widgets/Menu/index.js';
import HierarchicalMenu from './src/widgets/HierarchicalMenu/index.js';
import NumericRefinementList from './src/widgets/NumericRefinementList/index.js';
import Range from './src/widgets/Range/index.js';
import CurrentFilters from './src/widgets/CurrentFilters/index.js';
import Toggle from './src/widgets/Toggle/index.js';
import SortBy from './src/widgets/SortBy/index.js';
import Loading from './src/widgets/Loading/index.js';
import EmptyQuery from './src/widgets/EmptyQuery/index.js';
import NoResults from './src/widgets/NoResults/index.js';
import Stats from './src/widgets/Stats/index.js';
import Error from './src/widgets/Error/index.js';
import ScrollTo from './src/widgets/ScrollTo/index.js';

// Doing `export {default as Thing} from 'thing'` causes warnings with
// react-hot-loader.
// @TODO not sure this is still the case with new react-hot-loader, check
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
