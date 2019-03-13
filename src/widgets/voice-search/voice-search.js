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
}) => ({ refine, query }) => {
  render(
    <VoiceSearch
      refine={refine}
      cssClasses={cssClasses}
      query={query}
      templates={templates}
      searchAsYouSpeak={searchAsYouSpeak}
    />,
    containerNode
  );
};

export default function voiceSearch({
  container,
  cssClasses: userCssClasses = {},
  templates,
  searchAsYouSpeak,
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
  });

  const makeWidget = connectVoiceSearch(specializedRenderer, () =>
    unmountComponentAtNode(containerNode)
  );

  return makeWidget();
}
