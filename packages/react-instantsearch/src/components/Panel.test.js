import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Panel from './Panel';

Enzyme.configure({ adapter: new Adapter() });

describe('Panel', () => {
  it('panel should add a classname when no refinement', () => {
    const wrapper = mount(
      <Panel title="category">
        <div className="content" />
      </Panel>
    );

    const title = wrapper.find('.ais-Panel__title');

    expect(title.text()).toEqual('category');
    expect(wrapper.find('.ais-Panel__noRefinement')).toHaveLength(0);

    wrapper.setState({ canRefine: false });

    expect(wrapper.find('.ais-Panel__noRefinement')).toHaveLength(1);
  });
});
