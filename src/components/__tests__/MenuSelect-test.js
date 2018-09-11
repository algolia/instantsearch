import React from 'react';
import MenuSelect from '../MenuSelect';
import renderer from 'react-test-renderer';

import defaultTemplates from '../../widgets/menu-select/defaultTemplates';

describe('MenuSelect', () => {
  it('should render <MenuSelect /> with items', () => {
    const props = {
      items: [{ value: 'foo', label: 'foo' }, { value: 'bar', label: 'bar' }],
      refine: () => {},
      templateProps: { templates: defaultTemplates },
      shouldAutoHideContainer: false,
      cssClasses: {},
    };
    const tree = renderer.create(<MenuSelect {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render with custom css classes', () => {
    const props = {
      items: [{ value: 'foo', label: 'foo' }, { value: 'bar', label: 'bar' }],
      refine: () => {},
      templateProps: { templates: defaultTemplates },
      shouldAutoHideContainer: false,
      cssClasses: {
        select: 'foo',
        option: 'bar',
      },
    };
    const tree = renderer.create(<MenuSelect {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
