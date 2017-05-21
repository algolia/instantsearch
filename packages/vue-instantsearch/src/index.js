import Index from 'vue-instantsearch-index';
import Highlight from 'vue-instantsearch-highlight';
import Snippet from 'vue-instantsearch-snippet';
import Input from 'vue-instantsearch-input';
import Results from 'vue-instantsearch-results';
import Stats from 'vue-instantsearch-stats';
import Pagination from 'vue-instantsearch-pagination';
import ResultsPerPageSelector
  from 'vue-instantsearch-results-per-page-selector';
import TreeMenu from 'vue-instantsearch-tree-menu';
import SortBySelector from 'vue-instantsearch-sort-by-selector';
import SearchBox from 'vue-instantsearch-search-box';
import Clear from 'vue-instantsearch-clear';
import Rating from 'vue-instantsearch-rating';
import NoResults from 'vue-instantsearch-no-results';
import RefinementList from 'vue-instantsearch-refinement-list';
import PriceRange from 'vue-instantsearch-price-range';
import PoweredBy from 'vue-instantsearch-powered-by';

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
  SortBySelector,
  SearchBox,
  Clear,
  Rating,
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
    Vue.component('ais-sort-by-selector', SortBySelector);
    Vue.component('ais-search-box', SearchBox);
    Vue.component('ais-clear', Clear);
    Vue.component('ais-rating', Rating);
    Vue.component('ais-no-results', NoResults);
    Vue.component('ais-refinement-list', RefinementList);
    Vue.component('ais-price-range', PriceRange);
    Vue.component('ais-powered-by', PoweredBy);
  },
};

// Automatically register Algolia Search components if Vue is available globally
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(InstantSearch);
}

export default InstantSearch;

export {
  Index,
  Highlight,
  Snippet,
  Input,
  Results,
  Stats,
  Pagination,
  ResultsPerPageSelector,
  TreeMenu,
  SortBySelector,
  SearchBox,
  Clear,
  Rating,
  NoResults,
  RefinementList,
  PriceRange,
  PoweredBy,
};
