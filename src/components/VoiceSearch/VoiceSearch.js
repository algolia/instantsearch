import React, { Component } from 'preact-compat';
import PropTypes from 'prop-types';
import Template from '../Template/Template';

const VoiceSearchCSSClasses = PropTypes.shape({
  root: PropTypes.string.isRequired,
  button: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  transcript: PropTypes.string.isRequired,
});

class VoiceSearch extends Component {
  static propTypes = {
    cssClasses: VoiceSearchCSSClasses.isRequired,
    isSupportedBrowser: PropTypes.func.isRequired,
    isListening: PropTypes.func.isRequired,
    toggleListening: PropTypes.func.isRequired,
    voiceListeningState: PropTypes.object.isRequired,
    searchAsYouSpeak: PropTypes.bool,
    query: PropTypes.string,
    templates: PropTypes.object.isRequired,
  };

  static defaultProps = {
    searchAsYouSpeak: true,
    query: '',
  };

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.button.blur();
    const { toggleListening, searchAsYouSpeak } = this.props;
    toggleListening(searchAsYouSpeak);
  }

  render() {
    const {
      cssClasses,
      templates,
      isSupportedBrowser,
      voiceListeningState,
    } = this.props;
    const isListening = this.props.isListening();
    const {
      status,
      transcript,
      isSpeechFinal,
      errorCode,
    } = voiceListeningState;
    return (
      isSupportedBrowser() && (
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
              isListening,
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
              isListening,
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
              isListening,
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
