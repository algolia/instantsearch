import type { widgets } from './widgets';

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

export type TemplateWidgetTypes =
  | 'ais.hits'
  | 'ais.infiniteHits'
  | 'ais.frequentlyBoughtTogether'
  | 'ais.lookingSimilar'
  | 'ais.relatedProducts'
  | 'ais.trendingItems';

export type TemplateWidget<
  TKeys extends TemplateWidgetTypes = TemplateWidgetTypes
> = {
  [key in TKeys]: {
    type: key;
    parameters: Omit<
      Parameters<typeof widgets[key]>[0],
      'container' | 'templates'
    >;
    children: TemplateChild[];
  };
}[TKeys];

export type PanelWidgetTypes =
  | 'ais.refinementList'
  | 'ais.menu'
  | 'ais.hierarchicalMenu'
  | 'ais.breadcrumb'
  | 'ais.numericMenu'
  | 'ais.rangeInput'
  | 'ais.rangeSlider'
  | 'ais.ratingMenu'
  | 'ais.toggleRefinement';
export type PanelWidget<TKeys extends PanelWidgetTypes = PanelWidgetTypes> = {
  [key in TKeys]: {
    type: key;
    parameters: Omit<Parameters<typeof widgets[key]>[0], 'container'> & {
      header?: string;
      collapsed?: boolean;
    };
  };
}[TKeys];

type RegularWidget<TKeys extends keyof typeof widgets = keyof typeof widgets> =
  {
    [key in TKeys]: {
      type: key;
      parameters: Omit<Parameters<typeof widgets[key]>[0], 'container'>;
    };
  }[TKeys];

export type Block =
  | {
      [key in keyof typeof widgets]: key extends TemplateWidgetTypes
        ? TemplateWidget<key>
        : key extends PanelWidgetTypes
        ? PanelWidget<key>
        : RegularWidget<key>;
    }[keyof typeof widgets]
  | {
      type: 'grid';
      children: Block[];
    }
  | {
      type: 'column';
      children: Block[];
    };

export type Configuration = {
  id: string;
  name: string;
  indexName: string;
  blocks: Block[];
};
