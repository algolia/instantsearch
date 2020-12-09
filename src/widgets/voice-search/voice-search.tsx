/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import { PlainSearchParameters } from 'algoliasearch-helper';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import connectVoiceSearch, {
  VoiceSearchConnectorParams,
  VoiceSearchRendererOptions,
} from '../../connectors/voice-search/connectVoiceSearch';
import VoiceSearch, {
  VoiceSearchComponentCSSClasses,
} from '../../components/VoiceSearch/VoiceSearch';
import defaultTemplates from './defaultTemplates';
import { WidgetFactory, Template, Renderer } from '../../types';
import { CreateVoiceSearchHelper } from '../../lib/voiceSearchHelper/types';

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

export type VoiceSearchWidgetParams = {
  container: string | HTMLElement;
  cssClasses?: Partial<VoiceSearchCSSClasses>;
  templates?: Partial<VoiceSearchTemplates>;
  searchAsYouSpeak?: boolean;
  language?: string;
  additionalQueryParameters?: (params: {
    query: string;
  }) => PlainSearchParameters | void;
  createVoiceSearchHelper?: CreateVoiceSearchHelper;
};

type VoiceSearchRendererWidgetParams = {
  container: HTMLElement;
  cssClasses: VoiceSearchComponentCSSClasses;
  templates: VoiceSearchTemplates;
} & VoiceSearchWidgetParams;

type VoiceSearch = WidgetFactory<
  VoiceSearchRendererOptions,
  VoiceSearchConnectorParams,
  VoiceSearchWidgetParams
>;

const renderer: Renderer<
  VoiceSearchRendererOptions,
  VoiceSearchRendererWidgetParams
> = ({
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

const voiceSearch: VoiceSearch = widgetOptions => {
  const {
    container,
    cssClasses: userCssClasses = {} as VoiceSearchCSSClasses,
    templates,
    searchAsYouSpeak = false,
    language,
    additionalQueryParameters,
    createVoiceSearchHelper,
  } = widgetOptions || ({} as VoiceSearchWidgetParams);
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
    render(null, containerNode)
  );

  return {
    ...makeWidget({
      container: containerNode,
      cssClasses,
      templates: { ...defaultTemplates, ...templates },
      searchAsYouSpeak,
      language,
      additionalQueryParameters,
      createVoiceSearchHelper,
    }),
    $$officialWidget: true,
  };
};

export default voiceSearch;
