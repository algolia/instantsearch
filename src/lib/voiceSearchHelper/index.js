const STATUS_INITIAL = 'initial';
const STATUS_ASKING_PERMISSION = 'askingPermission';
const STATUS_WAITING_FOR_AUDIO = 'waitingForAudio';
const STATUS_WAITING_FOR_VOICE = 'waitingForVoice';
const STATUS_GETTING_INPUTS = 'gettingInputs';
const STATUS_FINISHED = 'finished';

export default function voiceSearchHelper({ onQueryChange, onStateChange }) {
  window.SpeechRecognition =
    window.webkitSpeechRecognition || window.SpeechRecognition;
  let state = {};
  let recognition;

  const isSupportedBrowser = () => 'SpeechRecognition' in window;

  const isListening = () =>
    state.status !== STATUS_INITIAL && state.status !== STATUS_FINISHED;

  const setState = (newState = {}) => {
    state = { ...state, ...newState };
    onStateChange(state);
  };

  const resetState = (status = STATUS_INITIAL) => {
    setState({
      status,
      transcript: '',
      isSpeechFinal: undefined,
      errorCode: undefined,
    });
  };

  const stop = () => {
    if (recognition) {
      recognition.stop();
      recognition = undefined;
    }
    resetState();
  };

  const canStart = () =>
    state.status === STATUS_INITIAL || state.status === STATUS_FINISHED;

  const start = searchAsYouSpeak => {
    resetState(STATUS_ASKING_PERMISSION);
    recognition = new window.SpeechRecognition();
    // recognition.continuous = true;
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
        status: STATUS_GETTING_INPUTS,
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

  resetState();
  return {
    isSupportedBrowser,
    isListening,
    canStart,
    start,
    stop,
  };
}
