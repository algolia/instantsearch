/* eslint-env jest, jasmine */

import React from 'react';
import {mount} from 'enzyme';
import algoliasearchHelper from 'algoliasearch-helper';
jest.unmock('algoliasearch-helper');

export default mapStateToProps => Composed => state => {
  const helper = algoliasearchHelper();
  helper.search = jest.fn();
  const wrapper = mount(
    <Composed
      {...mapStateToProps(state)}
      helper={helper}
    />
  );
  return wrapper;
};
