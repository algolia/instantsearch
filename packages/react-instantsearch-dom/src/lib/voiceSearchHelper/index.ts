// copied from https://github.com/algolia/instantsearch.js/blob/0e988cc85487f61aa3b61131c22bed135ddfd76d/src/lib/voiceSearchHelper/index.ts

export type VoiceSearchHelperParams = {
  searchAsYouSpeak: boolean;
  onQueryChange: (query: string) => void;
  onStateChange: () => void;
};

export type Status =
  | 'initial'
  | 'askingPermission'
  | 'waiting'
  | 'recognizing'
  | 'finished'
  | 'error';

export type ErrorCode =
  | 'no-speech'
  | 'aborted'
  | 'audio-capture'
  | 'network'
  | 'not-allowed'
  | 'service-not-allowed'
  | 'bad-grammar'
  | 'language-not-supported';

export type VoiceListeningState = {
  status: Status;
  transcript: string;
  isSpeechFinal: boolean;
  errorCode?: ErrorCode;
};

export type VoiceSearchHelper = {
  getState: () => VoiceListeningState;
  isBrowserSupported: () => boolean;
  isListening: () => boolean;
  toggleListening: () => void;
  dispose: () => void;
};

export type ToggleListening = () => void;

export default function createVoiceSearchHelper({
  searchAsYouSpeak,
  onQueryChange,
  onStateChange,
}: VoiceSearchHelperParams): VoiceSearchHelper {
  const SpeechRecognitionAPI: new () => SpeechRecognition =
    (window as any).webkitSpeechRecognition ||
    (window as any).SpeechRecognition;
  const getDefaultState = (status: Status): VoiceListeningState => ({
    status,
    transcript: '',
    isSpeechFinal: false,
    errorCode: undefined,
  });
  let state: VoiceListeningState = getDefaultState('initial');
  let recognition: SpeechRecognition | undefined;

  const isBrowserSupported = (): boolean => Boolean(SpeechRecognitionAPI);

  const isListening = (): boolean =>
    state.status === 'askingPermission' ||
    state.status === 'waiting' ||
    state.status === 'recognizing';

  const setState = (newState: Partial<VoiceListeningState> = {}): void => {
    state = { ...state, ...newState };
    onStateChange();
  };

  const getState = (): VoiceListeningState => state;

  const resetState = (status: Status = 'initial'): void => {
    setState(getDefaultState(status));
  };

  const onStart = (): void => {
    setState({
      status: 'waiting',
    });
  };

  const onError = (event: SpeechRecognitionError): void => {
    setState({ status: 'error', errorCode: event.error });
  };

  const onResult = (event: SpeechRecognitionEvent): void => {
    setState({
      status: 'recognizing',
      transcript:
        (event.results[0] &&
          event.results[0][0] &&
          event.results[0][0].transcript) ||
        '',
      isSpeechFinal: event.results[0] && event.results[0].isFinal,
    });
    if (searchAsYouSpeak && state.transcript) {
      onQueryChange(state.transcript);
    }
  };

  const onEnd = (): void => {
    if (!state.errorCode && state.transcript && !searchAsYouSpeak) {
      onQueryChange(state.transcript);
    }
    if (state.status !== 'error') {
      setState({ status: 'finished' });
    }
  };

  const stop = (): void => {
    dispose();
    resetState();
  };

  const start = (): void => {
    recognition = new SpeechRecognitionAPI();
    if (!recognition) {
      return;
    }
    resetState('askingPermission');
    recognition.interimResults = true;
    recognition.addEventListener('start', onStart);
    recognition.addEventListener('error', onError);
    recognition.addEventListener('result', onResult);
    recognition.addEventListener('end', onEnd);
    recognition.start();
  };

  const dispose = (): void => {
    if (!recognition) {
      return;
    }
    recognition.stop();
    recognition.removeEventListener('start', onStart);
    recognition.removeEventListener('error', onError);
    recognition.removeEventListener('result', onResult);
    recognition.removeEventListener('end', onEnd);
    recognition = undefined;
  };

  const toggleListening = (): void => {
    if (!isBrowserSupported()) {
      return;
    }
    if (isListening()) {
      stop();
    } else {
      start();
    }
  };

  return {
    getState,
    isBrowserSupported,
    isListening,
    toggleListening,
    dispose,
  };
}
