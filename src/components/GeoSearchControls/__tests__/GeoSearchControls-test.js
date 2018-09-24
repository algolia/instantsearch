import React from 'preact-compat';
import { shallow } from 'enzyme';
import GeoSearchControls from '../GeoSearchControls';

describe('GeoSearchControls', () => {
  const CSSClassesDefaultProps = {
    control: 'control',
    label: 'label',
    labelSelected: 'label-selected',
    input: 'input',
    redo: 'redo',
    redoDisabled: 'redo-disabled',
    reset: 'reset',
  };

  const defaultProps = {
    cssClasses: CSSClassesDefaultProps,
    enableRefineControl: true,
    enableClearMapRefinement: true,
    isRefineOnMapMove: true,
    isRefinedWithMap: false,
    hasMapMoveSinceLastRefine: false,
    onRefineToggle: () => {},
    onRefineClick: () => {},
    onClearClick: () => {},
    templateProps: {},
  };

  describe('Control enabled', () => {
    it('expect to render the toggle checked when refine on map move is enabled', () => {
      const props = {
        ...defaultProps,
        enableRefineControl: true,
        isRefineOnMapMove: true,
        hasMapMoveSinceLastRefine: false,
      };

      const wrapper = shallow(<GeoSearchControls {...props} />);

      expect(wrapper).toMatchSnapshot();
    });

    it('expect to render the toggle checked when refine on map move is enabled even when the map has moved', () => {
      const props = {
        ...defaultProps,
        enableRefineControl: true,
        isRefineOnMapMove: true,
        hasMapMoveSinceLastRefine: true,
      };

      const wrapper = shallow(<GeoSearchControls {...props} />);

      expect(wrapper).toMatchSnapshot();
    });

    it('expect to render the toggle unchecked when refine on map move is disabled and the map has not moved', () => {
      const props = {
        ...defaultProps,
        enableRefineControl: true,
        isRefineOnMapMove: false,
        hasMapMoveSinceLastRefine: false,
      };

      const wrapper = shallow(<GeoSearchControls {...props} />);

      expect(wrapper).toMatchSnapshot();
    });

    it('expect to render the button when refine on map move is disabled and the map has moved', () => {
      const props = {
        ...defaultProps,
        enableRefineControl: true,
        isRefineOnMapMove: false,
        hasMapMoveSinceLastRefine: true,
      };

      const wrapper = shallow(<GeoSearchControls {...props} />);

      expect(wrapper).toMatchSnapshot();
    });

    it('expect to call onRefineToggle when the toggle is toggled', () => {
      const props = {
        ...defaultProps,
        enableRefineControl: true,
        isRefineOnMapMove: true,
        hasMapMoveSinceLastRefine: false,
        onRefineToggle: jest.fn(),
      };

      const wrapper = shallow(<GeoSearchControls {...props} />);

      expect(props.onRefineToggle).not.toHaveBeenCalled();

      wrapper.find('GeoSearchToggle').simulate('toggle');

      expect(props.onRefineToggle).toHaveBeenCalled();
    });

    it('expect to call onRefineClick when the button is clicked', () => {
      const props = {
        ...defaultProps,
        enableRefineControl: true,
        isRefineOnMapMove: false,
        hasMapMoveSinceLastRefine: true,
        onRefineClick: jest.fn(),
      };

      const wrapper = shallow(<GeoSearchControls {...props} />);

      expect(props.onRefineClick).not.toHaveBeenCalled();

      wrapper.find('GeoSearchButton').simulate('click');

      expect(props.onRefineClick).toHaveBeenCalled();
    });
  });

  describe('Control disabled', () => {
    it('expect to render the button enabled when refine on map move is disabled and the map as moved', () => {
      const props = {
        ...defaultProps,
        enableRefineControl: false,
        isRefineOnMapMove: false,
        hasMapMoveSinceLastRefine: true,
      };

      const wrapper = shallow(<GeoSearchControls {...props} />);

      expect(wrapper).toMatchSnapshot();
    });

    it('expect to render the button disabled when refine on map move is disabled and the map has not moved', () => {
      const props = {
        ...defaultProps,
        enableRefineControl: false,
        isRefineOnMapMove: false,
        hasMapMoveSinceLastRefine: false,
      };

      const wrapper = shallow(<GeoSearchControls {...props} />);

      expect(wrapper).toMatchSnapshot();
    });

    it('expect to render nothing when refine on map move is enabled', () => {
      const props = {
        ...defaultProps,
        enableRefineControl: false,
        isRefineOnMapMove: true,
      };

      const wrapper = shallow(<GeoSearchControls {...props} />);

      expect(wrapper).toMatchSnapshot();
    });

    it('expect to call onRefineClick whe the button is clicked', () => {
      const props = {
        ...defaultProps,
        enableRefineControl: false,
        isRefineOnMapMove: false,
        hasMapMoveSinceLastRefine: true,
        onRefineClick: jest.fn(),
      };

      const wrapper = shallow(<GeoSearchControls {...props} />);

      expect(props.onRefineClick).not.toHaveBeenCalled();

      wrapper.find('GeoSearchButton').simulate('click');

      expect(props.onRefineClick).toHaveBeenCalled();
    });
  });

  describe('Clear button', () => {
    it('expect to render the button when the refinement come from the map', () => {
      const props = {
        ...defaultProps,
        enableRefineControl: false,
        enableClearMapRefinement: true,
        isRefinedWithMap: true,
      };

      const wrapper = shallow(<GeoSearchControls {...props} />);

      expect(wrapper).toMatchSnapshot();
    });

    it('expect to not render the button when the refinement is not coming from the map', () => {
      const props = {
        ...defaultProps,
        enableRefineControl: false,
        enableClearMapRefinement: true,
        isRefinedWithMap: false,
      };

      const wrapper = shallow(<GeoSearchControls {...props} />);

      expect(wrapper).toMatchSnapshot();
    });

    it('expect to not render the button when the options is disabled', () => {
      const props = {
        ...defaultProps,
        enableRefineControl: false,
        enableClearMapRefinement: false,
        isRefinedWithMap: true,
      };

      const wrapper = shallow(<GeoSearchControls {...props} />);

      expect(wrapper).toMatchSnapshot();
    });

    it('expect to call onClearClick when the clear button is clicked', () => {
      const props = {
        ...defaultProps,
        enableRefineControl: false,
        enableClearMapRefinement: true,
        isRefinedWithMap: true,
        onClearClick: jest.fn(),
      };

      const wrapper = shallow(<GeoSearchControls {...props} />);

      expect(props.onClearClick).not.toHaveBeenCalled();

      wrapper.find('.reset').simulate('click');

      expect(props.onClearClick).toHaveBeenCalled();
    });
  });
});
