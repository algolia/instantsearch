/**
 * @jest-environment jsdom
 */
/** @jsx h */

import { h } from 'preact';
import MenuSelect from '../MenuSelect';
import { mount } from '../../../../test/utils/enzyme';
import defaultTemplates from '../../../widgets/menu-select/defaultTemplates';
import { render } from '@testing-library/preact';

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

  it('renders component with custom `html` templates', () => {
    const { container } = render(
      <MenuSelect
        cssClasses={cssClasses}
        items={[
          { value: 'Apple', label: 'Apple', count: 25, isRefined: true },
          { value: 'Samsung', label: 'Samsung', count: 13, isRefined: false },
        ]}
        refine={() => {}}
        templateProps={{
          templates: {
            item({ label, value, count, isRefined }, { html }) {
              return html`<span
                title="${value}"
                style="font-weight: ${isRefined ? 'bold' : 'normal'}"
                >${label} - (${count})</span
              >`;
            },
            defaultOption(_, { html }) {
              return html`<span>See all</span>`;
            },
          },
        }}
      />
    );

    expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="root"
  >
    <select
      class="select"
    >
      <option
        class="option"
        value=""
      >
        <span>
          See all
        </span>
      </option>
      <option
        class="option"
        value="Apple"
      >
        <span
          style="font-weight: bold;"
          title="Apple"
        >
          Apple
           - (
          25
          )
        </span>
      </option>
      <option
        class="option"
        value="Samsung"
      >
        <span
          style="font-weight: normal;"
          title="Samsung"
        >
          Samsung
           - (
          13
          )
        </span>
      </option>
    </select>
  </div>
</div>
`);
  });
});
