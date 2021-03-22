/* global SpeechRecognition */
import createVoiceSearchHelper from '..';

type DummySpeechRecognition = () => void;
declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognition | DummySpeechRecognition;
    SpeechRecognition?: SpeechRecognition | DummySpeechRecognition;
  }
}

const start = jest.fn();
const stop = jest.fn();

const createFakeSpeechRecognition = (): jest.Mock => {
  const simulateListener: any = {};
  const mock = jest.fn().mockImplementation(() => ({
    start,
    stop,
    addEventListener(eventName: string, callback: () => void) {
      simulateListener[eventName] = callback;
    },
    removeEventListener() {},
  }));
  (mock as any).simulateListener = simulateListener;
  return mock;
};

describe('VoiceSearchHelper', () => {
  afterEach(() => {
    delete window.webkitSpeechRecognition;
    // @ts-expect-error
    delete window.SpeechRecognition;
  });

  it('has initial state correctly', () => {
    const voiceSearchHelper = createVoiceSearchHelper({
      searchAsYouSpeak: false,
      onQueryChange: () => {},
      onStateChange: () => {},
    });
    expect(voiceSearchHelper.getState()).toEqual({
      errorCode: undefined,
      isSpeechFinal: false,
      status: 'initial',
      transcript: '',
    });
  });

  it('is not supported', () => {
    const voiceSearchHelper = createVoiceSearchHelper({
      searchAsYouSpeak: false,
      onQueryChange: () => {},
      onStateChange: () => {},
    });
    expect(voiceSearchHelper.isBrowserSupported()).toBe(false);
  });

  it('is not listening', () => {
    const voiceSearchHelper = createVoiceSearchHelper({
      searchAsYouSpeak: false,
      onQueryChange: () => {},
      onStateChange: () => {},
    });
    expect(voiceSearchHelper.isListening()).toBe(false);
  });

  it('is supported with webkitSpeechRecognition', () => {
    window.webkitSpeechRecognition = () => {};
    const voiceSearchHelper = createVoiceSearchHelper({
      searchAsYouSpeak: false,
      onQueryChange: () => {},
      onStateChange: () => {},
    });
    expect(voiceSearchHelper.isBrowserSupported()).toBe(true);
  });

  it('is supported with SpeechRecognition', () => {
    window.SpeechRecognition = createFakeSpeechRecognition();
    const voiceSearchHelper = createVoiceSearchHelper({
      searchAsYouSpeak: false,
      onQueryChange: () => {},
      onStateChange: () => {},
    });
    expect(voiceSearchHelper.isBrowserSupported()).toBe(true);
  });

  it('works with mock SpeechRecognition (searchAsYouSpeak:false)', () => {
    window.SpeechRecognition = createFakeSpeechRecognition();
    const { simulateListener } = window.SpeechRecognition as any;
    const onQueryChange = jest.fn();
    const onStateChange = jest.fn();
    const voiceSearchHelper = createVoiceSearchHelper({
      searchAsYouSpeak: false,
      onQueryChange,
      onStateChange,
    });

    voiceSearchHelper.startListening();
    expect(onStateChange).toHaveBeenCalledTimes(1);
    expect(voiceSearchHelper.getState().status).toEqual('askingPermission');
    simulateListener.start();
    expect(voiceSearchHelper.getState().status).toEqual('waiting');
    simulateListener.result({
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
    simulateListener.end();
    expect(onQueryChange).toHaveBeenCalledWith('Hello World');
    expect(voiceSearchHelper.getState().status).toEqual('finished');
  });

  it('works with mock SpeechRecognition (searchAsYouSpeak:true)', () => {
    window.SpeechRecognition = createFakeSpeechRecognition();
    const { simulateListener } = window.SpeechRecognition as any;
    const onQueryChange = jest.fn();
    const onStateChange = jest.fn();
    const voiceSearchHelper = createVoiceSearchHelper({
      searchAsYouSpeak: true,
      onQueryChange,
      onStateChange,
    });

    voiceSearchHelper.startListening();
    expect(onStateChange).toHaveBeenCalledTimes(1);
    expect(voiceSearchHelper.getState().status).toEqual('askingPermission');
    simulateListener.start();
    expect(voiceSearchHelper.getState().status).toEqual('waiting');
    simulateListener.result({
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
    simulateListener.end();
    expect(onQueryChange).toHaveBeenCalledTimes(1);
    expect(voiceSearchHelper.getState().status).toEqual('finished');
  });

  it('works with onerror', () => {
    window.SpeechRecognition = createFakeSpeechRecognition();
    const { simulateListener } = window.SpeechRecognition as any;
    const onQueryChange = jest.fn();
    const onStateChange = jest.fn();
    const voiceSearchHelper = createVoiceSearchHelper({
      searchAsYouSpeak: true,
      onQueryChange,
      onStateChange,
    });
    voiceSearchHelper.startListening();
    expect(voiceSearchHelper.getState().status).toEqual('askingPermission');
    simulateListener.error({
      error: 'not-allowed',
    });
    expect(voiceSearchHelper.getState().status).toEqual('error');
    expect(voiceSearchHelper.getState().errorCode).toEqual('not-allowed');
    simulateListener.end();
    expect(onQueryChange).toHaveBeenCalledTimes(0);
  });

  it('stops listening on `dispose`', () => {
    window.SpeechRecognition = createFakeSpeechRecognition();
    const voiceSearchHelper = createVoiceSearchHelper({
      searchAsYouSpeak: false,
      onQueryChange: () => {},
      onStateChange: () => {},
    });
    voiceSearchHelper.startListening();
    voiceSearchHelper.dispose();
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('stops and the status becomes `finished`', () => {
    window.SpeechRecognition = createFakeSpeechRecognition();
    const onQueryChange = (): void => {};
    const onStateChange = (): void => {};
    const voiceSearchHelper = createVoiceSearchHelper({
      searchAsYouSpeak: true,
      onQueryChange,
      onStateChange,
    });

    voiceSearchHelper.startListening();
    voiceSearchHelper.stopListening();
    expect(voiceSearchHelper.getState().status).toBe('finished');
  });
});
