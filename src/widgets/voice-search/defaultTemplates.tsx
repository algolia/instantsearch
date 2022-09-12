/** @jsx h */
import { Fragment, h } from 'preact';

import type { VoiceSearchComponentTemplates } from '../../components/VoiceSearch/VoiceSearch';

type ButtonInnerElementProps = {
  status: string;
  errorCode: string;
  isListening: boolean;
};

const ButtonInnerElement = ({
  status,
  errorCode,
  isListening,
}: ButtonInnerElementProps) => {
  if (status === 'error' && errorCode === 'not-allowed') {
    return (
      <Fragment>
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </Fragment>
    );
  }

  return (
    <Fragment>
      <path
        d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
        fill={isListening ? 'currentColor' : 'none'}
      />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </Fragment>
  );
};

const defaultTemplates: VoiceSearchComponentTemplates = {
  buttonText({ status, errorCode, isListening }) {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        /* eslint-disable react/no-unknown-property */
        // Preact supports kebab case attributes, and using camel case would
        // require using `preact/compat`.
        // @TODO: reconsider using the `react` ESLint preset
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        /* eslint-enable react/no-unknown-property */
      >
        <ButtonInnerElement
          status={status}
          errorCode={errorCode}
          isListening={isListening}
        />
      </svg>
    );
  },
  status({ transcript }) {
    return <p>{transcript}</p>;
  },
};

export default defaultTemplates;
