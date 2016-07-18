/* eslint-env jest, jasmine */

import React, {Children} from 'react';
import algoliasearchHelper from 'algoliasearch-helper';
import omit from 'lodash/object/omit';
jest.unmock('algoliasearch-helper');

export const connect = mapStateToProps => Composed => {
  const helper = algoliasearchHelper();
  helper.search = jest.fn();
  return function(props) {
    return (
      <Composed
        {...omit(props, '__state')}
        {...mapStateToProps(props.__state)}
        helper={helper}
      />
    );
  };
};

// For some reason, using jest.unmock('react-algoliasearch-helper') will
// return the automocked version of the module. Probably a bug.
export const Provider = props => Children.only(props.children);
