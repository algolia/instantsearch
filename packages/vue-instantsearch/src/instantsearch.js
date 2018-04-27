import Component from './component';

import Index from './components/Index.vue';
import Highlight from './components/Highlight';
import Snippet from './components/Snippet';
import Input from './components/Input.vue';
import Hits from './components/Hits.vue';
import Stats from './components/Stats.vue';
import Configure from './components/Configure.vue';
import Pagination from './components/Pagination.vue';
import Menu from './components/Menu.vue';
import SortBySelector from './components/SortBySelector.vue';
import SearchBox from './components/SearchBox.vue';
import ClearRefinements from './components/ClearRefinements.vue';
import PoweredBy from './components/PoweredBy.vue';
import Breadcrumb from './components/Breadcrumb.vue';
import CurrentRefinements from './components/CurrentRefinements.vue';
import HierarchicalMenu from './components/HierarchicalMenu.vue';
import HitsPerPage from './components/HitsPerPage.vue';

const InstantSearch = {
  Index,
  Highlight,
  Snippet,
  Input,
  Configure,
  Hits,
  Stats,
  Pagination,
  Menu,
  SortBySelector,
  SearchBox,
  ClearRefinements,
  PoweredBy,
  Breadcrumb,
  CurrentRefinements,
  HierarchicalMenu,
  HitsPerPage,

  install(Vue) {
    Vue.component('ais-index', Index);
    Vue.component('ais-highlight', Highlight);
    Vue.component('ais-snippet', Snippet);
    Vue.component('ais-input', Input);
    Vue.component('ais-hits', Hits);
    Vue.component('ais-stats', Stats);
    Vue.component('ais-pagination', Pagination);
    Vue.component('ais-menu', Menu);
    Vue.component('ais-sort-by-selector', SortBySelector);
    Vue.component('ais-search-box', SearchBox);
    Vue.component('ais-clear-refinements', ClearRefinements);
    Vue.component('ais-configure', Configure);
    Vue.component('ais-powered-by', PoweredBy);
    Vue.component('ais-breadcrumb', Breadcrumb);
    Vue.component('ais-current-refinements', CurrentRefinements);
    Vue.component('ais-hierarchical-menu', HierarchicalMenu);
    Vue.component('ais-hits-per-page', HitsPerPage);
  },
};

export default InstantSearch;

export {
  Component,
  Index,
  Highlight,
  Snippet,
  Input,
  Hits,
  Stats,
  Pagination,
  Menu,
  SortBySelector,
  SearchBox,
  ClearRefinements,
  PoweredBy,
  HitsPerPage,
};
