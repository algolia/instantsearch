import createVoiceSearchHelper, {
  VoiceSearchHelper,
  VoiceSearchHelperParams,
} from '..';

const getVoiceSearchHelper = (
  opts?: VoiceSearchHelperParams
): VoiceSearchHelper =>
  createVoiceSearchHelper(
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
    const voiceSearchHelper = getVoiceSearchHelper();
    expect(voiceSearchHelper.getState()).toEqual({
      errorCode: undefined,
      isSpeechFinal: false,
      status: 'initial',
      transcript: '',
    });
  });

  it('is not supported', () => {
    const voiceSearchHelper = getVoiceSearchHelper();
    expect(voiceSearchHelper.isBrowserSupported()).toBe(false);
  });

  it('is not listening', () => {
    const voiceSearchHelper = getVoiceSearchHelper();
    expect(voiceSearchHelper.isListening()).toBe(false);
  });

  it('is supported with webkitSpeechRecognition', () => {
    window.webkitSpeechRecognition = () => {};
    const voiceSearchHelper = getVoiceSearchHelper();
    expect(voiceSearchHelper.isBrowserSupported()).toBe(true);
  });

  it('is supported with SpeechRecognition', () => {
    window.SpeechRecognition = () => {};
    const voiceSearchHelper = getVoiceSearchHelper();
    expect(voiceSearchHelper.isBrowserSupported()).toBe(true);
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
    const voiceSearchHelper = getVoiceSearchHelper({
      searchAsYouSpeak: false,
      onQueryChange,
      onStateChange,
    });

    voiceSearchHelper.toggleListening();
    expect(onStateChange).toHaveBeenCalledTimes(1);
    expect(voiceSearchHelper.getState().status).toEqual('askingPermission');
    recognition.onstart();
    expect(voiceSearchHelper.getState().status).toEqual('waiting');
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
    expect(voiceSearchHelper.getState().status).toEqual('recognizing');
    expect(voiceSearchHelper.getState().transcript).toEqual('Hello World');
    expect(voiceSearchHelper.getState().isSpeechFinal).toBe(true);
    expect(onQueryChange).toHaveBeenCalledTimes(0);
    recognition.onend();
    expect(onQueryChange).toHaveBeenCalledWith('Hello World');
    expect(voiceSearchHelper.getState().status).toEqual('finished');
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
    const voiceSearchHelper = getVoiceSearchHelper({
      searchAsYouSpeak: true,
      onQueryChange,
      onStateChange,
    });

    voiceSearchHelper.toggleListening();
    expect(onStateChange).toHaveBeenCalledTimes(1);
    expect(voiceSearchHelper.getState().status).toEqual('askingPermission');
    recognition.onstart();
    expect(voiceSearchHelper.getState().status).toEqual('waiting');
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
    expect(voiceSearchHelper.getState().status).toEqual('recognizing');
    expect(voiceSearchHelper.getState().transcript).toEqual('Hello World');
    expect(voiceSearchHelper.getState().isSpeechFinal).toBe(true);
    expect(onQueryChange).toHaveBeenCalledWith('Hello World');
    recognition.onend();
    expect(onQueryChange).toHaveBeenCalledTimes(1);
    expect(voiceSearchHelper.getState().status).toEqual('finished');
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
    const voiceSearchHelper = getVoiceSearchHelper({
      searchAsYouSpeak: true,
      onQueryChange,
      onStateChange,
    });
    voiceSearchHelper.toggleListening();
    expect(voiceSearchHelper.getState().status).toEqual('askingPermission');
    recognition.onerror({
      error: 'not-allowed',
    });
    expect(voiceSearchHelper.getState().status).toEqual('error');
    expect(voiceSearchHelper.getState().errorCode).toEqual('not-allowed');
    recognition.onend();
    expect(onQueryChange).toHaveBeenCalledTimes(0);
  });
});
