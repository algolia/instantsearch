/** @jsx h */

import { h } from 'preact';
import MenuSelect from '../MenuSelect';
import { mount } from 'enzyme';
import defaultTemplates from '../../../widgets/menu-select/defaultTemplates';

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
        { value: 'foo', label: 'foo' },
        { value: 'bar', label: 'bar' },
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
        { value: 'foo', label: 'foo' },
        { value: 'bar', label: 'bar' },
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
