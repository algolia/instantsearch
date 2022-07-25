/** @jsx h */

import type { JSX } from 'preact';
import { h, Component } from 'preact';
import type { BindEventForHits, SendEventForHits } from '../../lib/utils';
import { renderTemplate, isEqual } from '../../lib/utils';
import type { PreparedTemplateProps } from '../../lib/utils/prepareTemplateProps';
import type { Templates } from '../../types';

const defaultProps = {
  data: {},
  rootTagName: 'div',
  useCustomCompileOptions: {},
  templates: {},
  templatesConfig: {},
};

type TemplateProps = {
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

    if (typeof content !== 'string') {
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
