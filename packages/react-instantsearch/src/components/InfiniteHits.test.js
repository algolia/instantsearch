import React from 'react';
import PropTypes from 'prop-types';
import renderer from 'react-test-renderer';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import InfiniteHits from './InfiniteHits';

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
        refine={() => undefined}
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
        refine={() => undefined}
      />
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('calls refine when the load more button is clicked', () => {
    const mockedRefine = jest.fn();
    const hits = [{ objectID: 0 }, { objectID: 1 }, { objectID: 2 }];
    const wrapped = mount(
      <InfiniteHits
        refine={mockedRefine}
        hitComponent={Hit}
        hits={hits}
        hasMore={true}
      />
    );
    expect(mockedRefine.mock.calls).toHaveLength(0);
    wrapped.find('button').simulate('click');
    expect(mockedRefine.mock.calls).toHaveLength(1);
  });

  it('Button is disabled when it is the last page', () => {
    const hits = [{ objectID: 0 }, { objectID: 1 }, { objectID: 2 }];
    const wrapped = mount(
      <InfiniteHits
        refine={() => undefined}
        hitComponent={Hit}
        hits={hits}
        hasMore={false}
      />
    );
    expect(wrapped.find('button').props().disabled).toBe(true);
  });
});
