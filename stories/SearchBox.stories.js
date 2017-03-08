import React, {Component} from 'react';
import {storiesOf} from '@kadira/storybook';
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

  state = {eventsHistory: [], selectedEvents: {onChange: true}}

  get supportedEvents() {
    return [
      'onChange', 'onFocus', 'onBlur',
      'onSelect', 'onKeyDown', 'onKeyPress',
      'onSubmit', 'onReset',
    ];
  }

  get time() {
    const d = new Date();
    const h = `0${d.getHours()}`.slice(-2);
    const m = `0${d.getMinutes()}`.slice(-2);
    const s = `0${d.getSeconds()}`.slice(-2);
    return `${h}:${m}:${s}`;
  }

  handleSelectedEvent = eventName => ({target: {checked}}) => {
    const {selectedEvents} = this.state;
    this.setState({selectedEvents: {...selectedEvents, [eventName]: checked}});
  }

  handleInputEvent = eventName => event => {
    // we dont want the page to reload while testing
    if (eventName === 'onSubmit') event.preventDefault();

    // we only want to log events which are selected
    if (this.state.selectedEvents[eventName]) {
      const history = (() => {
        switch (eventName) {
        case 'onChange':
          return `[${this.time}] event: onChange | e.target.value: ${event.target.value}`;
        case 'onKeyDown':
        case 'onKeyPress':
          return `[${this.time}] event: ${eventName} | e.keyCode ${event.keyCode}`;
        default:
          return `[${this.time}] event: ${eventName}`;
        }
      })();

      const eventsHistory = this.state.eventsHistory.length === 10
        ? [history, ...(this.state.eventsHistory.slice(0, -1))]
        : [history, ...this.state.eventsHistory];

      this.setState({eventsHistory});
    }
  }

  render() {
    const {eventsHistory} = this.state;

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

          {/* events history */}
          <pre>{ eventsHistory.join('\n') }</pre>
        </div>

        <SearchBox {
          ...this.supportedEvents.reduce(
            (events, eventName) =>
              ({...events, [eventName]: this.handleInputEvent(eventName)})
          , {})
        } />
      </WrapWithHits>
    );
  }

}

stories.add('with event listeners', () => <SearchBoxContainer />);
