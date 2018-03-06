import PropTypes from 'prop-types';
import React from 'react';
import {
  InstantSearch,
  ClearRefinements,
  SearchBox,
  Pagination,
  Highlight,
  Configure,
} from '../packages/react-instantsearch/dom';
import { connectHits } from '../packages/react-instantsearch/connectors';
import { linkTo } from '@storybook/addon-links';
import 'instantsearch.css/themes/algolia.css';

const Wrap = props => (
  <InstantSearch
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="ikea"
  >
    {props.children}
  </InstantSearch>
);

Wrap.propTypes = {
  children: PropTypes.node,
};

const WrapWithHits = ({
  searchParameters: askedSearchParameters = {},
  children,
  searchBox = true,
  hasPlayground = false,
  linkedStoryGroup,
  pagination = true,
  appId = 'latency',
  apiKey = '6be0576ff61c053d5f9a3225e2a90f76',
  indexName = 'ikea',
}) => {
  const sourceCodeUrl = `https://github.com/algolia/react-instantsearch/tree/master/stories/${linkedStoryGroup}.stories.js`;
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
      <a target="_blank" href={sourceCodeUrl} className="source-code-url">
        <div>View source code</div>
      </a>
    </div>
  ) : null;

  const searchParameters = {
    hitsPerPage: 3,
    ...askedSearchParameters,
  };

  return (
    <InstantSearch appId={appId} apiKey={apiKey} indexName={indexName}>
      <Configure {...searchParameters} />
      <div>
        <div className="container widget-container">{children}</div>
        <div>
          <div
            style={linkedStoryGroup ? {} : { borderRadius: '0px 0px 5px 5px' }}
            className="container hits-container"
          >
            <div className="hit-actions">
              {searchBox ? (
                <SearchBox
                  translations={{
                    placeholder:
                      'Search into our furnitures: chair, table, tv unit...',
                  }}
                />
              ) : null}
              <ClearRefinements translations={{ reset: 'Clear all filters' }} />
            </div>
            <CustomHits />
            <div className="hit-pagination">
              {pagination ? <Pagination showLast={true} /> : null}
            </div>
          </div>
          {footer}
        </div>
      </div>
    </InstantSearch>
  );
};

const CustomHits = connectHits(({ hits }) => (
  <div className="hits">
    {hits.map(hit => (
      <div key={hit.objectID} className="hit">
        <div>
          <div className="hit-picture">
            <img
              src={`https://res.cloudinary.com/hilnmyskv/image/fetch/h_100,q_100,f_auto/${
                hit.image
              }`}
            />
          </div>
        </div>
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
));

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
};

// defaultProps added so that they're displayed in the JSX addon
WrapWithHits.defaultProps = {
  appId: 'latency',
  apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
  indexName: 'ikea',
};

// retrieves the displayName of the React Component
const getReactElementDisplayName = element =>
  element.type.displayName ||
  element.type.name ||
  (typeof element.type === 'function' // function without a name, provide one
    ? 'No Display Name'
    : element.type);

// displays the right name for the JSX addon in Storybook
const displayName = element => {
  // display 'InstantSearch' instead of 'WrapWithHits'
  if (getReactElementDisplayName(element) === 'WrapWithHits') {
    const instantSearch = 'InstantSearch';
    return instantSearch;
  }
  // wrapped component: AlgoliaWidgetName(Translatable..)" => "WidgetName"
  if (
    React.Component.isPrototypeOf(element.type) &&
    getReactElementDisplayName(element).startsWith('Algolia')
  ) {
    const innerComponentRegex = /\(([^()]+)\)/;
    const match = innerComponentRegex.exec(element.type.displayName);
    const innerComponentName = match[1];
    const rawName = element.type.displayName;
    const widgetName = rawName.split('(')[0].replace('Algolia', '');
    if (match) {
      // when a VirtualWidget is used, Algolia returns 'UnknownComponent' as the displayName
      if (innerComponentName === 'UnknownComponent') {
        return widgetName;
      }
      // when a Configure widget is used, Algolia returns '_default' as the displayName
      if (innerComponentName === '_default') {
        return widgetName;
      }
      // when a RangeInput widget is used, Algolia returns 'RawRangeInput' as the displayName
      if (innerComponentName === 'RawRangeInput') {
        return 'RangeInput';
      }
      return innerComponentName;
    }
  }
  return getReactElementDisplayName(element);
};

const filterProps = ['linkedStoryGroup', 'hasPlayground'];

export { CustomHits, displayName, filterProps, Wrap, WrapWithHits };
