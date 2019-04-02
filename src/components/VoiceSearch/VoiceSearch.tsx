import React from 'preact-compat';
import Template from '../Template/Template';

import {
  VoiceSearchCSSClasses,
  VoiceSearchTemplates,
  VoiceListeningState,
} from '../../widgets/voice-search/voice-search';

type VoiceSearchProps = {
  cssClasses: VoiceSearchCSSClasses;
  isSupportedBrowser: boolean;
  isListening: boolean;
  toggleListening: (toggleListeningParams: {
    searchAsYouSpeak: boolean;
  }) => void;
  voiceListeningState: VoiceListeningState;
  searchAsYouSpeak?: boolean;
  templates: VoiceSearchTemplates;
};

const VoiceSearch = ({
  cssClasses,
  isSupportedBrowser,
  isListening,
  toggleListening,
  voiceListeningState,
  searchAsYouSpeak = false,
  templates,
}: VoiceSearchProps) => {
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.currentTarget.blur();
    toggleListening({ searchAsYouSpeak });
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
        rootTagName="div"
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
