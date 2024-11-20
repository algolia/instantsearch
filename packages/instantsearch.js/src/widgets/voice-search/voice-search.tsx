/** @jsx h */

import { cx } from 'instantsearch-ui-components';
import { h, render } from 'preact';

import VoiceSearchComponent from '../../components/VoiceSearch/VoiceSearch';
import connectVoiceSearch from '../../connectors/voice-search/connectVoiceSearch';
import { component } from '../../lib/suit';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import defaultTemplates from './defaultTemplates';

import type {
  VoiceSearchComponentCSSClasses,
  VoiceSearchComponentTemplates,
} from '../../components/VoiceSearch/VoiceSearch';
import type {
  VoiceSearchConnectorParams,
  VoiceSearchRenderState,
  VoiceSearchWidgetDescription,
} from '../../connectors/voice-search/connectVoiceSearch';
import type { WidgetFactory, Template, Renderer } from '../../types';
import type { PlainSearchParameters } from 'algoliasearch-helper';
import type { CreateVoiceSearchHelper } from 'instantsearch-core';

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
