/** @jsx h */

import { h } from 'preact';
import ClearRefinements from '../ClearRefinements.js';
import { mount } from '../../../../test/utils/enzyme.js';
import { prepareTemplateProps } from '../../../lib/utils/index.js';
import defaultTemplates from '../../../widgets/clear-refinements/defaultTemplates.js';

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
});
