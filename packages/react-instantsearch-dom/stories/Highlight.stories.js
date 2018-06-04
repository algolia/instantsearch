import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import {
  ClearRefinements,
  Highlight,
  Hits,
  InstantSearch,
  Pagination,
  SearchBox,
  connectHits,
} from 'react-instantsearch-dom';
import { displayName, filterProps, WrapWithHits } from './util';

const stories = storiesOf('Highlight', module);

const Default = ({ hit }) => (
  <article>
    <p>
      <Highlight attribute="name" hit={hit} />
    </p>
    <p>
      <Highlight attribute="description" hit={hit} />
    </p>
  </article>
);

Default.propTypes = {
  hit: PropTypes.object.isRequired,
};

const StrongHits = ({ hit }) => (
  <article>
    <p>
      <Highlight
        attribute="name"
        tagName={text('tag name (title)', 'strong')}
        hit={hit}
      />
    </p>
    <p>
      <Highlight
        attribute="description"
        tagName={text('tag name (description)', 'strong')}
        hit={hit}
      />
    </p>
  </article>
);

StrongHits.propTypes = {
  hit: PropTypes.object.isRequired,
};

stories
  .add('default', () => (
    <WrapWithHits hasPlayground={true} linkedStoryGroup="Highlight">
      <Hits hitComponent={Default} />
    </WrapWithHits>
  ))
  .add('playground', () => (
    <WrapWithHits linkedStoryGroup="Highlight">
      <Hits hitComponent={StrongHits} />
    </WrapWithHits>
  ));

const CustomHits = connectHits(({ hits }) => (
  <div className="hits">
    {hits.map(hit => (
      <div key={hit.objectID} className="hit">
        <div className="hit-content">
          <div>
            <Highlight attribute="name" hit={hit} />
          </div>

          <div className="hit-tags">
            <Highlight attribute="tags" hit={hit} />
          </div>
        </div>
      </div>
    ))}
  </div>
));

class AppWithArray extends Component {
  render() {
    return (
      <InstantSearch
        appId="KY4PR9ORUL"
        apiKey="a5ca312adab3b79e14054154efa00b37"
        indexName="highlight_array"
      >
        <SearchBox
          translations={{
            placeholder: 'Search into our furnitures: chair, table, tv unit...',
          }}
        />
        <ClearRefinements translations={{ reset: 'Clear all filters' }} />
        <CustomHits />
        <Pagination />
      </InstantSearch>
    );
  }
}

stories.add('highlight on  array', () => <AppWithArray />, {
  displayName,
  filterProps,
});
