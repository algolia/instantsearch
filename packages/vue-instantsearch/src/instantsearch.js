import Component from './component';

import Breadcrumb from './components/Breadcrumb.vue';
import ClearRefinements from './components/ClearRefinements.vue';
import Configure from './components/Configure.vue';
import CurrentRefinements from './components/CurrentRefinements.vue';
import HierarchicalMenu from './components/HierarchicalMenu.vue';
import Highlight from './components/Highlight';
import Hits from './components/Hits.vue';
import HitsPerPage from './components/HitsPerPage.vue';
import Index from './components/Index.vue';
import InfiniteHits from './components/InfiniteHits.vue';
import Menu from './components/Menu.vue';
import MenuSelect from './components/MenuSelect.vue';
import NumericMenu from './components/NumericMenu.vue';
import Pagination from './components/Pagination.vue';
import PoweredBy from './components/PoweredBy.vue';
import RangeInput from './components/RangeInput.vue';
import RatingMenu from './components/RatingMenu.vue';
import SearchBox from './components/SearchBox.vue';
import Snippet from './components/Snippet';
import SortBy from './components/SortBy.vue';
import Stats from './components/Stats.vue';
import ToggleRefinement from './components/ToggleRefinement.vue';

const InstantSearch = {
  Breadcrumb,
  ClearRefinements,
  Component,
  Configure,
  CurrentRefinements,
  HierarchicalMenu,
  Highlight,
  Hits,
  HitsPerPage,
  Index,
  InfiniteHits,
  Menu,
  MenuSelect,
  Pagination,
  PoweredBy,
  RangeInput,
  RatingMenu,
  SearchBox,
  Snippet,
  SortBy,
  Stats,
  ToggleRefinement,

  install(Vue) {
    Vue.component('ais-breadcrumb', Breadcrumb);
    Vue.component('ais-clear-refinements', ClearRefinements);
    Vue.component('ais-configure', Configure);
    Vue.component('ais-current-refinements', CurrentRefinements);
    Vue.component('ais-hierarchical-menu', HierarchicalMenu);
    Vue.component('ais-highlight', Highlight);
    Vue.component('ais-hits-per-page', HitsPerPage);
    Vue.component('ais-hits', Hits);
    Vue.component('ais-index', Index);
    Vue.component('ais-infinite-hits', InfiniteHits);
    Vue.component('ais-menu', Menu);
    Vue.component('ais-menu-select', MenuSelect);
    Vue.component('ais-numeric-menu', NumericMenu);
    Vue.component('ais-pagination', Pagination);
    Vue.component('ais-powered-by', PoweredBy);
    Vue.component('ais-range-input', RangeInput);
    Vue.component('ais-rating-menu', RatingMenu);
    Vue.component('ais-search-box', SearchBox);
    Vue.component('ais-snippet', Snippet);
    Vue.component('ais-sort-by', SortBy);
    Vue.component('ais-stats', Stats);
    Vue.component('ais-toggle-refinement', ToggleRefinement);
  },
};

export default InstantSearch;

export {
  Breadcrumb,
  ClearRefinements,
  Component,
  Configure,
  CurrentRefinements,
  HierarchicalMenu,
  Highlight,
  Hits,
  HitsPerPage,
  Index,
  InfiniteHits,
  Menu,
  MenuSelect,
  Pagination,
  PoweredBy,
  RangeInput,
  RatingMenu,
  SearchBox,
  Snippet,
  SortBy,
  Stats,
  ToggleRefinement,
};
