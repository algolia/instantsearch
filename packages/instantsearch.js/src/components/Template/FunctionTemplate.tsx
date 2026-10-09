/** @jsx h */

import { h, Fragment } from 'preact';

import { renderFunctionTemplate } from '../../lib/templating/renderFunctionTemplate';
import { warning } from '../../lib/utils';

import { BaseTemplate } from './BaseTemplate';

import type { BaseTemplateProps } from './BaseTemplate';

export type FunctionTemplateProps = BaseTemplateProps;

/**
 * Renders function templates only.
 * using it. String templates aren't compiled: they render as plain text.
 */
class FunctionTemplate extends BaseTemplate {
  protected renderContent() {
    const { templates, templateKey } = this.props;
    const template = templates[templateKey];

    if (typeof template === 'string') {
      if (__DEV__) {
        warning(
          template[0] !== '<',
          `String-based templates are not supported in this widget and are rendered as plain text (template: ${templateKey}).

Use function-form templates with either the provided \`html\` function or JSX templates.`
        );
      }

      return <Fragment>{template}</Fragment>;
    }

    if (typeof template !== 'function') {
      throw new Error(
        `Template must be 'string' or 'function', was '${typeof template}' (key: ${templateKey})`
      );
    }

    return renderFunctionTemplate({
      template,
      data: this.props.data,
      sendEvent: this.props.sendEvent,
    });
  }
}

export default FunctionTemplate;
