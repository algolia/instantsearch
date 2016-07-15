/* eslint-env jest, jasmine */

import React from 'react';
import algoliasearchHelper from 'algoliasearch-helper';
import omit from 'lodash/object/omit';
jest.unmock('algoliasearch-helper');

export default mapStateToProps => Composed => {
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
