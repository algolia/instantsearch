import React from 'react';
import {
  InstantSearch,
  ClearAll,
  SearchBox,
  Pagination,
  Highlight,
  Configure,
} from '../packages/react-instantsearch/dom';
import {connectHits} from '../packages/react-instantsearch/connectors';
import {linkTo} from '@kadira/storybook';
import '../packages/react-instantsearch-theme-algolia/style.scss';

const Wrap = props =>
  <InstantSearch
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="ikea"
  >
    {props.children}
  </InstantSearch>;

Wrap.propTypes = {
  children: React.PropTypes.node,
};

const WrapWithHits = ({
  searchParameters: askedSearchParameters = {},
  children,
  searchBox = true,
  hasPlayground = false,
  linkedStoryGroup,
  pagination = true,
}) => {
  const sourceCodeUrl = `https://github.com/algolia/instantsearch.js/tree/v2/stories/${linkedStoryGroup}.stories.js`;
  const playgroundLink = hasPlayground
    ? <button onClick={linkTo(linkedStoryGroup, 'playground')}
         className="playground-url"
  >
    <span>Play with props</span>
  </button>
    : null;

  const footer = linkedStoryGroup ?
      <div className="footer-container">
        {playgroundLink}
        <a target="_blank"
           href={sourceCodeUrl}
           className="source-code-url"
        >
          <div>View source code</div>
        </a>
      </div>
      : null;

  const searchParameters = {
    hitsPerPage: 3,
    ...askedSearchParameters,
  };

  return <InstantSearch
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="ikea"
  >
    <Configure {...searchParameters} />
    <div>
      <div className="container widget-container">
        {children}
      </div>
      <div>
        <div style={linkedStoryGroup ? {} : {borderRadius: '0px 0px 5px 5px'}}
             className="container hits-container">
          <div className="hit-actions">
            {searchBox ?
              <SearchBox translations={{placeholder: 'Search into our furnitures: chair, table, tv unit...'}}/>
              : null}
              <ClearAll
                translations={{reset: 'Clear all filters'}}
              />
          </div>
          <CustomHits />
          <div className="hit-pagination">{pagination ? <Pagination showLast={true}/> : null}</div>
        </div>
        {footer}
      </div>
    </div>
  </InstantSearch>;
};

const CustomHits = connectHits(({hits}) =>
  <div className="hits">
    {hits.map((hit, idx) =>
      <div key={idx} className="hit">
        <div>
          <div className="hit-picture"><img src={`${hit.image}`}/></div>
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
      </div>
    )}
  </div>
);

WrapWithHits.propTypes = {
  children: React.PropTypes.node,
  searchBox: React.PropTypes.bool,
  linkedStoryGroup: React.PropTypes.string,
  hasPlayground: React.PropTypes.bool,
  pagination: React.PropTypes.bool,
  searchParameters: React.PropTypes.object,
};

export {
  Wrap,
  WrapWithHits,
};
