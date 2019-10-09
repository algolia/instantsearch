/** @jsx h */

import { h } from 'preact';
import Template from '../Template/Template';

import {
  VoiceSearchTemplates,
  VoiceSearchTemplateProps,
} from '../../widgets/voice-search/voice-search';

import {
  VoiceListeningState,
  ToggleListening,
} from '../../lib/voiceSearchHelper';

export type VoiceSearchComponentCSSClasses = {
  root: string;
  button: string;
  status: string;
};

export type VoiceSearchProps = {
  cssClasses: VoiceSearchComponentCSSClasses;
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
}: VoiceSearchProps) => {
  const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
    event.currentTarget.blur();
    toggleListening();
  };

  const { status, transcript, isSpeechFinal, errorCode } = voiceListeningState;
  const templateData: VoiceSearchTemplateProps = {
    status,
    errorCode,
    isListening,
    transcript,
    isSpeechFinal,
    isBrowserSupported,
  };

  return (
    <div className={cssClasses.root}>
      <Template
        template={templates.buttonText}
        data={templateData}
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
      />

      <Template
        template={templates.status}
        data={templateData}
        rootProps={{
          className: cssClasses.status,
        }}
      />
    </div>
  );
};

export default VoiceSearch;
