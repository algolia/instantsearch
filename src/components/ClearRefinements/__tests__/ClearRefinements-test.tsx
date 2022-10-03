/**
 * @jest-environment jsdom
 */
/** @jsx h */

import { h } from 'preact';
import ClearRefinements from '../ClearRefinements';
import { mount } from '../../../../test/utils/enzyme';
import { prepareTemplateProps } from '../../../lib/templating';
import defaultTemplates from '../../../widgets/clear-refinements/defaultTemplates';

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
