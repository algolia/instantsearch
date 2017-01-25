/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react-test-renderer';
import {mount} from 'enzyme';

import InfiniteHits from './InfiniteHits';

describe('Hits', () => {
  it('accepts a hitComponent prop', () => {
    const hits = [{objectID: 0}, {objectID: 1}, {objectID: 2}];
    const Hit = 'Hit';
    const tree = renderer.create(
      <InfiniteHits
        hitComponent={Hit}
        hits={hits}
        hasMore={false}
        refine={() => undefined}
      />
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });

  const Hit = ({hit}) => <div>{JSON.stringify(hit)}</div>;
  Hit.propTypes = {hit: React.PropTypes.object};

  it('calls refine when the load more button is clicked', () => {
    const mockedRefine = jest.fn();
    const hits = [{objectID: 0}, {objectID: 1}, {objectID: 2}];
    const wrapped = mount(
        <InfiniteHits
          refine={mockedRefine}
          hitComponent={Hit}
          hits={hits}
          hasMore={true}
        />
      );
    expect(mockedRefine.mock.calls.length).toBe(0);
    wrapped.find('.ais-InfiniteHits__loadMore').simulate('click');
    expect(mockedRefine.mock.calls.length).toBe(1);
  });

  it('Button is disabled when it is the last page', () => {
    const hits = [{objectID: 0}, {objectID: 1}, {objectID: 2}];
    const wrapped = mount(
        <InfiniteHits
          refine={() => undefined}
          hitComponent={Hit}
          hits={hits}
          hasMore={false}
          />
      );
    expect(wrapped.find('.ais-InfiniteHits__loadMore').props().disabled).toBe(true);
  });
});
