import React, { Component } from 'preact-compat';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import Template from '../Template/Template';

const STATUS_INITIAL = 'initial';
const STATUS_ASKING_PERMISSION = 'askingPermission';
const STATUS_WAITING_FOR_AUDIO = 'waitingForAudio';
const STATUS_WAITING_FOR_VOICE = 'waitingForVoice';
const STATUS_GETTING_INPUTS = 'gettingInputs';
const STATUS_FINISHED = 'finished';

// https://w3c.github.io/speech-api/#speechreco-error
// const ERROR_NO_SPEECH = 'no-speech';
// const ERROR_ABORTED = 'aborted';
// const ERROR_AUDIO_CAPTURE = 'audio-capture';
// const ERROR_NETWORK = 'network';
// const ERROR_NOT_ALLOWED = 'not-allowed';
// const ERROR_SERVICE_NOT_ALLOWED = 'service-not-allowed';
// const ERROR_BAD_GRAMMAR = 'bad-grammar';
// const ERROR_LANGUAGE_NOT_SUPPORTED = 'language-not-supported';

const VoiceSearchCSSClasses = PropTypes.shape({
  root: PropTypes.string.isRequired,
  button: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  transcript: PropTypes.string.isRequired,
});

class VoiceSearch extends Component {
  static propTypes = {
    cssClasses: VoiceSearchCSSClasses.isRequired,
    searchAsYouSpeak: PropTypes.bool,
    refine: PropTypes.func,
    query: PropTypes.string,
    templates: PropTypes.object.isRequired,
  };

  static defaultProps = {
    searchAsYouSpeak: true,
    refine: noop,
    query: '',
  };

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.resetState();
    window.SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;
    this.isSupportedBrowser = 'SpeechRecognition' in window;
  }

  resetState() {
    this.setState({
      status: STATUS_INITIAL,
      transcript: '',
      isSpeechFinal: undefined,
      errorCode: undefined,
    });
  }

  stopRecognition() {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = undefined;
    }
  }

  canStartRecognition() {
    return (
      this.state.status === STATUS_INITIAL ||
      this.state.status === STATUS_FINISHED
    );
  }

  startRecognition() {
    this.setState({
      status: STATUS_ASKING_PERMISSION,
    });
    this.recognition = new window.SpeechRecognition();
    // this.recognition.continuous = true;
    this.recognition.interimResults = this.props.searchAsYouSpeak;
    this.recognition.onend = () => {
      if (
        !this.state.errorCode &&
        this.state.transcript &&
        !this.props.searchAsYouSpeak
      ) {
        this.props.refine(this.state.transcript);
      }
      this.setState({ status: STATUS_FINISHED });
    };
    this.recognition.onerror = e => {
      this.setState({ errorCode: e.error });
    };
    this.recognition.onresult = e => {
      this.setState({
        status: STATUS_GETTING_INPUTS,
        transcript: e.results[0][0].transcript,
        isSpeechFinal: e.results[0].isFinal,
      });
      this.props.refine(this.state.transcript);
    };
    this.recognition.onsoundstart = () => {
      this.setState({ status: STATUS_WAITING_FOR_VOICE });
    };
    this.recognition.onstart = () => {
      this.setState({
        status: STATUS_WAITING_FOR_AUDIO,
      });
    };
    this.recognition.start();
  }

  handleClick() {
    this.button.blur();
    if (this.canStartRecognition()) {
      this.resetState();
      this.startRecognition();
    } else {
      this.stopRecognition();
      this.resetState();
    }
  }

  render() {
    const { cssClasses, templates } = this.props;
    const { status, transcript, isSpeechFinal, errorCode } = this.state;
    const isStarted = status !== STATUS_INITIAL && status !== STATUS_FINISHED;
    return (
      this.isSupportedBrowser && (
        <div className={cssClasses.root}>
          <Template
            ref={buttonRef => (this.button = buttonRef.base)}
            templateKey="buttonText"
            rootTagName="button"
            rootProps={{
              className: cssClasses.button,
              type: 'button',
              title: 'Search by voice',
              onClick: this.handleClick,
            }}
            data={{
              status,
              errorCode,
              isStarted,
              transcript,
              isSpeechFinal,
            }}
            templates={templates}
          />
          <Template
            templateKey="status"
            rootTagName="div"
            rootProps={{
              className: cssClasses.status,
            }}
            data={{
              status,
              errorCode,
              isStarted,
              transcript,
              isSpeechFinal,
            }}
            templates={templates}
          />
          <Template
            templateKey="transcript"
            rootTagName="div"
            rootProps={{
              className: cssClasses.transcript,
            }}
            data={{
              status,
              isStarted,
              transcript,
              isSpeechFinal,
            }}
            templates={templates}
          />
        </div>
      )
    );
  }
}

export default VoiceSearch;
