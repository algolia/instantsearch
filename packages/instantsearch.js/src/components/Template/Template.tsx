/** @jsx h */

import { h, Component, Fragment } from 'preact';

import { renderTemplate } from '../../lib/templating';
import { isEqual } from '../../lib/utils';

import type { PreparedTemplateProps } from '../../lib/templating';
import type { Templates } from '../../types';
import type { SendEventForHits } from 'instantsearch-core';
import type { JSX } from 'preact';

const defaultProps = {
  data: {},
  rootTagName: 'div',
  templates: {},
};

export type TemplateProps = {
  data?: Record<string, any>;
  rootProps?: Record<string, any>;
  rootTagName: keyof JSX.IntrinsicElements | 'fragment';
  templateKey: string;
  sendEvent?: SendEventForHits;
} & PreparedTemplateProps<Templates> &
  Readonly<typeof defaultProps>;

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
    const RootTagName =
      this.props.rootTagName === 'fragment' ? Fragment : this.props.rootTagName;

    const content = renderTemplate({
      templates: this.props.templates,
      templateKey: this.props.templateKey,
      data: this.props.data,
      sendEvent: this.props.sendEvent,
    });

    if (content === null) {
      // Adds a noscript to the DOM but virtual DOM is null
      // See http://facebook.github.io/react/docs/component-specs.html#render
      return null;
    }

    return <RootTagName {...this.props.rootProps}>{content}</RootTagName>;
  }
}

export default Template;
