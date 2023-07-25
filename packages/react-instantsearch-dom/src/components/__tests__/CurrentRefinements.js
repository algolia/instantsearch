import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { shallow } from 'enzyme';
import React from 'react';

import Connected, { CurrentRefinements } from '../CurrentRefinements';

Enzyme.configure({ adapter: new Adapter() });

describe('CurrentRefinements', () => {
  const defaultProps = {
    items: [],
    canRefine: true,
    refine: () => {},
    translate: (x) => x,
  };

  it('expect to render a list of current refinements', () => {
    const props = {
      ...defaultProps,
      items: [
        { label: 'color: Red', value: () => {} },
        {
          label: 'category:',
          value: () => {},
          items: [
            { label: 'iPhone', value: () => {} },
            { label: 'iPad', value: () => {} },
          ],
        },
      ],
    };

    const wrapper = shallow(<CurrentRefinements {...props} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('expect to render a list without refinements', () => {
    const props = {
      ...defaultProps,
      canRefine: false,
    };

    const wrapper = shallow(<CurrentRefinements {...props} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('expect to render a list with a custom className', () => {
    const props = {
      ...defaultProps,
      className: 'MyCustomCurrentRefinements',
    };

    const wrapper = shallow(<CurrentRefinements {...props} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('expect to refine the "color" onClick', () => {
    const value = () => {};
    const props = {
      ...defaultProps,
      items: [
        { label: 'color: Red', value },
        {
          label: 'category:',
          value: () => {},
          items: [
            { label: 'iPhone', value: () => {} },
            { label: 'iPad', value: () => {} },
          ],
        },
      ],
      refine: jest.fn(),
    };

    const wrapper = shallow(<CurrentRefinements {...props} />);

    expect(props.refine).not.toHaveBeenCalled();

    wrapper.find('li').first().find('button').simulate('click');

    expect(props.refine).toHaveBeenCalledWith(value);
  });

  it('expect to refine the "category: iPad" onClick', () => {
    const value = () => {};
    const props = {
      ...defaultProps,
      items: [
        { label: 'color: Red', value: () => {} },
        {
          label: 'category:',
          value: () => {},
          items: [
            { label: 'iPhone', value: () => {} },
            { label: 'iPad', value },
          ],
        },
      ],
      refine: jest.fn(),
    };

    const wrapper = shallow(<CurrentRefinements {...props} />);

    expect(props.refine).not.toHaveBeenCalled();

    wrapper.find('li').last().find('button').last().simulate('click');

    expect(props.refine).toHaveBeenCalledWith(value);
  });
});

describe('CurrentRefinements - Connected', () => {
  const defaultProps = {
    items: [
      { label: 'color: Red', value: () => {} },
      {
        label: 'category:',
        value: () => {},
        items: [
          { label: 'iPhone', value: () => {} },
          { label: 'iPad', value: () => {} },
        ],
      },
    ],
    canRefine: true,
    refine: () => {},
  };

  it('expect to render a list of current refinements', () => {
    const props = {
      ...defaultProps,
    };

    const wrapper = shallow(<Connected {...props} />).dive();

    expect(wrapper).toMatchSnapshot();
  });

  it('expect to render a list of current refinements with custom translations', () => {
    const props = {
      ...defaultProps,
      translations: {
        clearFilter: 'DELETE',
      },
    };

    const wrapper = shallow(<Connected {...props} />).dive();

    expect(wrapper).toMatchSnapshot();
  });
});
