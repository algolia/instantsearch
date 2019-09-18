/** @jsx h */

import { h } from 'preact';
import { shallow } from 'enzyme';
import QueryRuleCustomData from '../QueryRuleCustomData';

describe('QueryRuleCustomData', () => {
  test('renders with empty items', () => {
    const items = [];
    const props = {
      items,
      cssClasses: {
        root: 'root',
      },
      templates: {
        default: 'default',
      },
    };

    const wrapper = shallow(<QueryRuleCustomData {...props} />);

    expect(wrapper.props().data).toEqual({ items });
    expect(wrapper).toMatchSnapshot();
  });

  test('renders with items', () => {
    const items = [{ banner: 'image-1.png' }, { banner: 'image-2.png' }];
    const props = {
      items,
      cssClasses: {
        root: 'root',
      },
      templates: {
        default: 'default',
      },
    };

    const wrapper = shallow(<QueryRuleCustomData {...props} />);

    expect(wrapper.props().data).toEqual({ items });
    expect(wrapper).toMatchSnapshot();
  });
});
