import React from 'react';
import ClearRefinements from '../ClearRefinements';
import renderer from 'react-test-renderer';

describe('ClearAll', () => {
  const defaultProps = {
    refine: () => {},
    cssClasses: {
      root: 'root',
      button: 'button',
      disabledButton: 'disabled',
    },
    hasRefinements: true,
    templateProps: {
      templates: {
        resetLabel: '',
      },
    },
    url: '#all-cleared!',
  };

  it('should render <ClearRefinements />', () => {
    const tree = renderer
      .create(<ClearRefinements {...defaultProps} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render <ClearRefinements /> with a specific class when no refinements', () => {
    const tree = renderer
      .create(<ClearRefinements {...defaultProps} hasRefinements={true} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
