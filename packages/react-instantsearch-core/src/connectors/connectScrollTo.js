import PropTypes from 'prop-types';

import createConnector from '../core/createConnector';
import {
  getCurrentRefinementValue,
  hasMultipleIndices,
  getIndexId,
} from '../core/indexUtils';
import { shallowEqual, omit } from '../core/utils';

/**
 * connectScrollTo connector provides the logic to build a widget that will
 * let the page scroll to a certain point.
 * @name connectScrollTo
 * @kind connector
 * @propType {string} [scrollOn="page"] - Widget searchState key on which to listen for changes, default to the pagination widget.
 * @providedPropType {any} value - the current refinement applied to the widget listened by scrollTo
 * @providedPropType {boolean} hasNotChanged - indicates whether the refinement came from the scrollOn argument (for instance page by default)
 */
export default createConnector({
  displayName: 'AlgoliaScrollTo',
  $$type: 'ais.scrollTo',

  propTypes: {
    scrollOn: PropTypes.string,
  },

  defaultProps: {
    scrollOn: 'page',
  },

  getProvidedProps(props, searchState) {
    const id = props.scrollOn;
    const value = getCurrentRefinementValue(
      props,
      searchState,
      { ais: props.contextValue, multiIndexContext: props.indexContextValue },
      id,
      null
    );

    if (!this._prevSearchState) {
      this._prevSearchState = {};
    }

    // Get the subpart of the state that interest us
    if (
      hasMultipleIndices({
        ais: props.contextValue,
        multiIndexContext: props.indexContextValue,
      })
    ) {
      searchState = searchState.indices
        ? searchState.indices[
            getIndexId({
              ais: props.contextValue,
              multiIndexContext: props.indexContextValue,
            })
          ]
        : {};
    }

    // if there is a change in the app that has been triggered by another element
    // than "props.scrollOn (id) or the Configure widget, we need to keep track of
    // the search state to know if there's a change in the app that was not triggered
    // by the props.scrollOn (id) or the Configure widget. This is useful when
    // using ScrollTo in combination of Pagination. As pagination can be change
    // by every widget, we want to scroll only if it cames from the pagination
    // widget itself. We also remove the configure key from the search state to
    // do this comparison because for now configure values are not present in the
    // search state before a first refinement has been made and will false the results.
    // See: https://github.com/algolia/react-instantsearch/issues/164
    const cleanedSearchState = omit(searchState, ['configure', id]);

    const hasNotChanged = shallowEqual(
      this._prevSearchState,
      cleanedSearchState
    );

    this._prevSearchState = cleanedSearchState;

    return { value, hasNotChanged };
  },
});
