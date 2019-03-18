import React, { Component } from 'preact-compat';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import Template from '../Template/Template';
import voiceSearchHelper from '../../lib/voiceSearchHelper';

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
    this.helper = voiceSearchHelper({
      onQueryChange: query => this.props.refine(query),
      onStateChange: state => this.setState(state),
    });
    window.SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;
    this.isSupportedBrowser = 'SpeechRecognition' in window;
  }

  handleClick() {
    this.button.blur();
    const { canStart, start, stop } = this.helper;
    const { searchAsYouSpeak } = this.props;
    if (canStart()) {
      start(searchAsYouSpeak);
    } else {
      stop();
    }
  }

  render() {
    const { cssClasses, templates } = this.props;
    const { status, transcript, isSpeechFinal, errorCode } = this.state;
    const { isSupportedBrowser } = this.helper;
    const isListening = this.helper.isListening();
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
