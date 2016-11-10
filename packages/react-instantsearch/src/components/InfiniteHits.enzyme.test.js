/* eslint-env jest, jasmine */

import React from 'react';

import InfiniteHits from './InfiniteHits';

import {mount} from 'enzyme';

describe('InfiniteHits', () => {
  const Hit = ({hit}) => <div>{JSON.stringify(hit)}</div>;
  Hit.propTypes = {hit: React.PropTypes.object};

  it('calls refine when the load more button is clicked', () => {
    const mockedRefine = jest.fn();
    const hits = [{objectID: 0}, {objectID: 1}, {objectID: 2}];
    const wrapped = mount(
      <InfiniteHits
        refine={mockedRefine}
        itemComponent={Hit}
        hits={hits}
        hasMore={true}
      />
    );
    expect(mockedRefine.mock.calls.length).toBe(0);
    wrapped.find('button').simulate('click');
    expect(mockedRefine.mock.calls.length).toBe(1);
  });

  it('Button is disabled when it is the last page', () => {
    const hits = [{objectID: 0}, {objectID: 1}, {objectID: 2}];
    const wrapped = mount(
      <InfiniteHits
        refine={() => undefined}
        itemComponent={Hit}
        hits={hits}
        hasMore={false}
      />
    );
    expect(wrapped.find('button').props().disabled).toBe(true);
  });
});
