const STATUS_INITIAL = 'initial';
const STATUS_ASKING_PERMISSION = 'askingPermission';
const STATUS_WAITING = 'waiting';
const STATUS_RECOGNIZING = 'recognizing';
const STATUS_FINISHED = 'finished';
const STATUS_ERROR = 'error';

export type VoiceSearchHelperParams = {
  searchAsYouSpeak: boolean;
  onQueryChange: (query: string) => void;
  onStateChange: () => void;
};

export type VoiceListeningState = {
  status: string;
  transcript: string;
  isSpeechFinal: boolean;
  errorCode?: string;
};

export type VoiceSearchHelper = {
  getState: () => VoiceListeningState;
  isBrowserSupported: () => boolean;
  isListening: () => boolean;
  toggleListening: () => void;
  dispose: () => void;
};

export type ToggleListening = () => void;

export default function voiceSearchHelper({
  searchAsYouSpeak,
  onQueryChange,
  onStateChange,
}: VoiceSearchHelperParams): VoiceSearchHelper {
  const SpeechRecognitionAPI: new () => SpeechRecognition =
    (window as any).webkitSpeechRecognition ||
    (window as any).SpeechRecognition;
  const getDefaultState = (status: string): VoiceListeningState => ({
    status,
    transcript: '',
    isSpeechFinal: false,
    errorCode: undefined,
  });
  let state: VoiceListeningState = getDefaultState(STATUS_INITIAL);
  let recognition: SpeechRecognition | undefined;

  const isBrowserSupported = (): boolean => Boolean(SpeechRecognitionAPI);

  const isListening = (): boolean =>
    state.status === STATUS_ASKING_PERMISSION ||
    state.status === STATUS_WAITING ||
    state.status === STATUS_RECOGNIZING;

  const setState = (newState = {}): void => {
    state = { ...state, ...newState };
    onStateChange();
  };

  const getState = (): VoiceListeningState => state;

  const resetState = (status = STATUS_INITIAL): void => {
    setState(getDefaultState(status));
  };

  const onStart = (): void => {
    setState({
      status: STATUS_WAITING,
    });
  };

  const onError = (event: SpeechRecognitionError): void => {
    setState({ status: STATUS_ERROR, errorCode: event.error });
  };

  const onResult = (event: SpeechRecognitionEvent): void => {
    setState({
      status: STATUS_RECOGNIZING,
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
    if (state.status !== STATUS_ERROR) {
      setState({ status: STATUS_FINISHED });
    }
  };

  const stop = (): void => {
    if (recognition) {
      recognition.stop();
      recognition = undefined;
    }
    resetState();
  };

  const start = (): void => {
    recognition = new SpeechRecognitionAPI();
    if (!recognition) {
      return;
    }
    resetState(STATUS_ASKING_PERMISSION);
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
    resetState();
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
