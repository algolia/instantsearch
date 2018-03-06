import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import ToggleRefinement from './ToggleRefinement';

Enzyme.configure({ adapter: new Adapter() });

describe('ToggleRefinement', () => {
  const defaultProps = {
    currentRefinement: true,
    label: 'toggle the refinement',
    refine: () => {},
  };

  it('expect to render with a positive currentRefinement', () => {
    const props = {
      ...defaultProps,
    };

    const wrapper = shallow(<ToggleRefinement {...props} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('expect to render with a negative currentRefinement', () => {
    const props = {
      ...defaultProps,
      currentRefinement: false,
    };

    const wrapper = shallow(<ToggleRefinement {...props} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('expect to render with custom className', () => {
    const props = {
      ...defaultProps,
      className: 'MyCustomToggleRefinement',
    };

    const wrapper = shallow(<ToggleRefinement {...props} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('expect to call refine onChange', () => {
    const props = {
      ...defaultProps,
      refine: jest.fn(),
    };

    const wrapper = shallow(<ToggleRefinement {...props} />);

    expect(props.refine).not.toHaveBeenCalled();

    wrapper.find('input[type="checkbox"]').simulate('change', {
      target: {
        checked: false,
      },
    });

    expect(props.refine).toHaveBeenCalledWith(false);
  });
});
