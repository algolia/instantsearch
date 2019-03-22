const STATUS_INITIAL = 'initial';
const STATUS_ASKING_PERMISSION = 'askingPermission';
const STATUS_WAITING_FOR_AUDIO = 'waitingForAudio';
const STATUS_WAITING_FOR_VOICE = 'waitingForVoice';
const STATUS_RECOGNIZING = 'recognizing';
const STATUS_FINISHED = 'finished';

export default function voiceSearchHelper({ onQueryChange, onStateChange }) {
  const SpeechRecognition =
    window.webkitSpeechRecognition || window.SpeechRecognition;
  const defaultState = status => ({
    status,
    transcript: '',
    isSpeechFinal: undefined,
    errorCode: undefined,
  });
  let state = defaultState(STATUS_INITIAL);
  let recognition;

  const isSupportedBrowser = () =>
    'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  const isListening = () =>
    state.status !== STATUS_INITIAL && state.status !== STATUS_FINISHED;

  const setState = (newState = {}) => {
    state = { ...state, ...newState };
    onStateChange();
  };

  const getState = () => state;

  const resetState = (status = STATUS_INITIAL) => {
    setState(defaultState(status));
  };

  const stop = () => {
    if (recognition) {
      recognition.stop();
      recognition = undefined;
    }
    resetState();
  };

  const start = searchAsYouSpeak => {
    resetState(STATUS_ASKING_PERMISSION);
    recognition = new SpeechRecognition();
    recognition.interimResults = searchAsYouSpeak;
    recognition.onend = () => {
      if (!state.errorCode && state.transcript && !searchAsYouSpeak) {
        onQueryChange(state.transcript);
      }
      setState({ status: STATUS_FINISHED });
    };
    recognition.onerror = e => {
      setState({ errorCode: e.error });
    };
    recognition.onresult = e => {
      setState({
        status: STATUS_RECOGNIZING,
        transcript: e.results[0][0].transcript,
        isSpeechFinal: e.results[0].isFinal,
      });
      if (searchAsYouSpeak) {
        onQueryChange(state.transcript);
      }
    };
    recognition.onsoundstart = () => {
      setState({ status: STATUS_WAITING_FOR_VOICE });
    };
    recognition.onstart = () => {
      setState({
        status: STATUS_WAITING_FOR_AUDIO,
      });
    };
    recognition.start();
  };

  const toggle = searchAsYouSpeak => {
    if (isListening()) {
      stop();
    } else {
      start(searchAsYouSpeak);
    }
  };

  return {
    getState,
    isSupportedBrowser,
    isListening,
    toggle,
  };
}
