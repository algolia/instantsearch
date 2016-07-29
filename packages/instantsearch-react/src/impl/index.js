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

import createRefinementList from '../hoc/createRefinementList';
import RefinementListImpl from './RefinementList';
export const RefinementList = createRefinementList(RefinementListImpl);
import RefinementListLinksImpl from './RefinementListLinks';
export const RefinementListLinks = createRefinementList(RefinementListLinksImpl);

import createMenu from '../hoc/createMenu';
import MenuImpl from './Menu';
export const Menu = createMenu(MenuImpl);

import Select from './Select';
export const MenuSelect = createMenu(Select);

import createHierarchicalMenu from '../hoc/createHierarchicalMenu';
import HierarchicalMenuImpl from './HierarchicalMenu';
export const HierarchicalMenu = createHierarchicalMenu(HierarchicalMenuImpl);
