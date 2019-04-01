import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import connectVoiceSearch from '../../connectors/voice-search/connectVoiceSearch';
import VoiceSearch from '../../components/VoiceSearch/VoiceSearch';
import defaultTemplates from './defaultTemplates';
import { Template } from '../../types';

const withUsage = createDocumentationMessageGenerator({ name: 'voice-search' });
const suit = component('VoiceSearch');

export type VoiceSearchCSSClasses = {
  root: string;
  button: string;
  status: string;
};

export type VoiceSearchTemplates = {
  buttonText: Template;
  status: Template;
};

export type VoiceListeningState = {
  status: string;
  transcript?: string;
  isSpeechFinal?: boolean;
  errorCode?: string;
};

type VoiceSearchWidgetParams = {
  container: string | HTMLElement;
  cssClasses: VoiceSearchCSSClasses;
  templates: VoiceSearchTemplates;
  searchAsYouSpeak?: boolean;
};

type VoiceSearchWidgetRenderParams = {
  isSupportedBrowser: () => boolean;
  isListening: () => boolean;
  toggleListening: (searchAsYouSpeak: boolean) => void;
  voiceListeningState: VoiceListeningState;
};

const renderer = ({
  container,
  cssClasses,
  templates,
  searchAsYouSpeak,
}: VoiceSearchWidgetParams) => ({
  isSupportedBrowser,
  isListening,
  toggleListening,
  voiceListeningState,
}: VoiceSearchWidgetRenderParams) => {
  render(
    <VoiceSearch
      cssClasses={cssClasses}
      templates={templates}
      isSupportedBrowser={isSupportedBrowser}
      isListening={isListening}
      toggleListening={toggleListening}
      voiceListeningState={voiceListeningState}
      searchAsYouSpeak={searchAsYouSpeak}
    />,
    container
  );
};

export default function voiceSearch(
  {
    container,
    cssClasses: userCssClasses = {} as VoiceSearchCSSClasses,
    templates,
    searchAsYouSpeak,
  } = {} as VoiceSearchWidgetParams
) {
  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    button: cx(suit({ descendantName: 'button' }), userCssClasses.button),
    status: cx(suit({ descendantName: 'status' }), userCssClasses.status),
  };

  const specializedRenderer = renderer({
    container: containerNode,
    cssClasses,
    templates: { ...defaultTemplates, ...templates },
    searchAsYouSpeak,
  });

  const makeWidget = connectVoiceSearch(specializedRenderer, () =>
    unmountComponentAtNode(containerNode)
  );

  return makeWidget({});
}
