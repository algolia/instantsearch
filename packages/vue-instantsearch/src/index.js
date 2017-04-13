import AisStore from 'vue-instantsearch-store'
import AisHighlight from 'vue-instantsearch-highlight'
import AisSnippet from 'vue-instantsearch-snippet'
import AisInput from 'vue-instantsearch-input'
import AisResults from 'vue-instantsearch-results'
import AisStats from 'vue-instantsearch-stats'
import AisPagination from 'vue-instantsearch-pagination'
import AisResultsPerPageSelector from 'vue-instantsearch-results-per-page-selector'
import AisTreeMenu from 'vue-instantsearch-tree-menu'
import AisSortBySelector from 'vue-instantsearch-sort-by-selector'
import AisSearchForm from 'vue-instantsearch-search-form'
import AisClear from 'vue-instantsearch-clear'
import AisRating from 'vue-instantsearch-rating'
import AisNoResults from 'vue-instantsearch-no-results'
import AisRefinementList from 'vue-instantsearch-refinement-list'
import AisPriceRange from 'vue-instantsearch-price-range'
import AisPoweredBy from 'vue-instantsearch-powered-by'

const InstantSearch = {
  AisStore,
  AisHighlight,
  AisSnippet,
  AisInput,
  AisResults,
  AisStats,
  AisPagination,
  AisResultsPerPageSelector,
  AisTreeMenu,
  AisSortBySelector,
  AisSearchForm,
  AisClear,
  AisRating,
  AisNoResults,
  AisRefinementList,
  AisPriceRange,
  AisPoweredBy,

  install (Vue) {
    Vue.component('ais-store', AisStore)
    Vue.component('ais-highlight', AisHighlight)
    Vue.component('ais-snippet', AisSnippet)
    Vue.component('ais-input', AisInput)
    Vue.component('ais-results', AisResults)
    Vue.component('ais-stats', AisStats)
    Vue.component('ais-pagination', AisPagination)
    Vue.component('ais-results-per-page-selector', AisResultsPerPageSelector)
    Vue.component('ais-tree-menu', AisTreeMenu)
    Vue.component('ais-sort-by-selector', AisSortBySelector)
    Vue.component('ais-search-form', AisSearchForm)
    Vue.component('ais-clear', AisClear)
    Vue.component('ais-rating', AisRating)
    Vue.component('ais-no-results', AisNoResults)
    Vue.component('ais-refinement-list', AisRefinementList)
    Vue.component('ais-price-range', AisPriceRange)
    Vue.component('ais-powered-by', AisPoweredBy)
  }

}

// Automatically register Algolia Search components if Vue is available globally
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(InstantSearch);
}

export default InstantSearch

export {
  AisStore,
  AisHighlight,
  AisSnippet,
  AisInput,
  AisResults,
  AisStats,
  AisPagination,
  AisResultsPerPageSelector,
  AisTreeMenu,
  AisSortBySelector,
  AisSearchForm,
  AisClear,
  AisRating,
  AisNoResults,
  AisRefinementList,
  AisPriceRange,
  AisPoweredBy
}
