/**
 * @jest-environment jsdom
 */

import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount } from 'enzyme';
import PropTypes from 'prop-types';
import React from 'react';
import renderer from 'react-test-renderer';

import InfiniteHits from '../InfiniteHits';

Enzyme.configure({ adapter: new Adapter() });

describe('InfiniteHits', () => {
  const Hit = ({ hit }) => <div>{JSON.stringify(hit)}</div>;

  Hit.propTypes = {
    hit: PropTypes.object,
  };

  it('accepts a hitComponent prop', () => {
    const hits = [{ objectID: 0 }, { objectID: 1 }, { objectID: 2 }];
    const tree = renderer.create(
      <InfiniteHits
        hitComponent={Hit}
        hits={hits}
        hasMore={false}
        hasPrevious={false}
        refinePrevious={() => undefined}
        refineNext={() => undefined}
      />
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('accepts a custom className', () => {
    const hits = [{ objectID: 0 }, { objectID: 1 }, { objectID: 2 }];
    const tree = renderer.create(
      <InfiniteHits
        className="MyCustomInfiniteHits"
        hitComponent={Hit}
        hits={hits}
        hasMore={false}
        hasPrevious={false}
        refinePrevious={() => undefined}
        refineNext={() => undefined}
      />
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('calls refineNext when the load more button is clicked', () => {
    const mockedRefine = jest.fn();
    const hits = [{ objectID: 0 }, { objectID: 1 }, { objectID: 2 }];
    const wrapped = mount(
      <InfiniteHits
        refinePrevious={() => undefined}
        refineNext={mockedRefine}
        hitComponent={Hit}
        hits={hits}
        hasMore={true}
        hasPrevious={false}
      />
    );
    expect(mockedRefine.mock.calls).toHaveLength(0);
    wrapped.find('button').simulate('click');
    expect(mockedRefine.mock.calls).toHaveLength(1);
  });

  it('calls refinePrevious when the load previous button is clicked', () => {
    const mockedRefinePrevious = jest.fn();
    const hits = [{ objectID: 0 }, { objectID: 1 }, { objectID: 2 }];
    const wrapped = mount(
      <InfiniteHits
        showPrevious={true}
        refinePrevious={mockedRefinePrevious}
        refineNext={() => undefined}
        hitComponent={Hit}
        hits={hits}
        hasMore={true}
        hasPrevious={true}
      />
    );
    expect(mockedRefinePrevious).toHaveBeenCalledTimes(0);
    wrapped.find('.ais-InfiniteHits-loadPrevious').simulate('click');
    expect(mockedRefinePrevious).toHaveBeenCalledTimes(1);
  });

  it('render "Show previous" button depending of `showPrevious` prop', () => {
    const hits = [{ objectID: 0 }, { objectID: 1 }, { objectID: 2 }];
    const wrapped = mount(
      <InfiniteHits
        showPrevious={false}
        refinePrevious={() => undefined}
        refineNext={() => undefined}
        hitComponent={Hit}
        hits={hits}
        hasMore={false}
        hasPrevious={false}
      />
    );
    expect(wrapped.find('.ais-InfiniteHits-loadPrevious').length).toEqual(0);

    wrapped.setProps({ showPrevious: true });

    expect(wrapped.find('.ais-InfiniteHits-loadPrevious').length).toEqual(1);
  });

  it('"Show more" button is disabled when it is the last page', () => {
    const hits = [{ objectID: 0 }, { objectID: 1 }, { objectID: 2 }];
    const wrapped = mount(
      <InfiniteHits
        refinePrevious={() => undefined}
        refineNext={() => undefined}
        hitComponent={Hit}
        hits={hits}
        hasMore={false}
        hasPrevious={false}
      />
    );
    expect(wrapped.find('.ais-InfiniteHits-loadMore').props().disabled).toBe(
      true
    );
  });

  it('"Show previous" button is disabled when it is the first page', () => {
    const hits = [{ objectID: 0 }, { objectID: 1 }, { objectID: 2 }];
    const wrapped = mount(
      <InfiniteHits
        showPrevious={true}
        refinePrevious={() => undefined}
        refineNext={() => undefined}
        hitComponent={Hit}
        hits={hits}
        hasMore={false}
        hasPrevious={false}
      />
    );
    expect(
      wrapped.find('.ais-InfiniteHits-loadPrevious').props().disabled
    ).toBe(true);
  });
});
