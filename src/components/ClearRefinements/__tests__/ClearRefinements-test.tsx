/**
 * @jest-environment jsdom
 */
/** @jsx h */

import { h } from 'preact';
import ClearRefinements from '../ClearRefinements';
import { mount } from '../../../../test/utils/enzyme';
import { prepareTemplateProps } from '../../../lib/utils';
import defaultTemplates from '../../../widgets/clear-refinements/defaultTemplates';
import { render } from '@testing-library/preact';

describe('ClearRefinements', () => {
  const defaultProps = {
    refine: () => {},
    cssClasses: {
      root: 'root',
      button: 'button',
      disabledButton: 'disabled',
    },
    hasRefinements: true,
    templateProps: prepareTemplateProps({
      templates: {
        resetLabel: '',
      },
      defaultTemplates,
      templatesConfig: {},
    }),
    url: '#all-cleared!',
  };

  it('should render <ClearRefinements />', () => {
    const wrapper = mount(<ClearRefinements {...defaultProps} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('should render <ClearRefinements /> with a specific class when no refinements', () => {
    const wrapper = mount(
      <ClearRefinements {...defaultProps} hasRefinements={false} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders component with custom `html` templates', () => {
    const { container } = render(
      <ClearRefinements
        {...defaultProps}
        templateProps={{
          ...defaultProps.templateProps,
          templates: {
            resetLabel({ hasRefinements }, { html }) {
              return html`<span
                >${hasRefinements
                  ? 'No refinements'
                  : 'Clear refinements'}</span
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
    <button
      class="button"
    >
      <span>
        No refinements
      </span>
    </button>
  </div>
</div>
`);
  });
});
