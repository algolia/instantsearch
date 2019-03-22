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

const withUsage = createDocumentationMessageGenerator({ name: 'voice-search' });
const suit = component('VoiceSearch');

const renderer = ({
  containerNode,
  cssClasses,
  templates,
  searchAsYouSpeak,
  hideOnUnsupportedBrowser,
}) => ({
  isSupportedBrowser,
  isListening,
  toggleListening,
  voiceListeningState,
}) => {
  render(
    <VoiceSearch
      cssClasses={cssClasses}
      templates={templates}
      isSupportedBrowser={isSupportedBrowser}
      isListening={isListening}
      toggleListening={toggleListening}
      voiceListeningState={voiceListeningState}
      searchAsYouSpeak={searchAsYouSpeak}
      hideOnUnsupportedBrowser={hideOnUnsupportedBrowser}
    />,
    containerNode
  );
};

export default function voiceSearch({
  container,
  cssClasses: userCssClasses = {},
  templates,
  searchAsYouSpeak,
  hideOnUnsupportedBrowser,
} = {}) {
  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    button: cx(suit({ descendantName: 'button' }), userCssClasses.button),
    transcript: cx(
      suit({ descendantName: 'transcript' }),
      userCssClasses.transcript
    ),
    status: cx(suit({ descendantName: 'status' }), userCssClasses.status),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    templates: { ...defaultTemplates, ...templates },
    searchAsYouSpeak,
    hideOnUnsupportedBrowser,
  });

  const makeWidget = connectVoiceSearch(specializedRenderer, () =>
    unmountComponentAtNode(containerNode)
  );

  return makeWidget();
}
