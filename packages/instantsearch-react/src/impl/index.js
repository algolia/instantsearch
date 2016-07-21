import createHits from '../hoc/createHits';
import HitsImpl from './Hits';
export const Hits = createHits(HitsImpl);

import createHitsPerPage from '../hoc/createHitsPerPage';
import HitsPerPageImpl from './HitsPerPage';
export const HitsPerPage = createHitsPerPage(HitsPerPageImpl);

import createSearchBox from '../hoc/createSearchBox';
import SearchBoxImpl from './SearchBox';
export const SearchBox = createSearchBox(SearchBoxImpl);

import createPagination from '../hoc/createPagination';
import PaginationImpl from './Pagination';
export const Pagination = createPagination(PaginationImpl);

import createFacetRefiner from '../hoc/createFacetRefiner';
import RefinementListImpl from './RefinementList';
export const RefinementList = createFacetRefiner(RefinementListImpl);
