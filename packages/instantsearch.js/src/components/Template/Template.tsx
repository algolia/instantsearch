/** @jsx h */

import { h, Component } from 'preact';

import { renderTemplate } from '../../lib/templating';
import { warning, isEqual } from '../../lib/utils';

import type { PreparedTemplateProps } from '../../lib/templating';
import type { BindEventForHits, SendEventForHits } from '../../lib/utils';
import type { Templates } from '../../types';
import type { JSX } from 'preact';

const defaultProps = {
  data: {},
  rootTagName: 'div',
  useCustomCompileOptions: {},
  templates: {},
  templatesConfig: {},
};

export type TemplateProps = {
  data?: Record<string, any>;
  rootProps?: Record<string, any>;
  rootTagName?: keyof JSX.IntrinsicElements;
  templateKey: string;
  bindEvent?: BindEventForHits;
  sendEvent?: SendEventForHits;
} & PreparedTemplateProps<Templates> &
  Readonly<typeof defaultProps>;

// @TODO: Template should be a generic and receive TData to pass to Templates (to avoid TTemplateData to be set as `any`)
class Template extends Component<TemplateProps> {
  public static readonly defaultProps = defaultProps;

  public shouldComponentUpdate(nextProps: TemplateProps) {
    return (
      !isEqual(this.props.data, nextProps.data) ||
      this.props.templateKey !== nextProps.templateKey ||
      !isEqual(this.props.rootProps, nextProps.rootProps)
    );
  }

  public render() {
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

    const RootTagName = this.props.rootTagName;

    const useCustomCompileOptions =
      this.props.useCustomCompileOptions[this.props.templateKey];
    const compileOptions = useCustomCompileOptions
      ? this.props.templatesConfig.compileOptions
      : {};

    const content = renderTemplate({
      templates: this.props.templates,
      templateKey: this.props.templateKey,
      compileOptions,
      helpers: this.props.templatesConfig.helpers,
      data: this.props.data,
      bindEvent: this.props.bindEvent,
      sendEvent: this.props.sendEvent,
    });

    if (content === null) {
      // Adds a noscript to the DOM but virtual DOM is null
      // See http://facebook.github.io/react/docs/component-specs.html#render
      return null;
    }

    if (typeof content === 'object') {
      return <RootTagName {...this.props.rootProps}>{content}</RootTagName>;
    }

    return (
      <RootTagName
        {...this.props.rootProps}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
}

export default Template;
