import React, { Component } from 'preact-compat';
import PropTypes from 'prop-types';
import Template from '../Template/Template';

const VoiceSearchCSSClasses = PropTypes.shape({
  root: PropTypes.string.isRequired,
  button: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
});

class VoiceSearch extends Component {
  static propTypes = {
    cssClasses: VoiceSearchCSSClasses.isRequired,
    isSupportedBrowser: PropTypes.func.isRequired,
    isListening: PropTypes.func.isRequired,
    toggleListening: PropTypes.func.isRequired,
    voiceListeningState: PropTypes.object.isRequired,
    searchAsYouSpeak: PropTypes.bool,
    templates: PropTypes.object.isRequired,
  };

  static defaultProps = {
    searchAsYouSpeak: false,
  };

  handleClick = event => {
    event.currentTarget.blur();
    const { toggleListening, searchAsYouSpeak } = this.props;
    toggleListening(searchAsYouSpeak);
  };

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
      <div className={cssClasses.root}>
        <Template
          templateKey="buttonText"
          rootTagName="button"
          rootProps={{
            className: cssClasses.button,
            type: 'button',
            title: 'Search by voice',
            onClick: this.handleClick,
            disabled: !isSupportedBrowser(),
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
      </div>
    );
  }
}

export default VoiceSearch;
