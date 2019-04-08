import VoiceSearchHelper from '../';

const getHelper = opts =>
  new VoiceSearchHelper(
    opts || {
      onQueryChange: () => {},
      onStateChange: () => {},
    }
  );

describe('VoiceSearchHelper', () => {
  beforeEach(() => {
    delete window.webkitSpeechRecognition;
    delete window.SpeechRecognition;
  });

  it('has initial state correctly', () => {
    const helper = getHelper();
    expect(helper.getState()).toMatchSnapshot();
  });

  it('is not supported', () => {
    const helper = getHelper();
    expect(helper.isSupportedBrowser()).toBe(false);
  });

  it('is not listening', () => {
    const helper = getHelper();
    expect(helper.isListening()).toBe(false);
  });

  it('is supported with webkitSpeechRecognition', () => {
    window.webkitSpeechRecognition = () => {};
    const helper = getHelper();
    expect(helper.isSupportedBrowser()).toBe(true);
  });

  it('is supported with SpeechRecognition', () => {
    window.SpeechRecognition = () => {};
    const helper = getHelper();
    expect(helper.isSupportedBrowser()).toBe(true);
  });

  it('works with mock SpeechRecognition (searchAsYouSpeak:false)', () => {
    let that;
    window.SpeechRecognition = jest.fn().mockImplementation(() => ({
      start() {
        that = this;
      },
    }));
    const onQueryChange = jest.fn();
    const onStateChange = jest.fn();
    const helper = getHelper({
      onQueryChange,
      onStateChange,
    });
    const { getState } = helper;
    helper.toggleListening({ searchAsYouSpeak: false });
    expect(onStateChange).toHaveBeenCalledTimes(1);
    expect(getState().status).toEqual('askingPermission');
    that.onstart();
    expect(getState().status).toEqual('waiting');
    that.onresult({
      results: [
        (() => {
          const obj = [
            {
              transcript: 'Hello World',
            },
          ];
          obj.isFinal = true;
          return obj;
        })(),
      ],
    });
    expect(getState().status).toEqual('recognizing');
    expect(getState().transcript).toEqual('Hello World');
    expect(getState().isSpeechFinal).toBe(true);
    expect(onQueryChange).toHaveBeenCalledTimes(0);
    that.onend();
    expect(onQueryChange).toHaveBeenCalledWith('Hello World');
    expect(getState().status).toEqual('finished');
  });

  it('works with mock SpeechRecognition (searchAsYouSpeak:true)', () => {
    let that;
    window.SpeechRecognition = jest.fn().mockImplementation(() => ({
      start() {
        that = this;
      },
    }));
    const onQueryChange = jest.fn();
    const onStateChange = jest.fn();
    const helper = getHelper({
      onQueryChange,
      onStateChange,
    });
    const { getState } = helper;
    helper.toggleListening({ searchAsYouSpeak: true });
    expect(onStateChange).toHaveBeenCalledTimes(1);
    expect(getState().status).toEqual('askingPermission');
    that.onstart();
    expect(getState().status).toEqual('waiting');
    that.onresult({
      results: [
        (() => {
          const obj = [
            {
              transcript: 'Hello World',
            },
          ];
          obj.isFinal = true;
          return obj;
        })(),
      ],
    });
    expect(getState().status).toEqual('recognizing');
    expect(getState().transcript).toEqual('Hello World');
    expect(getState().isSpeechFinal).toBe(true);
    expect(onQueryChange).toHaveBeenCalledWith('Hello World');
    that.onend();
    expect(onQueryChange).toHaveBeenCalledTimes(1);
    expect(getState().status).toEqual('finished');
  });

  it('works with onerror', () => {
    let that;
    window.SpeechRecognition = jest.fn().mockImplementation(() => ({
      start() {
        that = this;
      },
    }));
    const onQueryChange = jest.fn();
    const onStateChange = jest.fn();
    const helper = getHelper({
      onQueryChange,
      onStateChange,
    });
    const { getState } = helper;
    helper.toggleListening({ searchAsYouSpeak: true });
    expect(getState().status).toEqual('askingPermission');
    that.onerror({
      error: 'not-allowed',
    });
    expect(getState().status).toEqual('error');
    expect(getState().errorCode).toEqual('not-allowed');
    that.onend();
    expect(onQueryChange).toHaveBeenCalledTimes(0);
  });
});
