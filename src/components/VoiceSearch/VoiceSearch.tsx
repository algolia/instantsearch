import React from 'preact-compat';
import Template from '../Template/Template';

import {
  VoiceSearchCSSClasses,
  VoiceSearchTemplates,
} from '../../widgets/voice-search/voice-search';

import {
  VoiceListeningState,
  ToggleListening,
} from '../../lib/voiceSearchHelper';

export type VoiceSearchProps = {
  cssClasses: VoiceSearchCSSClasses;
  isSupportedBrowser: boolean;
  isListening: boolean;
  toggleListening: ToggleListening;
  voiceListeningState: VoiceListeningState;
  templates: VoiceSearchTemplates;
};

const VoiceSearch = ({
  cssClasses,
  isSupportedBrowser,
  isListening,
  toggleListening,
  voiceListeningState,
  templates,
}: VoiceSearchProps) => {
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.currentTarget.blur();
    toggleListening();
  };

  const { status, transcript, isSpeechFinal, errorCode } = voiceListeningState;
  return (
    <div className={cssClasses.root}>
      <Template
        templateKey="buttonText"
        rootTagName="button"
        rootProps={{
          className: cssClasses.button,
          type: 'button',
          title: 'Search by voice',
          onClick: handleClick,
          disabled: !isSupportedBrowser,
        }}
        data={{
          status,
          errorCode,
          isListening,
          transcript,
          isSpeechFinal,
          isSupportedBrowser,
        }}
        templates={templates}
      />
      <Template
        templateKey="status"
        rootProps={{
          className: cssClasses.status,
        }}
        data={{
          status,
          errorCode,
          isListening,
          transcript,
          isSpeechFinal,
          isSupportedBrowser,
        }}
        templates={templates}
      />
    </div>
  );
};

export default VoiceSearch;
