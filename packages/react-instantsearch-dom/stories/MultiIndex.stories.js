import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {Configure, InstantSearch, Index, Highlight, SearchBox} from '../packages/react-instantsearch/dom';
import {connectHits, connectAutoComplete} from '../packages/react-instantsearch/connectors';
import Autosuggest from 'react-autosuggest';
const stories = storiesOf('<Index>', module);

stories.add('MultiHits', () =>
  <InstantSearch
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="ikea">
    <SearchBox/>
    <Configure hitsPerPage={1} />
    <Index indexName="ikea">
      <CustomHits />
    </Index>
    <Index indexName="bestbuy">
      <CustomHits />
    </Index>
    <Index indexName="airbnb">
      <CustomHits />
    </Index>
  </InstantSearch>
).add('AutoComplete', () =>
  <InstantSearch
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="ikea">
    <AutoComplete />
    <Configure hitsPerPage={1} />
    <Index indexName="bestbuy">
      <VirtualHits />
    </Index>
    <Index indexName="airbnb">
      <VirtualHits />
    </Index>
  </InstantSearch >);

const VirtualHits = connectHits(() => null);

const AutoComplete = connectAutoComplete(({hits, currentRefinement, refine}) => <Autosuggest
  suggestions={hits}
  multiSection={true}
  onSuggestionsFetchRequested={({value}) => refine(value)}
  onSuggestionsClearRequested={() => refine('')}
  getSuggestionValue={hit => hit.name}
  renderSuggestion={hit =>
    <div>
      <div>{hit.name}</div>
    </div>
  }
  inputProps={{
    placeholder: 'Type a product',
    value: currentRefinement,
    onChange: () => {
    },
  }}
  renderSectionTitle={section => section.index}
  getSectionSuggestions={section => section.hits}
/>);

const CustomHits = connectHits(({hits}) =>
  <div className="hits">
    {hits.map((hit, idx) => {
      const image = hit.image ? hit.image : hit.picture_url;
      return <div key={idx} className="hit">
          <div>
            <div className="hit-picture"><img src={`${image}`} /></div>
          </div>
          <div className="hit-content">
            <div>
              <Highlight attributeName="name" hit={hit} />
              <span> - ${hit.price}</span>
              <span> - {hit.rating} stars</span>
            </div>
            <div className="hit-type">
              <Highlight attributeName="type" hit={hit} />
            </div>
            <div className="hit-description">
              <Highlight attributeName="description" hit={hit} />
            </div>
          </div>
        </div>;
    }
    )}
  </div>);
