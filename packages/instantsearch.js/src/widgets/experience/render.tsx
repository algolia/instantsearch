/** @jsx h */
import { h, Fragment } from 'preact';

import { getPropertyByPath } from '../../lib/utils';

import type { BaseHit, TemplateParams } from '../../types';
import type { ComponentChildren } from 'preact';

type StaticString = { type: 'string'; value: string };
type Attribute = { type: 'attribute'; path: string[] };
type Highlight = { type: 'highlight' | 'snippet'; path: string[] };
export type TemplateText = Array<Attribute | StaticString | Highlight>;
export type TemplateAttribute = Array<Attribute | StaticString>;
type RegularParameters = {
  class?: TemplateAttribute;
};
export type TemplateChild =
  | {
      type: 'paragraph' | 'span' | 'h2';
      parameters: {
        text: TemplateText;
      } & RegularParameters;
    }
  | {
      type: 'div';
      parameters: RegularParameters;
      children: TemplateChild[];
    }
  | {
      type: 'image';
      parameters: {
        src: TemplateAttribute;
        alt: TemplateAttribute;
      } & RegularParameters;
    }
  | {
      type: 'link';
      parameters: {
        href: TemplateAttribute;
      } & RegularParameters;
      children: TemplateChild[];
    };

const tagNames = new Map<string, string>(
  Object.entries({
    paragraph: 'p',
    span: 'span',
    h2: 'h2',
    div: 'div',
    link: 'a',
    image: 'img',
  })
);

function renderText(text: TemplateText[number], hit: any, components: any) {
  if (text.type === 'string') {
    return text.value;
  }

  if (text.type === 'attribute') {
    return getPropertyByPath(hit, text.path);
  }

  if (text.type === 'highlight') {
    return components.Highlight({
      hit,
      attribute: text.path,
    });
  }

  if (text.type === 'snippet') {
    return components.Snippet({
      hit,
      attribute: text.path,
    });
  }

  return null;
}

function renderAttribute(text: TemplateAttribute[number], hit: any) {
  if (text.type === 'string') {
    return text.value;
  }

  if (text.type === 'attribute') {
    return getPropertyByPath(hit, text.path);
  }

  return null;
}

export function renderTemplate(
  template: TemplateChild[]
): (hit: BaseHit, params: TemplateParams) => any {
  function renderChild(child: TemplateChild, hit: any, components: any) {
    const Tag = tagNames.get(child.type) as keyof JSX.IntrinsicElements;
    if (!Tag) {
      return <Fragment></Fragment>;
    }

    let children: ComponentChildren = null;
    if ('text' in child.parameters) {
      children = child.parameters.text.map((text) =>
        renderText(text, hit, components)
      );
    } else if ('children' in child) {
      children = child.children.map((grandChild) =>
        renderChild(grandChild, hit, components)
      );
    }

    const attributes = Object.fromEntries(
      Object.entries(child.parameters)
        .filter(
          (tuple): tuple is [string, TemplateAttribute] => tuple[0] !== 'text'
        )
        .map(([key, value]) => [
          key,
          value.map((item) => renderAttribute(item, hit)).join(''),
        ])
    );

    // @ts-ignore
    return <Tag {...attributes}>{children}</Tag>;
  }

  return (hit, { components }) =>
    template.map((child) => renderChild(child, hit, components));
}
