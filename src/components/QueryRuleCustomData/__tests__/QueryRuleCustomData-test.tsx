/**
 * @jest-environment jsdom
 */
/** @jsx h */

import { h } from 'preact';
import { render } from '@testing-library/preact';
import QueryRuleCustomData from '../QueryRuleCustomData';

type QueryRuleItem = {
  banner: string;
};

function defaultTemplate({ items }: { items: QueryRuleItem[] }) {
  return items.map((item) => item.banner).join(' ');
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

  test('renders component with custom `html` templates', () => {
    const { container } = render(
      <QueryRuleCustomData
        items={[{ banner: 'image-1.png' }, { banner: 'image-2.png' }]}
        templates={{
          default({ items }, { html }) {
            return html`<ul>
              ${items.map(
                (item) => html`<li key="${item.banner}">${item.banner}</li>`
              )}
            </ul>`;
          },
        }}
        cssClasses={{ root: 'root' }}
      />
    );

    expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="root"
  >
    <ul>
      <li>
        image-1.png
      </li>
      <li>
        image-2.png
      </li>
    </ul>
  </div>
</div>
`);
  });
});
