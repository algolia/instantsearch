import { renderTemplate } from '../../lib/templating';
import { warning } from '../../lib/utils';

import { BaseTemplate, defaultProps as baseDefaultProps } from './BaseTemplate';

import type { BaseTemplateProps } from './BaseTemplate';
import type { PreparedTemplateProps } from '../../lib/templating';
import type { BindEventForHits } from '../../lib/utils';
import type { Templates } from '../../types';

const defaultProps = {
  ...baseDefaultProps,
  useCustomCompileOptions: {},
  templatesConfig: {},
};

export type TemplateProps = BaseTemplateProps & {
  bindEvent?: BindEventForHits;
} & PreparedTemplateProps<Templates> &
  Readonly<typeof defaultProps>;

/**
 * Renders function templates and Hogan.js string templates.
 * New widgets should use `FunctionTemplate`, which doesn't bundle Hogan.js.
 */
class Template extends BaseTemplate<TemplateProps> {
  public static readonly defaultProps = defaultProps;

  protected renderContent() {
    if (__DEV__) {
      const nonFunctionTemplates = Object.keys(this.props.templates).filter(
        (key) => typeof this.props.templates[key] !== 'function'
      );
      warning(
        nonFunctionTemplates.length === 0,
        `Hogan.js and string-based templates are deprecated and will not be supported in InstantSearch.js 5.x.

You can replace them with function-form templates and use either the provided \`html\` function or JSX templates.

String-based templates: ${nonFunctionTemplates.join(', ')}.

See: https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/js/#upgrade-templates`
      );
    }

    const useCustomCompileOptions =
      this.props.useCustomCompileOptions[this.props.templateKey];
    const compileOptions = useCustomCompileOptions
      ? this.props.templatesConfig.compileOptions
      : {};

    return renderTemplate({
      templates: this.props.templates,
      templateKey: this.props.templateKey,
      compileOptions,
      helpers: this.props.templatesConfig.helpers,
      data: this.props.data,
      bindEvent: this.props.bindEvent,
      sendEvent: this.props.sendEvent,
    });
  }
}

export default Template;
