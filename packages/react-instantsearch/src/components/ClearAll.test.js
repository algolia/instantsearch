import React from 'react';
import renderer from 'react-test-renderer';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import ClearAll from './ClearAll';

Enzyme.configure({ adapter: new Adapter() });

describe('ClearAll', () => {
  it('renders a clickable button', () =>
    expect(
      renderer
        .create(<ClearAll refine={() => null} items={[{ filter: 1 }]} />)
        .toJSON()
    ).toMatchSnapshot());

  it('has a disabled mode', () =>
    expect(
      renderer.create(<ClearAll refine={() => null} items={[]} />).toJSON()
    ).toMatchSnapshot());

  it('is disabled when there is no filters', () => {
    const refine = jest.fn();
    const wrapper = mount(<ClearAll refine={refine} items={[]} />);

    const btn = wrapper.find('button');
    expect(refine.mock.calls).toHaveLength(0);
    btn.simulate('click');
    expect(refine.mock.calls).toHaveLength(0);
  });

  it('is not disabled when there are filters', () => {
    const refine = jest.fn();
    const wrapper = mount(
      <ClearAll
        refine={refine}
        items={[{ value: 'test', label: 'test: test' }]}
      />
    );

    const btn = wrapper.find('button');
    expect(refine.mock.calls).toHaveLength(0);
    btn.simulate('click');
    expect(refine.mock.calls).toHaveLength(1);
  });
});
