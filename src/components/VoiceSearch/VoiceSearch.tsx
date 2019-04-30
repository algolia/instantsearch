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
  isBrowserSupported: boolean;
  isListening: boolean;
  toggleListening: ToggleListening;
  voiceListeningState: VoiceListeningState;
  templates: VoiceSearchTemplates;
};

const VoiceSearch = ({
  cssClasses,
  isBrowserSupported,
  isListening,
  toggleListening,
  voiceListeningState,
  templates,
}: VoiceSearchProps): React.ReactNode => {
  const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
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
          title: `Search by voice${
            isBrowserSupported ? '' : ' (not supported on this browser)'
          }`,
          onClick: handleClick,
          disabled: !isBrowserSupported,
        }}
        data={{
          status,
          errorCode,
          isListening,
          transcript,
          isSpeechFinal,
          isBrowserSupported,
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
          isBrowserSupported,
        }}
        templates={templates}
      />
    </div>
  );
};

export default VoiceSearch;
