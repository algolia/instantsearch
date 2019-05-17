import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import connectVoiceSearch, {
  VoiceSearchRenderer,
} from '../../connectors/voice-search/connectVoiceSearch';
import VoiceSearch from '../../components/VoiceSearch/VoiceSearch';
import defaultTemplates from './defaultTemplates';
import { WidgetFactory, Template } from '../../types';

const withUsage = createDocumentationMessageGenerator({ name: 'voice-search' });
const suit = component('VoiceSearch');

export type VoiceSearchCSSClasses = {
  root: string | string[];
  button: string | string[];
  status: string | string[];
};

type VoiceSearchTemplateProps = {
  status: string;
  errorCode: string;
  isListening: boolean;
  transcript: string;
  isSpeechFinal: boolean;
  isBrowserSupported: boolean;
};

export type VoiceSearchTemplates = {
  buttonText: Template<VoiceSearchTemplateProps>;
  status: Template<VoiceSearchTemplateProps>;
};

type VoiceSearchWidgetParams = {
  container: string | HTMLElement;
  cssClasses?: Partial<VoiceSearchCSSClasses>;
  templates?: Partial<VoiceSearchTemplates>;
  searchAsYouSpeak?: boolean;
};

interface VoiceSearchRendererWidgetParams extends VoiceSearchWidgetParams {
  container: HTMLElement;
  cssClasses: VoiceSearchCSSClasses;
  templates: VoiceSearchTemplates;
}

type VoiceSearch = WidgetFactory<VoiceSearchWidgetParams>;

const renderer: VoiceSearchRenderer<VoiceSearchRendererWidgetParams> = ({
  isBrowserSupported,
  isListening,
  toggleListening,
  voiceListeningState,
  widgetParams,
}) => {
  const { container, cssClasses, templates } = widgetParams;

  render(
    <VoiceSearch
      cssClasses={cssClasses}
      templates={templates}
      isBrowserSupported={isBrowserSupported}
      isListening={isListening}
      toggleListening={toggleListening}
      voiceListeningState={voiceListeningState}
    />,
    container
  );
};

const voiceSearch: VoiceSearch = (
  {
    container,
    cssClasses: userCssClasses = {} as VoiceSearchCSSClasses,
    templates,
    searchAsYouSpeak = false,
  } = {} as VoiceSearchWidgetParams
) => {
  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    button: cx(suit({ descendantName: 'button' }), userCssClasses.button),
    status: cx(suit({ descendantName: 'status' }), userCssClasses.status),
  };

  const makeWidget = connectVoiceSearch(renderer, () =>
    unmountComponentAtNode(containerNode)
  );

  return makeWidget({
    container: containerNode,
    cssClasses,
    templates: { ...defaultTemplates, ...templates },
    searchAsYouSpeak,
  });
};

export default voiceSearch;
