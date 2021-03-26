/** @jsx h */

import { h, Component } from 'preact';
import { renderTemplate, isEqual } from '../../lib/utils';

type TemplateProps = {
  data?: Record<string, any>;
  rootProps?: Record<string, any>;
  rootTagName?: string;
  templateKey?: string;
  templates?: Record<
    string,
    | string
    | ((data: any, bindEvent: (...args: any[]) => string) => string)
    | undefined
  >;
  templatesConfig?: {
    helpers?: Record<
      string,
      (text: string, render: (value: any) => string) => string
    >;
    // https://github.com/twitter/hogan.js/#compilation-options
    compileOptions?: {
      asString?: boolean;
      sectionTags?: Array<{
        o?: string;
        c?: string;
      }>;
      delimiters?: string;
      disableLambda?: boolean;
    };
  };
  useCustomCompileOptions?: Record<string, boolean | undefined>;
  bindEvent?: (...args: any[]) => string;
} & typeof defaultProps;

const defaultProps = Object.freeze({
  data: {},
  rootTagName: 'div',
  useCustomCompileOptions: {},
  templates: {},
  templatesConfig: {},
});

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
    const RootTagName = (this.props.rootTagName as unknown) as (
      props: h.JSX.HTMLAttributes
    ) => h.JSX.Element;
    const useCustomCompileOptions =
      this.props.templateKey &&
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
    });

    if (content === null) {
      // Adds a noscript to the DOM but virtual DOM is null
      // See http://facebook.github.io/react/docs/component-specs.html#render
      return null;
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
