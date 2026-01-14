import type { IndexWidget, InstantSearch, Widget } from '../../types';
import type { AutocompleteWidget } from '../autocomplete/autocomplete';
import type { ChatWidget } from '../chat/chat';
import type { TemplateChild } from './render';

export type ExperienceApiResponse = {
  blocks: Array<{
    type: string;
    parameters: {
      container: string;
      cssVariables: Record<string, string>;
    } & Record<
      // eslint-disable-next-line @typescript-eslint/ban-types
      'container' | 'cssVariables' | (string & {}),
      unknown
    >;
  }>;
};

export type ExperienceWidgetParams = {
  id: string;
};

type SupportedWidget<
  TWidgetParameters = unknown,
  TApiParameters = ExperienceApiResponse['blocks'][0]['parameters']
> = {
  widget: (...args: any[]) => Widget | Array<IndexWidget | Widget>;
  transformParams: (
    params: TApiParameters,
    options: {
      env: 'beta' | 'prod';
      instantSearchInstance: InstantSearch;
    }
  ) => TWidgetParameters;
};

export type ExperienceWidget = Widget & {
  $$widgetParams: ExperienceWidgetParams;
  $$supportedWidgets: {
    'ais.autocomplete': SupportedWidget<Parameters<AutocompleteWidget>[0]>;
    'ais.chat': SupportedWidget<
      Parameters<ChatWidget>[0],
      ExperienceApiResponse['blocks'][0]['parameters'] & {
        itemTemplate?: TemplateChild[];
      }
    >;
    // eslint-disable-next-line @typescript-eslint/ban-types
  } & Record<'ais.chat' | (string & {}), SupportedWidget>;
};
