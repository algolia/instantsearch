/** @jsx h */

import { h } from 'preact';
import { render, fireEvent } from '@testing-library/preact';
import GeoSearchControls from '../GeoSearchControls';

describe('GeoSearchControls', () => {
  const CSSClassesDefaultProps = {
    control: 'control',
    label: 'label',
    selectedLabel: 'label-selected',
    input: 'input',
    redo: 'redo',
    disabledRedo: 'redo-disabled',
    reset: 'reset',
  };

  const defaultProps = {
    cssClasses: CSSClassesDefaultProps,
    enableRefineControl: true,
    enableClearMapRefinement: true,
    enableRefine: true,
    isRefineOnMapMove: true,
    isRefinedWithMap: false,
    hasMapMoveSinceLastRefine: false,
    onRefineToggle: () => {},
    onRefineClick: () => {},
    onClearClick: () => {},
    templateProps: {
      templates: {
        toggle: 'toggle',
        redo: 'redo',
        reset: 'reset',
      },
    },
  };

  it('expect to render nothing with refine disabled', () => {
    const props = {
      ...defaultProps,
      enableRefine: false,
    };

    const { container } = render(<GeoSearchControls {...props} />);

    expect(container).toMatchSnapshot();
  });

  describe('Control enabled', () => {
    it('expect to render the toggle checked when refine on map move is enabled', () => {
      const props = {
        ...defaultProps,
        enableRefineControl: true,
        isRefineOnMapMove: true,
        hasMapMoveSinceLastRefine: false,
      };

      const { container } = render(<GeoSearchControls {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('expect to render the toggle checked when refine on map move is enabled even when the map has moved', () => {
      const props = {
        ...defaultProps,
        enableRefineControl: true,
        isRefineOnMapMove: true,
        hasMapMoveSinceLastRefine: true,
      };

      const { container } = render(<GeoSearchControls {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('expect to render the toggle unchecked when refine on map move is disabled and the map has not moved', () => {
      const props = {
        ...defaultProps,
        enableRefineControl: true,
        isRefineOnMapMove: false,
        hasMapMoveSinceLastRefine: false,
      };

      const { container } = render(<GeoSearchControls {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('expect to render the button when refine on map move is disabled and the map has moved', () => {
      const props = {
        ...defaultProps,
        enableRefineControl: true,
        isRefineOnMapMove: false,
        hasMapMoveSinceLastRefine: true,
      };

      const { container } = render(<GeoSearchControls {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('expect to call onRefineToggle when the toggle is toggled', () => {
      const props = {
        ...defaultProps,
        enableRefineControl: true,
        isRefineOnMapMove: true,
        hasMapMoveSinceLastRefine: false,
        onRefineToggle: jest.fn(),
      };

      const { container } = render(<GeoSearchControls {...props} />);

      expect(props.onRefineToggle).toHaveBeenCalledTimes(0);

      fireEvent.change(container.querySelector('input'));

      expect(props.onRefineToggle).toHaveBeenCalledTimes(1);
    });

    it('expect to call onRefineClick when the button is clicked', () => {
      const props = {
        ...defaultProps,
        enableRefineControl: true,
        isRefineOnMapMove: false,
        hasMapMoveSinceLastRefine: true,
        onRefineClick: jest.fn(),
      };

      const { container } = render(<GeoSearchControls {...props} />);

      expect(props.onRefineClick).toHaveBeenCalledTimes(0);

      fireEvent.click(container.querySelector('button'));

      expect(props.onRefineClick).toHaveBeenCalledTimes(1);
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

      const { container } = render(<GeoSearchControls {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('expect to render the button disabled when refine on map move is disabled and the map has not moved', () => {
      const props = {
        ...defaultProps,
        enableRefineControl: false,
        isRefineOnMapMove: false,
        hasMapMoveSinceLastRefine: false,
      };

      const { container } = render(<GeoSearchControls {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('expect to render nothing when refine on map move is enabled', () => {
      const props = {
        ...defaultProps,
        enableRefineControl: false,
        isRefineOnMapMove: true,
      };

      const { container } = render(<GeoSearchControls {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('expect to call onRefineClick whe the button is clicked', () => {
      const props = {
        ...defaultProps,
        enableRefineControl: false,
        isRefineOnMapMove: false,
        hasMapMoveSinceLastRefine: true,
        onRefineClick: jest.fn(),
      };

      const { container } = render(<GeoSearchControls {...props} />);

      expect(props.onRefineClick).toHaveBeenCalledTimes(0);

      fireEvent.click(container.querySelector('button'));

      expect(props.onRefineClick).toHaveBeenCalledTimes(1);
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

      const { container } = render(<GeoSearchControls {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('expect to not render the button when the refinement is not coming from the map', () => {
      const props = {
        ...defaultProps,
        enableRefineControl: false,
        enableClearMapRefinement: true,
        isRefinedWithMap: false,
      };

      const { container } = render(<GeoSearchControls {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('expect to not render the button when the options is disabled', () => {
      const props = {
        ...defaultProps,
        enableRefineControl: false,
        enableClearMapRefinement: false,
        isRefinedWithMap: true,
      };

      const { container } = render(<GeoSearchControls {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('expect to call onClearClick when the reset button is clicked', () => {
      const props = {
        ...defaultProps,
        enableRefineControl: false,
        enableClearMapRefinement: true,
        isRefinedWithMap: true,
        onClearClick: jest.fn(),
      };

      const { container } = render(<GeoSearchControls {...props} />);

      expect(props.onClearClick).toHaveBeenCalledTimes(0);

      fireEvent.click(container.querySelector('.reset'));

      expect(props.onClearClick).toHaveBeenCalledTimes(1);
    });
  });
});
