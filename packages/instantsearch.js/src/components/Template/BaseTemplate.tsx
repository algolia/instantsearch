/** @jsx h */

import { h, Component, Fragment, createRef } from 'preact';

import { isEqual } from '../../lib/utils';

import type { SendEventForHits } from '../../lib/utils';
import type { Templates } from '../../types';
import type { JSX, VNode } from 'preact';

class RawHtml extends Component<{ content: string }> {
  ref = createRef();
  nodes: ChildNode[] = [];

  componentDidMount() {
    const fragment = new DocumentFragment();
    const root = document.createElement('div');
    root.innerHTML = this.props.content;
    this.nodes = [...root.childNodes];
    this.nodes.forEach((node) => fragment.appendChild(node));
    this.ref.current.replaceWith(fragment);
  }

  componentWillUnmount() {
    this.nodes.forEach((node) => {
      if (node instanceof Element) {
        node.outerHTML = '';
        return;
      }
      node.nodeValue = '';
    });
    // if there is one TextNode first and one TextNode last, the
    // last one's nodeValue will be assigned to the first.
    if (this.nodes[0] && this.nodes[0].nodeValue) {
      this.nodes[0].nodeValue = '';
    }
  }

  render() {
    return <div ref={this.ref} />;
  }
}

export const defaultProps = {
  data: {},
  rootTagName: 'div',
  templates: {},
};

export type BaseTemplateProps = {
  data?: Record<string, any>;
  rootProps?: Record<string, any>;
  rootTagName: keyof JSX.IntrinsicElements | 'fragment';
  templateKey: string;
  templates: Templates;
  sendEvent?: SendEventForHits;
} & Readonly<typeof defaultProps>;

export type TemplateContent = VNode | VNode[] | string | null;

/**
 * Shared rendering for template components. Subclasses decide how a template
 * turns into content: a VNode is rendered inside the root, a string as HTML.
 */
// @TODO: Template should be a generic and receive TData to pass to Templates (to avoid TTemplateData to be set as `any`)
export abstract class BaseTemplate<
  TProps extends BaseTemplateProps = BaseTemplateProps,
> extends Component<TProps> {
  public static readonly defaultProps = defaultProps;

  public shouldComponentUpdate(nextProps: TProps) {
    return (
      !isEqual(this.props.data, nextProps.data) ||
      this.props.templateKey !== nextProps.templateKey ||
      !isEqual(this.props.rootProps, nextProps.rootProps)
    );
  }

  protected abstract renderContent(): TemplateContent;

  public render() {
    const RootTagName =
      this.props.rootTagName === 'fragment' ? Fragment : this.props.rootTagName;

    const content = this.renderContent();

    if (content === null) {
      // Adds a noscript to the DOM but virtual DOM is null
      // See http://facebook.github.io/react/docs/component-specs.html#render
      return null;
    }

    if (typeof content === 'object') {
      return <RootTagName {...this.props.rootProps}>{content}</RootTagName>;
    }

    // This is to handle string templates with Fragment as rootTagName
    if (RootTagName === Fragment) {
      return <RawHtml content={content} key={Math.random()} />;
    }

    return (
      <RootTagName
        {...this.props.rootProps}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
}
