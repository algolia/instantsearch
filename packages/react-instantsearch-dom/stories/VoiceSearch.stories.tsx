import React from 'react';
import { storiesOf } from '@storybook/react';
import { VoiceSearch, SearchBox } from '../packages/react-instantsearch-dom';
import { WrapWithHits } from './util';
import { InnerComponentProps } from '../packages/react-instantsearch-dom/src/components/VoiceSearch';

const stories = storiesOf('VoiceSearch', module);

stories
  .add('default', () => (
    <WrapWithHits
      searchBox={false}
      hasPlayground={true}
      linkedStoryGroup="VoiceSearch"
    >
      <p style={{ color: '#999', fontStyle: 'italic' }}>
        To see this button disabled, test it on unsupported browsers like
        Safari, Firefox, etc.
      </p>
      <VoiceSearch />
    </WrapWithHits>
  ))
  .add('without status', () => (
    <WrapWithHits
      searchBox={false}
      hasPlayground={true}
      linkedStoryGroup="VoiceSearch"
    >
      <VoiceSearch statusComponent={() => null} />
    </WrapWithHits>
  ))
  .add('with a SearchBox', () => (
    <WrapWithHits
      searchBox={false}
      hasPlayground={true}
      linkedStoryGroup="VoiceSearch"
    >
      <VoiceSearch />
      <SearchBox />
    </WrapWithHits>
  ))
  .add('with a custom button text', () => (
    <WrapWithHits
      searchBox={false}
      hasPlayground={true}
      linkedStoryGroup="VoiceSearch"
    >
      <div className="custom-button-story">
        <VoiceSearch
          buttonTextComponent={({ isListening }) => (isListening ? '⏹' : '🎙')}
        />
      </div>
    </WrapWithHits>
  ))
  .add('with full status', () => {
    const Status = ({
      status,
      errorCode,
      isListening,
      transcript,
      isSpeechFinal,
      isBrowserSupported,
    }: InnerComponentProps) => {
      return (
        <div>
          <p>status: {status}</p>
          <p>errorCode: {errorCode}</p>
          <p>isListening: {isListening ? 'true' : 'false'}</p>
          <p>transcript: {transcript}</p>
          <p>isSpeechFinal: {isSpeechFinal ? 'true' : 'false'}</p>
          <p>isBrowserSupported: {isBrowserSupported ? 'true' : 'false'}</p>
        </div>
      );
    };

    return (
      <WrapWithHits
        searchBox={false}
        hasPlayground={true}
        linkedStoryGroup="VoiceSearch"
      >
        <VoiceSearch statusComponent={Status} />
      </WrapWithHits>
    );
  })
  .add('search as you speak', () => {
    const Status = ({
      status,
      errorCode,
      isListening,
      transcript,
      isSpeechFinal,
      isBrowserSupported,
    }: InnerComponentProps) => {
      return (
        <div>
          <p>status: {status}</p>
          <p>errorCode: {errorCode}</p>
          <p>isListening: {isListening ? 'true' : 'false'}</p>
          <p>transcript: {transcript}</p>
          <p>isSpeechFinal: {isSpeechFinal ? 'true' : 'false'}</p>
          <p>isBrowserSupported: {isBrowserSupported ? 'true' : 'false'}</p>
        </div>
      );
    };
    return (
      <WrapWithHits
        searchBox={false}
        hasPlayground={true}
        linkedStoryGroup="VoiceSearch"
      >
        <VoiceSearch searchAsYouSpeak={true} statusComponent={Status} />
      </WrapWithHits>
    );
  })
  .add('example of dynamic UI working with SearchBox', () => {
    const Status = ({ isListening, transcript }: InnerComponentProps) => {
      return (
        <div className={`layer listening-${isListening}`}>
          <span>{transcript}</span>
        </div>
      );
    };

    return (
      <WrapWithHits
        searchBox={false}
        hasPlayground={true}
        linkedStoryGroup="VoiceSearch"
      >
        <div className="custom-ui">
          <VoiceSearch statusComponent={Status} />
          <SearchBox reset={null} />
        </div>
      </WrapWithHits>
    );
  })
  .add('with additional paramaters', () => (
    <WrapWithHits
      searchBox={false}
      hasPlayground={true}
      linkedStoryGroup="VoiceSearch"
    >
      <VoiceSearch additionalQueryParameters={() => {}} />
      <SearchBox />
    </WrapWithHits>
  ))
  .add('with additional paramaters & language', () => (
    <WrapWithHits
      searchBox={false}
      hasPlayground={true}
      linkedStoryGroup="VoiceSearch"
    >
      <VoiceSearch language="fr-FR" additionalQueryParameters={() => {}} />
    </WrapWithHits>
  ))
  .add('with additional paramaters & user set & language', () => (
    <WrapWithHits
      searchBox={false}
      hasPlayground={true}
      linkedStoryGroup="VoiceSearch"
    >
      <VoiceSearch
        language="fr-FR"
        additionalQueryParameters={() => ({ analyticsTags: ['voice'] })}
      />
    </WrapWithHits>
  ));
