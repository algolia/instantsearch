/** @jsx h */

import { h } from 'preact';
import { render } from '@testing-library/preact';
import QueryRuleCustomData from '../QueryRuleCustomData';

type QueryRuleItem = {
  banner: string;
};

function defaultTemplate({ items }: { items: QueryRuleItem[] }) {
  return items.map(item => item.banner).join(' ');
}

describe('QueryRuleCustomData', () => {
  test('renders with empty items', () => {
    const items: QueryRuleItem[] = [];
    const props = {
      items,
      templates: {
        default: defaultTemplate,
      },
      cssClasses: {
        root: 'root',
      },
    };

    const { container } = render(<QueryRuleCustomData {...props} />);

    expect(container).toMatchSnapshot();
  });

  test('renders with items', () => {
    const items: QueryRuleItem[] = [
      { banner: 'image-1.png' },
      { banner: 'image-2.png' },
    ];
    const props = {
      items,
      templates: {
        default: defaultTemplate,
      },
      cssClasses: {
        root: 'root',
      },
    };

    const { container } = render(<QueryRuleCustomData {...props} />);

    expect(container).toMatchSnapshot();
  });
});
