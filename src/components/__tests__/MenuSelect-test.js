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
      cssClasses: {
        root: 'root',
        noRefinementRoot: 'noRefinementRoot',
        select: 'select',
        option: 'option',
      },
    };
    const tree = renderer.create(<MenuSelect {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render <MenuSelect /> with no items', () => {
    const props = {
      items: [],
      refine: () => {},
      templateProps: { templates: defaultTemplates },
      shouldAutoHideContainer: false,
      cssClasses: {
        root: 'root',
        noRefinementRoot: 'noRefinementRoot',
        select: 'select',
        option: 'option',
      },
    };
    const tree = renderer.create(<MenuSelect {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
