import { storiesOf } from '@storybook/react';
import algoliasearch from 'algoliasearch/lite';
import React, { Component } from 'react';
import { InstantSearch, SearchBox, Configure } from 'react-instantsearch-dom';

import { CustomHits, Content } from './util';

const stories = storiesOf('RefreshCache', module);

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

class AppWithRefresh extends Component {
  state = {
    refresh: false,
  };

  refresh = () => {
    this.setState({ refresh: true }, () => {
      this.setState({ refresh: false });
    });
  };

  render() {
    return (
      <InstantSearch
        indexName="instant_search"
        searchClient={searchClient}
        refresh={this.state.refresh}
      >
        <Configure hitsPerPage={5} />
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
                Type a query in the SearchBox (for instance
                &apos;cellphones&apos;). You should see 10 requests to Algolia
                (one per letter)
              </li>
              <li>
                Type &apos;cellphones&apos; again, you will see that no
                additional query is made since the results are retrieved from
                the cache
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
            marginTop: '10px',
          }}
        >
          Refresh cache
        </button>
        <CustomHits />
      </InstantSearch>
    );
  }
}

stories.add('with a refresh button', () => (
  <Content linkedStoryGroup="RefreshCache.stories.js">
    <AppWithRefresh />
  </Content>
));

class App extends Component {
  state = {
    refresh: false,
    count: 0,
  };

  componentDidMount() {
    this.interval = setInterval(
      () =>
        this.setState(
          (prevState) => ({
            refresh: prevState.count === 5,
            count: prevState.count === 5 ? 0 : prevState.count + 1,
          }),
          () => {
            this.setState({
              refresh: false,
            });
          }
        ),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <InstantSearch
        indexName="instant_search"
        searchClient={searchClient}
        refresh={this.state.refresh}
      >
        <Configure hitsPerPage={5} />

        <span>The cache is refreshed every 5 seconds.</span>

        <SearchBox
          translations={{
            placeholder: 'Search our products: phones, tv, etc.',
          }}
        />

        <CustomHits />
      </InstantSearch>
    );
  }
}

stories.add('with setInterval', () => (
  <Content linkedStoryGroup="RefreshCache.stories.js">
    <App />
  </Content>
));
