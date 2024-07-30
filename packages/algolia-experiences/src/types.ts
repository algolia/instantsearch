import type { widgets } from './widgets';

type StaticString = { type: 'string'; value: string };
type Attribute = { type: 'attribute'; path: string[] };
type Highlight = { type: 'highlight' | 'snippet'; path: string[] };
export type TemplateText = Array<Attribute | StaticString | Highlight>;
export type TemplateAttribute = Array<Attribute | StaticString>;
export type TemplateChild =
  | {
      type: 'paragraph' | 'div' | 'span' | 'h2';
      parameters: {
        text: TemplateText;
      };
    }
  | {
      type: 'image';
      parameters: {
        src: TemplateAttribute;
        alt: TemplateAttribute;
      };
    };

export type Child =
  | {
      [key in keyof typeof widgets]: key extends
        | 'ais.hits'
        | 'ais.infiniteHits'
        | 'ais.frequentlyBoughtTogether'
        | 'ais.lookingSimilar'
        | 'ais.relatedProducts'
        | 'ais.trendingItems'
        ? {
            type: key;
            parameters: Omit<
              Parameters<typeof widgets[key]>[0],
              'container' | 'templates'
            >;
            children: TemplateChild[];
          }
        : {
            type: key;
            parameters: Omit<Parameters<typeof widgets[key]>[0], 'container'>;
          };
    }[keyof typeof widgets]
  | {
      type: 'columns';
      children: Child[][];
    };

export type Configuration = {
  id: string;
  indexName: string;
  children: Child[];
};
