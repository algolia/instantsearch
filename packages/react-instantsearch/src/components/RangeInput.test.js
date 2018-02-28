import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import RangeInput, { RawRangeInput } from './RangeInput';

Enzyme.configure({ adapter: new Adapter() });

describe('RangeInput', () => {
  const shallowRender = (props = {}, context = {}) => {
    const defaultProps = {
      currentRefinement: {
        min: undefined,
        max: undefined,
      },
      canRefine: true,
      precision: 0,
      refine: () => {},
      min: undefined,
      max: undefined,
    };

    return shallow(<RangeInput {...defaultProps} {...props} />, { context });
  };

  it('render with translations', () => {
    const props = {
      translations: {
        submit: 'SUBMIT',
        separator: 'SEPARATOR',
      },
    };

    const component = shallowRender(props).shallow();

    expect(component).toMatchSnapshot();
  });
});

describe('RawRangeInput', () => {
  const shallowRender = (props = {}, context = {}) => {
    const defaultProps = {
      currentRefinement: {
        min: undefined,
        max: undefined,
      },
      canRefine: true,
      precision: 0,
      refine: () => {},
      translate: x => x,
      min: undefined,
      max: undefined,
    };

    return shallow(<RawRangeInput {...defaultProps} {...props} />, { context });
  };

  it('render with empty values', () => {
    const props = {};

    const component = shallowRender(props);

    expect(component).toMatchSnapshot();
  });

  it('render with empty values when refinement is equal to min / max', () => {
    const props = {
      currentRefinement: {
        min: 0,
        max: 500,
      },
      min: 0,
      max: 500,
    };

    const component = shallowRender(props);

    expect(component).toMatchSnapshot();
  });

  it('render with refinement', () => {
    const props = {
      currentRefinement: {
        min: 10,
        max: 490,
      },
    };

    const component = shallowRender(props);

    expect(component).toMatchSnapshot();
  });

  it('render with min / max', () => {
    const props = {
      min: 0,
      max: 500,
    };

    const component = shallowRender(props);

    expect(component).toMatchSnapshot();
  });

  it('render with min only', () => {
    const props = {
      min: 0,
    };

    const component = shallowRender(props);

    expect(component).toMatchSnapshot();
  });

  it('render with max only', () => {
    const props = {
      max: 500,
    };

    const component = shallowRender(props);

    expect(component).toMatchSnapshot();
  });

  it('render with precision of 1', () => {
    const props = {
      precision: 1,
    };

    const component = shallowRender(props);

    expect(component).toMatchSnapshot();
  });

  it('render with precision of 2', () => {
    const props = {
      precision: 2,
    };

    const component = shallowRender(props);

    expect(component).toMatchSnapshot();
  });

  it("render when can't refine", () => {
    const props = {
      canRefine: false,
      min: 0,
      max: 100,
      currentRefinement: {
        min: 10,
        max: 90,
      },
    };

    const component = shallowRender(props);

    expect(component).toMatchSnapshot();
  });

  describe('willMount', () => {
    it('expect to call canRefine from context when defined', () => {
      const props = {};
      const context = {
        canRefine: jest.fn(),
      };

      shallowRender(props, context);

      expect(context.canRefine).toHaveBeenCalledTimes(1);
    });

    it('expect to not throw when canRefine is not defined', () => {
      const props = {};
      const context = {};

      expect(() => shallowRender(props, context)).not.toThrow();
    });
  });

  describe('willReceiveProps', () => {
    it('expect to update state when props have changed ', () => {
      const props = {
        canRefine: false,
        currentRefinement: {
          min: 0,
          max: 100,
        },
      };

      const context = {
        canRefine: jest.fn(),
      };

      const wrapper = shallowRender(props, context);

      wrapper.setProps({
        canRefine: true,
        currentRefinement: {
          min: 10,
          max: 90,
        },
      });

      wrapper.update();

      expect(wrapper.state()).toEqual({
        from: 10,
        to: 90,
      });
    });

    it("expect to not update state when props don't have changed", () => {
      const props = {
        canRefine: true,
        currentRefinement: {
          min: 0,
          max: 100,
        },
      };

      const context = {
        canRefine: jest.fn(),
      };

      const wrapper = shallowRender(props, context);

      wrapper.setState({
        from: 10,
        to: 90,
      });

      wrapper.setProps({
        canRefine: true,
        currentRefinement: {
          min: 0,
          max: 100,
        },
      });

      wrapper.update();

      expect(wrapper.state()).toEqual({
        from: 10,
        to: 90,
      });
    });

    it('expect to call context canRefine when props changed', () => {
      const props = {
        canRefine: true,
        currentRefinement: {
          min: 0,
          max: 100,
        },
      };

      const context = {
        canRefine: jest.fn(),
      };

      const wrapper = shallowRender(props, context);

      wrapper.setProps({
        canRefine: false,
      });

      expect(context.canRefine).toHaveBeenCalledTimes(2);
    });

    it("expect to not call context canRefine when props don't have changed", () => {
      const props = {
        canRefine: true,
        currentRefinement: {
          min: 0,
          max: 100,
        },
      };

      const context = {
        canRefine: jest.fn(),
      };

      const wrapper = shallowRender(props, context);

      wrapper.setProps({
        canRefine: true,
      });

      expect(context.canRefine).toHaveBeenCalledTimes(1);
    });

    it('expect to not throw when canRefine is not defined', () => {
      const props = {};
      const context = {};
      const nextProps = {};

      const component = shallowRender(props, context);

      expect(() => component.setProps(nextProps)).not.toThrow();
    });
  });

  describe('onChange', () => {
    it('expect to update min onChange', () => {
      const props = {};
      const component = shallowRender(props);

      component.find('.ais-RangeInput__inputMin').simulate('change', {
        currentTarget: {
          value: 10,
        },
      });

      expect(component).toMatchSnapshot();
      expect(component.state()).toEqual({
        from: 10,
        to: '',
      });
    });

    it('expect to update max onChange', () => {
      const props = {};
      const component = shallowRender(props);

      component.find('.ais-RangeInput__inputMax').simulate('change', {
        currentTarget: {
          value: 490,
        },
      });

      expect(component).toMatchSnapshot();
      expect(component.state()).toEqual({
        from: '',
        to: 490,
      });
    });
  });

  describe('onSubmit', () => {
    it('expect to call refine onSubmit with values', () => {
      const props = {
        refine: jest.fn(),
      };

      const event = {
        preventDefault: jest.fn(),
      };

      const component = shallowRender(props);

      component.setState({
        from: 10,
        to: 490,
      });

      component.find('form').simulate('submit', event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(props.refine).toHaveBeenCalledWith({
        min: 10,
        max: 490,
      });
    });

    it('expect to not call refine with empty string', () => {
      const props = {
        refine: jest.fn(),
      };

      const event = {
        preventDefault: jest.fn(),
      };

      const component = shallowRender(props);

      component.find('form').simulate('submit', event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(props.refine).toHaveBeenCalledWith({
        min: '',
        max: '',
      });
    });
  });
});
