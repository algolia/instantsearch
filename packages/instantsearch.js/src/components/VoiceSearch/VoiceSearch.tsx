/** @jsx h */

import { h } from 'preact';

import Template from '../Template/Template';

import type { VoiceListeningState } from '../../connectors';
import type { ComponentCSSClasses } from '../../types';
import type {
  VoiceSearchCSSClasses,
  VoiceSearchTemplates,
} from '../../widgets/voice-search/voice-search';

export type VoiceSearchComponentCSSClasses =
  ComponentCSSClasses<VoiceSearchCSSClasses>;

export type VoiceSearchComponentTemplates = Required<VoiceSearchTemplates>;

export type VoiceSearchProps = {
  cssClasses: VoiceSearchComponentCSSClasses;
  isBrowserSupported: boolean;
  isListening: boolean;
  toggleListening: () => void;
  voiceListeningState: VoiceListeningState;
  templates: VoiceSearchComponentTemplates;
};

const VoiceSearch = ({
  cssClasses,
  isBrowserSupported,
  isListening,
  toggleListening,
  voiceListeningState,
  templates,
}: VoiceSearchProps) => {
  const handleClick = (event: MouseEvent): void => {
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.blur();
    }
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
