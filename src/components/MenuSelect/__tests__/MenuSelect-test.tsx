/** @jsx h */

import { h } from 'preact';
import MenuSelect from '../MenuSelect.js';
import { mount } from '../../../../test/utils/enzyme.js';
import defaultTemplates from '../../../widgets/menu-select/defaultTemplates.js';

describe('MenuSelect', () => {
  const cssClasses = {
    root: 'root',
    noRefinementRoot: 'noRefinementRoot',
    select: 'select',
    option: 'option',
  };

  it('should render <MenuSelect /> with items', () => {
    const props = {
      items: [
        { value: 'foo', label: 'foo', count: 0, isRefined: false },
        { value: 'bar', label: 'bar', count: 0, isRefined: false },
      ],
      refine: () => {},
      templateProps: { templates: defaultTemplates },
      cssClasses,
    };

    const wrapper = mount(<MenuSelect {...props} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('should render <MenuSelect /> with no items', () => {
    const props = {
      items: [],
      refine: () => {},
      templateProps: { templates: defaultTemplates },
      cssClasses,
    };

    const wrapper = mount(<MenuSelect {...props} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('should render <MenuSelect /> with custom templates', () => {
    const props = {
      items: [
        { value: 'foo', label: 'foo', count: 0, isRefined: false },
        { value: 'bar', label: 'bar', count: 0, isRefined: false },
      ],
      refine: () => {},
      templateProps: {
        templates: {
          item: '{{label}}',
          defaultOption: 'defaultOption',
        },
      },
      cssClasses,
    };

    const wrapper = mount(<MenuSelect {...props} />);

    expect(wrapper).toMatchSnapshot();
  });
});
