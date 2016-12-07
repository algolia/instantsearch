---
title: Multi index
mainTitle: Guide
layout: main.pug
category: guide
navWeight: 50
---

You can use multiple `<InstantSearch/>` instances for cases like:

* displaying hits from different indices
* sharing a single search box
* any use case involving synchronizing widgets between different `<InstantSearch>` instances

Two props on the [InstantSearch component](widgets/InstantSearch.html) can be used to inject searchState or be notified of searchState changes:

* onSearchStateChange(onSearchStateChange): a function being called every time the `<InstantSearch>` searchState is updated.
* [searchState](guide/Search%20state.html): a search state

The idea is to have a main component that will receive every new search state of the first instance
and then pass it back to each `<InstantSearch>` instances.

Refinements and parameters of an `<InstantSearch>` searchState needs to have their corresponding widgets or
[virtual widget](guide/Virtual%20widgets.html) added to be effectively applied.

Here's an example displaying hits from two different indices:

```jsx
import React, {Component} from 'react';
import { InstantSearch, Hits, SearchBox } from 'react-instantsearch/dom';
import {connectSearchBox} from 'react-instantsearch/connectors'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {searchState: {}};
  }

  onStateChange = searchState => {
    this.setState({searchState});
  };

  render() {
    return (
    <div>
      {/* You can also nest `<InstantSearch>` components,
       as long as you pass the right state and onStateChange function
       */}
      <FirstResults onSearchStateChange={this.onSearchStateChange}/>
      <SecondResults searchState={this.state.searchState}/>
    </div>
    );
  }
}

const FirstResults = props =>
  <InstantSearch
    appId="appId"
    apiKey="apiKey"
    indexName="firstIndexName"
    searchState={props.searchState}
    onSearchStateChange={props.onSearchStateChange}
  >
    <div>
      <SearchBox/>
      <Hits />
    </div>
  </InstantSearch>;

/*
 To perform the same query as the FirstResults instance we need a virtual SearchBox widget
 to handle the search.
 */
const VirtualSearchBox = connectSearchBox(() => null);
const SecondResults = props =>
  <InstantSearch
    appId="appId"
    apiKey="apiKey"
    indexName="secondIndexName"
    searchState={props.searchState}
  >
    <div>
      <Hits/>
      <VirtualSearchBox/>
    </div>
  </InstantSearch>;

export default App;
```

<div class="guide-nav">
Next: <a href="guide/Custom connectors.html">Custom connectors →</a>
</div>
