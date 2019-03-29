const STATUS_INITIAL = 'initial';
const STATUS_ASKING_PERMISSION = 'askingPermission';
const STATUS_WAITING = 'waiting';
const STATUS_RECOGNIZING = 'recognizing';
const STATUS_FINISHED = 'finished';
const STATUS_ERROR = 'error';

type VoiceSearchHelperParams = {
  onQueryChange: (query: string) => any;
  onStateChange: () => any;
};

export default function voiceSearchHelper({
  onQueryChange,
  onStateChange,
}: VoiceSearchHelperParams) {
  const SpeechRecognition =
    (window as any).webkitSpeechRecognition ||
    (window as any).SpeechRecognition;
  const defaultState = (status: string) => ({
    status,
    transcript: '',
    isSpeechFinal: undefined,
    errorCode: undefined,
  });
  let state = defaultState(STATUS_INITIAL);
  let recognition: any;

  const isSupportedBrowser = () =>
    'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  const isListening = () =>
    state.status === STATUS_ASKING_PERMISSION ||
    state.status === STATUS_WAITING ||
    state.status === STATUS_RECOGNIZING;

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

  const start = (searchAsYouSpeak: boolean) => {
    resetState(STATUS_ASKING_PERMISSION);
    recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.onend = () => {
      if (!state.errorCode && state.transcript && !searchAsYouSpeak) {
        onQueryChange(state.transcript);
      }
      if (state.status !== STATUS_ERROR) {
        setState({ status: STATUS_FINISHED });
      }
    };
    recognition.onerror = (e: any) => {
      setState({ status: STATUS_ERROR, errorCode: e.error });
    };
    recognition.onresult = (e: any) => {
      setState({
        status: STATUS_RECOGNIZING,
        transcript: e.results[0][0].transcript,
        isSpeechFinal: e.results[0].isFinal,
      });
      if (searchAsYouSpeak && state.transcript) {
        onQueryChange(state.transcript);
      }
    };
    recognition.onstart = () => {
      setState({
        status: STATUS_WAITING,
      });
    };

    // [
    //   'audiostart',
    //   'soundstart',
    //   'speechstart',
    //   'speechend',
    //   'soundend',
    //   'audioend',
    //   'result',
    //   'nomatch',
    //   'error',
    //   'start',
    //   'end',
    // ].forEach(event => {
    //   recognition.addEventListener(event, e => {
    //     console.log(`# ${event}`, e);
    //   });
    // });
    recognition.start();
  };

  const toggle = (searchAsYouSpeak: boolean) => {
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
