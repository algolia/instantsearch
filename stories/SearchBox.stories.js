import React, {Component} from 'react';
import {storiesOf, action} from '@kadira/storybook';
import {SearchBox} from '../packages/react-instantsearch/dom';
import {withKnobs, object} from '@kadira/storybook-addon-knobs';
import {WrapWithHits} from './util';

const stories = storiesOf('SearchBox', module);

stories.addDecorator(withKnobs);

stories.add('default', () =>
  <WrapWithHits searchBox={false} hasPlayground={true} linkedStoryGroup="SearchBox">
    <SearchBox/>
  </WrapWithHits>
).add('with a default query', () =>
  <WrapWithHits searchBox={false} hasPlayground={true} linkedStoryGroup="SearchBox">
    <SearchBox defaultRefinement="battery" />
  </WrapWithHits>
).add('with submit and reset components', () =>
  <WrapWithHits searchBox={false} hasPlayground={true} linkedStoryGroup="SearchBox" >
    <SearchBox
      submitComponent={<span>🔍</span>}
      resetComponent={
        <svg viewBox="200 198 108 122">
          <path d="M200.8 220l45 46.7-20 47.4 31.7-34 50.4 39.3-34.3-52.6 30.2-68.3-49.7 51.7" />
        </svg>
      }
    />
  </WrapWithHits>
).add('playground', () =>
  <WrapWithHits searchBox={false}>
    <SearchBox
      focusShortcuts={['s']}
      searchAsYouType={true}
      autoFocus={true}
      translations={object('translations', {
        submit: null,
        reset: null,
        submitTitle: 'Submit your search query.',
        resetTitle: 'Clear your search query.',
        placeholder: 'Search your website.',
      })}
    />
  </WrapWithHits>
);

// with event listeners
// --------------------
class SearchBoxContainer extends Component {

  state = {selectedEvents: {onChange: true}}

  get supportedEvents() {
    return [
      'onChange', 'onFocus', 'onBlur',
      'onSelect', 'onKeyDown', 'onKeyPress',
      'onSubmit', 'onReset',
    ];
  }

  handleSelectedEvent = eventName => ({target: {checked}}) => {
    const {selectedEvents} = this.state;
    this.setState({selectedEvents: {...selectedEvents, [eventName]: checked}});
  }

  handleSubmit = event => {
    // we dont want the page to reload after the submit event
    event.preventDefault();
    event.stopPropagation();

    this.logAction('onSubmit')(event);
  }

  logAction = eventName => event => {
    // we dont want to log unselected event
    if (this.state.selectedEvents[eventName]) {
      action(eventName)(event);
    }
  }

  render() {
    return (
      <WrapWithHits searchBox={ false } hasPlayground={ true } linkedStoryGroup="searchBox">
        <div style={ {color: '#999', borderBottom: '1px solid #E4E4E4', marginBottom: 10} }>
          {/* events checkboxes */}
          { this.supportedEvents.map(eventName =>
              <label key={ eventName } style={ {marginRight: 10} }>
                <input
                  name={ `selectEvent-${eventName}` }
                  type="checkbox"
                  checked={ this.state.selectedEvents[eventName] }
                  onChange={ this.handleSelectedEvent(eventName) }
                />
                { eventName }
              </label>
          ) }

          <div style={ {marginBottom: 5, marginTop: 5, fontSize: 12} }>
            <em>
              (Click on the "action logger" tab of the right sidebar to see events logs)
            </em>
          </div>
        </div>

        <SearchBox
          onSubmit={ this.handleSubmit }
          onReset={ this.logAction('onReset') }
          onChange={ this.logAction('onChange') }
          onFocus={ this.logAction('onFocus') }
          onBlur={ this.logAction('onBlur') }
          onSelect={ this.logAction('onSelect') }
          onKeyDown={ this.logAction('onKeyDown') }
          onKeyPress={ this.logAction('onKeyPress') }
        />
      </WrapWithHits>
    );
  }

}

stories.add('with event listeners', () => <SearchBoxContainer />);
