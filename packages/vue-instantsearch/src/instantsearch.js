import {
  FACET_AND,
  FACET_OR,
  FACET_TREE,
  createFromAlgoliaCredentials,
  createFromAlgoliaClient,
  createFromSerialized,
  Store,
} from './store';

import Component from './component';

import Index from './components/Index.vue';
import Highlight from './components/Highlight';
import Snippet from './components/Snippet';
import Input from './components/Input.vue';
import Results from './components/Results.vue';
import Stats from './components/Stats.vue';
import Pagination from './components/Pagination.vue';
import ResultsPerPageSelector from './components/ResultsPerPageSelector.vue';
import TreeMenu from './components/TreeMenu.vue';
import Menu from './components/Menu.vue';
import SortBySelector from './components/SortBySelector.vue';
import SearchBox from './components/SearchBox.vue';
import ClearAll from './components/ClearAll.vue';
import Rating from './components/Rating.vue';
import RangeInput from './components/RangeInput.vue';
import NoResults from './components/NoResults.vue';
import RefinementList from './components/RefinementList.vue';
import PriceRange from './components/PriceRange.vue';
import PoweredBy from './components/PoweredBy.vue';

const InstantSearch = {
  Index,
  Highlight,
  Snippet,
  Input,
  Results,
  Stats,
  Pagination,
  ResultsPerPageSelector,
  TreeMenu,
  Menu,
  SortBySelector,
  SearchBox,
  ClearAll,
  Rating,
  RangeInput,
  NoResults,
  RefinementList,
  PriceRange,
  PoweredBy,

  install(Vue) {
    Vue.component('ais-index', Index);
    Vue.component('ais-highlight', Highlight);
    Vue.component('ais-snippet', Snippet);
    Vue.component('ais-input', Input);
    Vue.component('ais-results', Results);
    Vue.component('ais-stats', Stats);
    Vue.component('ais-pagination', Pagination);
    Vue.component('ais-results-per-page-selector', ResultsPerPageSelector);
    Vue.component('ais-tree-menu', TreeMenu);
    Vue.component('ais-menu', Menu);
    Vue.component('ais-sort-by-selector', SortBySelector);
    Vue.component('ais-search-box', SearchBox);
    Vue.component('ais-clear-all', ClearAll);
    Vue.component('ais-rating', Rating);
    Vue.component('ais-range-input', RangeInput);
    Vue.component('ais-no-results', NoResults);
    Vue.component('ais-refinement-list', RefinementList);
    Vue.component('ais-price-range', PriceRange);
    Vue.component('ais-powered-by', PoweredBy);
  },
};

export default InstantSearch;

export {
  Component,
  FACET_AND,
  FACET_OR,
  FACET_TREE,
  createFromAlgoliaCredentials,
  createFromAlgoliaClient,
  createFromSerialized,
  Store,
  Index,
  Highlight,
  Snippet,
  Input,
  Results,
  Stats,
  Pagination,
  ResultsPerPageSelector,
  TreeMenu,
  Menu,
  SortBySelector,
  SearchBox,
  ClearAll,
  Rating,
  RangeInput,
  NoResults,
  RefinementList,
  PriceRange,
  PoweredBy,
};
