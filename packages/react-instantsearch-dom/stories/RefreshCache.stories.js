import React, { Component } from 'react';
import { storiesOf } from '@storybook/react';
import { InstantSearch, SearchBox } from 'react-instantsearch-dom';
import { CustomHits } from './util';

const stories = storiesOf('RefreshCache', module);

class AppWithRefresh extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refresh: false,
    };
  }

  refresh = () => {
    this.setState({ refresh: true });
  };

  onSearchStateChange = () => {
    this.setState({ refresh: false });
  };

  render() {
    const displayRefresh = `${this.state.refresh}`;
    return (
      <InstantSearch
        appId="latency"
        apiKey="6be0576ff61c053d5f9a3225e2a90f76"
        indexName="ikea"
        refresh={this.state.refresh}
        onSearchStateChange={this.onSearchStateChange}
      >
        <div>
          <h2
            style={{
              color: '#182359',
              font: 'Raleway',
              size: '30px',
              lineHeight: '1',
              fontWeight: '200',
            }}
          >
            Feature: Refresh cache
          </h2>
          <p style={{ color: '#182359', font: 'open sans' }}>
            Adding the refresh prop to your InstantSearch component gives you
            the possibility to refresh the cache.
          </p>

          <h3
            style={{
              color: '#182359',
              font: 'Raleway',
              size: '18px',
              lineHeight: '1',
              fontWeight: 'bold',
            }}
          >
            How to test it?
          </h3>
          <div style={{ color: '#182359', font: 'open sans' }}>
            By default, the &apos;refresh&apos; prop is disabled. You will need
            to open your network tab in the developer tools.
            <ol>
              <li>
                Type a query in the SearchBox (for instance &apos;clock&apos;).
                You should see 5 requests to Algolia (one per letter)
              </li>
              <li>
                Type &apos;clock&apos; again, you will see that no additional
                query is made since the results are retrieved from the cache
              </li>
              <li>
                Make sure the SearchBox is empty, click on the &apos;Refresh
                cache&apos; button (you should see that Refresh set to true in
                the info box below the SearchBox)
              </li>
              <li>
                Type your previous query again: the cache has been cleared and
                you will see new requests made to Algolia
              </li>
            </ol>
          </div>
        </div>
        <hr />
        <SearchBox
          translations={{
            placeholder: 'Search our furnitures: chairs, tables etc.',
          }}
        />
        <button
          onClick={this.refresh}
          style={{
            borderRadius: '4px',
            padding: '10px',
            border: 'none',
            fontSize: '12px',
            cursor: 'pointer',
            color: '#fff',
            background: '#3369e7',
          }}
        >
          Refresh cache
        </button>
        <button
          style={{
            borderRadius: '2px',
            padding: '10px',
            marginTop: '15px',
            border: 'none',
            fontSize: '12px',
            color: '#999999',
            background: '#F3F3F3',
            display: 'block',
          }}
          disabled
        >
          Refresh is set to: <em>{displayRefresh}</em>
        </button>

        <CustomHits />
      </InstantSearch>
    );
  }
}

stories.add('with a refresh button', () => <AppWithRefresh />);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refresh: false,
      count: 0,
    };
  }

  componentDidMount() {
    this.interval = setInterval(
      () =>
        this.setState(prevState => ({
          refresh: prevState.count === 5,
          count: prevState.count === 5 ? 0 : prevState.count + 1,
        })),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <InstantSearch
        appId="latency"
        apiKey="6be0576ff61c053d5f9a3225e2a90f76"
        indexName="ikea"
        refresh={this.state.refresh}
      >
        <span>{this.state.count} s elapsed since last refresh</span>

        <SearchBox
          translations={{
            placeholder: 'Search our furnitures: chairs, tables etc.',
          }}
        />

        <CustomHits />
      </InstantSearch>
    );
  }
}

stories.add('with setInterval', () => <App />);
