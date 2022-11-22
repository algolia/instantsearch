/** @jsx h */

import { h, render } from 'preact';
import { cx } from '@algolia/ui-components-shared';
import type { PlainSearchParameters } from 'algoliasearch-helper';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import type {
  VoiceSearchConnectorParams,
  VoiceSearchRenderState,
  VoiceSearchWidgetDescription,
} from '../../connectors/voice-search/connectVoiceSearch';
import connectVoiceSearch from '../../connectors/voice-search/connectVoiceSearch';
import type {
  VoiceSearchComponentCSSClasses,
  VoiceSearchComponentTemplates,
} from '../../components/VoiceSearch/VoiceSearch';
import VoiceSearchComponent from '../../components/VoiceSearch/VoiceSearch';
import defaultTemplates from './defaultTemplates';
import type { WidgetFactory, Template, Renderer } from '../../types';
import type { CreateVoiceSearchHelper } from '../../lib/voiceSearchHelper/types';

const withUsage = createDocumentationMessageGenerator({ name: 'voice-search' });
const suit = component('VoiceSearch');

export type VoiceSearchCSSClasses = Partial<{
  root: string | string[];
  button: string | string[];
  status: string | string[];
}>;

type VoiceSearchTemplateProps = {
  status: string;
  errorCode: string;
  isListening: boolean;
  transcript: string;
  isSpeechFinal: boolean;
  isBrowserSupported: boolean;
};

export type VoiceSearchTemplates = Partial<{
  buttonText: Template<VoiceSearchTemplateProps>;
  status: Template<VoiceSearchTemplateProps>;
}>;

export type VoiceSearchWidgetParams = {
  container: string | HTMLElement;
  cssClasses?: VoiceSearchCSSClasses;
  templates?: VoiceSearchTemplates;
  searchAsYouSpeak?: boolean;
  language?: string;
  additionalQueryParameters?: (params: {
    query: string;
  }) => PlainSearchParameters | void;
  createVoiceSearchHelper?: CreateVoiceSearchHelper;
};

export type VoiceSearchWidget = WidgetFactory<
  VoiceSearchWidgetDescription & { $$type: 'ais.voiceSearch' },
  VoiceSearchConnectorParams,
  VoiceSearchWidgetParams
>;

const renderer =
  ({
    containerNode,
    cssClasses,
    templates,
  }: {
    containerNode: HTMLElement;
    cssClasses: VoiceSearchComponentCSSClasses;
    templates: VoiceSearchComponentTemplates;
  }): Renderer<VoiceSearchRenderState, Partial<VoiceSearchWidgetParams>> =>
  ({
    isBrowserSupported,
    isListening,
    toggleListening,
    voiceListeningState,
  }) => {
    render(
      <VoiceSearchComponent
        cssClasses={cssClasses}
        templates={templates}
        isBrowserSupported={isBrowserSupported}
        isListening={isListening}
        toggleListening={toggleListening}
        voiceListeningState={voiceListeningState}
      />,
      containerNode
    );
  };

const voiceSearch: VoiceSearchWidget = (widgetParams) => {
  const {
    container,
    cssClasses: userCssClasses = {},
    templates: userTemplates = {},
    searchAsYouSpeak = false,
    language,
    additionalQueryParameters,
    createVoiceSearchHelper,
  }: VoiceSearchWidgetParams = widgetParams || {};
  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    button: cx(suit({ descendantName: 'button' }), userCssClasses.button),
    status: cx(suit({ descendantName: 'status' }), userCssClasses.status),
  };
  const templates = {
    ...defaultTemplates,
    ...userTemplates,
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    templates,
  });

  const makeWidget = connectVoiceSearch(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({
      container: containerNode,
      cssClasses,
      templates,
      searchAsYouSpeak,
      language,
      additionalQueryParameters,
      createVoiceSearchHelper,
    }),
    $$widgetType: 'ais.voiceSearch',
  };
};

export default voiceSearch;
