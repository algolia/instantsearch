const STATUS_INITIAL = 'initial';
const STATUS_ASKING_PERMISSION = 'askingPermission';
const STATUS_WAITING = 'waiting';
const STATUS_RECOGNIZING = 'recognizing';
const STATUS_FINISHED = 'finished';
const STATUS_ERROR = 'error';

type VoiceSearchHelperParams = {
  onQueryChange: (query: string) => void;
  onStateChange: () => any;
};

export default function voiceSearchHelper({
  onQueryChange,
  onStateChange,
}: VoiceSearchHelperParams) {
  const SpeechRecognition =
    (window as any).webkitSpeechRecognition ||
    (window as any).SpeechRecognition;
  const getDefaultState = (status: string) => ({
    status,
    transcript: '',
    isSpeechFinal: undefined,
    errorCode: undefined,
  });
  let state = getDefaultState(STATUS_INITIAL);
  let recognition: any;

  const isSupportedBrowser = () => Boolean(SpeechRecognition);

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
    setState(getDefaultState(status));
  };

  const stop = () => {
    if (recognition) {
      recognition.stop();
      recognition = undefined;
    }
    resetState();
  };

  const start = ({ searchAsYouSpeak }: { searchAsYouSpeak: boolean }) => {
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
    recognition.onerror = (event: SpeechRecognitionError) => {
      setState({ status: STATUS_ERROR, errorCode: event.error });
    };
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      setState({
        status: STATUS_RECOGNIZING,
        transcript: event.results[0][0].transcript,
        isSpeechFinal: event.results[0].isFinal,
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

    recognition.start();
  };

  const toggleListening = ({
    searchAsYouSpeak,
  }: {
    searchAsYouSpeak: boolean;
  }) => {
    if (isListening()) {
      stop();
    } else {
      start({ searchAsYouSpeak });
    }
  };

  return {
    getState,
    isSupportedBrowser,
    isListening,
    toggleListening,
  };
}
