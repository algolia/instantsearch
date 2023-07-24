import { linkTo } from '@storybook/addon-links';
import algoliasearch from 'algoliasearch/lite';
import PropTypes from 'prop-types';
import React, { useState, useMemo } from 'react';
import {
  InstantSearch,
  ClearRefinements,
  SearchBox,
  Pagination,
  Highlight,
  Configure,
  connectHits,
} from 'react-instantsearch-dom';
import 'instantsearch.css/themes/algolia.css';

const Hits = ({ hits }) => (
  <div className="hits">
    {hits.map((hit) => (
      <div key={hit.objectID} className="hit">
        {hit.image && (
          <div className="hit-picture">
            <img
              src={`https://res.cloudinary.com/hilnmyskv/image/fetch/h_100,q_100,f_auto/${hit.image}`}
            />
          </div>
        )}
        <div className="hit-content">
          <div>
            <Highlight attribute="name" hit={hit} />
            <span> - ${hit.price}</span>
            <span> - {hit.rating} stars</span>
          </div>
          <div className="hit-type">
            <Highlight attribute="type" hit={hit} />
          </div>
          <div className="hit-description">
            <Highlight attribute="description" hit={hit} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

Hits.propTypes = {
  hits: PropTypes.array.isRequired,
};

export const CustomHits = connectHits(Hits);

export function Content({
  hasPlayground,
  linkedStoryGroup,
  children,
  resultsView,
}) {
  const sourceCodeUrl = `https://github.com/algolia/instantsearch.js/tree/master/packages/react-instantsearch-dom/stories/${linkedStoryGroup}`;
  const playgroundLink = hasPlayground ? (
    <button
      onClick={linkTo(linkedStoryGroup, 'playground')}
      className="playground-url"
    >
      <span>Play with props</span>
    </button>
  ) : null;

  const footer = linkedStoryGroup ? (
    <div className="footer-container">
      {playgroundLink}
      <a
        href={sourceCodeUrl}
        className="source-code-url"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div>View source code</div>
      </a>
    </div>
  ) : null;

  const results = resultsView ? (
    <div
      style={linkedStoryGroup ? {} : { borderRadius: '0px 0px 5px 5px' }}
      className="container hits-container"
    >
      {resultsView}
    </div>
  ) : null;

  return (
    <div>
      <div className="container widget-container">{children}</div>
      {results}
      {footer}
    </div>
  );
}

Content.propTypes = {
  linkedStoryGroup: PropTypes.string,
  hasPlayground: PropTypes.bool,
  children: PropTypes.node,
  resultsView: PropTypes.node,
};

export function WrapWithHits({
  searchParameters: askedSearchParameters = {},
  children,
  searchBox = true,
  hasPlayground = false,
  linkedStoryGroup,
  pagination = true,
  hitsElement,
  appId,
  apiKey,
  indexName,
  initialSearchState,
  onSearchStateChange,
}) {
  const searchClient = useMemo(() => {
    return algoliasearch(appId, apiKey);
  }, [appId, apiKey]);

  const hits = hitsElement || <CustomHits />;

  const searchParameters = {
    hitsPerPage: 3,
    ...askedSearchParameters,
  };

  const [searchState, setSearchState] = useState(initialSearchState);

  const setNextSearchState = (nextSearchState) => {
    setSearchState(nextSearchState);
    onSearchStateChange(nextSearchState);
  };

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={indexName}
      searchState={searchState}
      onSearchStateChange={setNextSearchState}
    >
      <Configure {...searchParameters} />
      <Content
        linkedStoryGroup={linkedStoryGroup}
        hasPlayground={hasPlayground}
        resultsView={
          <div>
            <div className="hit-actions">
              {searchBox ? (
                <SearchBox
                  translations={{
                    placeholder: 'Search into our products: phones, tv...',
                  }}
                />
              ) : null}
              <ClearRefinements translations={{ reset: 'Clear all filters' }} />
            </div>
            {hits}
            <div className="hit-pagination">
              {pagination ? <Pagination showLast={true} /> : null}
            </div>
          </div>
        }
      >
        {children}
      </Content>
    </InstantSearch>
  );
}

WrapWithHits.propTypes = {
  appId: PropTypes.string,
  apiKey: PropTypes.string,
  indexName: PropTypes.string,
  children: PropTypes.node,
  searchBox: PropTypes.bool,
  linkedStoryGroup: PropTypes.string,
  hasPlayground: PropTypes.bool,
  pagination: PropTypes.bool,
  searchParameters: PropTypes.object,
  hitsElement: PropTypes.element,
  initialSearchState: PropTypes.object,
  onSearchStateChange: PropTypes.func,
};

// defaultProps added so that they're displayed in the JSX addon
WrapWithHits.defaultProps = {
  appId: 'latency',
  apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
  indexName: 'instant_search',
  initialSearchState: {},
  onSearchStateChange: (searchState) => searchState,
};
