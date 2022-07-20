/**
 * @jest-environment jsdom
 */
/** @jsx h */

import { render } from '@testing-library/preact';
import { h } from 'preact';

import { prepareTemplateProps } from '../../../lib/utils';
import ToggleRefinement, { ToggleRefinementProps } from '../ToggleRefinement';

describe('ToggleRefinement', () => {
  function createProps(props: Partial<ToggleRefinementProps>) {
    return {
      currentRefinement: { isRefined: true, count: 5 },
      cssClasses: {
        root: 'root',
        label: 'label',
        checkbox: 'checkbox',
        labelText: 'labelText',
      },
      refine: jest.fn(),
      templateProps: {
        ...prepareTemplateProps({
          defaultTemplates: { labelText: '' },
          templates: {},
          templatesConfig: {},
        }),
      },
      ...props,
    };
  }

  test('renders component with custom `html` templates', () => {
    const props = createProps({});

    const { container } = render(
      <ToggleRefinement
        {...props}
        templateProps={{
          ...props.templateProps,
          templates: {
            labelText({ count, isRefined }, { html }) {
              return html`<span
                style="font-weight: ${isRefined ? 'bold' : 'normal'}"
                >Free shipping (${count})</span
              >`;
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
    <label
      class="label"
    >
      <input
        class="checkbox"
        type="checkbox"
      />
      <span
        class="labelText"
      >
        <span
          style="font-weight: bold;"
        >
          Free shipping (
          5
          )
        </span>
      </span>
    </label>
  </div>
</div>
`);
  });
});
