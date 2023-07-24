import React, { Component } from 'react';
import { translatable } from 'react-instantsearch-core';

import { createClassNames } from '../core/utils';
import createVoiceSearchHelper from '../lib/voiceSearchHelper';

import type {
  VoiceSearchHelper,
  VoiceListeningState,
  Status,
  SpeechRecognitionErrorCode,
} from '../lib/voiceSearchHelper';
const cx = createClassNames('VoiceSearch');

type ButtonSvgProps = {
  children: React.ReactNode;
};

export type InnerComponentProps = {
  status: Status;
  errorCode?: SpeechRecognitionErrorCode;
  isListening: boolean;
  transcript: string;
  isSpeechFinal: boolean;
  isBrowserSupported: boolean;
};

type Translate = (key: string, ...params: any[]) => string;

type VoiceSearchProps = {
  searchAsYouSpeak: boolean;
  language?: string;
  additionalQueryParameters?: (params: { query: string }) => {} | void;

  refine: (query: string) => void;
  translate: Translate;
  buttonTextComponent: React.FC<InnerComponentProps>;
  statusComponent: React.FC<InnerComponentProps>;
};

const ButtonSvg = ({ children }: ButtonSvgProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const DefaultButtonText = ({
  status,
  errorCode,
  isListening,
}: InnerComponentProps) => {
  return status === 'error' && errorCode === 'not-allowed' ? (
    <ButtonSvg>
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </ButtonSvg>
  ) : (
    <ButtonSvg>
      <path
        d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
        fill={isListening ? 'currentColor' : ''}
      />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </ButtonSvg>
  );
};

const DefaultStatus = ({ transcript }: InnerComponentProps) => (
  <p>{transcript}</p>
);

class VoiceSearch extends Component<VoiceSearchProps, VoiceListeningState> {
  protected static defaultProps = {
    searchAsYouSpeak: false,
    buttonTextComponent: DefaultButtonText,
    statusComponent: DefaultStatus,
  };
  private voiceSearchHelper?: VoiceSearchHelper;

  public componentDidMount() {
    const { searchAsYouSpeak = false, language, refine } = this.props;
    this.voiceSearchHelper = createVoiceSearchHelper({
      searchAsYouSpeak,
      language,
      onQueryChange: (query) => refine(query),
      onStateChange: () => {
        this.setState(this.voiceSearchHelper!.getState());
      },
    });
    this.setState(this.voiceSearchHelper.getState());
  }

  public render() {
    if (!this.voiceSearchHelper) {
      return null;
    }

    const { status, transcript, isSpeechFinal, errorCode } = this.state;
    const { isListening, isBrowserSupported } = this.voiceSearchHelper;
    const {
      translate,
      buttonTextComponent: ButtonTextComponent,
      statusComponent: StatusComponent,
    } = this.props;
    const innerProps: InnerComponentProps = {
      status,
      errorCode,
      isListening: isListening(),
      transcript,
      isSpeechFinal,
      isBrowserSupported: isBrowserSupported(),
    };

    return (
      <div className={cx('')}>
        <button
          className={cx('button')}
          type="button"
          title={
            isBrowserSupported()
              ? translate('buttonTitle')
              : translate('disabledButtonTitle')
          }
          onClick={this.onClick}
          disabled={!isBrowserSupported()}
        >
          <ButtonTextComponent {...innerProps} />
        </button>
        <div className={cx('status')}>
          <StatusComponent {...innerProps} />
        </div>
      </div>
    );
  }

  public componentWillUnmount() {
    if (this.voiceSearchHelper) {
      this.voiceSearchHelper.dispose();
    }
  }

  private onClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!this.voiceSearchHelper) {
      return;
    }
    event.currentTarget.blur();
    const { toggleListening } = this.voiceSearchHelper;
    toggleListening();
  };
}

export default translatable({
  buttonTitle: 'Search by voice',
  disabledButtonTitle: 'Search by voice (not supported on this browser)',
})(VoiceSearch);
