/** @jsx h */
import { h, Fragment } from 'preact';

import { getPropertyByPath } from '../../lib/utils';
import { Tool } from '../chat/chat';

import type { BaseHit, TemplateParams } from '../../types';
import type { ExperienceApiResponse } from './types';
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
      type: 'p' | 'paragraph' | 'span' | 'h2';
      parameters: {
        text: TemplateText;
      } & RegularParameters;
    }
  | {
      type: 'div' | 'svg' | 'path' | 'circle' | 'line' | 'polyline';
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
    p: 'p',
    span: 'span',
    h2: 'h2',
    div: 'div',
    link: 'a',
    image: 'img',
    svg: 'svg',
    path: 'path',
    circle: 'circle',
    line: 'line',
    polyline: 'polyline',
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

  // Custom 'tags' type for rendering arrays as tag elements
  if ((text as unknown as { type: 'tags'; path: string[] }).type === 'tags') {
    const value = getPropertyByPath(hit, (text as { path: string[] }).path);

    if (Array.isArray(value)) {
      return (
        <div>
          {value.map((item, i) => (
            <span key={i} className="ais-AutocompleteItemContentTag">
              {String(item)}
            </span>
          ))}
        </div>
      );
    }

    // If not an array, render as plain text
    return String(value ?? '');
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
): (hit: BaseHit, params?: TemplateParams) => any {
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

  return (hit, params) =>
    template.map((child) => renderChild(child, hit, params?.components));
}

type RenderToolParams = {
  name: string;
  experience: ExperienceApiResponse;
};

export function renderTool({ name, experience }: RenderToolParams) {
  const { template, webhook } = experience.blocks[0].parameters as unknown as {
    template: TemplateChild[];
    webhook?: string;
  };

  return {
    [name]: {
      templates: {
        layout: ({ message }) => {
          return message.output ? (
            <div className="ais-Chat-ToolCard">
              {renderTemplate(template)(message.output as BaseHit)}
            </div>
          ) : (
            <div className="ais-Chat-ToolCard ais-Chat-ToolCard--loading">
              Loading…
            </div>
          );
        },
      },
      onToolCall: ({ addToolResult, input }) => {
        if (!webhook) {
          addToolResult({ output: { success: true, data: input } });
          return;
        }

        fetch(webhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(input),
        })
          .then((res) => res.json())
          .then((data) =>
            addToolResult({
              output: {
                success: true,
                ...data,
              },
            })
          );
      },
    },
  } satisfies { [key: string]: Tool };
}
