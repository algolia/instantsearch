import React from 'react';
import Selector from '../Selector';
import renderer from 'react-test-renderer';

describe('Selector', () => {
  it('should render <Selector/> with strings', () => {
    const props = {
      currentValue: 'index-a',
      setValue: () => {},
      cssClasses: {
        root: 'custom-root',
        select: 'custom-select',
        option: 'custom-item',
      },
      options: [
        { value: 'index-a', label: 'Index A' },
        { value: 'index-b', label: 'Index B' },
      ],
    };
    const tree = renderer.create(<Selector {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render <Selector/> with numbers', () => {
    const props = {
      currentValue: 10,
      setValue: () => {},
      cssClasses: {
        root: 'custom-root',
        select: 'custom-select',
        option: 'custom-item',
      },
      options: [
        { value: 10, label: '10 results per page' },
        { value: 20, label: '20 results per page' },
      ],
    };
    const tree = renderer.create(<Selector {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
