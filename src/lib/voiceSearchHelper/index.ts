/* global SpeechRecognition SpeechRecognitionEvent */
import { CreateVoiceSearchHelper, Status, VoiceListeningState } from './types';

const createVoiceSearchHelper: CreateVoiceSearchHelper = function createVoiceSearchHelper({
  searchAsYouSpeak,
  language,
  onQueryChange,
  onStateChange,
}) {
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

  const onError = (event: Event): void => {
    setState({ status: 'error', errorCode: (event as any).error });
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

  const startListening = (): void => {
    recognition = new SpeechRecognitionAPI();
    if (!recognition) {
      return;
    }
    resetState('askingPermission');
    recognition.interimResults = true;

    if (language) {
      recognition.lang = language;
    }

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

  const stopListening = (): void => {
    dispose();
    // Because `dispose` removes event listeners, `end` listener is not called.
    // So we're setting the `status` as `finished` here.
    // If we don't do it, it will be still `waiting` or `recognizing`.
    resetState('finished');
  };

  return {
    getState,
    isBrowserSupported,
    isListening,
    startListening,
    stopListening,
    dispose,
  };
};

export default createVoiceSearchHelper;
