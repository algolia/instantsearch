import Component from './component';

import Index from './components/Index.vue';
import Highlight from './components/Highlight';
import Snippet from './components/Snippet';
import Hits from './components/Hits.vue';
import Stats from './components/Stats.vue';
import Configure from './components/Configure.vue';
import Pagination from './components/Pagination.vue';
import Menu from './components/Menu.vue';
import MenuSelect from './components/MenuSelect.vue';
import SortBy from './components/SortBy.vue';
import SearchBox from './components/SearchBox.vue';
import ClearRefinements from './components/ClearRefinements.vue';
import PoweredBy from './components/PoweredBy.vue';
import Breadcrumb from './components/Breadcrumb.vue';
import CurrentRefinements from './components/CurrentRefinements.vue';
import HierarchicalMenu from './components/HierarchicalMenu.vue';
import HitsPerPage from './components/HitsPerPage.vue';
import InfiniteHits from './components/InfiniteHits.vue';

const InstantSearch = {
  Index,
  Highlight,
  Snippet,
  Configure,
  Hits,
  Stats,
  Pagination,
  Menu,
  MenuSelect,
  SortBy,
  SearchBox,
  ClearRefinements,
  PoweredBy,
  Breadcrumb,
  CurrentRefinements,
  HierarchicalMenu,
  HitsPerPage,
  InfiniteHits,

  install(Vue) {
    Vue.component('ais-index', Index);
    Vue.component('ais-highlight', Highlight);
    Vue.component('ais-snippet', Snippet);
    Vue.component('ais-hits', Hits);
    Vue.component('ais-stats', Stats);
    Vue.component('ais-pagination', Pagination);
    Vue.component('ais-menu', Menu);
    Vue.component('ais-menu-select', MenuSelect);
    Vue.component('ais-sort-by', SortBy);
    Vue.component('ais-search-box', SearchBox);
    Vue.component('ais-clear-refinements', ClearRefinements);
    Vue.component('ais-configure', Configure);
    Vue.component('ais-powered-by', PoweredBy);
    Vue.component('ais-breadcrumb', Breadcrumb);
    Vue.component('ais-current-refinements', CurrentRefinements);
    Vue.component('ais-hierarchical-menu', HierarchicalMenu);
    Vue.component('ais-hits-per-page', HitsPerPage);
    Vue.component('ais-infinite-hits', InfiniteHits);
  },
};

export default InstantSearch;

export {
  Component,
  Index,
  Highlight,
  Snippet,
  Hits,
  Stats,
  Pagination,
  Menu,
  SortBy,
  SearchBox,
  ClearRefinements,
  PoweredBy,
  HitsPerPage,
};
