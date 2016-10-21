/**
 * @module widget/CurrentFilters
 */
import connect from './connect';
import CurrentFiltersComponent from './CurrentFilters';
import ResetComponent from './Reset';

/**
 * The CurrentFilters widget displays the list of filters currently applied to the search parameters.
 * It also lets the user remove each one of them.
 * @kind component
 * @category widget
 * @themeKey root - the root div of the widget
 * @themeKey filters - the container of the filters
 * @themeKey filter - a single filter
 * @themeKey filterLabel - the label of a filter
 * @themeKey filterClear - the trigger to remove the filter
 * @themeKey clearAll - the atomic option
 * @translationKey clearFilter - the label?
 * @translationKey clearAll - the clear all button value
 */
const CurrentFilters = connect(CurrentFiltersComponent);
CurrentFilters.Reset = connect(ResetComponent);
CurrentFilters.connect = connect;
export default CurrentFilters;
