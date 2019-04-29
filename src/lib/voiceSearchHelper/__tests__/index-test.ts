import voiceSearchHelper, {
  VoiceSearchHelper,
  VoiceSearchHelperParams,
} from '..';

const getHelper = (opts?: VoiceSearchHelperParams): VoiceSearchHelper =>
  voiceSearchHelper(
    opts || {
      searchAsYouSpeak: false,
      onQueryChange: () => {},
      onStateChange: () => {},
    }
  );

type DummySpeechRecognition = () => void;
declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognition | DummySpeechRecognition;
    SpeechRecognition?: SpeechRecognition | DummySpeechRecognition;
  }
}

describe('VoiceSearchHelper', () => {
  beforeEach(() => {
    delete window.webkitSpeechRecognition;
    delete window.SpeechRecognition;
  });

  it('has initial state correctly', () => {
    const helper = getHelper();
    expect(helper.getState()).toEqual({
      errorCode: undefined,
      isSpeechFinal: undefined,
      status: 'initial',
      transcript: undefined,
    });
  });

  it('is not supported', () => {
    const helper = getHelper();
    expect(helper.isBrowserSupported()).toBe(false);
  });

  it('is not listening', () => {
    const helper = getHelper();
    expect(helper.isListening()).toBe(false);
  });

  it('is supported with webkitSpeechRecognition', () => {
    window.webkitSpeechRecognition = () => {};
    const helper = getHelper();
    expect(helper.isBrowserSupported()).toBe(true);
  });

  it('is supported with SpeechRecognition', () => {
    window.SpeechRecognition = () => {};
    const helper = getHelper();
    expect(helper.isBrowserSupported()).toBe(true);
  });

  it('works with mock SpeechRecognition (searchAsYouSpeak:false)', () => {
    let recognition;
    window.SpeechRecognition = jest.fn().mockImplementation(() => ({
      start() {
        /* eslint-disable-next-line consistent-this */
        recognition = this;
      },
    }));
    const onQueryChange = jest.fn();
    const onStateChange = jest.fn();
    const helper = getHelper({
      searchAsYouSpeak: false,
      onQueryChange,
      onStateChange,
    });
    const { getState } = helper;
    helper.toggleListening();
    expect(onStateChange).toHaveBeenCalledTimes(1);
    expect(getState().status).toEqual('askingPermission');
    recognition.onstart();
    expect(getState().status).toEqual('waiting');
    recognition.onresult({
      results: [
        (() => {
          const obj = [
            {
              transcript: 'Hello World',
            },
          ];
          (obj as any).isFinal = true;
          return obj;
        })(),
      ],
    });
    expect(getState().status).toEqual('recognizing');
    expect(getState().transcript).toEqual('Hello World');
    expect(getState().isSpeechFinal).toBe(true);
    expect(onQueryChange).toHaveBeenCalledTimes(0);
    recognition.onend();
    expect(onQueryChange).toHaveBeenCalledWith('Hello World');
    expect(getState().status).toEqual('finished');
  });

  it('works with mock SpeechRecognition (searchAsYouSpeak:true)', () => {
    let recognition;
    window.SpeechRecognition = jest.fn().mockImplementation(() => ({
      start() {
        /* eslint-disable-next-line consistent-this */
        recognition = this;
      },
    }));
    const onQueryChange = jest.fn();
    const onStateChange = jest.fn();
    const helper = getHelper({
      searchAsYouSpeak: true,
      onQueryChange,
      onStateChange,
    });
    const { getState } = helper;
    helper.toggleListening();
    expect(onStateChange).toHaveBeenCalledTimes(1);
    expect(getState().status).toEqual('askingPermission');
    recognition.onstart();
    expect(getState().status).toEqual('waiting');
    recognition.onresult({
      results: [
        (() => {
          const obj = [
            {
              transcript: 'Hello World',
            },
          ];
          (obj as any).isFinal = true;
          return obj;
        })(),
      ],
    });
    expect(getState().status).toEqual('recognizing');
    expect(getState().transcript).toEqual('Hello World');
    expect(getState().isSpeechFinal).toBe(true);
    expect(onQueryChange).toHaveBeenCalledWith('Hello World');
    recognition.onend();
    expect(onQueryChange).toHaveBeenCalledTimes(1);
    expect(getState().status).toEqual('finished');
  });

  it('works with onerror', () => {
    let recognition;
    window.SpeechRecognition = jest.fn().mockImplementation(() => ({
      start() {
        /* eslint-disable-next-line consistent-this */
        recognition = this;
      },
    }));
    const onQueryChange = jest.fn();
    const onStateChange = jest.fn();
    const helper = getHelper({
      searchAsYouSpeak: true,
      onQueryChange,
      onStateChange,
    });
    const { getState } = helper;
    helper.toggleListening();
    expect(getState().status).toEqual('askingPermission');
    recognition.onerror({
      error: 'not-allowed',
    });
    expect(getState().status).toEqual('error');
    expect(getState().errorCode).toEqual('not-allowed');
    recognition.onend();
    expect(onQueryChange).toHaveBeenCalledTimes(0);
  });
});
